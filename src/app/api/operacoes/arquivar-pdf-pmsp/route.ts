import { NextResponse } from "next/server";

import { verifyAndArchivePmspDocument } from "../../../../../workers/collector/archive-pmsp-document.mjs";
import { OfficialDocumentArchiveError } from "../../../../../workers/collector/official-document-archive.mjs";
import { OfficialDocumentValidationError } from "../../../../../workers/collector/pmsp-notice-discovery.mjs";
import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireOperationalToken(request.headers.get("authorization"));
    const payload: unknown = await request.json();
    const documentUrl = typeof payload === "object" && payload !== null && "documentUrl" in payload
      ? (payload as { documentUrl?: unknown }).documentUrl
      : undefined;
    if (typeof documentUrl !== "string" || !documentUrl.trim()) {
      return NextResponse.json({ error: "documentUrl é obrigatória." }, { status: 400 });
    }

    const result = await verifyAndArchivePmspDocument({ documentUrl: documentUrl.trim() });
    return NextResponse.json({
      canonicalUrl: result.canonicalUrl,
      contentHash: result.contentHash,
      contentType: result.contentType,
      byteLength: result.byteLength,
      storage: {
        bucket: result.archived.bucket,
        path: result.archived.path,
        alreadyArchived: result.archived.alreadyArchived,
      },
      requiresEditorialReview: true,
    });
  } catch (error) {
    if (error instanceof OperationalTokenConfigurationError) {
      return NextResponse.json({ error: "Disparo operacional indisponível." }, { status: 503 });
    }
    if (error instanceof OperationalTokenUnauthorizedError) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    if (error instanceof OfficialDocumentValidationError || error instanceof OfficialDocumentArchiveError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Não foi possível arquivar o documento oficial." }, { status: 502 });
  }
}
