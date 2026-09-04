import { redirect } from "next/navigation";

import { listVisibleNotices } from "@/lib/notices/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditaisPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const notices = await listVisibleNotices();

  return <main className="editorial-page" data-cy="approved-notices-dashboard">
    <header className="editorial-header">
      <div><span className="tag">EDITAIS APROVADOS</span><h1>Atualizações verificáveis.</h1><p>Somente versões aprovadas editorialmente aparecem aqui.</p></div>
      <a className="secundario" href="/area" data-cy="approved-notices-back">Voltar à área</a>
    </header>
    <section className="course-modules" data-cy="approved-notices-list">
      {notices.length ? notices.map((notice) => <article key={notice.id} data-cy={`approved-notice-${notice.id}`}>
        <span className="tag">{notice.municipality} · {notice.stateCode}</span>
        <h2>{notice.title}</h2>
        <p>{notice.organizationName}</p>
        <p>Fonte: {notice.sourceName ?? "órgão oficial"} · atualização editorial em {new Date(notice.lastCapturedAt).toLocaleDateString("pt-BR")}</p>
        <a className="primario" href={notice.canonicalUrl} target="_blank" rel="noreferrer" data-cy={`open-official-notice-${notice.id}`}>Abrir fonte oficial</a>
        {notice.municipality === "Mauá" && <a className="secundario" href="/area/editais/maua" data-cy="open-maua-analysis">Analisar edital</a>}
      </article>) : <article data-cy="approved-notices-empty"><h2>Nenhum edital aprovado ainda.</h2><p>As novas capturas aparecerão aqui depois da conferência editorial.</p></article>}
    </section>
  </main>;
}
