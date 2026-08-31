const OFFICIAL_HOSTS = new Set([
  "clic.prefeitura.sp.gov.br",
  "www.prefeitura.sp.gov.br",
  "prefeitura.sp.gov.br",
]);

const DOCUMENT_EXTENSION = /\.(?:pdf|docx?|xlsx?)(?:$|[?#])/i;

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

function absoluteOfficialUrl(href, baseUrl) {
  try {
    const url = new URL(decodeHtml(href.trim()), baseUrl);
    if (url.protocol !== "https:" || !OFFICIAL_HOSTS.has(url.hostname)) return null;
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
