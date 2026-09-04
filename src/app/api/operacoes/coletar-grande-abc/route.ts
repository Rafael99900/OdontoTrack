import { NextResponse } from "next/server";

import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { collectAndPersistGrandeAbc } from "../../../../../workers/collector/run-grande-abc-supabase.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireOperationalToken(request.headers.get("authorization"));
    const sources = await collectAndPersistGrandeAbc();
    return NextResponse.json({ sources: sources.map(({ result, saved }) => ({
      sourceKey: result.sourceKey,
      runStatus: saved.runStatus ?? result.runStatus,
      snapshotId: (saved as { snapshotId?: string | null }).snapshotId ?? null,
      snapshotRecorded: saved.snapshotRecorded,
    })) });
  } catch (error) {
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError) return NextResponse.json({ error: "Coleta operacional indisponível." }, { status: 503 });
    if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    return NextResponse.json({ error: "Não foi possível concluir a coleta da Grande ABC." }, { status: 502 });
  }
}
