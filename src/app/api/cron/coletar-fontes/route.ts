import { NextResponse } from "next/server";

import { collectAndPersistPmsp } from "../../../../../workers/collector/run-pmsp-supabase.mjs";
import { collectAndPersistMaua } from "../../../../../workers/collector/run-maua-supabase.mjs";
import { collectAndPersistGrandeAbc } from "../../../../../workers/collector/run-grande-abc-supabase.mjs";
import { requireToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ponto de entrada diário do agendador. A primeira fonte em produção é a CLIC
 * da PMSP; as demais ficam no inventário com adaptador próprio obrigatório.
 * Assim, nenhum portal de município vizinho é tratado como compatível sem
 * validação de estrutura, domínio e documento oficial.
 */
export async function GET(request: Request) {
  try {
    requireToken(request.headers.get("authorization"), process.env.CRON_SECRET);
    const [pmsp, maua, grandeAbc] = await Promise.all([collectAndPersistPmsp(), collectAndPersistMaua(), collectAndPersistGrandeAbc()]);
    return NextResponse.json({
      collectedAt: new Date().toISOString(),
      sources: [...[pmsp, maua], ...grandeAbc].map(({ result, saved }) => ({
        sourceKey: result.sourceKey,
        status: saved.runStatus ?? result.runStatus,
        snapshotId: saved.snapshotId ?? null,
        reviewRequired: true,
      })),
      pendingAdapters: ["São Caetano do Sul", "Diadema", "Rio Grande da Serra"],
    });
  } catch (error) {
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError) {
      return NextResponse.json({ error: "Agendamento diário indisponível." }, { status: 503 });
    }
    if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    return NextResponse.json({ error: "A coleta diária não foi concluída." }, { status: 502 });
  }
}
