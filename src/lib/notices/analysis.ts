import "server-only";

import { createSupabaseAdminClient, SupabaseAdminConfigurationError } from "@/lib/supabase/admin";

type PositionRow = {
  id: string;
  title: string;
  education_level: string;
  area: string | null;
  vacancies: number | null;
  remuneration_cents: number | null;
  workload_hours_week: number | null;
};

type FactRow = { fact_key: string; fact_value: unknown };
type EvidenceRow = { id: string; excerpt: string; source_url: string; page_number: number | null };
type VersionRow = {
  id: string;
  version_number: number;
  document_url: string | null;
  source_url: string;
  publication_date: string | null;
  captured_at: string;
  change_summary: string | null;
  editorial_status: "approved" | "published";
};

export type ApprovedNoticeAnalysis = {
  id: string;
  title: string;
  municipality: string;
  stateCode: string;
  organizationName: string;
  canonicalUrl: string;
  currentVersion: VersionRow;
  positions: PositionRow[];
  facts: FactRow[];
  evidence: EvidenceRow[];
  history: VersionRow[];
};

function asRows<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

/**
 * Lê exclusivamente versões e evidências que já passaram pela aprovação
 * editorial. Itens em fila, rascunhos e diferenças pendentes nunca chegam à
 * experiência do aluno.
 */
export async function getApprovedNoticeAnalysis(noticeId: string): Promise<ApprovedNoticeAnalysis | null> {
  let client;
  try {
    client = createSupabaseAdminClient();
  } catch (error) {
    if (error instanceof SupabaseAdminConfigurationError) return null;
    throw error;
  }

  const { data: notice, error: noticeError } = await client
    .from("notices")
    .select("id,title,municipality,state_code,organization_name,canonical_url,current_version_id,editorial_status")
    .eq("id", noticeId)
    .in("editorial_status", ["approved", "published"])
    .maybeSingle();
  if (noticeError || !notice?.current_version_id) return null;

  const { data: version, error: versionError } = await client
    .from("notice_versions")
    .select("id,version_number,document_url,source_url,publication_date,captured_at,change_summary,editorial_status")
    .eq("id", notice.current_version_id)
    .in("editorial_status", ["approved", "published"])
    .maybeSingle();
  if (versionError || !version) return null;

  const [positionsResult, factsResult, evidenceResult, historyResult] = await Promise.all([
    client.from("positions").select("id,title,education_level,area,vacancies,remuneration_cents,workload_hours_week").eq("notice_version_id", version.id).in("editorial_status", ["approved", "published"]),
    client.from("notice_version_facts").select("fact_key,fact_value").eq("notice_version_id", version.id).in("editorial_status", ["approved", "published"]),
    client.from("evidence").select("id,excerpt,source_url,page_number").eq("notice_version_id", version.id).in("editorial_status", ["approved", "published"]).order("page_number", { ascending: true }),
    client.from("notice_versions").select("id,version_number,document_url,source_url,publication_date,captured_at,change_summary,editorial_status").eq("notice_id", notice.id).in("editorial_status", ["approved", "published"]).order("version_number", { ascending: false }),
  ]);

  return {
    id: notice.id,
    title: notice.title,
    municipality: notice.municipality,
    stateCode: notice.state_code,
    organizationName: notice.organization_name,
    canonicalUrl: notice.canonical_url,
    currentVersion: version as VersionRow,
    positions: asRows<PositionRow>(positionsResult.data),
    facts: asRows<FactRow>(factsResult.data),
    evidence: asRows<EvidenceRow>(evidenceResult.data),
    history: asRows<VersionRow>(historyResult.data),
  };
}

export function readFact(facts: FactRow[], key: string): string | null {
  const value = facts.find((fact) => fact.fact_key === key)?.fact_value;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const candidate = value as { value?: unknown; text?: unknown; date?: unknown };
    for (const item of [candidate.value, candidate.text, candidate.date]) {
      if (typeof item === "string" || typeof item === "number") return String(item);
    }
  }
  return null;
}
