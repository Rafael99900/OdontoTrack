import { persistMauaCp01Retifications } from "../workers/collector/persist-maua-retifications.mjs";

const tables = new Map();
let counter = 0;
const id = (prefix) => `${prefix}-${++counter}`;
function matches(row, filters) {
  return Object.entries(filters).every(([key, value]) => String(row[key]) === String(value).replace(/^eq\./, ""));
}
const client = {
  async findOne(table, filters) { return (tables.get(table) ?? []).find((row) => matches(row, filters)) ?? null; },
  async list(table, { filters = {}, order } = {}) {
    const rows = (tables.get(table) ?? []).filter((row) => matches(row, filters));
    return order?.includes("desc") ? [...rows].reverse() : rows;
  },
  async insert(table, row, options = {}) {
    if (options.ignoreDuplicates && options.onConflict === "candidate_notice_version_id") {
      if ((tables.get(table) ?? []).some((item) => item.candidate_notice_version_id === row.candidate_notice_version_id)) return [];
    }
    const saved = { id: id(table), ...row };
    tables.set(table, [...(tables.get(table) ?? []), saved]);
    return [saved];
  },
};
tables.set("sources", [{ id: "source-maua", canonical_url: "https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11" }]);
tables.set("notices", [{ id: "notice-maua", source_id: "source-maua", external_reference: "maua-cp-01-2025-cirurgiao-dentista-20h" }]);
tables.set("source_snapshots", [{ id: "snapshot-maua", source_key: "maua-concursos", canonical_url: "https://www.maua.sp.gov.br/Concursos/", content_hash: "s".repeat(64) }]);
tables.set("notice_versions", [{ id: "opening", notice_id: "notice-maua", version_number: 1, content_hash: "o".repeat(64) }]);
const archive = async (url) => {
  const suffix = url.includes("b9eab") ? "1" : "2";
  return { verified: { canonicalUrl: url, contentHash: suffix.repeat(64) }, archived: { bucket: "official-documents", path: `maua/${suffix}.pdf`, contentType: "application/pdf", byteLength: 100 } };
};
const options = { client, archive, collect: async () => ({ saved: { snapshotId: "snapshot-maua" } }), now: () => new Date("2026-09-06T12:00:00Z") };
const first = await persistMauaCp01Retifications(options);
const retry = await persistMauaCp01Retifications(options);
if (first.retifications.length !== 2 || first.retifications.some((item) => !item.versionCreated || item.classification !== "document_update")) {
  throw new Error("As duas retificações precisam criar versões candidatas document_update.");
}
if (retry.retifications.some((item) => item.versionCreated) || (tables.get("notice_versions") ?? []).length !== 3) {
  throw new Error("A repetição não pode duplicar as versões de retificação.");
}
if ((tables.get("evidence") ?? []).length !== 4 || (tables.get("notice_review_queue") ?? []).length !== 2) {
  throw new Error("Cada retificação precisa de duas evidências e uma fila editorial.");
}
console.log("Persistência de retificações Mauá: 2 versões, 4 evidências e 2 filas idempotentes sem publicação.");
