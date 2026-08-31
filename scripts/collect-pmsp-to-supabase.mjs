import { resolve } from "node:path";

import { collectPmsp } from "../workers/collector/pmsp-source.mjs";
import { createSupabaseCollectorPersistence, SupabasePersistenceConfigurationError } from "../workers/collector/supabase-persistence.mjs";

try {
  // A validação vem antes da coleta: sem configuração não há tráfego de rede
  // nem escrita local/remota em nome da persistência.
  const persistence = createSupabaseCollectorPersistence();
  const result = await collectPmsp({ statePath: resolve(process.cwd(), "work/pmsp-collection-state.json") });
  const saved = await persistence.persist(result);
  console.log(JSON.stringify({ result, saved }, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : "Erro inesperado";
  console.error(message);
  process.exitCode = error instanceof SupabasePersistenceConfigurationError ? 2 : 1;
}
