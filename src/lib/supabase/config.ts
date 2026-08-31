export class SupabaseAuthConfigurationError extends Error {
  constructor() {
    super("Autenticação ainda não configurada.");
    this.name = "SupabaseAuthConfigurationError";
  }
}

export function publicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new SupabaseAuthConfigurationError();
  return { url, anonKey };
}
