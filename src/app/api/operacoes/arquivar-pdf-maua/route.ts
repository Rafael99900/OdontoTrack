import { NextResponse } from "next/server";

import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { archiveMauaOfficialDocument } from "../../../../../workers/collector/archive-maua-document.mjs";
import { OfficialDocumentValidationError } from "../../../../../workers/collector/pmsp-notice-discovery.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireOperationalToken(request.headers.get("authorization"));
    const body = await request.json() as { documentUrl?: string };
    if (!body.documentUrl) return NextResponse.json({ error: "documentUrl é obrigatória." }, { status: 400 });
    const { verified, archived } = await archiveMauaOfficialDocument(body.documentUrl);
    return NextResponse.json({
      documentUrl: verified.canonicalUrl,
      contentHash: verified.contentHash,
      storagePath: archived.path,
      alreadyArchived: archived.alreadyArchived,
      requiresEditorialReview: true,
    });
  } catch (error) {
    if (error instanceof OfficialDocumentValidationError) return NextResponse.json({ error: error.message }, { status: 422 });
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError) return NextResponse.json({ error: "Arquivamento operacional indisponível." }, { status: 503 });
    if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    return NextResponse.json({ error: "Não foi possível arquivar o PDF oficial de Mauá." }, { status: 502 });
  }
}
