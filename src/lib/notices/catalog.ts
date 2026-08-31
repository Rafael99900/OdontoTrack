export type NoticeCatalogItem = {
  id: string;
  title: string;
  municipality: string;
  stateCode: string;
  organizationName: string;
  canonicalUrl: string;
  sourceName: string | null;
  currentVersionId: string | null;
  lastCapturedAt: string;
};

type NoticeCatalogRow = {
  id: string;
  title: string;
  municipality: string;
  state_code: string;
  organization_name: string;
  canonical_url: string;
  current_version_id: string | null;
  last_captured_at: string;
  sources: { name: string } | null;
};

export class CatalogConfigurationError extends Error {
  constructor() {
    super("Catálogo oficial ainda não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no servidor.");
    this.name = "CatalogConfigurationError";
  }
}

function configuredCatalogEndpoint() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new CatalogConfigurationError();

  const endpoint = new URL("rest/v1/notices", url.endsWith("/") ? url : `${url}/`);
  endpoint.searchParams.set("select", "id,title,municipality,state_code,organization_name,canonical_url,current_version_id,last_captured_at,sources(name)");
  endpoint.searchParams.set("editorial_status", "eq.published");
  endpoint.searchParams.set("order", "last_captured_at.desc");
  endpoint.searchParams.set("limit", "50");
  return { endpoint, key };
}

export async function listPublishedNotices(): Promise<NoticeCatalogItem[]> {
  const { endpoint, key } = configuredCatalogEndpoint();
  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Não foi possível consultar o catálogo oficial.");
  const rows = (await response.json()) as NoticeCatalogRow[];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    municipality: row.municipality,
    stateCode: row.state_code,
    organizationName: row.organization_name,
    canonicalUrl: row.canonical_url,
    sourceName: row.sources?.name ?? null,
    currentVersionId: row.current_version_id,
    lastCapturedAt: row.last_captured_at,
  }));
}
