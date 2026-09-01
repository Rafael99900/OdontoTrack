import { readFile } from "node:fs/promises";

const files = [
  "src/lib/supabase/client.ts",
  "src/lib/supabase/server.ts",
  "src/features/auth/magic-link-form.tsx",
  "src/app/auth/callback/route.ts",
];
const source = await Promise.all(files.map((file) => readFile(file, "utf8")));
const contract = source.join("\n");
for (const fragment of ["createBrowserClient", "createServerClient", "signInWithOtp", "signInWithOAuth", "provider: \"google\"", "exchangeCodeForSession", "data-cy=\"auth-send-magic-link\"", "data-cy=\"auth-google-sign-in\""]) {
  if (!contract.includes(fragment)) throw new Error(`Contrato de autenticação ausente: ${fragment}`);
}
if (contract.includes("SUPABASE_SERVICE_ROLE_KEY")) throw new Error("Auth não pode usar service role.");
console.log("Supabase Auth contract passed: magic link, server callback and no service role.");
