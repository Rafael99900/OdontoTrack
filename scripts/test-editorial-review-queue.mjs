import { createEditorialReviewQueue, EditorialTransitionError } from "../workers/collector/editorial-review-queue.mjs";

const writes = [];
const rows = {
  "queue-pending": { id: "queue-pending", review_status: "pending", candidate_notice_version_id: "candidate-1", previous_notice_version_id: "published-1" },
  "queue-illegal": { id: "queue-illegal", review_status: "pending", candidate_notice_version_id: "candidate-1", previous_notice_version_id: "published-1" },
  "queue-review": { id: "queue-review", review_status: "in_review", candidate_notice_version_id: "candidate-1", previous_notice_version_id: "published-1" },
};
const client = {
  list: async (table) => table === "notice_review_queue" ? [rows["queue-pending"]] : [{ id: "diff-1", change_key: "exam_date" }],
  findOne: async (table, filters) => table === "notice_review_queue" ? rows[filters.id] ?? null : { id: "candidate-1", version_number: 2, editorial_status: "pending_review" },
  update: async (table, fields, filters) => {
    writes.push({ table, fields, filters });
    if (filters.review_status !== rows[filters.id]?.review_status) return [];
    rows[filters.id] = { ...rows[filters.id], ...fields };
    return [rows[filters.id]];
  },
};
const queue = createEditorialReviewQueue({ client });
const open = await queue.listOpen();
if (open.length !== 1 || open[0].candidateVersion.id !== "candidate-1" || open[0].changes.length !== 1) throw new Error("Fila aberta não trouxe versão/diff candidato.");
await queue.transition({ queueId: "queue-pending", decision: "in_review" });
await queue.transition({ queueId: "queue-review", decision: "approved", reviewNote: "Evidência revisada.", now: () => new Date("2026-08-31T15:00:00Z") });
if (writes.some(({ table }) => table === "notices") || writes.length !== 2 || rows["queue-review"].review_status !== "approved" || !rows["queue-review"].reviewed_at) throw new Error("Decisão editorial não foi registrada de forma segura.");
try {
  await queue.transition({ queueId: "queue-illegal", decision: "approved", reviewNote: "Pular etapa" });
  throw new Error("Transição pending→approved deveria falhar.");
} catch (error) {
  if (!(error instanceof EditorialTransitionError)) throw error;
}
console.log("Editorial review queue contract passed: list, pending→in_review→approved, no public notice update.");
