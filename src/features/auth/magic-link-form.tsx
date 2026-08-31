"use client";

import { FormEvent, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SupabaseAuthConfigurationError } from "@/lib/supabase/config";

export function MagicLinkForm() {
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
      setStatus("error");
      setMessage(error instanceof SupabaseAuthConfigurationError
        ? "O login ainda não está disponível neste ambiente."
        : "Não foi possível enviar o link. Confira o e-mail e tente novamente.");
    }
  }

  return (
    <form onSubmit={submit} data-cy="auth-magic-link-form" aria-busy={status === "loading"}>
      <label htmlFor="email">Seu e-mail</label>
      <input
        id="email"
        data-cy="auth-email-input"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        disabled={status === "loading"}
      />
      <button data-cy="auth-send-magic-link" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Enviando link…" : "Enviar link de acesso"}
      </button>
      {message && <p data-cy="auth-status" role={status === "error" ? "alert" : "status"}>{message}</p>}
    </form>
  );
}
