export const publishedVersion = { id: "version-published", contentHash: "a".repeat(64), editorialStatus: "published" };
export const sameHashCandidate = { id: "version-same", contentHash: "a".repeat(64), editorialStatus: "pending_review" };
export const changedCandidate = { id: "version-candidate", contentHash: "b".repeat(64), editorialStatus: "pending_review" };

export const previousFacts = [
  { changePath: "notice:exam_date", factKey: "exam_date", value: { date: "2026-10-20" }, evidenceId: "evidence-previous" },
];

export const changedFacts = [
  { changePath: "notice:exam_date", factKey: "exam_date", value: { date: "2026-10-27" }, evidenceId: "evidence-candidate" },
];
