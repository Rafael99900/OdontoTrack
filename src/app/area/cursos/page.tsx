import { redirect } from "next/navigation";

import { createNoticeCourseDraft } from "@/lib/courses/notice-course-draft";
import { CourseLaunch } from "@/features/learning/course-launch";
import { CourseProgress } from "@/features/learning/course-progress";
import { firstRealNoticeCandidate } from "@/lib/notices/first-real-notice";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const admin = createSupabaseAdminClient();
  const { data: persistedNotice } = await admin
    .from("notices")
    .select("editorial_status")
    .eq("external_reference", firstRealNoticeCandidate.id)
    .maybeSingle();
  const course = createNoticeCourseDraft({
    ...firstRealNoticeCandidate,
    editorialStatus: persistedNotice?.editorial_status === "approved" ? "approved" : "pending_review",
  });
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);

  return <main className="editorial-page" data-cy="courses-editorial-page">
    <header className="editorial-header">
      <div><span className="tag">CURSO GERADO A PARTIR DO EDITAL</span><h1>{course.title}</h1><p>{lessonCount} aulas planejadas a partir do conteúdo da página 31 do edital oficial.</p></div>
      <a className="secundario" href="/area" data-cy="courses-back-dashboard">Voltar à área</a>
    </header>
    <section className="course-guard" data-cy="course-editorial-guard">
      <strong>{course.canPublish ? "Pronto para produção" : "Aguardando aprovação editorial"}</strong>
      <p>{course.canPublish ? "Os materiais podem seguir para produção editorial." : "A trilha está estruturada, mas não será publicada nem exibirá conteúdo gerado enquanto o edital não for aprovado."}</p>
      <a href={course.sourceDocumentUrl} target="_blank" rel="noreferrer" data-cy="course-open-source-page">Consultar evidência oficial</a>
      <CourseLaunch canCreate={course.canPublish} />
    </section>
    <CourseProgress />
    <section className="editorial-grid" data-cy="course-production-rules"><article><span className="tag">PADRÃO DE PRODUÇÃO</span><h2>Vídeo, PDF, áudio e questões</h2><ol>{course.productionRules.map((rule) => <li key={rule}>{rule}</li>)}</ol></article></section>
  </main>;
}
