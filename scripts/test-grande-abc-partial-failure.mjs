import { collectAndPersistGrandeAbc } from "../workers/collector/run-grande-abc-supabase.mjs";

const results = await collectAndPersistGrandeAbc({
  collectSources: async () => [
    { sourceKey: "santo-andre-editais", runStatus: "change_detected" },
    { sourceKey: "diadema-diario-oficial", runStatus: "change_detected" },
  ],
  persistence: {
    persist: async (result) => {
      if (result.sourceKey === "diadema-diario-oficial") throw new Error("falha simulada de persistência");
      return { runRecorded: true, snapshotRecorded: true, snapshotId: "snapshot-andre", runStatus: "change_detected" };
    },
  },
});
if (results.length !== 2 || results[0].saved.runStatus !== "change_detected" || results[1].saved.runStatus !== "failed") {
  throw new Error("Falha parcial da Grande ABC não preservou o resultado das outras fontes.");
}
console.log("Grande ABC: falha parcial registrada sem interromper fontes saudáveis.");
