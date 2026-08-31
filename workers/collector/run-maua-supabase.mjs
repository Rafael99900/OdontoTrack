import { collectMaua } from "./maua-source.mjs";
import { createSupabaseCollectorPersistence } from "./supabase-persistence.mjs";

export async function collectAndPersistMaua() {
  const persistence = createSupabaseCollectorPersistence();
  const result = await collectMaua();
  const saved = await persistence.persist(result);
  return { result, saved };
}
