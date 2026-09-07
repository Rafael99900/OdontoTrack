import { redirect } from "next/navigation";
import { NoticeStudyEstimator } from "@/app/area/editais/_components/notice-study-estimator";
import { getApprovedNoticeAnalysis, readFact } from "@/lib/notices/analysis";
import { listVisibleNotices } from "@/lib/notices/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "Não informado na fonte aprovada";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString("pt-BR");
}

function formatFactDate(value: string | null) {
  if (!value) return "Não informado na fonte aprovada";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString("pt-BR");
}

export default async function AnaliseMauaPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");

  const catalog = await listVisibleNotices().catch(() => []);
  const maua = catalog.find((item) => item.municipality === "Mauá");
  const notice = maua ? await getApprovedNoticeAnalysis(maua.id) : null;

  if (!notice) {
    return <main className="editorial-page" data-cy="notice-analysis-unavailable">
      <header className="editorial-header"><div><span className="tag">ANÁLISE VERIFICÁVEL</span><h1>Análise ainda não disponível.</h1><p>O edital de Mauá só é exibido nesta área após a aprovação editorial da versão e das evidências.</p></div><a className="secundario" href="/area/editais">Voltar aos editais</a></header>
      <section className="catalog-error"><h2>Não há versão aprovada para analisar.</h2><p>Isso evita apresentar dados provisórios como se fossem atuais. Confira a fonte oficial ou a fila editorial.</p></section>
    </main>;
  }

  const position = notice.positions.find((item) => item.area?.toLocaleLowerCase("pt-BR").includes("odontologia")) ?? notice.positions[0];
  const subjectText = readFact(notice.facts, "syllabus") ?? "Conteúdo programático não informado na fonte aprovada.";
  const subjects = subjectText.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  const exam = readFact(notice.facts, "exam_date");
  const registration = readFact(notice.facts, "registration_period");
  const requirements = readFact(notice.facts, "requirements");
  const usesPriorFacts = notice.factsVersion.id !== notice.currentVersion.id;

  return <main className="editorial-page" data-cy="notice-analysis-maua">
    <header className="editorial-header">
      <div>
        <span className="tag">ANÁLISE VERIFICÁVEL · VERSÃO VIGENTE {notice.currentVersion.version_number}</span>
        <h1>{notice.title}</h1>
        <p>{notice.organizationName} · Mauá, SP · atualização verificada em documentos oficiais.</p>
      </div>
      <a className="secundario" href="/area/editais" data-cy="back-to-notices">Voltar aos editais</a>
    </header>

    {usesPriorFacts && <aside className="review-note" data-cy="facts-source-version">
      Os dados do cargo e o conteúdo abaixo vêm da versão {notice.factsVersion.version_number}, a última versão aprovada que contém esses campos. A versão vigente {notice.currentVersion.version_number} permanece listada nas retificações e não substitui fatos sem evidência específica.
    </aside>}

    <section className="editorial-grid" aria-label="Resumo para decisão">
      <article data-cy="notice-decision-summary">
        <h2>Decisão rápida</h2>
        <dl>
          <dt>Cargo</dt><dd>{position?.title ?? "Não informado na fonte aprovada"}</dd>
          <dt>Local</dt><dd>{notice.municipality}, {notice.stateCode}</dd>
          <dt>Inscrições</dt><dd>{registration ?? "Não informado na fonte aprovada"}</dd>
          <dt>Prova objetiva</dt><dd>{formatFactDate(exam)}</dd>
          <dt>Vagas</dt><dd>{position?.vacancies ?? "Não informado na fonte aprovada"}</dd>
          <dt>Remuneração</dt><dd>{position?.remuneration_cents != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(position.remuneration_cents / 100) : "Não informado na fonte aprovada"}</dd>
          <dt>Jornada</dt><dd>{position?.workload_hours_week ? `${position.workload_hours_week} horas semanais` : "Não informado na fonte aprovada"}</dd>
          <dt>Requisitos</dt><dd>{requirements ?? "Não informado na fonte aprovada"}</dd>
        </dl>
      </article>
      <NoticeStudyEstimator subjectCount={Math.max(1, subjects.length)} defaultHoursPerWeek={10} />
    </section>

    <section className="course-modules" aria-label="Conteúdo e documentos do edital">
      <article data-cy="notice-subject-adherence">
        <h2>Matérias e aderência</h2>
        <p>O plano é montado a partir dos tópicos oficiais do Anexo II. Cada tópico abaixo compõe uma unidade de estudo da trilha.</p>
        <ul className="subject-list">
          {subjects.map((subject) => <li key={subject}>{subject}</li>)}
        </ul>
        <p className="review-note"><strong>Aderência da trilha:</strong> {subjects.length} tópico{subjects.length === 1 ? "" : "s"} oficial{subjects.length === 1 ? "" : "is"} identificado{subjects.length === 1 ? "" : "s"}. A estimativa usa exatamente essa lista, com teoria, questões e revisão conforme a profundidade selecionada.</p>
        <a className="primario" href="/area/cursos" data-cy="create-study-path-from-notice">Criar trilha a partir deste edital</a>
      </article>

      <article data-cy="notice-retifications">
        <h2>Versões e retificações</h2>
        <p>Documentos aprovados em ordem da versão mais recente para a abertura. Abra cada arquivo para conferir o texto integral.</p>
        {notice.history.map((item) => <div className="version-row" key={item.id} data-cy={`notice-version-${item.version_number}`}>
          <b>Versão {item.version_number}{item.id === notice.currentVersion.id ? " · vigente" : ""}</b>
          <span>Publicação: {formatDate(item.publication_date)}</span>
          <p>{item.change_summary ?? "Documento oficial aprovado sem resumo editorial adicional."}</p>
          <a href={item.document_url ?? item.source_url} target="_blank" rel="noreferrer">Abrir documento oficial</a>
        </div>)}
      </article>

      <article data-cy="notice-evidence">
        <h2>Rastreabilidade dos dados</h2>
        <p>Os fatos desta análise são exibidos apenas quando há evidência aprovada. A referência abaixo aponta a página ou a captura oficial que sustenta a informação.</p>
        {notice.evidence.map((item) => <div className="evidence-row" key={item.id}>
          <p><strong>{item.page_number ? `Página ${item.page_number}` : "Portal oficial"}:</strong> {item.excerpt}</p>
          <a href={item.source_url} target="_blank" rel="noreferrer">Abrir fonte</a>
        </div>)}
        <a className="secundario" target="_blank" rel="noreferrer" href={notice.currentVersion.document_url ?? notice.canonicalUrl} data-cy="open-current-notice-pdf">Abrir PDF oficial da versão vigente</a>
      </article>
    </section>
  </main>;
}
