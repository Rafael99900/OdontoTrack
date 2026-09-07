import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeManualNotice } from "@/lib/learning/manual-authoring";
import { authenticatedUser, bodyOf, manualError } from "@/app/api/manual/_lib";

export async function GET() {
  const user = await authenticatedUser(); if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  try { const { data, error } = await createSupabaseAdminClient().from("manual_notices").select("*").eq("owner_user_id", user.id).order("updated_at", { ascending: false }); if (error) throw error; return NextResponse.json({ notices: data ?? [] }); } catch (error) { return manualError(error); }
}
export async function POST(request: Request) {
  const user = await authenticatedUser(); if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  try { const input = normalizeManualNotice(await bodyOf(request), true); const { data, error } = await createSupabaseAdminClient().from("manual_notices").insert({ ...input, owner_user_id: user.id, status: "draft" }).select("*").single(); if (error) throw error; return NextResponse.json({ notice: data }, { status: 201 }); } catch (error) { return manualError(error); }
}
