import { MagicLinkForm } from "@/features/auth/magic-link-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main data-cy="auth-login-page">
      <h1>Entrar no OdontoTrack</h1>
      <p>Informe seu e-mail para receber um link de acesso.</p>
      {error && <p data-cy="auth-callback-error" role="alert">Não foi possível concluir seu acesso. Solicite um novo link.</p>}
      <MagicLinkForm />
    </main>
  );
}
