import { MagicLinkForm } from "@/features/auth/magic-link-form";
import styles from "./login.module.css";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className={styles.page} data-cy="auth-login-page">
      <h1>Entrar no OdontoTrack</h1>
      <p className={styles.intro}>Entre com Google ou receba um link de acesso por e-mail.</p>
      {error && <p className={styles.error} data-cy="auth-callback-error" role="alert">Não foi possível concluir seu acesso. Solicite um novo link.</p>}
      <MagicLinkForm className={styles.form} />
    </main>
  );
}
