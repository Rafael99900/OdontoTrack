import { join } from "node:path";
import { tmpdir } from "node:os";

import { collectPmsp } from "./pmsp-source.mjs";
import { createSupabaseCollectorPersistence } from "./supabase-persistence.mjs";

export async function collectAndPersistPmsp({ statePath = join(tmpdir(), "odontotrack-pmsp-collection-state.json") } = {}) {
  // A persistência é criada primeiro; se as variáveis server-only estiverem
  // ausentes, a função falha antes de acessar a fonte oficial.
  const persistence = createSupabaseCollectorPersistence();
  const result = await collectPmsp({ statePath });
  const saved = await persistence.persist(result);
  return { result, saved };
}
