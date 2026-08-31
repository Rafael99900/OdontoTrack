import { createBrowserClient } from "@supabase/ssr";

import { publicSupabaseConfig } from "./config";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = publicSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
