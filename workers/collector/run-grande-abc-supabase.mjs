import { collectGrandeAbcSources } from "./grande-abc-sources.mjs";
import { createSupabaseCollectorPersistence } from "./supabase-persistence.mjs";

export async function collectAndPersistGrandeAbc({
  collectSources = collectGrandeAbcSources,
  persistence = createSupabaseCollectorPersistence(),
} = {}) {
  const results = await collectSources();
  const settled = await Promise.allSettled(results.map((result) => persistence.persist(result)));
  return results.map((result, index) => ({
    result,
    saved: settled[index].status === "fulfilled"
      ? settled[index].value
      : { runRecorded: false, snapshotRecorded: false, runStatus: "failed" },
  }));
}
