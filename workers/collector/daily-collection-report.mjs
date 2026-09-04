/** Mantém o resultado diário pequeno, sanitizado e adequado a logs/alertas. */
export function buildDailyCollectionReport(entries, { collectedAt = new Date().toISOString() } = {}) {
  const sources = entries.map((entry) => {
    if (entry.status === "rejected") {
      return { sourceKey: entry.sourceKey, status: "failed", snapshotId: null, reviewRequired: false };
    }
    const { result, saved } = entry.value;
    return {
      sourceKey: result.sourceKey,
      status: saved?.runStatus ?? result.runStatus ?? "failed",
      snapshotId: saved?.snapshotId ?? null,
      reviewRequired: result.runStatus !== "failed",
    };
  });
  const failed = sources.filter((source) => source.status === "failed");
  const changed = sources.filter((source) => source.status === "change_detected");
  const unchanged = sources.filter((source) => source.status === "unchanged");
  return {
    collectedAt,
    status: failed.length ? "degraded" : "ok",
    summary: { total: sources.length, failed: failed.length, changed: changed.length, unchanged: unchanged.length },
    sources,
    alertRequired: failed.length > 0,
  };
}
