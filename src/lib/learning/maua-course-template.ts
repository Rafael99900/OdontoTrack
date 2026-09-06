import { mauaSyllabusSource, susLawSource } from "@/lib/learning/maua-dentistry-production";

export const mauaCourseTemplate = {
  title: "Trilha de Cirurgião-Dentista 20h · Mauá",
  sourcePages: [31],
  modules: [
    { title: "SUS, gestão e atenção básica", lessons: [
      { key: "sus", title: "Princípios, diretrizes e estrutura do SUS", objective: "Relacionar bases legais, gestão, controle social e financiamento.", sources: [mauaSyllabusSource, susLawSource] },
      { key: "atencao-basica", title: "Atenção básica e saúde bucal", objective: "Aplicar a organização da atenção básica e da saúde bucal ao contexto municipal.", sources: [mauaSyllabusSource] },
    ] },
    { title: "Diagnóstico, clínica e prevenção", lessons: [
      { key: "diagnostico", title: "Exame clínico, anamnese e diagnóstico", objective: "Reconhecer etapas do diagnóstico das afecções da boca.", sources: [mauaSyllabusSource] },
      { key: "prevencao", title: "Prevenção, flúor e higiene dental", objective: "Diferenciar medidas preventivas e suas aplicações clínicas.", sources: [mauaSyllabusSource] },
      { key: "dentistica", title: "Dentística, materiais e oclusão", objective: "Revisar preparos, materiais restauradores e fundamentos de oclusão.", sources: [mauaSyllabusSource] },
    ] },
    { title: "Especialidades, urgências e biossegurança", lessons: [
      { key: "farmacologia", title: "Farmacologia odontológica", objective: "Revisar anestésicos, anti-inflamatórios e antibioticoterapia.", sources: [mauaSyllabusSource] },
      { key: "especialidades", title: "Periodontia, odontopediatria e endodontia", objective: "Consolidar diagnóstico e condutas básicas das especialidades previstas.", sources: [mauaSyllabusSource] },
      { key: "urgencia", title: "Cirurgia, urgência e biossegurança", objective: "Revisar pronto atendimento, esterilização e prevenção de riscos.", sources: [mauaSyllabusSource] },
    ] },
  ],
} as const;

type MauaLessonKey = "sus" | "atencao-basica" | "diagnostico" | "prevencao" | "dentistica" | "farmacologia" | "especialidades" | "urgencia";
type CandidateReviewStatus = "approved" | "in_review";
type CandidateLicenseStatus = "link_only_verified" | "awaiting_review";

export type CuratedVideoCandidate = {
  provider: "UNA-SUS";
  title: string;
  channelName: string;
  externalUrl: string;
  rightsEvidenceUrl: string;
  licenseStatus: CandidateLicenseStatus;
  reviewStatus: CandidateReviewStatus;
  coverage: string;
  usage: "external_link_only";
};

export type LessonVideoPolicy = {
  candidates: readonly CuratedVideoCandidate[];
  requiredAction?: "produce_original_video_or_obtain_authorization";
  editorialNote: string;
};

const odontologiaAps: CuratedVideoCandidate = {
  provider: "UNA-SUS", title: "Situações Odontológicas Comuns em Atenção Primária à Saúde", channelName: "Universidade Federal de Pelotas, pela UNA-SUS",
  externalUrl: "https://www.unasus.gov.br/cursos/curso/44644", rightsEvidenceUrl: "https://www.unasus.gov.br/cursos/curso/44644",
  licenseStatus: "link_only_verified", reviewStatus: "approved", usage: "external_link_only",
  coverage: "Complemento de odontologia na APS. A página apresenta casos clínicos, prevenção, doença periodontal e urgências.",
};

const atributosAps: CuratedVideoCandidate = {
  provider: "UNA-SUS", title: "Programa de Aperfeiçoamento em Atributos da Atenção Primária à Saúde", channelName: "Universidade Federal de Minas Gerais, pela UNA-SUS",
  externalUrl: "https://www.unasus.gov.br/programa_modular/4", rightsEvidenceUrl: "https://www.unasus.gov.br/programa_modular/4",
  licenseStatus: "link_only_verified", reviewStatus: "approved", usage: "external_link_only",
  coverage: "Atributos da atenção primária e organização do SUS. A página lista Cirurgião Dentista entre as ocupações elegíveis.",
};

const urgenciasOdontologicas: CuratedVideoCandidate = {
  provider: "UNA-SUS", title: "Cuidado em Saúde Bucal para Pessoas em Situações de Urgências Odontológicas", channelName: "Universidade Federal do Maranhão, pela UNA-SUS",
  externalUrl: "https://www.unasus.gov.br/cursos/curso/46622", rightsEvidenceUrl: "https://www.unasus.gov.br/cursos/curso/46622",
  licenseStatus: "awaiting_review", reviewStatus: "in_review", usage: "external_link_only",
  coverage: "Urgências odontológicas e organização do primeiro atendimento na atenção primária.",
};

const biosseguranca: CuratedVideoCandidate = {
  provider: "UNA-SUS", title: "Fundamentos Básicos de Biossegurança e Bioproteção", channelName: "Fiocruz Pernambuco, pela UNA-SUS",
  externalUrl: "https://www.unasus.gov.br/cursos/curso/47012", rightsEvidenceUrl: "https://www.unasus.gov.br/cursos/curso/47012",
  licenseStatus: "link_only_verified", reviewStatus: "approved", usage: "external_link_only",
  coverage: "Biossegurança, gerenciamento de riscos e resíduos em serviços de saúde. Não substitui conteúdo de cirurgia odontológica.",
};

/**
 * Catálogo curado com decisão de uso, não uma autorização de incorporação.
 * `approved` disponibiliza apenas um link para a fonte. `in_review` não cria
 * ativo visível. Aulas sem candidato exigem mídia autoral ou termo escrito.
 */
export const mauaLessonVideoPolicies: Readonly<Record<MauaLessonKey, LessonVideoPolicy>> = {
  sus: { candidates: [odontologiaAps], editorialNote: "Link complementar de odontologia na APS. Não incorporar sem permissão específica." },
  "atencao-basica": { candidates: [atributosAps], editorialNote: "Link complementar para atributos da APS. Confirmar condições de matrícula a cada publicação." },
  diagnostico: { candidates: [{ ...odontologiaAps, licenseStatus: "awaiting_review", reviewStatus: "in_review", coverage: "Candidato para raciocínio clínico e diagnóstico. Revalidar a disponibilidade antes de exibir." }], editorialNote: "Nenhum vídeo é publicado enquanto a disponibilidade for revalidada." },
  prevencao: { candidates: [{ ...odontologiaAps, licenseStatus: "awaiting_review", reviewStatus: "in_review", coverage: "Candidato para prevenção e controle de cárie. Revalidar a disponibilidade antes de exibir." }], editorialNote: "Nenhum vídeo é publicado enquanto a disponibilidade for revalidada." },
  dentistica: { candidates: [], requiredAction: "produce_original_video_or_obtain_authorization", editorialNote: "Não há fonte externa aprovada. Exige vídeo próprio revisado ou autorização formal de professor parceiro." },
  farmacologia: { candidates: [], requiredAction: "produce_original_video_or_obtain_authorization", editorialNote: "Não há fonte externa aprovada. Exige vídeo próprio revisado ou autorização formal de professor parceiro." },
  especialidades: { candidates: [{ ...odontologiaAps, licenseStatus: "awaiting_review", reviewStatus: "in_review", coverage: "Candidato parcial para periodontia. Não cobre toda a aula de odontopediatria e endodontia." }], editorialNote: "Não rotular o material como cobertura completa das três especialidades." },
  urgencia: { candidates: [urgenciasOdontologicas, biosseguranca], editorialNote: "A biossegurança está aprovada somente como link. A fonte de urgências depende de nova verificação de disponibilidade." },
};

export const mauaSusVideoCandidate = mauaLessonVideoPolicies.sus.candidates[0];
