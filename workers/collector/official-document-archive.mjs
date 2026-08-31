import { createHash } from "node:crypto";

const OFFICIAL_DOCUMENT_BUCKET = "official-documents";

export class OfficialDocumentArchiveError extends Error {
  constructor(message) {
    super(message);
    this.name = "OfficialDocumentArchiveError";
  }
}

function normalizeSupabaseUrl(url) {
  if (!url) throw new OfficialDocumentArchiveError("SUPABASE_URL é obrigatória para arquivar o documento.");
  return url.endsWith("/") ? url : `${url}/`;
}

function assertPdf(document) {
  if (!document?.bytes || !Buffer.isBuffer(document.bytes)) {
    throw new OfficialDocumentArchiveError("O arquivo oficial precisa conter bytes verificados.");
  }
  if (document.bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new OfficialDocumentArchiveError("Somente PDFs com assinatura válida podem ser arquivados.");
  }
  const contentHash = createHash("sha256").update(document.bytes).digest("hex");
  if (document.contentHash && document.contentHash !== contentHash) {
    throw new OfficialDocumentArchiveError("O hash informado não confere com o PDF verificado.");
  }
  return contentHash;
}

export function officialDocumentStoragePath({ sourceKey, contentHash }) {
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(sourceKey ?? "")) {
    throw new OfficialDocumentArchiveError("sourceKey inválida para o arquivo oficial.");
  }
  if (!/^[a-f0-9]{64}$/i.test(contentHash ?? "")) {
    throw new OfficialDocumentArchiveError("O hash SHA-256 do documento é obrigatório.");
  }
  return `${sourceKey}/${contentHash.slice(0, 2)}/${contentHash}.pdf`;
}

function storageObjectUrl(supabaseUrl, bucket, path) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return new URL(`storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, normalizeSupabaseUrl(supabaseUrl));
}

/**
 * Armazena uma única cópia privada por hash. Um conflito 409 significa que a
 * cópia idêntica já existe e não deve ser sobrescrita.
 */
export async function archiveOfficialPdf({
  document,
  sourceKey,
  supabaseUrl = process.env.SUPABASE_URL,
  serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY,
  fetchImplementation = fetch,
} = {}) {
  if (!serviceRoleKey) throw new OfficialDocumentArchiveError("SUPABASE_SERVICE_ROLE_KEY é obrigatória para arquivar o documento.");
  const contentHash = assertPdf(document);
  const path = officialDocumentStoragePath({ sourceKey, contentHash });
  const response = await fetchImplementation(storageObjectUrl(supabaseUrl, OFFICIAL_DOCUMENT_BUCKET, path), {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/pdf",
      "x-upsert": "false",
    },
    body: document.bytes,
  });

  if (!response.ok && response.status !== 409) {
    throw new OfficialDocumentArchiveError(`Não foi possível arquivar o PDF oficial (${response.status}).`);
  }

  return {
    bucket: OFFICIAL_DOCUMENT_BUCKET,
    path,
    contentHash,
    contentType: "application/pdf",
    byteLength: document.bytes.byteLength,
    alreadyArchived: response.status === 409,
  };
}
