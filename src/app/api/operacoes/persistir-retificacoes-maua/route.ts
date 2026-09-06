import { NextResponse } from "next/server";

import { OfficialDocumentArchiveError } from "../../../../../workers/collector/official-document-archive.mjs";
import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { persistMauaCp01Retifications } from "../../../../../workers/collector/persist-maua-retifications.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Operação interna, idempotente e restrita às retificações verificadas do CP 01/2025 de Mauá. */
export async function POST(request: Request) {
  try {
    requireOperationalToken(request.headers.get("authorization"));
    return NextResponse.json(await persistMauaCp01Retifications(), { status: 201 });
  } catch (error) {
    console.error("Falha sanitizada ao persistir retificações de Mauá", { name: error instanceof Error ? error.name : "UnknownError" });
    if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError || error instanceof OfficialDocumentArchiveError) {
      return NextResponse.json({ error: "Persistência editorial indisponível." }, { status: 503 });
    }
    return NextResponse.json({ error: "Não foi possível persistir as retificações de Mauá." }, { status: 502 });
  }
}
