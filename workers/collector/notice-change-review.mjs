const CRITICAL_FACT_KEYS = new Set([
  "registration_period", "exam_date", "vacancies", "remuneration",
  "requirements", "syllabus", "workload", "fee",
]);

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function changedFacts(previousFacts, candidateFacts) {
  const previousByPath = new Map(previousFacts.map((fact) => [fact.changePath, fact]));
  return candidateFacts
    .filter((fact) => CRITICAL_FACT_KEYS.has(fact.factKey))
    .filter((fact) => stableJson(previousByPath.get(fact.changePath)?.value) !== stableJson(fact.value))
    .map((fact) => ({ previous: previousByPath.get(fact.changePath) ?? null, candidate: fact }));
}

export function classifyPersistedCapture({ previousPublishedVersion, candidateVersion, previousFacts = [], candidateFacts = [], comparisonReliable = true }) {
  if (previousPublishedVersion?.contentHash === candidateVersion.contentHash) {
    return { action: "unchanged", classification: null, changes: [], enqueue: false, preservesCurrentVersionId: previousPublishedVersion.id };
  }
  if (!previousPublishedVersion) {
    return { action: "review", classification: "new_notice", changes: [], enqueue: true, preservesCurrentVersionId: null };
  }
  const changes = changedFacts(previousFacts, candidateFacts);
  const missingEvidence = changes.some(({ candidate }) => !candidate.evidenceId);
  if (!comparisonReliable || missingEvidence) {
    return { action: "review", classification: "needs_manual_review", changes, enqueue: true, preservesCurrentVersionId: previousPublishedVersion.id };
  }
  return {
    action: "review",
    classification: changes.length ? "potential_retification" : "document_update",
    changes,
    enqueue: true,
    // Esta é a invariante que o chamador deve preservar: não tocar em notices.current_version_id.
    preservesCurrentVersionId: previousPublishedVersion.id,
  };
}

export function createReviewWritePlan({ noticeId, candidateVersion, previousPublishedVersion, outcome }) {
  if (!outcome.enqueue) return { queue: null, changes: [], publicUpdate: null };
  return {
    queue: {
      notice_id: noticeId,
      candidate_notice_version_id: candidateVersion.id,
      previous_notice_version_id: previousPublishedVersion?.id ?? null,
      classification: outcome.classification,
      review_status: "pending",
      review_reason: outcome.classification === "potential_retification"
        ? "Fatos críticos divergentes em captura posterior; requer revisão editorial."
        : "Captura candidata requer revisão editorial.",
    },
    changes: outcome.changes.map(({ previous, candidate }) => ({
      candidate_notice_version_id: candidateVersion.id,
      previous_notice_version_id: previousPublishedVersion?.id ?? null,
      change_path: candidate.changePath,
      change_key: candidate.factKey,
      previous_value: previous?.value ?? null,
      candidate_value: candidate.value,
      candidate_evidence_id: candidate.evidenceId ?? null,
    })),
    // Nunca incluir notices.current_version_id no plano de detecção.
    publicUpdate: null,
  };
}

export async function persistReviewWritePlan(client, plan) {
  if (!plan.queue) return { queued: false, changeCount: 0 };
  for (const change of plan.changes) await client.insert("notice_version_changes", change);
  const queueRows = await client.insert("notice_review_queue", plan.queue, {
    onConflict: "candidate_notice_version_id",
    ignoreDuplicates: true,
  });
  return { queued: true, queueId: queueRows[0]?.id ?? null, changeCount: plan.changes.length };
}
