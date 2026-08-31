export type OfficialSource = {
  id: string;
  municipality: string;
  name: string;
  url: string;
  kind: "concursos" | "diario-oficial" | "banca";
  enabled: boolean;
  collectionStatus: "active" | "needs_adapter" | "needs_validation";
};

export const officialSources: OfficialSource[] = [
  { id: "sp-gestao-concursos", municipality: "São Paulo", name: "Secretaria Municipal de Gestão: Concursos Públicos", url: "https://prefeitura.sp.gov.br/gestao/concursos_publicos/", kind: "concursos", enabled: true, collectionStatus: "needs_adapter" },
  { id: "sp-clic-concursos", municipality: "São Paulo", name: "CLIC: Concursos", url: "https://clic.prefeitura.sp.gov.br/concursos", kind: "concursos", enabled: true, collectionStatus: "active" },
  { id: "santo-andre-editais", municipality: "Santo André", name: "Prefeitura Municipal de Santo André: Editais", url: "https://web.santoandre.sp.gov.br/portal/editais/3", kind: "concursos", enabled: true, collectionStatus: "needs_adapter" },
  { id: "sao-caetano-concursos", municipality: "São Caetano do Sul", name: "Prefeitura de São Caetano: Concursos", url: "https://www.saocaetanodosul.sp.gov.br/", kind: "concursos", enabled: true, collectionStatus: "needs_validation" },
  { id: "sao-bernardo-concursos", municipality: "São Bernardo do Campo", name: "Portal de concursos de São Bernardo do Campo", url: "https://concurso.saobernardo.sp.gov.br/", kind: "concursos", enabled: true, collectionStatus: "needs_adapter" },
  { id: "diadema-portal", municipality: "Diadema", name: "Prefeitura de Diadema", url: "https://portal.diadema.sp.gov.br/", kind: "concursos", enabled: true, collectionStatus: "needs_validation" },
  { id: "maua-concursos", municipality: "Mauá", name: "Prefeitura de Mauá: Concursos", url: "https://www.maua.sp.gov.br/Concursos/", kind: "concursos", enabled: true, collectionStatus: "needs_adapter" },
  { id: "maua-diario-oficial", municipality: "Mauá", name: "Diário Oficial de Mauá", url: "https://dom.maua.sp.gov.br/DOM/Index/3942", kind: "diario-oficial", enabled: true, collectionStatus: "needs_adapter" },
  { id: "ribeirao-pires-editais", municipality: "Ribeirão Pires", name: "Prefeitura de Ribeirão Pires: Editais de Concurso", url: "https://www.ribeiraopires.sp.gov.br/portal/editais/3", kind: "concursos", enabled: true, collectionStatus: "needs_adapter" },
  { id: "rio-grande-serra-portal", municipality: "Rio Grande da Serra", name: "Prefeitura de Rio Grande da Serra", url: "https://www.riograndedaserra.sp.gov.br/", kind: "concursos", enabled: true, collectionStatus: "needs_validation" },
];
