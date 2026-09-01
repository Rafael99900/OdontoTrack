"use client";

import { FormEvent, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SupabaseAuthConfigurationError } from "@/lib/supabase/config";

export function MagicLinkForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const client = createSupabaseBrowserClient();
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setStatus("sent");
      setMessage("Enviamos um link seguro para seu e-mail. Verifique também a caixa de spam.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : "";
      setStatus("error");
      setMessage(error instanceof SupabaseAuthConfigurationError
        ? "O login ainda não está disponível neste ambiente."
        : /rate limit|email.*limit|too many/i.test(errorMessage)
          ? "O limite temporário de e-mails do Supabase foi atingido. Aguarde antes de solicitar outro link."
        : "Não foi possível enviar o link. Confira o e-mail e tente novamente.");
    }
  }

  async function signInWithGoogle() {
    setStatus("loading");
    setMessage("");
    try {
      const client = createSupabaseBrowserClient();
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof SupabaseAuthConfigurationError
        ? "O login com Google ainda não está disponível neste ambiente."
        : "Não foi possível iniciar o login com Google. Tente novamente.");
    }
  }

  return (
    <form className={className} onSubmit={submit} data-cy="auth-magic-link-form" aria-busy={status === "loading"}>
      <label htmlFor="email">Seu e-mail</label>
      <input
        id="email"
        data-cy="auth-email-input"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        aria-describedby="auth-login-help auth-status"
        required
        disabled={status === "loading"}
      />
      <button data-cy="auth-send-magic-link" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Enviando link…" : "Enviar link de acesso"}
      </button>
      <p id="auth-login-help" className="auth-help">Use seu e-mail de acesso. Prefira Google se o link por e-mail expirar.</p>
      <p id="auth-status" className={status === "error" ? "auth-status auth-status-error" : "auth-status"} data-cy="auth-status" role={status === "error" ? "alert" : "status"} aria-live={status === "error" ? "assertive" : "polite"} aria-atomic="true">{message}</p>
      <div className="auth-divider" aria-hidden="true">ou</div>
      <button
        data-cy="auth-google-sign-in"
        className="auth-google-button"
        type="button"
        onClick={signInWithGoogle}
        disabled={status === "loading"}
      >
        Continuar com Google
      </button>
    </form>
  );
}
