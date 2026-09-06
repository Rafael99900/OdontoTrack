/**
 * Catálogo de documentos públicos reais ainda sujeitos à mesma fila editorial.
 * A presença aqui não os torna concurso vigente, nem os publica no catálogo.
 */
export const OFFICIAL_ODONTOLOGY_NOTICE_CANDIDATES = [
  {
    externalReference: "maua-cp-01-2025-cirurgiao-dentista-20h",
    municipality: "Mauá",
    stateCode: "SP",
    noticeKind: "concurso_publico",
    title: "Concurso Público 01/2025 · Cirurgião Dentista 20h",
    sourceUrl: "https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11",
    documentUrl: "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf",
    evidence: [{ page: 2, excerpt: "CIRURGIAO DENTISTA 20H" }, { page: 31, excerpt: "Conteúdo específico de Cirurgião Dentista" }],
    scope: "Odontologia, nível superior",
  },
  {
    externalReference: "sp-ahm-comunicado-015-2013-cirurgiao-dentista",
    municipality: "São Paulo",
    stateCode: "SP",
    noticeKind: "processo_seletivo_emergencial",
    title: "AHM Comunicado 015/2013 · Especialista em Saúde - Cirurgião Dentista",
    sourceUrl: "https://www.prefeitura.sp.gov.br/cidade/secretarias/upload/saude/autarquia_hospitalar_municipal/publicacoes_ingresso/COMUNICADO%20015%20ES-CirDent%20Buco.pdf",
    documentUrl: "https://www.prefeitura.sp.gov.br/cidade/secretarias/upload/saude/autarquia_hospitalar_municipal/publicacoes_ingresso/COMUNICADO%20015%20ES-CirDent%20Buco.pdf",
    evidence: [
      { page: 1, excerpt: "A abertura das inscrições de processo seletivo para contratação emergencial por até 12 meses" },
      { page: 1, excerpt: "Especialista em Saúde – Cirurgião Dentista 35" },
      { page: 2, excerpt: "Certificado de conclusão ou diploma de curso superior em odontologia" },
    ],
    scope: "Odontologia, nível superior; histórico de processo seletivo, não concurso vigente",
  },
];
