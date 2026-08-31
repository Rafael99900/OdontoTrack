import { NextResponse } from "next/server";

import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { collectAndPersistPmsp } from "../../../../../workers/collector/run-pmsp-supabase.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireOperationalToken(request.headers.get("authorization"));
    const { result, saved } = await collectAndPersistPmsp();
    const successfulResult = "canonicalUrl" in result ? result : null;
    return NextResponse.json({
      sourceKey: result.sourceKey,
      canonicalUrl: successfulResult?.canonicalUrl ?? null,
      contentHash: successfulResult?.contentHash ?? null,
      capturedAt: result.completedAt ?? null,
      httpStatus: successfulResult?.httpStatus ?? null,
      runStatus: saved.runStatus ?? result.runStatus,
      runId: saved.runId ?? null,
      snapshotId: saved.snapshotId ?? null,
      snapshotRecorded: saved.snapshotRecorded,
    });
  } catch (error) {
    if (error instanceof OperationalTokenConfigurationError) {
      return NextResponse.json({ error: "Disparo operacional indisponível." }, { status: 503 });
    }
    if (error instanceof SupabasePersistenceConfigurationError) {
      return NextResponse.json({ error: "Persistência operacional indisponível." }, { status: 503 });
    }
    if (error instanceof OperationalTokenUnauthorizedError) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Não foi possível concluir a coleta." }, { status: 502 });
  }
}
