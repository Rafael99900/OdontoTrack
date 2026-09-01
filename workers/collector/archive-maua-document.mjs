import { archiveOfficialPdf } from "./official-document-archive.mjs";
import { fetchVerifiedMauaPdf } from "./maua-official-document.mjs";

export async function archiveMauaOfficialDocument(documentUrl, { fetchPage = fetch, archiveOptions } = {}) {
  const verified = await fetchVerifiedMauaPdf({ documentUrl, fetchPage });
  const archived = await archiveOfficialPdf({ sourceKey: "maua-concursos", document: verified, ...archiveOptions });
  return { verified, archived };
}
