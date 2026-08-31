import { discoverPmspNoticeDocuments, fetchVerifiedPmspPdf, OfficialDocumentValidationError } from "../workers/collector/pmsp-notice-discovery.mjs";

const html = `
  <a href="/storage/edital-odontologia.pdf">Edital de concurso para Odontologia</a>
  <a href="https://clic.prefeitura.sp.gov.br/storage/edital-odontologia.pdf#pagina-3">Cópia</a>
  <a href="https://externo.exemplo.org/edital.pdf">Não oficial</a>
  <a href="/storage/guia.xlsx">Guia institucional</a>
  <a href="/concursos">Página de concursos</a>
`;

const candidates = discoverPmspNoticeDocuments(html);
if (candidates.length !== 2) throw new Error(`Esperados 2 documentos oficiais, recebidos ${candidates.length}.`);
if (candidates[0].documentUrl !== "https://clic.prefeitura.sp.gov.br/storage/edital-odontologia.pdf") throw new Error("A URL documental não foi canonizada.");
if (!candidates[0].possibleNotice || candidates[1].possibleNotice) throw new Error("A classificação inicial do link é incorreta.");
if (candidates.some((candidate) => candidate.documentUrl.includes("externo.exemplo.org"))) throw new Error("Um domínio externo foi aceito.");

const validPdf = await fetchVerifiedPmspPdf({
  documentUrl: "https://clic.prefeitura.sp.gov.br/storage/edital.pdf",
  fetchPage: async () => new Response(Buffer.from("%PDF-1.7\nconteudo"), { headers: { "content-type": "application/pdf", "content-length": "16" } }),
});
if (validPdf.byteLength < 6 || validPdf.contentHash.length !== 64) throw new Error("O PDF oficial válido não foi identificado.");

try {
  await fetchVerifiedPmspPdf({
    documentUrl: "https://clic.prefeitura.sp.gov.br/storage/arquivo.pdf",
    fetchPage: async () => new Response("<html>bloqueio</html>", { headers: { "content-type": "application/pdf" } }),
  });
  throw new Error("HTML disfarçado de PDF deveria ser recusado.");
} catch (error) {
  if (!(error instanceof OfficialDocumentValidationError)) throw error;
}

console.log("OT-12 descoberta de documentos PMSP: ok");
