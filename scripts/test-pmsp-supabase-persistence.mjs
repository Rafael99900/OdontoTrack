import { createSupabaseCollectorPersistence, SupabasePersistenceConfigurationError } from "../workers/collector/supabase-persistence.mjs";

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
const client = {
  insert: async (...args) => { calls.push(["insert", ...args]); return []; },
  update: async (...args) => { calls.push(["update", ...args]); return []; },
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
await persistence.persist(initial);
await persistence.persist({ ...initial, startedAt: "2026-08-31T12:01:00Z", completedAt: "2026-08-31T12:01:01Z", runStatus: "unchanged", snapshotCreated: false });

const runWrites = calls.filter(([kind, table]) => kind === "insert" && table === "collection_runs");
const snapshotWrites = calls.filter(([kind, table]) => kind === "insert" && table === "source_snapshots");
const snapshotUpdates = calls.filter(([kind, table]) => kind === "update" && table === "source_snapshots");
if (runWrites.length !== 2 || snapshotWrites.length !== 1 || snapshotUpdates.length !== 1) {
  throw new Error("Contrato de persistência idempotente inválido.");
}
console.log("PMSP Supabase persistence contract passed: missing config fails; 2 runs, 1 snapshot insert, 1 last-seen update.");
