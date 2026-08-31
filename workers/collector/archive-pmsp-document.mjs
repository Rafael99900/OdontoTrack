import { archiveOfficialPdf } from "./official-document-archive.mjs";
import { fetchVerifiedPmspPdf } from "./pmsp-notice-discovery.mjs";

/**
 * Encadeia a validação de origem, MIME, assinatura e hash com o arquivo
 * privado. Este passo não cria nem publica um edital: a classificação e a
 * revisão editorial continuam obrigatórias.
 *
 * @param {{
 *   documentUrl: string,
 *   sourceKey?: string,
 *   fetchOfficial?: typeof fetch,
 *   archiveOptions?: Parameters<typeof archiveOfficialPdf>[0]
 * }} options
 */
export async function verifyAndArchivePmspDocument({
  documentUrl,
  sourceKey = "sp-clic-concursos",
  fetchOfficial = fetch,
  archiveOptions = {},
} = {}) {
  const document = await fetchVerifiedPmspPdf({ documentUrl, fetchPage: fetchOfficial });
  const archived = await archiveOfficialPdf({ document, sourceKey, ...archiveOptions });
  return {
    requestedUrl: document.requestedUrl,
    canonicalUrl: document.canonicalUrl,
    contentHash: document.contentHash,
    contentType: document.contentType,
    byteLength: document.byteLength,
    archived,
  };
}
