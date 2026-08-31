import { collectGrandeAbcSources } from "./grande-abc-sources.mjs";
import { createSupabaseCollectorPersistence } from "./supabase-persistence.mjs";

export async function collectAndPersistGrandeAbc() {
  const persistence = createSupabaseCollectorPersistence();
  const results = await collectGrandeAbcSources();
  const saved = await Promise.all(results.map((result) => persistence.persist(result)));
  return results.map((result, index) => ({ result, saved: saved[index] }));
}
