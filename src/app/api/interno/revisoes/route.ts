import { NextResponse } from "next/server";

import { requireEditorialReviewToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { createEditorialReviewQueue, EditorialTransitionError } from "../../../../../workers/collector/editorial-review-queue.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function protectedError(error: unknown) {
  if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError) return NextResponse.json({ error: "Revisão editorial indisponível." }, { status: 503 });
  if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (error instanceof EditorialTransitionError) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ error: "Não foi possível concluir a revisão editorial." }, { status: 502 });
}

export async function GET(request: Request) {
  try {
    requireEditorialReviewToken(request.headers.get("authorization"));
    return NextResponse.json({ items: await createEditorialReviewQueue().listOpen() });
  } catch (error) {
    return protectedError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireEditorialReviewToken(request.headers.get("authorization"));
    const body = await request.json() as { queueId?: string; decision?: "in_review" | "approved" | "rejected"; reviewNote?: string };
    if (!body.queueId || !body.decision) return NextResponse.json({ error: "queueId e decision são obrigatórios." }, { status: 400 });
    const item = await createEditorialReviewQueue().transition({ queueId: body.queueId, decision: body.decision, reviewNote: body.reviewNote });
    return NextResponse.json({ item });
  } catch (error) {
    return protectedError(error);
  }
}
