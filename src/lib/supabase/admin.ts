import "server-only";

import { createClient } from "@supabase/supabase-js";

export class SupabaseAdminConfigurationError extends Error {
  constructor() {
    super("A consulta editorial do servidor não está configurada.");
    this.name = "SupabaseAdminConfigurationError";
  }
}

/** Cliente restrito a Server Components e rotas. Nunca deve ser importado pelo navegador. */
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new SupabaseAdminConfigurationError();

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
