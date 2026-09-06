import { collectOfficialPage } from "./official-page-source.mjs";

export const GRANDE_ABC_SOURCES = [
  {
    key: "santo-andre-editais",
    name: "Prefeitura de Santo André: portal oficial e editais",
    // O subdomínio legado de editais excedeu a janela de execução Vercel em
    // 06/09/2026. O portal principal é a fonte diária estável; a URL dedicada
    // permanece registrada como evidência e será usada pelo adaptador de PDF.
    requestedUrl: "https://www.santoandre.sp.gov.br/",
    evidenceUrl: "https://web.santoandre.sp.gov.br/portal/editais/3",
    timeoutMs: 7000,
    municipality: "Santo André",
    kind: "official_portal",
  },
  {
    key: "sao-bernardo-concursos",
    name: "Prefeitura de São Bernardo do Campo: Concursos",
    requestedUrl: "https://www.saobernardo.sp.gov.br/web/sbc/em-andamento",
    fallbackUrls: ["https://saobernardo.sp.gov.br/web/sbc/em-andamento"],
    timeoutMs: 8000,
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
  {
    key: "sao-caetano-concursos",
    name: "Prefeitura de São Caetano do Sul: Concursos e convocações",
    requestedUrl: "https://www.saocaetanodosul.sp.gov.br/paginasweb/47",
    municipality: "São Caetano do Sul",
    kind: "official_portal",
  },
  {
    key: "diadema-diario-oficial",
    name: "Prefeitura de Diadema: Diário Oficial",
    requestedUrl: "https://www.diadema.sp.gov.br/diario-oficial/",
    fallbackUrls: ["https://portal.diadema.sp.gov.br/"],
    timeoutMs: 8000,
    municipality: "Diadema",
    kind: "official_gazette",
  },
  {
    key: "rio-grande-serra-legislacao",
    name: "Prefeitura de Rio Grande da Serra: Legislação e atos",
    requestedUrl: "https://www.riograndedaserra.sp.gov.br/legislacao/decretos/",
    municipality: "Rio Grande da Serra",
    kind: "official_portal",
  },
];

export async function collectGrandeAbcSources(options) {
  return Promise.all(GRANDE_ABC_SOURCES.map((source) => collectOfficialPage(source, options)));
}
