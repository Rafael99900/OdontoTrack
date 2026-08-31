import { collectGrandeAbcSources, GRANDE_ABC_SOURCES } from "../workers/collector/grande-abc-sources.mjs";

const results = await collectGrandeAbcSources({
  fetchPage: async () => new Response("<main>fonte oficial</main>", { status: 200, headers: { "content-type": "text/html" } }),
  now: () => new Date("2026-08-31T12:00:00Z"),
});

if (results.length !== 3 || results.some((result) => result.runStatus !== "change_detected")) throw new Error("As fontes da Grande ABC não foram coletadas.");
if (results.map((result) => result.sourceKey).join(",") !== GRANDE_ABC_SOURCES.map((source) => source.key).join(",")) throw new Error("A ordem auditável das fontes foi alterada.");
console.log("Coletor Grande ABC: 3 fontes oficiais isoladas e auditáveis.");
