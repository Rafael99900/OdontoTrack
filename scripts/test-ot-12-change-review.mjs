import { classifyPersistedCapture, createReviewWritePlan, persistReviewWritePlan } from "../workers/collector/notice-change-review.mjs";
import { changedCandidate, changedFacts, previousFacts, publishedVersion, sameHashCandidate } from "../tests/fixtures/ot-12-captures.mjs";

const unchanged = classifyPersistedCapture({
  previousPublishedVersion: publishedVersion,
  candidateVersion: sameHashCandidate,
  previousFacts,
  candidateFacts: previousFacts,
});
if (unchanged.action !== "unchanged" || unchanged.enqueue || createReviewWritePlan({ noticeId: "notice-1", candidateVersion: sameHashCandidate, previousPublishedVersion: publishedVersion, outcome: unchanged }).queue) {
  throw new Error("Hash igual não pode criar versão/fila de revisão.");
}

const changed = classifyPersistedCapture({
  previousPublishedVersion: publishedVersion,
  candidateVersion: changedCandidate,
  previousFacts,
  candidateFacts: changedFacts,
});
const plan = createReviewWritePlan({ noticeId: "notice-1", candidateVersion: changedCandidate, previousPublishedVersion: publishedVersion, outcome: changed });
if (changed.classification !== "potential_retification" || plan.queue?.review_status !== "pending" || plan.publicUpdate !== null || changed.preservesCurrentVersionId !== publishedVersion.id) {
  throw new Error("Mudança crítica deve criar candidata pending_review sem atualizar versão pública.");
}

const writes = [];
const client = { insert: async (...args) => { writes.push(args); return [{ id: "queue-1" }]; } };
const persisted = await persistReviewWritePlan(client, plan);
if (persisted.queueId !== "queue-1" || persisted.changeCount !== 1 || writes.filter(([table]) => table === "notice_review_queue").length !== 1 || writes.some(([table]) => table === "notices")) {
  throw new Error("Fila/diff não foram persistidos com a segurança esperada.");
}
console.log("OT-12 change review contract passed: unchanged skips queue; candidate creates pending review without public update.");
