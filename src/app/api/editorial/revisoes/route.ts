import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireUser() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { client, response: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  return { client, response: null };
}

export async function GET() {
  const { client, response } = await requireUser();
  if (response) return response;
  const { data, error } = await client.rpc("editorial_review_queue_items");
  if (error) return NextResponse.json({ error: "A fila editorial não está disponível para esta conta." }, { status: 403 });
  return NextResponse.json({ items: data ?? [] });
}

export async function PATCH(request: Request) {
  const { client, response } = await requireUser();
  if (response) return response;
  const body = await request.json() as { queueId?: string; decision?: "in_review" | "approved" | "rejected"; reviewNote?: string };
  if (!body.queueId || !body.decision) return NextResponse.json({ error: "queueId e decision são obrigatórios." }, { status: 400 });
  const { data, error } = await client.rpc("editorial_transition_review_queue", {
    p_queue_id: body.queueId,
    p_decision: body.decision,
    p_review_note: body.reviewNote ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ item: data });
}
