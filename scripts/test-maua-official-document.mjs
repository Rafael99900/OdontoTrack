import { fetchVerifiedMauaPdf } from "../workers/collector/maua-official-document.mjs";
import { OfficialDocumentValidationError } from "../workers/collector/pmsp-notice-discovery.mjs";

const pdfBytes = Buffer.from("%PDF-1.4\nMauá edital de teste");
const ok = await fetchVerifiedMauaPdf({
  documentUrl: "https://dom.maua.sp.gov.br/public/docs/edital.pdf",
  fetchPage: async () => new Response(pdfBytes, { status: 200, headers: { "content-type": "application/pdf" } }),
});
if (!ok.contentHash || ok.byteLength !== pdfBytes.length) throw new Error("PDF oficial de Mauá deveria ser aceito.");
try {
  await fetchVerifiedMauaPdf({ documentUrl: "https://arquivo-nao-oficial.example/edital.pdf" });
  throw new Error("Host não oficial deveria ser recusado.");
} catch (error) {
  if (!(error instanceof OfficialDocumentValidationError)) throw error;
}
console.log("PDF oficial de Mauá: host, assinatura e hash validados.");
