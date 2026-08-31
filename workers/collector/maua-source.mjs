import { collectOfficialPage } from "./official-page-source.mjs";

export const MAUA_CONCURSOS_SOURCE = {
  key: "maua-concursos",
  name: "Prefeitura de Mauá: Concursos",
  requestedUrl: "https://www.maua.sp.gov.br/Concursos/",
  municipality: "Mauá",
  kind: "official_portal",
};

export function collectMaua(options) {
  return collectOfficialPage(MAUA_CONCURSOS_SOURCE, options);
}
