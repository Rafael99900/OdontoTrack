import { redirect } from "next/navigation";

import { OpportunityDashboard } from "@/features/dashboard/opportunity-dashboard";
import { listVisibleNotices, type NoticeCatalogItem } from "@/lib/notices/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AreaPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  let notices: NoticeCatalogItem[] = [];
  let catalogError = false;
  try { notices = await listVisibleNotices(); } catch { catalogError = true; }
  return <main className="area-page" data-cy="auth-protected-area">
    <header className="area-topbar"><a className="area-brand" href="/area" aria-label="OdontoTrack, início">OT<span>OdontoTrack</span></a><nav aria-label="Navegação principal"><a href="/area" aria-current="page">Oportunidades</a><a href="/area/editais">Editais</a><a href="/area/cursos">Meus cursos</a></nav><span className="area-user" title={user.email}>{user.email}</span></header>
    {catalogError ? <section className="catalog-error" role="alert"><h1>Não foi possível carregar as oportunidades agora.</h1><p>O catálogo oficial está temporariamente indisponível. Tente novamente em alguns instantes.</p></section> : <OpportunityDashboard notices={notices} />}
  </main>;
}
