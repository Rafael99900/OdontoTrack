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
  officialDocumentPage: "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf",
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
    examDate: "15/03/2026, data prevista no edital de abertura",
    remuneration: "R$ 3.287,43 mensais, referência de dezembro de 2025",
    workloadHoursWeek: 20,
    requirements: "Ensino superior completo em Odontologia e registro no conselho profissional.",
    syllabus: "SUS e atenção básica, saúde bucal, dentística, oclusão, prevenção, farmacologia, periodontia, odontopediatria, cirurgia, urgência, endodontia, biossegurança e demais tópicos do Anexo II.",
  },
  reviewChecklist: [
    "Arquivar o PDF de abertura a partir do Diário Oficial de Mauá.",
    "Arquivar o PDF de abertura em bucket privado com hash e metadados imutáveis.",
    "Converter o conteúdo programático em tópicos pedagógicos revisáveis, preservando a evidência da página 31.",
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
      excerpt: "Edital de Abertura do Concurso Público 01/2025, publicado pela Prefeitura do Município de Mauá.",
      sourceUrl: "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf",
      page: 1,
      extractionMethod: "pdf_text" as const,
    },
    {
      field: "requisitos, jornada e remuneração",
      excerpt: "Cirurgião Dentista: ensino superior em Odontologia, registro no conselho, 20h e R$ 3.287,43.",
      sourceUrl: "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf",
      page: 2,
      extractionMethod: "pdf_text" as const,
    },
    {
      field: "prova objetiva",
      excerpt: "Data prevista para 15 de março de 2026, sujeita à confirmação por edital de convocação.",
      sourceUrl: "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf",
      page: 12,
      extractionMethod: "pdf_text" as const,
    },
    {
      field: "conteúdo programático",
      excerpt: "O Anexo II lista SUS, atenção básica, saúde bucal, dentística, oclusão, prevenção, farmacologia, periodontia, pediatria, cirurgia, urgência, endodontia e biossegurança.",
      sourceUrl: "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf",
      page: 31,
      extractionMethod: "pdf_text" as const,
    },
  ],
} as const;

export type FirstRealNoticeCandidate = typeof firstRealNoticeCandidate;
