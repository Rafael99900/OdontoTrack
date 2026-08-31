import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const PMSP_CLIC_SOURCE = {
  key: "sp-clic-concursos",
  name: "CLIC: Concursos",
  requestedUrl: "https://clic.prefeitura.sp.gov.br/concursos",
  municipality: "São Paulo",
  kind: "official_portal",
};

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

async function readState(statePath) {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") return { schemaVersion: 1, snapshots: [], runs: [] };
    throw error;
  }
}

async function writeState(statePath, state) {
  await mkdir(dirname(statePath), { recursive: true });
  const pendingPath = `${statePath}.tmp`;
  await writeFile(pendingPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(pendingPath, statePath);
}

export async function collectPmsp({ statePath, fetchPage = fetch, now = () => new Date() }) {
  const startedAt = now().toISOString();
  const state = await readState(statePath);
  let response;

  try {
    response = await fetchPage(PMSP_CLIC_SOURCE.requestedUrl, {
      headers: { "user-agent": "OdontoTrack/0.1 manual-source-check" },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type");
    const contentHash = sha256(stableCapture(body, contentType));
    const rawContentHash = sha256(body);
    const capturedAt = now().toISOString();
    const canonicalUrl = response.url || PMSP_CLIC_SOURCE.requestedUrl;
    const existing = state.snapshots.find((snapshot) =>
      snapshot.sourceKey === PMSP_CLIC_SOURCE.key &&
      snapshot.canonicalUrl === canonicalUrl &&
      snapshot.contentHash === contentHash,
    );
    const runStatus = existing ? "unchanged" : "change_detected";

    if (existing) existing.lastSeenAt = capturedAt;
    else state.snapshots.push({
      sourceKey: PMSP_CLIC_SOURCE.key,
      canonicalUrl,
      contentHash,
      capturedAt,
      firstSeenAt: capturedAt,
      lastSeenAt: capturedAt,
      contentType,
      byteLength: body.byteLength,
      reviewRequired: true,
      metadata: { municipality: PMSP_CLIC_SOURCE.municipality, sourceKind: PMSP_CLIC_SOURCE.kind, rawContentHash },
    });

    const run = {
      sourceKey: PMSP_CLIC_SOURCE.key,
      requestedUrl: PMSP_CLIC_SOURCE.requestedUrl,
      canonicalUrl,
      contentHash,
      startedAt,
      completedAt: capturedAt,
      httpStatus: response.status,
      runStatus,
      metadata: { contentType, byteLength: body.byteLength, rawContentHash },
    };
    state.runs.push(run);
    await writeState(statePath, state);
    return { ...run, snapshotCreated: !existing, statePath };
  } catch (error) {
    const run = {
      sourceKey: PMSP_CLIC_SOURCE.key,
      requestedUrl: PMSP_CLIC_SOURCE.requestedUrl,
      startedAt,
      completedAt: now().toISOString(),
      runStatus: "failed",
      errorMessage: error instanceof Error ? error.message : "Erro desconhecido",
    };
    state.runs.push(run);
    await writeState(statePath, state);
    return { ...run, snapshotCreated: false, statePath };
  }
}
