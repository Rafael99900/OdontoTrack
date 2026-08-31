import { NextResponse } from "next/server";

import { SupabaseAuthConfigurationError } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
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
