import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { collectPmsp } from "../workers/collector/pmsp-source.mjs";

const folder = await mkdtemp(join(tmpdir(), "odontotrack-pmsp-"));
const statePath = join(folder, "state.json");
const fixedFetch = async () => new Response("<main>fonte oficial de teste</main>", {
  status: 200,
  headers: { "content-type": "text/html" },
});
const changedFetch = async () => new Response("<main>fonte oficial alterada</main>", {
  status: 200,
  headers: { "content-type": "text/html" },
});

try {
  const first = await collectPmsp({ statePath, fetchPage: fixedFetch, now: () => new Date("2026-08-31T12:00:00Z") });
  const second = await collectPmsp({ statePath, fetchPage: fixedFetch, now: () => new Date("2026-08-31T12:01:00Z") });
  const third = await collectPmsp({ statePath, fetchPage: changedFetch, now: () => new Date("2026-08-31T12:02:00Z") });
  const state = JSON.parse(await readFile(statePath, "utf8"));

  if (first.runStatus !== "change_detected" || !first.snapshotCreated) throw new Error("Primeira captura deveria criar snapshot para revisão.");
  if (second.runStatus !== "unchanged" || second.snapshotCreated) throw new Error("Segunda captura idêntica não pode duplicar snapshot.");
  if (third.runStatus !== "change_detected" || !third.snapshotCreated) throw new Error("Conteúdo alterado precisa criar snapshot para revisão.");
  if (state.snapshots.length !== 2 || state.runs.length !== 3) throw new Error("Auditoria idempotente inválida.");
  console.log("PMSP collector idempotency passed: 3 runs, 2 snapshots.");
} finally {
  await rm(folder, { recursive: true, force: true });
}
