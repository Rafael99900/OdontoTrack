import { redirect } from "next/navigation";
import { firstRealNoticeCandidate as notice } from "@/lib/notices/first-real-notice";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AnaliseMauaPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const weeks = 12; const hours = 10; const total = 96;
  return <main className="editorial-page" data-cy="notice-analysis-maua">
    <header className="editorial-header"><div><span className="tag">ANÁLISE VERIFICÁVEL</span><h1>{notice.title}</h1><p>Dados vinculados ao documento oficial e à versão aprovada.</p></div><a className="secundario" href="/area/editais">Voltar aos editais</a></header>
    <section className="editorial-grid"><article><h2>Decisão rápida</h2><dl><dt>Local</dt><dd>{notice.municipality}, SP</dd><dt>Prova</dt><dd>{notice.facts.examDate}</dd><dt>Vagas</dt><dd>{notice.position.vacancies} gerais e {notice.position.vacanciesPcd} PCD</dd><dt>Remuneração</dt><dd>{notice.facts.remuneration}</dd><dt>Jornada</dt><dd>{notice.facts.workloadHoursWeek} horas semanais</dd></dl></article><article><h2>Estimativa de estudo</h2><p>{total} horas sugeridas para a primeira cobertura, distribuídas em {weeks} semanas.</p><p>Com {hours} horas por semana: aproximadamente {Math.ceil(total / hours)} semanas. Ajuste a disponibilidade na próxima versão do perfil.</p></article></section>
    <section className="course-modules"><article><h2>Matérias e aderência</h2><p>{notice.facts.syllabus}</p><p><strong>Aderência inicial:</strong> a trilha prioriza SUS, atenção básica, saúde bucal e núcleo clínico, todos citados no Anexo II, página 31.</p><a className="primario" href="/area/cursos">Criar trilha a partir deste edital</a></article><article><h2>Rastreabilidade</h2>{notice.evidence.map((item)=><p key={item.field}><strong>{item.field}:</strong> {item.excerpt}</p>)}<a className="secundario" target="_blank" rel="noreferrer" href={notice.officialDocumentPage}>Abrir PDF oficial</a></article></section>
  </main>;
}
