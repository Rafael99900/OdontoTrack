import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ManualAuthoringError } from "@/lib/learning/manual-authoring";

export async function authenticatedUser() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  return user;
}
export function manualError(error: unknown) {
  return NextResponse.json({ error: error instanceof ManualAuthoringError ? error.message : "Não foi possível concluir a operação manual." }, { status: error instanceof ManualAuthoringError ? 422 : 500 });
}
export async function bodyOf(request: Request) { return await request.json() as Record<string, unknown>; }
