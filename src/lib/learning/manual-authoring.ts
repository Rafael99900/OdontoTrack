import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export class ManualAuthoringError extends Error {}

export type ManualNoticeInput = {
  title?: string; positionTitle?: string; organizationName?: string; city?: string; stateCode?: string;
  registrationStartAt?: string | null; registrationEndAt?: string | null; examAt?: string | null;
  remunerationCents?: number | null; workloadHoursWeek?: number | null; requirements?: string | null;
  noticeUrl?: string | null; retificationNote?: string | null;
};

const statuses = new Set(["draft", "in_review", "ready", "archived"]);
const assetKinds = new Set(["video", "pdf", "audio", "notebook_prompt"]);
const assetStatuses = new Set(["planned", "in_review", "approved", "published", "rejected"]);

function text(value: unknown, field: string, min = 1, max = 10000) {
  if (typeof value !== "string") throw new ManualAuthoringError(`${field} é obrigatório.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) throw new ManualAuthoringError(`${field} deve ter entre ${min} e ${max} caracteres.`);
  return normalized;
}
function optionalText(value: unknown, field: string, max = 10000) { return value == null || value === "" ? null : text(value, field, 1, max); }
function isoDate(value: unknown, field: string) { if (value == null || value === "") return null; if (typeof value !== "string" || Number.isNaN(Date.parse(value))) throw new ManualAuthoringError(`${field} precisa ser uma data ISO válida.`); return new Date(value).toISOString(); }
function positiveInteger(value: unknown, field: string, optional = false) { if (optional && (value == null || value === "")) return null; if (!Number.isInteger(value) || (value as number) < 0) throw new ManualAuthoringError(`${field} precisa ser um número inteiro não negativo.`); return value as number; }
function httpsUrl(value: unknown, field: string, optional = false) { if (optional && (value == null || value === "")) return null; if (typeof value !== "string") throw new ManualAuthoringError(`${field} é obrigatório.`); try { const url = new URL(value); if (url.protocol !== "https:") throw new Error(); return url.toString(); } catch { throw new ManualAuthoringError(`${field} precisa usar HTTPS.`); } }

export function normalizeManualNotice(input: ManualNoticeInput, requireIdentity = false) {
  const title = optionalText(input.title, "Título", 160);
  const positionTitle = optionalText(input.positionTitle, "Cargo", 160);
  const organizationName = optionalText(input.organizationName, "Órgão ou banca", 160);
  const city = optionalText(input.city, "Cidade", 100);
  const stateCode = optionalText(input.stateCode, "UF", 2)?.toUpperCase() ?? null;
  if (stateCode && !/^[A-Z]{2}$/.test(stateCode)) throw new ManualAuthoringError("UF deve ter duas letras.");
  if (requireIdentity && (!title || !positionTitle || !organizationName || !city || !stateCode)) throw new ManualAuthoringError("Título, cargo, órgão ou banca, cidade e UF são obrigatórios.");
  return {
    title, position_title: positionTitle, organization_name: organizationName, city, state_code: stateCode,
    registration_start_at: isoDate(input.registrationStartAt, "Início das inscrições"), registration_end_at: isoDate(input.registrationEndAt, "Fim das inscrições"), exam_at: isoDate(input.examAt, "Data da prova"),
    remuneration_cents: positiveInteger(input.remunerationCents, "Remuneração em centavos", true), workload_hours_week: positiveInteger(input.workloadHoursWeek, "Jornada semanal", true),
    requirements: optionalText(input.requirements, "Requisitos"), notice_url: httpsUrl(input.noticeUrl, "URL do edital", true), retification_note: optionalText(input.retificationNote, "Observação de retificação"),
  };
}

export function extractYouTubeId(value: unknown) {
  const url = httpsUrl(value, "URL do YouTube");
  const parsed = new URL(url as string);
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be") id = parsed.pathname.slice(1).split("/")[0] ?? null;
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    id = parsed.searchParams.get("v") ?? (parsed.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)?.[1] ?? null);
  }
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) throw new ManualAuthoringError("Informe uma URL válida de youtube.com, youtu.be ou youtube-nocookie.com.");
  return id;
}

export async function requireManualOwner(userId: string, noticeId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("manual_notices").select("*").eq("id", noticeId).eq("owner_user_id", userId).maybeSingle();
  if (error || !data) throw new ManualAuthoringError("Concurso manual não encontrado ou sem permissão.");
  return { admin, notice: data };
}

export async function requireLessonOwner(userId: string, lessonId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("learning_lessons").select("id,module_id,learning_modules!inner(course_id,learning_courses!inner(owner_user_id,manual_notice_id))").eq("id", lessonId).maybeSingle();
  const course = (data?.learning_modules as unknown as { learning_courses: { owner_user_id: string; manual_notice_id: string | null } }).learning_courses;
  if (error || !data || course.owner_user_id !== userId || !course.manual_notice_id) throw new ManualAuthoringError("Aula manual não encontrada ou sem permissão.");
  return { admin, lesson: data, course };
}

export function validateAssetInput(input: Record<string, unknown>) {
  const kind = text(input.assetKind, "Tipo de recurso", 1, 30);
  if (!assetKinds.has(kind)) throw new ManualAuthoringError("Tipo de recurso inválido.");
  const status = input.status == null ? "planned" : text(input.status, "Status", 1, 30);
  if (!assetStatuses.has(status)) throw new ManualAuthoringError("Status de recurso inválido.");
  const title = text(input.title, "Título do recurso", 2, 200);
  const sourceLabel = text(input.sourceLabel, "Fonte do recurso", 2, 200);
  const sourceUrl = httpsUrl(input.sourceUrl, "URL da fonte");
  if (kind === "video") {
    const embedId = extractYouTubeId(input.url);
    return { asset_kind: kind, status, title, asset_url: `https://www.youtube.com/watch?v=${embedId}`, embed_provider: "youtube", embed_id: embedId, source_label: sourceLabel, source_attribution: [{ label: sourceLabel, url: sourceUrl }] };
  }
  const assetUrl = kind === "notebook_prompt" ? null : httpsUrl(input.url, "URL do recurso", true);
  if (kind !== "notebook_prompt" && !assetUrl) throw new ManualAuthoringError("URL do recurso é obrigatória.");
  return { asset_kind: kind, status, title, asset_url: assetUrl, embed_provider: null, embed_id: null, source_label: sourceLabel, source_attribution: [{ label: sourceLabel, url: sourceUrl }] };
}

export async function createManualCourse(userId: string, noticeId: string) {
  const { admin, notice } = await requireManualOwner(userId, noticeId);
  if (notice.status === "archived") throw new ManualAuthoringError("Não é possível criar trilha de concurso arquivado.");
  const { data: subjects, error: subjectsError } = await admin.from("manual_notice_subjects").select("*").eq("manual_notice_id", noticeId).order("position");
  if (subjectsError || !subjects?.length) throw new ManualAuthoringError("Inclua ao menos uma matéria antes de criar a trilha.");
  const { data: existing, error: existingError } = await admin.from("learning_courses").select("id,title,status").eq("manual_notice_id", noticeId).eq("owner_user_id", userId).maybeSingle();
  if (existingError) throw new ManualAuthoringError("Não foi possível consultar a trilha manual.");
  if (existing) return { course: existing, created: false };
  const { data: course, error: courseError } = await admin.from("learning_courses").insert({ manual_notice_id: noticeId, owner_user_id: userId, title: `Trilha manual · ${notice.title}`, status: "draft", source_pages: [] }).select("id,title,status").single();
  if (courseError || !course) throw new ManualAuthoringError("Não foi possível criar a trilha manual.");
  for (const subject of subjects) {
    const { data: module, error: moduleError } = await admin.from("learning_modules").insert({ course_id: course.id, title: subject.title, position: subject.position }).select("id").single();
    if (moduleError || !module) throw new ManualAuthoringError("Não foi possível criar módulo da trilha.");
    const { error: lessonError } = await admin.from("learning_lessons").insert({ module_id: module.id, title: subject.title, objective: subject.notes || `Estudar ${subject.title}.`, position: 1, source_pages: [1], editorial_status: "planned", authoring_status: "draft" });
    if (lessonError) throw new ManualAuthoringError("Não foi possível criar aula inicial da matéria.");
  }
  return { course, created: true };
}
