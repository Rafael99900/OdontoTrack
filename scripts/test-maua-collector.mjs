import { collectMaua, MAUA_CONCURSOS_SOURCE } from "../workers/collector/maua-source.mjs";

const result = await collectMaua({
  fetchPage: async () => new Response("<main>concursos oficiais de Mauá</main>", { status: 200, headers: { "content-type": "text/html" } }),
  now: () => new Date("2026-08-31T12:00:00Z"),
});

if (result.sourceKey !== MAUA_CONCURSOS_SOURCE.key) throw new Error("A fonte de Mauá não foi identificada.");
if (result.runStatus !== "change_detected" || result.httpStatus !== 200) throw new Error("A coleta oficial de Mauá deveria registrar a captura.");
if (result.metadata.municipality !== "Mauá" || !result.contentHash) throw new Error("Metadados auditáveis de Mauá ausentes.");
console.log("Coletor Mauá: captura oficial auditável ok.");
