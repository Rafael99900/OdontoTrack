import { createSupabaseRestClient } from "./supabase-persistence.mjs";

export class EditorialTransitionError extends Error {
  constructor(message) {
    super(message);
    this.name = "EditorialTransitionError";
  }
}

const transitions = {
  pending: new Set(["in_review"]),
  in_review: new Set(["approved", "rejected"]),
  approved: new Set(),
  rejected: new Set(),
  dismissed: new Set(),
};

export function createEditorialReviewQueue({ client = createSupabaseRestClient() } = {}) {
  return {
    async listOpen() {
      const queueRows = await client.list("notice_review_queue", {
        filters: { review_status: "in.(pending,in_review)" },
        order: "enqueued_at.asc",
        limit: 100,
      });
      return Promise.all(queueRows.map(async (queue) => {
        const [candidateVersion, changes] = await Promise.all([
          client.findOne("notice_versions", { id: queue.candidate_notice_version_id }, { select: "id,version_number,source_url,document_url,content_hash,captured_at,editorial_status" }),
          client.list("notice_version_changes", {
            filters: { candidate_notice_version_id: `eq.${queue.candidate_notice_version_id}` },
            order: "created_at.asc",
            limit: 100,
          }),
        ]);
        return { ...queue, candidateVersion, changes };
      }));
    },

    async transition({ queueId, decision, reviewNote, now = () => new Date() }) {
      const queue = await client.findOne("notice_review_queue", { id: queueId }, { select: "id,review_status,candidate_notice_version_id,previous_notice_version_id" });
      if (!queue) throw new EditorialTransitionError("Item de revisão não encontrado.");
      if (!transitions[queue.review_status]?.has(decision)) throw new EditorialTransitionError("Transição editorial não permitida.");
      if (["approved", "rejected"].includes(decision) && !reviewNote?.trim()) throw new EditorialTransitionError("Uma nota editorial é obrigatória para a decisão final.");
      const fields = decision === "in_review"
        ? { review_status: decision }
        : { review_status: decision, reviewed_at: now().toISOString(), review_note: reviewNote.trim() };
      const rows = await client.update("notice_review_queue", fields, { id: queueId, review_status: queue.review_status });
      if (!rows[0]) throw new EditorialTransitionError("O item foi atualizado por outra revisão; recarregue a fila.");
      // Não há atualização de notices.current_version_id nesta rota.
      return rows[0];
    },
  };
}
