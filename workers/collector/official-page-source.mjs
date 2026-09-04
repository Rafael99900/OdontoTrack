import { createHash } from "node:crypto";

function sha256(body) {
  return createHash("sha256").update(body).digest("hex");
}

function stableCapture(body, contentType) {
  if (!contentType?.includes("text/html")) return body;
  return Buffer.from(body.toString("utf8")
    .replace(/<!--[^]*?-->/g, "")
    .replace(/<script\b[^>]*>[^]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[^]*?<\/style>/gi, "")
    .replace(/\s+/g, " ")
    .trim(), "utf8");
}

/** Coleta uma página oficial sem classificar ou publicar editais. */
export async function collectOfficialPage(source, { fetchPage = fetch, now = () => new Date() } = {}) {
  const startedAt = now().toISOString();
  try {
    const candidates = [source.requestedUrl, ...(source.fallbackUrls ?? [])];
    let response;
    let requestedUrl = source.requestedUrl;
    let lastError;
    for (const candidate of candidates) {
      try {
        const current = await fetchPage(candidate, {
          headers: {
            "user-agent": "Mozilla/5.0 (compatible; OdontoTrack/1.0; +https://odonto-track.vercel.app)",
            accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
            "accept-language": "pt-BR,pt;q=0.9",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(20000),
        });
        if (!current.ok) throw new Error(`HTTP ${current.status}`);
        response = current;
        requestedUrl = candidate;
        break;
      } catch (error) { lastError = error; }
    }
    if (!response) throw lastError ?? new Error("Fonte indisponível");
    const body = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "";
    const rawContentHash = sha256(body);
    const contentHash = sha256(stableCapture(body, contentType));
    const completedAt = now().toISOString();
    return {
      sourceKey: source.key,
      requestedUrl,
      canonicalUrl: response.url || source.requestedUrl,
      contentHash,
      startedAt,
      completedAt,
      httpStatus: response.status,
      runStatus: "change_detected",
      metadata: {
        municipality: source.municipality,
        sourceKind: source.kind,
        contentType,
        byteLength: body.byteLength,
        rawContentHash,
      },
    };
  } catch (error) {
    return {
      sourceKey: source.key,
      requestedUrl: source.requestedUrl,
      startedAt,
      completedAt: now().toISOString(),
      runStatus: "failed",
      errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
