import { collectOfficialPage } from "../workers/collector/official-page-source.mjs";

const source = {
  key: "municipio-test",
  requestedUrl: "https://falha.prefeitura.sp.gov.br/",
  fallbackUrls: ["https://oficial.prefeitura.sp.gov.br/concursos"],
  evidenceUrl: "https://falha.prefeitura.sp.gov.br/editais",
  municipality: "Teste",
  kind: "official_portal",
  timeoutMs: 1,
};
const calls = [];
const result = await collectOfficialPage(source, {
  fetchPage: async (url) => {
    calls.push(String(url));
    if (String(url).includes("falha")) throw new DOMException("aborted", "TimeoutError");
    return new Response("<main>fonte oficial estável</main>", { status: 200, headers: { "content-type": "text/html" } });
  },
  now: () => new Date("2026-09-06T12:00:00Z"),
});
if (result.runStatus !== "change_detected" || result.requestedUrl !== source.fallbackUrls[0] || !result.metadata.fallbackUsed) throw new Error("Fallback oficial não foi selecionado após falha temporária.");
if (result.metadata.sourceEvidenceUrl !== source.evidenceUrl || result.metadata.attempts[0].outcome !== "timeout" || calls.length !== 2) throw new Error("Evidência de origem ou tentativa não foi preservada.");
console.log("Fonte oficial resiliente: timeout sanitizado, fallback e evidência preservados.");
