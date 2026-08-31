export type OfficialSource = {
  id: string;
  municipality: string;
  name: string;
  url: string;
  kind: "concursos" | "diario-oficial" | "banca";
  enabled: boolean;
};

export const officialSources: OfficialSource[] = [
  { id: "sp-gestao-concursos", municipality: "São Paulo", name: "Secretaria Municipal de Gestão: Concursos Públicos", url: "https://prefeitura.sp.gov.br/gestao/concursos_publicos/", kind: "concursos", enabled: true },
  { id: "sp-clic-concursos", municipality: "São Paulo", name: "CLIC: Concursos", url: "https://clic.prefeitura.sp.gov.br/concursos", kind: "concursos", enabled: true },
  { id: "santo-andre-editais", municipality: "Santo André", name: "Prefeitura Municipal de Santo André: Editais", url: "https://web.santoandre.sp.gov.br/portal/editais/3", kind: "concursos", enabled: true },
  { id: "sao-caetano-concursos", municipality: "São Caetano do Sul", name: "Prefeitura de São Caetano: Concursos", url: "https://www.saocaetanodosul.sp.gov.br/", kind: "concursos", enabled: true },
  { id: "sao-bernardo-concursos", municipality: "São Bernardo do Campo", name: "Portal de concursos de São Bernardo do Campo", url: "https://concurso.saobernardo.sp.gov.br/", kind: "concursos", enabled: true },
];
