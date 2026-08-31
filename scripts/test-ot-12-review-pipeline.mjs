import { createServerReviewPipeline, OfficialSnapshotRequiredError } from "../workers/collector/review-pipeline.mjs";
import { changedCandidate, changedFacts, previousFacts, publishedVersion, sameHashCandidate } from "../tests/fixtures/ot-12-captures.mjs";

const writes = [];
const isolatedSnapshot = { id: "test-snapshot-official", source_key: "sp-clic-concursos", canonical_url: "https://clic.prefeitura.sp.gov.br/concursos", content_hash: "b".repeat(64) };
const client = {
  findOne: async (table, filters) => table === "source_snapshots" && filters.id === isolatedSnapshot.id ? isolatedSnapshot : null,
  insert: async (table, row, options) => { writes.push({ table, row, options }); return [{ id: table === "notice_review_queue" ? "test-queue-1" : "test-change-1" }]; },
};
const pipeline = createServerReviewPipeline({ client });

const common = {
  noticeId: "test-notice-1",
  originSnapshotId: isolatedSnapshot.id,
  previousPublishedVersion: publishedVersion,
  previousFacts,
};

const same = await pipeline.review({
  ...common,
  candidateVersion: { ...sameHashCandidate, originSnapshotId: isolatedSnapshot.id },
  candidateFacts: previousFacts,
});
if (same.outcome.action !== "unchanged" || writes.length !== 0 || same.publicCurrentVersionId !== publishedVersion.id) {
  throw new Error("Captura igual não pode escrever fila/diff nem alterar versão pública.");
}

const changed = await pipeline.review({
  ...common,
  candidateVersion: { ...changedCandidate, originSnapshotId: isolatedSnapshot.id },
  candidateFacts: changedFacts,
});
if (changed.outcome.classification !== "potential_retification" || changed.persisted.queueId !== "test-queue-1" || changed.publicCurrentVersionId !== publishedVersion.id) {
  throw new Error("Captura alterada deveria criar revisão pendente e preservar current_version_id.");
}
if (writes.map(({ table }) => table).join(",") !== "notice_version_changes,notice_review_queue" || writes.some(({ table }) => ["notices", "source_snapshots"].includes(table))) {
  throw new Error("Pipeline escreveu fora das tabelas internas de revisão.");
}

try {
  await pipeline.review({ ...common, originSnapshotId: "snapshot-nao-persistido", candidateVersion: { ...changedCandidate, originSnapshotId: "snapshot-nao-persistido" }, candidateFacts: changedFacts });
  throw new Error("Snapshot não persistido deveria falhar.");
} catch (error) {
  if (!(error instanceof OfficialSnapshotRequiredError)) throw error;
}
if (writes.length !== 2) throw new Error("Falha de origem não pode produzir escrita.");
console.log("OT-12 review pipeline integration passed: isolated fixtures, 0 writes for equal hash, 2 internal writes for change, no public update.");
