import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AreaPage() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  return <main data-cy="auth-protected-area"><h1>Área do aluno</h1><p>Acesso autenticado para {user.email}.</p></main>;
}
