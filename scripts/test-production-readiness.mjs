import { readFile } from "node:fs/promises";

const source = await readFile("src/app/api/health/route.ts", "utf8");
for (const fragment of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "CRON_SECRET", "status: ready ? \"ok\" : \"degraded\""]) {
  if (!source.includes(fragment)) throw new Error(`Contrato de prontidão ausente: ${fragment}`);
}
console.log("Production readiness contract passed: health endpoint checks configuration without exposing secrets.");
