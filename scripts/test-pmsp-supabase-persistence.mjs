import { createSupabaseCollectorPersistence, SupabasePersistenceConfigurationError } from "../workers/collector/supabase-persistence.mjs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const { SUPABASE_URL: _ignoredUrl, SUPABASE_SERVICE_ROLE_KEY: _ignoredKey, ...environmentWithoutSupabase } = process.env;
const missingConfigCommand = spawnSync(process.execPath, [resolve(import.meta.dirname, "collect-pmsp-to-supabase.mjs")], {
  env: environmentWithoutSupabase,
  encoding: "utf8",
});
if (missingConfigCommand.status !== 2 || !missingConfigCommand.stderr.includes("Persistência Supabase não configurada")) {
  throw new Error("Comando de persistência deveria falhar com código 2 antes da coleta.");
}

const missing = createSupabaseCollectorPersistence;
const previousUrl = process.env.SUPABASE_URL;
const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
try {
  try {
    missing();
    throw new Error("Configuração ausente deveria falhar antes de criar cliente.");
  } catch (error) {
    if (!(error instanceof SupabasePersistenceConfigurationError)) throw error;
  }
} finally {
  if (previousUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previousUrl;
  if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
}

const calls = [];
let existingSnapshot = null;
const client = {
  findOne: async (...args) => { calls.push(["findOne", ...args]); return existingSnapshot; },
  insert: async (table, row, options) => {
    calls.push(["insert", table, row, options]);
    if (table === "source_snapshots") existingSnapshot = { id: "snapshot-1" };
    return [{ id: table === "collection_runs" ? `run-${calls.filter(([kind, candidate]) => kind === "insert" && candidate === "collection_runs").length}` : "snapshot-1" }];
  },
  update: async (...args) => { calls.push(["update", ...args]); return [{ id: "snapshot-1" }]; },
};
const persistence = createSupabaseCollectorPersistence({ client });
const initial = {
  sourceKey: "sp-clic-concursos",
  requestedUrl: "https://clic.prefeitura.sp.gov.br/concursos",
  canonicalUrl: "https://clic.prefeitura.sp.gov.br/concursos",
  contentHash: "a".repeat(64),
  startedAt: "2026-08-31T12:00:00Z",
  completedAt: "2026-08-31T12:00:01Z",
  httpStatus: 200,
  runStatus: "change_detected",
  snapshotCreated: true,
  metadata: { contentType: "text/html", byteLength: 10 },
};
const first = await persistence.persist(initial);
const second = await persistence.persist({ ...initial, startedAt: "2026-08-31T12:01:00Z", completedAt: "2026-08-31T12:01:01Z", runStatus: "change_detected", snapshotCreated: true });

const runWrites = calls.filter(([kind, table]) => kind === "insert" && table === "collection_runs");
const snapshotWrites = calls.filter(([kind, table]) => kind === "insert" && table === "source_snapshots");
const snapshotUpdates = calls.filter(([kind, table]) => kind === "update" && table === "source_snapshots");
if (runWrites.length !== 2 || snapshotWrites.length !== 1 || snapshotUpdates.length !== 1) {
  throw new Error("Contrato de persistência idempotente inválido.");
}
if (first.runStatus !== "change_detected" || second.runStatus !== "unchanged" || !first.runId || !second.runId || second.snapshotId !== "snapshot-1") {
  throw new Error("Resultados persistidos não informam ids ou status esperado.");
}
console.log("PMSP Supabase persistence contract passed: missing config fails; 2 runs, 1 snapshot insert, 1 last-seen update.");
