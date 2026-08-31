import { collectOfficialPage } from "./official-page-source.mjs";

export const GRANDE_ABC_SOURCES = [
  {
    key: "santo-andre-editais",
    name: "Prefeitura de Santo André: Editais",
    requestedUrl: "https://web.santoandre.sp.gov.br/portal/editais/3",
    municipality: "Santo André",
    kind: "official_portal",
  },
  {
    key: "sao-bernardo-concursos",
    name: "Prefeitura de São Bernardo do Campo: Concursos",
    requestedUrl: "https://concurso.saobernardo.sp.gov.br/",
    municipality: "São Bernardo do Campo",
    kind: "official_portal",
  },
  {
    key: "ribeirao-pires-editais",
    name: "Prefeitura de Ribeirão Pires: Editais de Concurso",
    requestedUrl: "https://www.ribeiraopires.sp.gov.br/portal/editais/3",
    municipality: "Ribeirão Pires",
    kind: "official_portal",
  },
];

export async function collectGrandeAbcSources(options) {
  return Promise.all(GRANDE_ABC_SOURCES.map((source) => collectOfficialPage(source, options)));
}
