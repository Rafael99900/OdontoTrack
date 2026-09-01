import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const operationalSecretsConfigured = Boolean(
    process.env.CRON_SECRET && process.env.OPERATIONS_COLLECTOR_TOKEN && process.env.EDITORIAL_REVIEW_TOKEN,
  );
  const ready = supabaseConfigured && operationalSecretsConfigured;

  return NextResponse.json({
    status: ready ? "ok" : "degraded",
    checkedAt: new Date().toISOString(),
    checks: {
      supabaseConfigured,
      operationalSecretsConfigured,
    },
  }, { status: ready ? 200 : 503 });
}
