import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AreaPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  return <main className="area-page" data-cy="auth-protected-area">
    <span className="tag">ÁREA PRIVADA</span>
    <h1>Olá, {user.email}.</h1>
    <p>Revise fontes oficiais antes de transformar um edital em curso e trilha de estudo.</p>
    <div className="area-actions">
      <a className="primario" href="/area/revisoes" data-cy="open-editorial-review">Abrir revisão editorial</a>
      <a className="secundario" href="/area/cursos" data-cy="open-course-draft">Ver trilha em rascunho</a>
    </div>
  </main>;
}
