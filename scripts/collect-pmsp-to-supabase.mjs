import { collectAndPersistPmsp } from "../workers/collector/run-pmsp-supabase.mjs";
import { SupabasePersistenceConfigurationError } from "../workers/collector/supabase-persistence.mjs";

try {
  // A validação vem antes da coleta: sem configuração não há tráfego de rede
  // nem escrita local/remota em nome da persistência.
  const { result, saved } = await collectAndPersistPmsp();
  console.log(JSON.stringify({ result, saved }, null, 2));
} catch (error) {
  const message = error instanceof Error ? error.message : "Erro inesperado";
  console.error(message);
  process.exitCode = error instanceof SupabasePersistenceConfigurationError ? 2 : 1;
}
