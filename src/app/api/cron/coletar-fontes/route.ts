import { NextResponse } from "next/server";

import { collectAndPersistPmsp } from "../../../../../workers/collector/run-pmsp-supabase.mjs";
import { collectAndPersistMaua } from "../../../../../workers/collector/run-maua-supabase.mjs";
import { collectAndPersistGrandeAbc } from "../../../../../workers/collector/run-grande-abc-supabase.mjs";
import { requireToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../../../../../workers/collector/operational-token.mjs";
import { SupabasePersistenceConfigurationError } from "../../../../../workers/collector/supabase-persistence.mjs";
import { buildDailyCollectionReport } from "../../../../../workers/collector/daily-collection-report.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CollectedSource = {
  result: { sourceKey: string; runStatus?: string };
  saved?: { runStatus?: string; snapshotId?: string | null };
};

/**
 * Ponto de entrada diário do agendador. A primeira fonte em produção é a CLIC
 * da PMSP; as demais ficam no inventário com adaptador próprio obrigatório.
 * Assim, nenhum portal de município vizinho é tratado como compatível sem
 * validação de estrutura, domínio e documento oficial.
 */
export async function GET(request: Request) {
  try {
    requireToken(request.headers.get("authorization"), process.env.CRON_SECRET);
    // Todas as fontes são tentadas: uma falha municipal não pode ocultar as
    // demais capturas nem transformar uma execução parcial em sucesso silencioso.
    const settled = await Promise.allSettled([collectAndPersistPmsp(), collectAndPersistMaua(), collectAndPersistGrandeAbc()]);
    const entries = settled.flatMap((outcome, index) => {
      const keys = index === 0 ? ["sp-clic-concursos"] : index === 1 ? ["maua-concursos"] : [];
      if (outcome.status === "fulfilled") {
        const values = (index === 2 ? outcome.value : [outcome.value]) as CollectedSource[];
        return values.map((value: CollectedSource) => ({ sourceKey: value.result.sourceKey, status: "fulfilled", value }));
      }
      return [{ sourceKey: keys[0] ?? "grande-abc", status: "rejected" }];
    });
    const report = buildDailyCollectionReport(entries);
    return NextResponse.json(report, { status: report.status === "ok" ? 200 : 503 });
  } catch (error) {
    if (error instanceof OperationalTokenConfigurationError || error instanceof SupabasePersistenceConfigurationError) {
      return NextResponse.json({ error: "Agendamento diário indisponível." }, { status: 503 });
    }
    if (error instanceof OperationalTokenUnauthorizedError) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    return NextResponse.json({ error: "A coleta diária não foi concluída." }, { status: 502 });
  }
}
