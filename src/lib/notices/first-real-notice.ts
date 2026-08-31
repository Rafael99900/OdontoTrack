/**
 * Primeiro registro real usado na revisão editorial inicial.
 *
 * Este objeto é deliberadamente conservador: somente traz fatos visíveis na
 * fonte oficial e deixa como `null` qualquer informação ainda não comprovada
 * pelo edital de abertura arquivado. Ele não é um registro publicado.
 */
export const firstRealNoticeCandidate = {
  id: "maua-cp-01-2025-cirurgiao-dentista-20h",
  title: "Concurso Público 01/2025 · Cirurgião Dentista 20h",
  municipality: "Mauá",
  organizationName: "Prefeitura do Município de Mauá",
  sourceUrl: "https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11",
  officialDocumentPage: "https://dom.maua.sp.gov.br/DOM/Index/3942",
  sourceCapturedAt: "2026-08-31",
  editorialStatus: "pending_review" as const,
  position: {
    title: "Cirurgião Dentista 20h",
    educationLevel: "higher" as const,
    area: "Odontologia",
    vacancies: 5,
    vacanciesPcd: 1,
  },
  facts: {
    noticeNumber: "01/2025",
    registrationPeriod: "18/12/2025 a 29/01/2026",
    organizer: "IBAM",
    examDate: null,
    remuneration: null,
    workloadHoursWeek: 20,
    requirements: null,
    syllabus: null,
  },
  reviewChecklist: [
    "Arquivar o PDF de abertura a partir do Diário Oficial de Mauá.",
    "Extrair cargo, remuneração, requisitos, prova e conteúdo com página e trecho de evidência.",
    "Comparar retificações e publicações posteriores antes de aprovar o edital.",
  ],
  evidence: [
    {
      field: "cargo e vagas",
      excerpt: "CIRURGIAO DENTISTA 20H, 5 vagas e 1 vaga PCD.",
      sourceUrl: "https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11",
      extractionMethod: "web_capture" as const,
    },
    {
      field: "inscrições e banca",
      excerpt: "Edital 01/2025, inscrições de 18 de dezembro de 2025 a 29 de janeiro de 2026, pelo IBAM.",
      sourceUrl: "https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11",
      extractionMethod: "web_capture" as const,
    },
    {
      field: "documento de abertura",
      excerpt: "O Diário Oficial de Mauá registra a abertura do Concurso Público 01/2025 para cargos do quadro geral.",
      sourceUrl: "https://dom.maua.sp.gov.br/DOM/Index/3942",
      extractionMethod: "web_capture" as const,
    },
  ],
} as const;

export type FirstRealNoticeCandidate = typeof firstRealNoticeCandidate;
