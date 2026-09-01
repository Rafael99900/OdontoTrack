export type SourceReference = { label: string; url: string; accessedAt: string; page?: number; licenseNote: string };
export type CuratedMedia = { provider: "UNA-SUS" | "OdontoTrack"; title: string; externalUrl: string; author: string; rightsEvidenceUrl: string; reviewStatus: "approved_link" | "requires_embed_license" | "planned"; reason: string };

export const mauaSyllabusSource: SourceReference = {
  label: "Edital de abertura 01/2025 de Mauá, Anexo II", url: "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf", page: 31, accessedAt: "2026-08-31", licenseNote: "Documento público oficial. Usado como evidência do conteúdo cobrado.",
};
export const susLawSource: SourceReference = {
  label: "Lei nº 8.080/1990, Presidência da República", url: "https://www.planalto.gov.br/ccivil_03/leis/l8080.htm", accessedAt: "2026-08-31", licenseNote: "Legislação pública oficial.",
};

/** Rascunho verificável. Publicação depende da aprovação do edital e de cada ativo. */
export const susLessonProduction = {
  lessonId: "sus", title: "Princípios, diretrizes e estrutura do SUS", estimatedMinutes: 35, sourcePages: [31],
  objective: "Relacionar universalidade, integralidade e organização do SUS ao conteúdo programático do edital.",
  summary: [
    "O edital inclui SUS e atenção básica no conteúdo programático. Separe o que é exigência do edital da explicação didática.",
    "A Lei nº 8.080/1990 organiza ações e serviços de saúde e descreve princípios como universalidade e integralidade. A leitura dos artigos 2º, 4º, 6º e 7º é o ponto de partida.",
    "Em questões, identifique se o enunciado discute acesso, continuidade do cuidado, descentralização ou participação da comunidade. Compare os termos com o texto legal.",
  ],
  visual: { title: "Mapa de revisão do SUS", caption: "Ilustração autoral OdontoTrack, fundamentada na Lei nº 8.080/1990.", source: susLawSource },
  notebookPrompt: "Atue como tutor de concurso para Odontologia. Explique os princípios do SUS cobrados no edital de Mauá 01/2025 sem inventar informações do edital. Diferencie universalidade, integralidade e descentralização. Depois crie cinco questões autorais de múltipla escolha, com gabarito comentado. Baseie a parte legal somente na Lei nº 8.080/1990 e indique os artigos relevantes. Se algo não estiver comprovado, diga que não há evidência suficiente.",
  audioScript: "Nesta revisão, organize o SUS em três ideias. Universalidade trata do acesso. Integralidade reúne ações preventivas e curativas em uma atenção contínua. Descentralização aproxima a gestão das necessidades locais. Para a prova, compare cada alternativa com a Lei nº 8.080 de 1990. Este áudio é complementar e não substitui a leitura da legislação.",
  media: [{ provider: "UNA-SUS", title: "Situações Odontológicas Comuns em Atenção Primária à Saúde", externalUrl: "https://www.unasus.gov.br/cursos/curso/44644", author: "Universidade Federal de Pelotas, pela UNA-SUS", rightsEvidenceUrl: "https://www.unasus.gov.br/cursos/curso/44644", reviewStatus: "approved_link", reason: "Curso público de 45 horas para odontologia na atenção primária. Abre na plataforma de origem e não é incorporado sem autorização técnica e de licença." }] satisfies CuratedMedia[],
  questions: [
    { prompt: "Segundo a Lei nº 8.080/1990, qual princípio assegura o acesso aos serviços de saúde em todos os níveis de assistência?", options: ["Universalidade", "Centralização", "Seletividade", "Privatização"], correctOptionIndex: 0, explanation: "O art. 7º apresenta a universalidade de acesso aos serviços de saúde em todos os níveis de assistência.", sources: [susLawSource] },
    { prompt: "No contexto do SUS, a integralidade corresponde principalmente a:", options: ["Um conjunto articulado e contínuo de ações preventivas e curativas", "Atendimento restrito à urgência", "Apenas atendimento odontológico especializado", "Substituição da atenção básica por hospitais"], correctOptionIndex: 0, explanation: "A Lei nº 8.080/1990 define integralidade como conjunto articulado e contínuo de ações e serviços preventivos e curativos.", sources: [susLawSource] },
    { prompt: "Por que a Lei nº 8.080/1990 é uma fonte adequada para esta aula?", options: ["Porque fundamenta princípios e organização do SUS", "Porque substitui o edital municipal", "Porque confirma a data da prova", "Porque dispensa normas locais"], correctOptionIndex: 0, explanation: "Ela fundamenta a explicação didática do SUS. O edital continua sendo a fonte para o que é cobrado.", sources: [mauaSyllabusSource, susLawSource] },
  ], sources: [mauaSyllabusSource, susLawSource],
} as const;

export function buildLessonAiContext() {
  return { lessonTitle: susLessonProduction.title, noticeContext: "Concurso Público 01/2025 de Mauá, Cirurgião-Dentista 20h. O Anexo II, página 31, inclui SUS e atenção básica.", sources: susLessonProduction.sources.map((source) => ({ label: source.label, url: source.url, page: source.page })) };
}
