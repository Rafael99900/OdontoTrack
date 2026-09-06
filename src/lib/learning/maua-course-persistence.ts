import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mauaCourseTemplate, mauaLessonVideoPolicies } from "@/lib/learning/maua-course-template";
import { firstRealNoticeCandidate } from "@/lib/notices/first-real-notice";

type CourseRow = { id: string; status: string; title: string };

export class LearningCourseError extends Error {}

async function requireApprovedNoticeVersion() {
  const admin = createSupabaseAdminClient();
  const { data: notice, error: noticeError } = await admin.from("notices").select("id,editorial_status")
    .eq("external_reference", firstRealNoticeCandidate.id).maybeSingle();
  if (noticeError) throw new LearningCourseError("Não foi possível consultar o edital.");
  if (!notice || notice.editorial_status !== "approved") throw new LearningCourseError("O edital ainda precisa de aprovação editorial.");
  const { data: version, error: versionError } = await admin.from("notice_versions").select("id,editorial_status")
    .eq("notice_id", notice.id).eq("editorial_status", "approved").order("version_number", { ascending: false }).limit(1).maybeSingle();
  if (versionError || !version) throw new LearningCourseError("Não existe versão aprovada para gerar a trilha.");
  return { admin, versionId: version.id };
}

/** Geração idempotente, privada e dependente de evidência editorial aprovada. */
export async function createMauaCourseForUser(userId: string): Promise<CourseRow> {
  const { admin, versionId } = await requireApprovedNoticeVersion();
  const { data: existing, error: existingError } = await admin.from("learning_courses").select("id,status,title")
    .eq("source_notice_version_id", versionId).eq("owner_user_id", userId).maybeSingle();
  if (existingError) throw new LearningCourseError("Não foi possível consultar a trilha existente.");
  if (existing) return existing;

  const { data: course, error: courseError } = await admin.from("learning_courses").insert({
    source_notice_version_id: versionId, owner_user_id: userId, title: mauaCourseTemplate.title, status: "editorial_review", source_pages: mauaCourseTemplate.sourcePages,
  }).select("id,status,title").single();
  if (courseError || !course) throw new LearningCourseError("Não foi possível criar a trilha.");

  for (const [moduleIndex, module] of mauaCourseTemplate.modules.entries()) {
    const { data: savedModule, error: moduleError } = await admin.from("learning_modules").insert({ course_id: course.id, title: module.title, position: moduleIndex + 1 }).select("id").single();
    if (moduleError || !savedModule) throw new LearningCourseError("Não foi possível criar um módulo da trilha.");
    for (const [lessonIndex, lesson] of module.lessons.entries()) {
      const { data: savedLesson, error: lessonError } = await admin.from("learning_lessons").insert({
        module_id: savedModule.id, title: lesson.title, objective: lesson.objective, position: lessonIndex + 1, source_pages: [31], editorial_status: "planned",
      }).select("id").single();
      if (lessonError || !savedLesson) throw new LearningCourseError("Não foi possível criar uma aula da trilha.");
      const attribution = lesson.sources.map((source) => ({ label: source.label, url: source.url, page: source.page, licenseNote: source.licenseNote }));
      const assets: { asset_kind: string; status: string; title: string; asset_url?: string }[] = [
        { asset_kind: "pdf", status: "planned", title: `PDF editorial: ${lesson.title}` },
        { asset_kind: "audio", status: "planned", title: `Áudio complementar: ${lesson.title}` },
        { asset_kind: "notebook_prompt", status: "planned", title: `Prompt de estudo: ${lesson.title}` },
      ];
      const videoPolicy = mauaLessonVideoPolicies[lesson.key];
      const approvedLink = videoPolicy.candidates.find((candidate) => candidate.reviewStatus === "approved");
      if (approvedLink) assets.push({ asset_kind: "video", status: "approved", title: approvedLink.title, asset_url: approvedLink.externalUrl });
      const { error: assetError } = await admin.from("learning_assets").insert(assets.map((asset) => ({ lesson_id: savedLesson.id, ...asset, source_attribution: attribution })));
      if (assetError) throw new LearningCourseError("Não foi possível registrar os materiais da aula.");
      if (videoPolicy.candidates.length > 0) {
        const { error: videoError } = await admin.from("learning_video_candidates").insert(videoPolicy.candidates.map((candidate) => ({
          lesson_id: savedLesson.id, provider: candidate.provider, title: candidate.title, external_url: candidate.externalUrl,
          channel_name: candidate.channelName, rights_evidence_url: candidate.rightsEvidenceUrl,
          license_status: candidate.licenseStatus, review_status: candidate.reviewStatus,
        })));
        if (videoError) throw new LearningCourseError("Não foi possível registrar a curadoria de vídeo.");
      }
    }
  }
  return course;
}

export async function getMauaCourseForUser(userId: string) {
  const { admin, versionId } = await requireApprovedNoticeVersion();
  const { data, error } = await admin.from("learning_courses").select("id,status,title,learning_modules(id,title,position,learning_lessons(id,title,objective,position))")
    .eq("source_notice_version_id", versionId).eq("owner_user_id", userId).maybeSingle();
  if (error) throw new LearningCourseError("Não foi possível carregar a trilha.");
  return data;
}

export async function saveLessonProgress(userId: string, lessonId: string, completed: boolean) {
  const { admin } = await requireApprovedNoticeVersion();
  const { data: lesson, error: lessonError } = await admin.from("learning_lessons").select("id,module_id,learning_modules!inner(course_id,learning_courses!inner(owner_user_id))").eq("id", lessonId).maybeSingle();
  if (lessonError || !lesson) throw new LearningCourseError("Aula não encontrada.");
  const owner = (lesson.learning_modules as unknown as { learning_courses: { owner_user_id: string } }).learning_courses.owner_user_id;
  if (owner !== userId) throw new LearningCourseError("Aula não pertence ao usuário atual.");
  const { error } = await admin.from("learning_lesson_progress").upsert({ lesson_id: lessonId, user_id: userId, completed_at: completed ? new Date().toISOString() : null, last_opened_at: new Date().toISOString() }, { onConflict: "lesson_id,user_id" });
  if (error) throw new LearningCourseError("Não foi possível atualizar o progresso.");
}
