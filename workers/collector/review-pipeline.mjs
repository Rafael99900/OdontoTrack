import { classifyPersistedCapture, createReviewWritePlan, persistReviewWritePlan } from "./notice-change-review.mjs";
import { createSupabaseRestClient } from "./supabase-persistence.mjs";

const OFFICIAL_SOURCE_KEYS = new Set(["sp-clic-concursos"]);

export class OfficialSnapshotRequiredError extends Error {
  constructor() {
    super("A revisão requer um snapshot oficial já persistido pelo coletor.");
    this.name = "OfficialSnapshotRequiredError";
  }
}

export function createServerReviewPipeline({ client = createSupabaseRestClient() } = {}) {
  return {
    async review({ noticeId, originSnapshotId, previousPublishedVersion, candidateVersion, previousFacts = [], candidateFacts = [], comparisonReliable = true }) {
      if (!originSnapshotId || candidateVersion.originSnapshotId !== originSnapshotId) throw new OfficialSnapshotRequiredError();
      const snapshot = await client.findOne(
        "source_snapshots",
        { id: originSnapshotId },
        { select: "id,source_key,canonical_url,content_hash" },
      );
      if (!snapshot || !OFFICIAL_SOURCE_KEYS.has(snapshot.source_key)) throw new OfficialSnapshotRequiredError();
      if (candidateVersion.originSnapshotId !== snapshot.id) throw new OfficialSnapshotRequiredError();

      const outcome = classifyPersistedCapture({
        previousPublishedVersion,
        candidateVersion,
        previousFacts,
        candidateFacts,
        comparisonReliable,
      });
      const plan = createReviewWritePlan({ noticeId, candidateVersion, previousPublishedVersion, outcome });
      const persisted = await persistReviewWritePlan(client, plan);
      return { outcome, persisted, publicCurrentVersionId: outcome.preservesCurrentVersionId };
    },
  };
}
