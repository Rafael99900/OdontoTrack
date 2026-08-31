import { NextResponse } from "next/server";

import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { collectAndPersistMaua } from "../../../../../workers/collector/run-maua-supabase.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireOperationalToken(request.headers.get("authorization"));
    const { result, saved } = await collectAndPersistMaua();
    return NextResponse.json({
      sourceKey: result.sourceKey,
      canonicalUrl: result.canonicalUrl ?? null,
      contentHash: result.contentHash ?? null,
      capturedAt: result.completedAt ?? null,
      runStatus: saved.runStatus ?? result.runStatus,
      snapshotId: saved.snapshotId ?? null,
      snapshotRecorded: saved.snapshotRecorded,
    });
  } catch (error) {
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError) return NextResponse.json({ error: "Coleta operacional indisponível." }, { status: 503 });
    if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    return NextResponse.json({ error: "Não foi possível concluir a coleta de Mauá." }, { status: 502 });
  }
}
