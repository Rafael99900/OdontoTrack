import { createHash } from "node:crypto";

import { verifyAndArchivePmspDocument } from "../workers/collector/archive-pmsp-document.mjs";

const pdf = Buffer.from("%PDF-1.7\neditado oficialmente");
const expectedHash = createHash("sha256").update(pdf).digest("hex");
const calls = [];

const result = await verifyAndArchivePmspDocument({
  documentUrl: "https://clic.prefeitura.sp.gov.br/arquivos/edital.pdf",
  fetchOfficial: async () => new Response(pdf, {
    headers: { "content-type": "application/pdf", "content-length": String(pdf.byteLength) },
  }),
  archiveOptions: {
    supabaseUrl: "https://example.supabase.co",
    serviceRoleKey: "secret",
    fetchImplementation: async (url, options) => {
      calls.push({ url: url.toString(), options });
      return new Response(JSON.stringify({ Key: "stored" }), { status: 200 });
    },
  },
});

if (result.contentHash !== expectedHash || result.archived.path !== `sp-clic-concursos/${expectedHash.slice(0, 2)}/${expectedHash}.pdf`) {
  throw new Error("A cadeia de validação e arquivamento não preservou o hash do PDF.");
}
if (calls.length !== 1 || !calls[0].url.includes("storage/v1/object/official-documents/")) {
  throw new Error("O PDF verificado não chegou ao Storage privado.");
}
if (result.requiresEditorialReview !== undefined) throw new Error("A regra editorial pertence à rota, não ao coletor.");

console.log("OT-12 encadeamento PMSP PDF → Storage privado: ok");
