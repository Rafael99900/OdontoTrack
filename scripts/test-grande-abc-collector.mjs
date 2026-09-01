import { collectGrandeAbcSources, GRANDE_ABC_SOURCES } from "../workers/collector/grande-abc-sources.mjs";

const results = await collectGrandeAbcSources({
  fetchPage: async () => new Response("<main>fonte oficial</main>", { status: 200, headers: { "content-type": "text/html" } }),
  now: () => new Date("2026-08-31T12:00:00Z"),
});

if (results.length !== 6 || results.some((result) => result.runStatus !== "change_detected")) throw new Error("As fontes da Grande ABC não foram coletadas.");
if (results.map((result) => result.sourceKey).join(",") !== GRANDE_ABC_SOURCES.map((source) => source.key).join(",")) throw new Error("A ordem auditável das fontes foi alterada.");
if (!GRANDE_ABC_SOURCES.some((source) => source.key === "diadema-diario-oficial" && source.kind === "official_gazette")) throw new Error("O Diário Oficial de Diadema precisa ser classificado como gazeta oficial.");
console.log("Coletor Grande ABC: 6 fontes oficiais isoladas e auditáveis.");
