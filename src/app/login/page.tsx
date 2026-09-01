import { MagicLinkForm } from "@/features/auth/magic-link-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main data-cy="auth-login-page">
      <h1>Entrar no OdontoTrack</h1>
      <p>Entre com Google ou receba um link de acesso por e-mail.</p>
      {error && <p data-cy="auth-callback-error" role="alert">Não foi possível concluir seu acesso. Solicite um novo link.</p>}
      <MagicLinkForm />
    </main>
  );
}
