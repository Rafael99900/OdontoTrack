import { archiveOfficialPdf, OfficialDocumentArchiveError, officialDocumentStoragePath } from "../workers/collector/official-document-archive.mjs";

const pdf = Buffer.from("%PDF-1.7\nconteudo oficial");
const hash = "d36fcc6c407afe62f2d149c746e7b9fae834fabf99961d60d37d373508920e97";

if (officialDocumentStoragePath({ sourceKey: "sp-clic-concursos", contentHash: hash }) !== `sp-clic-concursos/d3/${hash}.pdf`) {
  throw new Error("O caminho privado do arquivo não é determinístico.");
}

const requests = [];
const archived = await archiveOfficialPdf({
  sourceKey: "sp-clic-concursos",
  document: { bytes: pdf, contentHash: "6120558b73aacdd157d7010613dae543586cc6ef3be60a6fed32e169334e8034" },
  supabaseUrl: "https://example.supabase.co",
  serviceRoleKey: "secret",
  fetchImplementation: async (url, options) => {
    requests.push({ url: url.toString(), options });
    return new Response(JSON.stringify({ Key: "stored" }), { status: 200 });
  },
});

if (archived.bucket !== "official-documents" || archived.alreadyArchived || !requests[0].url.includes("storage/v1/object/official-documents")) {
  throw new Error("O PDF não foi preparado para o bucket privado esperado.");
}
if (requests[0].options.headers["x-upsert"] !== "false" || requests[0].options.headers["Content-Type"] !== "application/pdf") {
  throw new Error("O upload precisa ser imutável e identificado como PDF.");
}

const duplicate = await archiveOfficialPdf({
  sourceKey: "sp-clic-concursos",
  document: { bytes: pdf },
  supabaseUrl: "https://example.supabase.co",
  serviceRoleKey: "secret",
  fetchImplementation: async () => new Response(null, { status: 409 }),
});
if (!duplicate.alreadyArchived) throw new Error("Conflito de hash deveria ser tratado como cópia já arquivada.");

const storageDuplicate = await archiveOfficialPdf({
  sourceKey: "sp-clic-concursos",
  document: { bytes: pdf },
  supabaseUrl: "https://example.supabase.co",
  serviceRoleKey: "secret",
  fetchImplementation: async () => new Response(JSON.stringify({ statusCode: "409", code: "KeyAlreadyExists" }), { status: 400 }),
});
if (!storageDuplicate.alreadyArchived) throw new Error("Resposta de duplicidade do Storage deveria ser idempotente.");

try {
  await archiveOfficialPdf({
    sourceKey: "sp-clic-concursos",
    document: { bytes: Buffer.from("<html>") },
    supabaseUrl: "https://example.supabase.co",
    serviceRoleKey: "secret",
  });
  throw new Error("Conteúdo sem assinatura PDF deveria ser recusado.");
} catch (error) {
  if (!(error instanceof OfficialDocumentArchiveError)) throw error;
}

console.log("OT-12 arquivamento privado de PDF oficial: ok");
