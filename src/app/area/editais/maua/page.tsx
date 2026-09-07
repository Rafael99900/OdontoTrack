import { redirect } from "next/navigation";
import { NoticeStudyEstimator } from "@/app/area/editais/_components/notice-study-estimator";
import { getApprovedNoticeAnalysis, readFact } from "@/lib/notices/analysis";
import { listVisibleNotices } from "@/lib/notices/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AnaliseMauaPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const catalog = await listVisibleNotices().catch(() => []);
  const maua = catalog.find((item) => item.municipality === "Mauá");
  const notice = maua ? await getApprovedNoticeAnalysis(maua.id) : null;
  if (!notice) return <main className="editorial-page" data-cy="notice-analysis-unavailable"><header className="editorial-header"><div><span className="tag">ANÁLISE VERIFICÁVEL</span><h1>Análise ainda não disponível.</h1><p>O edital de Mauá só é exibido nesta área após a aprovação editorial da versão e das evidências.</p></div><a className="secundario" href="/area/editais">Voltar aos editais</a></header><section className="catalog-error"><h2>Não há versão aprovada para analisar.</h2><p>Isso evita apresentar dados provisórios como se fossem atuais. Confira a fonte oficial ou a fila editorial.</p></section></main>;
  const position = notice.positions.find((item) => item.area?.toLocaleLowerCase("pt-BR").includes("odontologia")) ?? notice.positions[0];
  const subjectText = readFact(notice.facts, "syllabus") ?? readFact(notice.facts, "conteudo_programatico") ?? "Conteúdo programático aprovado sem taxonomia disponível.";
  const subjects = subjectText.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  const exam = readFact(notice.facts, "exam_date") ?? readFact(notice.facts, "data_prova") ?? "Consulte a versão vigente";
  const registration = readFact(notice.facts, "registration_period") ?? "Consulte a versão vigente";
  return <main className="editorial-page" data-cy="notice-analysis-maua">
    <header className="editorial-header"><div><span className="tag">ANÁLISE VERIFICÁVEL · VERSÃO {notice.currentVersion.version_number}</span><h1>{notice.title}</h1><p>{notice.organizationName} · dados da versão aprovada e suas evidências.</p></div><a className="secundario" href="/area/editais">Voltar aos editais</a></header>
    <section className="editorial-grid"><article><h2>Decisão rápida</h2><dl><dt>Local</dt><dd>{notice.municipality}, {notice.stateCode}</dd><dt>Inscrições</dt><dd>{registration}</dd><dt>Prova</dt><dd>{exam}</dd><dt>Vagas</dt><dd>{position?.vacancies ?? "Não informado"}</dd><dt>Remuneração</dt><dd>{position?.remuneration_cents ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(position.remuneration_cents / 100) : "Não informado"}</dd><dt>Jornada</dt><dd>{position?.workload_hours_week ? `${position.workload_hours_week} horas semanais` : "Não informado"}</dd></dl></article><NoticeStudyEstimator subjectCount={Math.max(1, subjects.length)} defaultHoursPerWeek={10} /></section>
    <section className="course-modules"><article><h2>Matérias e aderência</h2><p>{subjectText}</p><p><strong>Aderência:</strong> a estimativa usa os tópicos aprovados disponíveis nesta versão. A classificação fina será revisada por assunto antes de gerar cada aula.</p><a className="primario" href="/area/cursos">Criar trilha a partir deste edital</a></article><article><h2>Versões e retificações</h2>{notice.history.map((item) => <div className="version-row" key={item.id}><b>Versão {item.version_number}</b><span>{item.publication_date ? new Date(item.publication_date).toLocaleDateString("pt-BR") : "Data não informada"}</span><p>{item.change_summary ?? "Sem resumo de alteração publicado."}</p><a href={item.document_url ?? item.source_url} target="_blank" rel="noreferrer">Abrir documento</a></div>)}</article><article><h2>Rastreabilidade</h2>{notice.evidence.map((item)=><p key={item.id}><strong>{item.page_number ? `Página ${item.page_number}` : "Evidência"}:</strong> {item.excerpt}</p>)}<a className="secundario" target="_blank" rel="noreferrer" href={notice.currentVersion.document_url ?? notice.canonicalUrl}>Abrir PDF oficial</a></article></section>
  </main>;
}
