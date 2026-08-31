import { NextResponse } from "next/server";

import { collectAndPersistPmsp } from "../../../../../workers/collector/run-pmsp-supabase.mjs";
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
    const { result, saved } = await collectAndPersistPmsp();
    return NextResponse.json({
      collectedAt: result.completedAt ?? null,
      sources: [{
        sourceKey: result.sourceKey,
        status: saved.runStatus ?? result.runStatus,
        snapshotId: saved.snapshotId ?? null,
        reviewRequired: true,
      }],
      pendingAdapters: ["Santo André", "São Bernardo do Campo", "Mauá", "Ribeirão Pires"],
    });
  } catch (error) {
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError) {
      return NextResponse.json({ error: "Agendamento diário indisponível." }, { status: 503 });
    }
    if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    return NextResponse.json({ error: "A coleta diária não foi concluída." }, { status: 502 });
  }
}
