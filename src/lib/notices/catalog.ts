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
  sources: { name: string }[] | null;
};

export class CatalogConfigurationError extends Error {
  constructor() {
    super("Catálogo oficial ainda não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no servidor.");
    this.name = "CatalogConfigurationError";
  }
}

export async function listVisibleNotices(): Promise<NoticeCatalogItem[]> {
  let client;
  try {
    client = createSupabaseAdminClient();
  } catch (error) {
    if (error instanceof SupabaseAdminConfigurationError) throw new CatalogConfigurationError();
    throw error;
  }
  const { data, error } = await client
    .from("notices")
    .select("id,title,municipality,state_code,organization_name,canonical_url,current_version_id,last_captured_at,sources(name)")
    .in("editorial_status", ["approved", "published"])
    .order("last_captured_at", { ascending: false })
    .limit(50);
  if (error) throw new Error("Não foi possível consultar o catálogo oficial.");
  const rows = (data ?? []) as NoticeCatalogRow[];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    municipality: row.municipality,
    stateCode: row.state_code,
    organizationName: row.organization_name,
    canonicalUrl: row.canonical_url,
    sourceName: row.sources?.[0]?.name ?? null,
    currentVersionId: row.current_version_id,
    lastCapturedAt: row.last_captured_at,
  }));
}
import { createSupabaseAdminClient, SupabaseAdminConfigurationError } from "@/lib/supabase/admin";
