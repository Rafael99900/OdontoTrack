import { firstRealNoticeRecord } from "./first-real-notice-record.mjs";
import { archiveMauaOfficialDocument } from "./archive-maua-document.mjs";
import { collectAndPersistMaua } from "./run-maua-supabase.mjs";
import { createServerReviewPipeline } from "./review-pipeline.mjs";
import { createSupabaseRestClient } from "./supabase-persistence.mjs";

function first(rows, message) {
  const row = rows?.[0];
  if (!row) throw new Error(message);
  return row;
}

async function findOrInsert(client, table, filters, row, select = "*") {
  const found = await client.findOne(table, filters, { select });
  if (found) return { row: found, created: false };
  const inserted = await client.insert(table, row);
  return { row: first(inserted, `Não foi possível criar ${table}.`), created: true };
}

/**
 * Materializa o primeiro edital real apenas como candidato editorial. A função
 * é idempotente pelo URL da fonte e pelo hash imutável do PDF. Ela nunca
 * atualiza notices.current_version_id nem marca o edital como publicado.
 */
export async function persistFirstRealMauaNotice({
  client = createSupabaseRestClient(),
  fetchPage = fetch,
  now = () => new Date(),
  archiveOptions,
  collect = collectAndPersistMaua,
  archive = archiveMauaOfficialDocument,
} = {}) {
  const record = firstRealNoticeRecord;
  const collection = await collect();
  const originSnapshotId = collection.saved?.snapshotId;
  if (!originSnapshotId) throw new Error("O snapshot oficial de Mauá é obrigatório antes de persistir o edital.");

  const { verified, archived } = await archive(record.documentUrl, { fetchPage, archiveOptions });
  const capturedAt = now().toISOString();
  const source = await findOrInsert(client, "sources", { canonical_url: record.sourceUrl }, {
    name: "Prefeitura de Mauá: Concursos",
    organization_name: record.organizationName,
    canonical_url: record.sourceUrl,
    source_kind: "official_portal",
  }, "id,canonical_url");

  const notice = await findOrInsert(client, "notices", {
    source_id: source.row.id,
    external_reference: record.externalReference,
  }, {
    source_id: source.row.id,
    external_reference: record.externalReference,
    canonical_url: record.sourceUrl,
    municipality: record.municipality,
    state_code: "SP",
    organization_name: record.organizationName,
    title: record.title,
    editorial_status: "pending_review",
    first_captured_at: capturedAt,
    last_captured_at: capturedAt,
  }, "id,editorial_status");

  let version = await client.findOne("notice_versions", {
    notice_id: notice.row.id,
    content_hash: verified.contentHash,
  }, { select: "id,notice_id,version_number,content_hash,origin_snapshot_id" });
  let versionCreated = false;
  if (!version) {
    const priorVersions = await client.list("notice_versions", {
      filters: { notice_id: `eq.${notice.row.id}` }, select: "version_number", order: "version_number.desc", limit: 1,
    });
    const inserted = await client.insert("notice_versions", {
      notice_id: notice.row.id,
      version_number: (priorVersions[0]?.version_number ?? 0) + 1,
      source_url: record.sourceUrl,
      document_url: verified.canonicalUrl,
      content_hash: verified.contentHash,
      captured_at: capturedAt,
      publication_date: record.publicationDate,
      editorial_status: "pending_review",
      change_summary: "Primeira captura oficial do edital de abertura para revisão editorial.",
      origin_snapshot_id: originSnapshotId,
      document_storage_bucket: archived.bucket,
      document_storage_path: archived.path,
      document_content_type: archived.contentType,
      document_byte_length: archived.byteLength,
    });
    version = first(inserted, "Não foi possível criar a versão candidata do edital.");
    versionCreated = true;
  }

  const evidenceByKey = new Map();
  const existingEvidence = await client.list("evidence", {
    filters: { notice_version_id: `eq.${version.id}` }, select: "id,page_number,excerpt", limit: 100,
  });
  for (const item of record.evidence) {
    const existing = existingEvidence.find((row) => row.page_number === item.page && row.excerpt === item.excerpt);
    const evidence = existing ?? first(await client.insert("evidence", {
      notice_version_id: version.id,
      source_url: item.sourceUrl ?? verified.canonicalUrl,
      content_hash: verified.contentHash,
      page_number: item.page,
      excerpt: item.excerpt,
      captured_at: capturedAt,
      extraction_method: item.extractionMethod ?? "pdf_text",
      editorial_status: "pending_review",
    }), `Não foi possível salvar a evidência ${item.key}.`);
    evidenceByKey.set(item.key, evidence.id);
  }

  const position = await findOrInsert(client, "positions", {
    notice_version_id: version.id,
    title: record.position.title,
  }, {
    notice_version_id: version.id,
    title: record.position.title,
    education_level: "higher",
    area: "Odontologia",
    vacancies: record.position.vacancies,
    remuneration_cents: record.position.remunerationCents,
    workload_hours_week: record.position.workloadHoursWeek,
    editorial_status: "pending_review",
  }, "id,title");

  const existingFacts = await client.list("notice_version_facts", {
    filters: { notice_version_id: `eq.${version.id}` }, select: "id,position_id,fact_key", limit: 100,
  });
  for (const fact of record.facts) {
    const positionId = fact.positionScoped ? position.row.id : null;
    const current = existingFacts.find((row) => row.fact_key === fact.key && row.position_id === positionId);
    if (!current) await client.insert("notice_version_facts", {
      notice_version_id: version.id,
      position_id: positionId,
      fact_key: fact.key,
      fact_value: fact.value,
      evidence_id: evidenceByKey.get(fact.evidenceKey),
      editorial_status: "pending_review",
    });
  }

  const pipeline = createServerReviewPipeline({ client });
  const review = await pipeline.review({
    noticeId: notice.row.id,
    originSnapshotId,
    previousPublishedVersion: null,
    candidateVersion: { id: version.id, contentHash: verified.contentHash, originSnapshotId },
    candidateFacts: [],
  });
  return {
    noticeId: notice.row.id,
    noticeCreated: notice.created,
    versionId: version.id,
    versionCreated,
    originSnapshotId,
    evidenceCount: evidenceByKey.size,
    storagePath: archived.path,
    reviewQueueId: review.persisted.queueId,
    editorialStatus: "pending_review",
  };
}
