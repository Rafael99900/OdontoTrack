export const MAUA_CP_01_2025_RETIFICATIONS = [
  {
    externalReference: "maua-cp-01-2025-retificacao-01",
    noticeExternalReference: "maua-cp-01-2025-cirurgiao-dentista-20h",
    title: "Retificação do Edital de Abertura do Concurso Público 01/2025",
    publicationDate: "2025-12-29",
    sourceUrl: "https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11",
    documentUrl: "https://dom.maua.sp.gov.br/public/docs/b9eabcf7d7e784a29ae07b7f9e5a1afb.pdf",
    evidence: [
      { page: 1, excerpt: "RETIFICAÇÃO DO EDITAL DE ABERTURA - CONCURSO PÚBLICO N° 01/2025" },
      { page: 4, excerpt: "Os demais itens do Edital permanecem inalterados." },
    ],
  },
  {
    externalReference: "maua-cp-01-2025-retificacao-02",
    noticeExternalReference: "maua-cp-01-2025-cirurgiao-dentista-20h",
    title: "Retificação nº 02 do Edital de Abertura do Concurso Público 01/2025",
    publicationDate: "2026-01-14",
    sourceUrl: "https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11",
    documentUrl: "https://dom.maua.sp.gov.br/public/docs/1e9b18ff0d2e67aaebb8455c2db551f1.pdf",
    evidence: [
      { page: 1, excerpt: "RETIFICAÇÃO Nº 02 DO EDITAL DE ABERTURA - CONCURSO PÚBLICO N° 01/2025" },
      { page: 7, excerpt: "Os demais itens do Edital permanecem inalterados." },
    ],
  },
];

function normalize(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Não presume que uma retificação geral altere o cargo acompanhado. A ausência
 * do cargo no texto extraído não publica nada: mantém o documento na revisão
 * editorial e preserva todos os fatos da versão de abertura.
 */
export function compareRetificationForPosition({ documentText, positionTitle = "Cirurgião Dentista 20h", finalUnchangedClauseFound }) {
  const targetMentioned = normalize(documentText).includes(normalize(positionTitle));
  return {
    classification: "document_update",
    comparisonReliable: Boolean(finalUnchangedClauseFound),
    positionMentioned: targetMentioned,
    changedFacts: [],
    positionImpact: targetMentioned ? "requires_editorial_fact_review" : "not_mentioned",
    requiresEditorialReview: true,
    publicFactsMayChange: false,
  };
}
