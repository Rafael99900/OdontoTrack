import { buildDailyCollectionReport } from "../workers/collector/daily-collection-report.mjs";

const report = buildDailyCollectionReport([
  { sourceKey: "pmsp", status: "fulfilled", value: { result: { sourceKey: "pmsp", runStatus: "change_detected" }, saved: { snapshotId: "snapshot-1", runStatus: "change_detected" } } },
  { sourceKey: "maua", status: "fulfilled", value: { result: { sourceKey: "maua", runStatus: "unchanged" }, saved: { snapshotId: "snapshot-2", runStatus: "unchanged" } } },
  { sourceKey: "abc", status: "rejected" },
], { collectedAt: "2026-09-04T11:00:00.000Z" });
if (report.status !== "degraded" || !report.alertRequired || report.summary.failed !== 1 || report.summary.changed !== 1 || report.sources[2].status !== "failed") {
  throw new Error("Relatório diário não classificou a falha parcial de modo observável.");
}
const allowedFields = new Set(["collectedAt", "status", "summary", "total", "failed", "changed", "unchanged", "sources", "sourceKey", "snapshotId", "reviewRequired", "alertRequired"]);
function assertSanitized(value) {
  if (Array.isArray(value)) return value.forEach(assertSanitized);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (!allowedFields.has(key)) throw new Error(`Campo não sanitizado no relatório: ${key}`);
    assertSanitized(child);
  }
}
assertSanitized(report);
console.log("Relatório diário: sucesso, alteração e falha parcial consolidados sem segredo.");
