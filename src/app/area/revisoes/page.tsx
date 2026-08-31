import { redirect } from "next/navigation";

import { firstRealNoticeCandidate } from "@/lib/notices/first-real-notice";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RevisoesPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");

  const notice = firstRealNoticeCandidate;
  return (
    <main className="editorial-page" data-cy="editorial-review-page">
      <header className="editorial-header">
        <div>
          <span className="tag">REVISÃO EDITORIAL</span>
          <h1>Antes de publicar, confirmar.</h1>
          <p>Todo dado crítico deve apontar para uma fonte oficial e manter seu histórico de atualização.</p>
        </div>
        <a className="secundario" href="/area" data-cy="editorial-back-dashboard">Voltar à área</a>
      </header>

      <section className="editorial-notice" data-cy="editorial-review-notice">
        <div className="editorial-status"><span>AGUARDA REVISÃO</span><small>Capturado em {notice.sourceCapturedAt}</small></div>
        <h2>{notice.title}</h2>
        <p>{notice.organizationName} · {notice.municipality} · {notice.position.area}</p>
        <dl>
          <dt>Vagas confirmadas</dt><dd>{notice.position.vacancies} gerais · {notice.position.vacanciesPcd} PCD</dd>
          <dt>Inscrições</dt><dd>{notice.facts.registrationPeriod}</dd>
          <dt>Banca</dt><dd>{notice.facts.organizer}</dd>
          <dt>Data da prova</dt><dd className="pending-value">A confirmar no PDF oficial</dd>
          <dt>Conteúdo programático</dt><dd className="pending-value">A extrair do PDF oficial</dd>
        </dl>
        <div className="editorial-actions">
          <a className="primario" href={notice.sourceUrl} target="_blank" rel="noreferrer" data-cy="editorial-open-official-source">Abrir fonte oficial</a>
          <a className="secundario" href={notice.officialDocumentPage} target="_blank" rel="noreferrer" data-cy="editorial-open-official-document">Abrir Diário Oficial</a>
        </div>
      </section>

      <section className="editorial-grid">
        <article data-cy="editorial-evidence-list">
          <span className="tag">EVIDÊNCIAS CAPTURADAS</span>
          <h2>O que já pode ser conferido</h2>
          {notice.evidence.map((item) => <div className="evidence-row" key={item.field}>
            <strong>{item.field}</strong><p>{item.excerpt}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">Ver origem</a>
          </div>)}
        </article>
        <article data-cy="editorial-checklist">
          <span className="tag">PRÓXIMA REVISÃO</span>
          <h2>Checklist de aprovação</h2>
          <ol>{notice.reviewChecklist.map((item) => <li key={item}>{item}</li>)}</ol>
          <p className="review-note">A aprovação será habilitada somente após o PDF ser arquivado e os fatos receberem evidência por página.</p>
        </article>
      </section>
    </main>
  );
}
