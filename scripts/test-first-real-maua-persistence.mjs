import { persistFirstRealMauaNotice } from "../workers/collector/persist-first-real-notice.mjs";

const tables = new Map();
let counter = 0;
const id = (prefix) => `${prefix}-${++counter}`;
function matches(row, filters) {
  return Object.entries(filters).every(([key, value]) => {
    const expected = String(value).replace(/^eq\./, "");
    return String(row[key]) === expected;
  });
}
const client = {
  async findOne(table, filters) { return (tables.get(table) ?? []).find((row) => matches(row, filters)) ?? null; },
  async list(table, { filters = {}, order } = {}) {
    const rows = (tables.get(table) ?? []).filter((row) => matches(row, filters));
    return order?.includes("desc") ? rows.reverse() : rows;
  },
  async insert(table, row, options = {}) {
    if (options.ignoreDuplicates && options.onConflict === "candidate_notice_version_id") {
      const duplicate = (tables.get(table) ?? []).find((current) => current.candidate_notice_version_id === row.candidate_notice_version_id);
      if (duplicate) return [];
    }
    const saved = { id: id(table), ...row };
    tables.set(table, [...(tables.get(table) ?? []), saved]);
    return [saved];
  },
  async update(table, fields, filters) {
    const rows = tables.get(table) ?? [];
    const index = rows.findIndex((row) => matches(row, filters));
    if (index < 0) return [];
    rows[index] = { ...rows[index], ...fields };
    return [rows[index]];
  },
};
const archive = async () => ({
  verified: { canonicalUrl: "https://dom.maua.sp.gov.br/public/docs/edital.pdf", contentHash: "a".repeat(64) },
  archived: { bucket: "official-documents", path: "maua-concursos/aa/hash.pdf", contentType: "application/pdf", byteLength: 99 },
});
const collect = async () => ({ saved: { snapshotId: "snapshot-maua" } });
const snapshot = { id: "snapshot-maua", source_key: "maua-concursos", canonical_url: "https://www.maua.sp.gov.br/Concursos/", content_hash: "b".repeat(64) };
tables.set("source_snapshots", [snapshot]);
const options = { client, collect, archive, now: () => new Date("2026-09-01T12:00:00Z") };
const first = await persistFirstRealMauaNotice(options);
const second = await persistFirstRealMauaNotice(options);
if (!first.noticeCreated || !first.versionCreated || first.evidenceCount !== 4 || first.editorialStatus !== "pending_review") throw new Error("A primeira persistência não criou o candidato editorial completo.");
if (second.noticeCreated || second.versionCreated || tables.get("notice_versions").length !== 1 || tables.get("notice_review_queue").length !== 1) throw new Error("A persistência idempotente duplicou o edital ou a fila.");
if ((tables.get("notices")[0].current_version_id ?? null) !== null) throw new Error("A persistência não pode publicar uma versão automaticamente.");
if (tables.get("notice_version_facts").length !== 7) throw new Error("Os fatos críticos do edital não foram vinculados às evidências.");
console.log("Persistência Mauá: PDF arquivado, 4 evidências, 7 fatos e fila editorial pendente sem publicação.");
