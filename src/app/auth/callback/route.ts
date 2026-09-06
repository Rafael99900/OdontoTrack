import { NextResponse } from "next/server";

import { SupabaseAuthConfigurationError } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (!code && !(tokenHash && type === "email")) return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  try {
    const client = await createSupabaseServerClient();
    const { error } = code
      ? await client.auth.exchangeCodeForSession(code)
      : await client.auth.verifyOtp({ type: "email", token_hash: tokenHash! });
    if (error) {
      console.error("Falha ao trocar o código de autenticação", { message: error.message, status: error.status });
      return NextResponse.redirect(new URL("/login?error=invalid_link", url.origin));
    }
    return NextResponse.redirect(new URL("/area", url.origin));
  } catch (error) {
    if (error instanceof SupabaseAuthConfigurationError) return NextResponse.redirect(new URL("/login?error=configuration", url.origin));
    console.error("Falha inesperada no callback de autenticação", error);
    return NextResponse.redirect(new URL("/login?error=callback_failed", url.origin));
  }
}
