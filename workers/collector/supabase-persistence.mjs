export class SupabasePersistenceConfigurationError extends Error {
  constructor() {
    super("Persistência Supabase não configurada. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY somente no servidor.");
    this.name = "SupabasePersistenceConfigurationError";
  }
}

function configuredRestClient({ url = process.env.SUPABASE_URL, serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY, fetchImplementation = fetch } = {}) {
  if (!url || !serviceRoleKey) throw new SupabasePersistenceConfigurationError();
  const baseUrl = new URL("rest/v1/", url.endsWith("/") ? url : `${url}/`);

  return {
    async findOne(table, filters) {
      const endpoint = new URL(table, baseUrl);
      endpoint.searchParams.set("select", "id");
      endpoint.searchParams.set("limit", "1");
      for (const [key, value] of Object.entries(filters)) endpoint.searchParams.set(key, `eq.${value}`);
      const response = await fetchImplementation(endpoint, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Supabase não aceitou consulta em ${table} (${response.status}).`);
      const rows = await response.json();
      return rows[0] ?? null;
    },
    async insert(table, row, { onConflict, ignoreDuplicates = false } = {}) {
      const endpoint = new URL(table, baseUrl);
      if (onConflict) endpoint.searchParams.set("on_conflict", onConflict);
      const response = await fetchImplementation(endpoint, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: `return=representation${ignoreDuplicates ? ",resolution=ignore-duplicates" : ""}`,
        },
        body: JSON.stringify(row),
      });
      if (!response.ok) throw new Error(`Supabase não aceitou inserção em ${table} (${response.status}).`);
      return response.json();
    },
    async update(table, row, filters) {
      const endpoint = new URL(table, baseUrl);
      for (const [key, value] of Object.entries(filters)) endpoint.searchParams.set(key, `eq.${value}`);
      const response = await fetchImplementation(endpoint, {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(row),
      });
      if (!response.ok) throw new Error(`Supabase não aceitou atualização em ${table} (${response.status}).`);
      return response.json();
    },
  };
}

function runRow(result) {
  return {
    source_key: result.sourceKey,
    requested_url: result.requestedUrl,
    canonical_url: result.canonicalUrl ?? null,
    content_hash: result.contentHash ?? null,
    started_at: result.startedAt,
    completed_at: result.completedAt ?? null,
    http_status: result.httpStatus ?? null,
    run_status: result.runStatus,
    metadata: result.metadata ?? {},
    error_message: result.errorMessage ?? null,
  };
}

function snapshotRow(result) {
  return {
    source_key: result.sourceKey,
    canonical_url: result.canonicalUrl,
    content_hash: result.contentHash,
    captured_at: result.completedAt,
    first_seen_at: result.completedAt,
    last_seen_at: result.completedAt,
    content_type: result.metadata?.contentType ?? null,
    byte_length: result.metadata?.byteLength ?? null,
    review_required: true,
    metadata: result.metadata ?? {},
  };
}

export function createSupabaseCollectorPersistence(options = {}) {
  const client = options.client ?? configuredRestClient(options);
  return {
    async persist(result) {
      const existingSnapshot = result.runStatus === "failed" ? null : await client.findOne("source_snapshots", {
        source_key: result.sourceKey,
        canonical_url: result.canonicalUrl,
        content_hash: result.contentHash,
      });
      const effectiveResult = existingSnapshot
        ? { ...result, runStatus: "unchanged", snapshotCreated: false }
        : result;
      const savedRun = await client.insert("collection_runs", runRow(effectiveResult));
      const runId = savedRun[0]?.id ?? null;
      if (result.runStatus === "failed") return { runRecorded: true, snapshotRecorded: false };
      if (!existingSnapshot) {
        const savedSnapshot = await client.insert("source_snapshots", snapshotRow(effectiveResult), {
          onConflict: "source_key,canonical_url,content_hash",
          ignoreDuplicates: true,
        });
        return { runRecorded: true, snapshotRecorded: true, runId, snapshotId: savedSnapshot[0]?.id ?? null, runStatus: effectiveResult.runStatus };
      }
      const updatedSnapshot = await client.update(
        "source_snapshots",
        { last_seen_at: effectiveResult.completedAt },
        { source_key: result.sourceKey, canonical_url: result.canonicalUrl, content_hash: result.contentHash },
      );
      return { runRecorded: true, snapshotRecorded: false, runId, snapshotId: updatedSnapshot[0]?.id ?? existingSnapshot.id, runStatus: effectiveResult.runStatus };
    },
  };
}
