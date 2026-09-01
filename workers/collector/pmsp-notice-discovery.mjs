import { createHash } from "node:crypto";

const OFFICIAL_HOSTS = new Set([
  "clic.prefeitura.sp.gov.br",
  "www.prefeitura.sp.gov.br",
  "prefeitura.sp.gov.br",
]);

const DOCUMENT_EXTENSION = /\.(?:pdf|docx?|xlsx?)(?:$|[?#])/i;
const MAX_PDF_BYTES = 25 * 1024 * 1024;

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export class OfficialDocumentValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "OfficialDocumentValidationError";
  }
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function textFromHtml(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function absoluteOfficialUrl(href, baseUrl, allowedHosts = OFFICIAL_HOSTS) {
  try {
    const url = new URL(decodeHtml(href.trim()), baseUrl);
    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * Extrai somente referências documentais hospedadas em domínios oficiais da PMSP.
 * A função não presume que o documento seja um edital, nem grava dados: a
 * classificação editorial e a persistência dependem de revisão posterior.
 */
export function discoverPmspNoticeDocuments(html, { sourceUrl = "https://clic.prefeitura.sp.gov.br/concursos" } = {}) {
  if (typeof html !== "string") throw new TypeError("O HTML da fonte oficial deve ser texto.");

  const discovered = new Map();
  const anchors = html.matchAll(/<a\b[^>]*?href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a\s*>/gi);

  for (const match of anchors) {
    const url = absoluteOfficialUrl(match[2], sourceUrl);
    if (!url || !DOCUMENT_EXTENSION.test(url.pathname)) continue;

    url.hash = "";
    const canonicalUrl = url.toString();
    const linkText = textFromHtml(match[3]);
    const normalizedLabel = linkText.toLocaleLowerCase("pt-BR");
    const possibleNotice = /concurso|edital|sele[cç][aã]o|processo seletivo|nomea[cç][aã]o|retifica[cç][aã]o/i.test(normalizedLabel);

    if (!discovered.has(canonicalUrl)) {
      discovered.set(canonicalUrl, {
        documentUrl: canonicalUrl,
        sourceUrl,
        linkText: linkText || null,
        documentType: url.pathname.match(/\.([a-z0-9]+)$/i)?.[1].toLowerCase() ?? "unknown",
        possibleNotice,
        officialHost: url.hostname,
      });
    }
  }

  return [...discovered.values()].sort((a, b) => a.documentUrl.localeCompare(b.documentUrl));
}

export async function fetchPmspNoticeDocumentCandidates({ fetchPage = fetch, sourceUrl = "https://clic.prefeitura.sp.gov.br/concursos" } = {}) {
  const response = await fetchPage(sourceUrl, {
    headers: { "user-agent": "OdontoTrack/0.1 official-document-discovery" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Fonte oficial PMSP indisponível (HTTP ${response.status}).`);

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) throw new Error("A fonte oficial PMSP não retornou HTML para descoberta.");
  const html = await response.text();
  const canonicalSourceUrl = response.url || sourceUrl;
  return {
    sourceUrl: canonicalSourceUrl,
    candidates: discoverPmspNoticeDocuments(html, { sourceUrl: canonicalSourceUrl }),
  };
}

/**
 * Baixa um candidato de maneira limitada e o aceita somente se o retorno for
 * realmente um PDF da infraestrutura oficial. A gravação no banco/Storage é
 * propositalmente responsabilidade de uma etapa posterior e editorial.
 */
export async function fetchVerifiedPmspPdf({ documentUrl, fetchPage = fetch, maxBytes = MAX_PDF_BYTES } = {}) {
  return fetchVerifiedOfficialPdf({ documentUrl, fetchPage, maxBytes, allowedHosts: OFFICIAL_HOSTS });
}

/**
 * Verifica um PDF hospedado em uma lista explícita de domínios oficiais. A
 * lista é fornecida pelo adaptador municipal, nunca pelo cliente da API.
 */
export async function fetchVerifiedOfficialPdf({ documentUrl, fetchPage = fetch, maxBytes = MAX_PDF_BYTES, allowedHosts } = {}) {
  if (!documentUrl) throw new OfficialDocumentValidationError("A URL do documento é obrigatória.");
  if (!(allowedHosts instanceof Set) || allowedHosts.size === 0) throw new OfficialDocumentValidationError("A lista de domínios oficiais não foi configurada.");
  const requestedUrl = absoluteOfficialUrl(documentUrl, documentUrl, allowedHosts);
  if (!requestedUrl) throw new OfficialDocumentValidationError("O documento deve estar em HTTPS e host oficial permitido.");

  const response = await fetchPage(requestedUrl, {
    headers: { "user-agent": "OdontoTrack/0.1 official-pdf-verification" },
    redirect: "follow",
  });
  if (!response.ok) throw new OfficialDocumentValidationError(`Documento oficial indisponível (HTTP ${response.status}).`);

  const finalUrl = absoluteOfficialUrl(response.url || requestedUrl.toString(), requestedUrl.toString(), allowedHosts);
  if (!finalUrl) throw new OfficialDocumentValidationError("O redirecionamento do documento saiu do host oficial permitido.");
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/pdf")) throw new OfficialDocumentValidationError("O documento não informou content-type PDF.");

  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw new OfficialDocumentValidationError("O PDF excede o limite de tamanho permitido.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new OfficialDocumentValidationError("O PDF excede o limite de tamanho permitido.");
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new OfficialDocumentValidationError("O conteúdo não possui assinatura PDF válida.");

  return {
    requestedUrl: requestedUrl.toString(),
    canonicalUrl: finalUrl.toString(),
    contentHash: sha256(bytes),
    contentType,
    byteLength: bytes.byteLength,
    bytes,
  };
}
