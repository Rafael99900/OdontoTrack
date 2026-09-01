import { NextResponse } from "next/server";

import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { persistFirstRealMauaNotice } from "../../../../../workers/collector/persist-first-real-notice.mjs";
import { OfficialDocumentValidationError } from "../../../../../workers/collector/pmsp-notice-discovery.mjs";
import { OfficialDocumentArchiveError } from "../../../../../workers/collector/official-document-archive.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Operação interna, idempotente e restrita ao edital candidato de Mauá. */
export async function POST(request: Request) {
  try {
    requireOperationalToken(request.headers.get("authorization"));
    const result = await persistFirstRealMauaNotice();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof OfficialDocumentValidationError) return NextResponse.json({ error: error.message }, { status: 422 });
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError || error instanceof OfficialDocumentArchiveError) {
      return NextResponse.json({ error: "Persistência editorial indisponível." }, { status: 503 });
    }
    return NextResponse.json({ error: "Não foi possível persistir o edital de Mauá." }, { status: 502 });
  }
}
