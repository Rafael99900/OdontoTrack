import type { FirstRealNoticeCandidate } from "@/lib/notices/first-real-notice";

type LessonDraft = {
  id: string;
  title: string;
  objective: string;
  evidencePage: number;
  video: "awaiting_editorial_selection";
  pdf: "awaiting_editorial_generation";
  audio: "awaiting_editorial_generation";
  questions: "awaiting_editorial_generation";
};

type ModuleDraft = {
  id: string;
  title: string;
  lessons: LessonDraft[];
};

export type NoticeCourseDraft = {
  noticeId: string;
  title: string;
  status: "blocked_by_editorial_review" | "ready_for_editorial_generation";
  canPublish: boolean;
  sourceDocumentUrl: string;
  sourcePages: number[];
  modules: ModuleDraft[];
  productionRules: string[];
};

const sourcePage = 31;

/**
 * Converte o programa de uma vaga em estrutura pedagógica, mas não publica
 * aulas. A regra impede que IA, mídia ou PDF transformem dados pendentes em
 * informação aparentemente oficial.
 */
export function createNoticeCourseDraft(notice: FirstRealNoticeCandidate): NoticeCourseDraft {
  const approved = notice.editorialStatus === "approved";
  return {
    noticeId: notice.id,
    title: `Trilha de ${notice.position.title} · ${notice.municipality}`,
    status: approved ? "ready_for_editorial_generation" : "blocked_by_editorial_review",
    canPublish: approved,
    sourceDocumentUrl: notice.officialDocumentPage,
    sourcePages: [31],
    modules: [
      {
        id: "sus-e-gestao",
        title: "SUS, gestão e atenção básica",
        lessons: [
          { id: "sus", title: "Princípios, diretrizes e estrutura do SUS", objective: "Relacionar bases legais, gestão, controle social e financiamento.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
          { id: "atencao-basica", title: "Atenção básica e saúde bucal", objective: "Aplicar a organização da atenção básica e da saúde bucal ao contexto municipal.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
        ],
      },
      {
        id: "clinica-e-prevencao",
        title: "Diagnóstico, clínica e prevenção",
        lessons: [
          { id: "diagnostico", title: "Exame clínico, anamnese e diagnóstico", objective: "Reconhecer etapas do diagnóstico das afecções da boca.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
          { id: "prevencao", title: "Prevenção, flúor e higiene dental", objective: "Diferenciar medidas preventivas e suas aplicações clínicas.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
          { id: "dentistica", title: "Dentística, materiais e oclusão", objective: "Revisar preparos, materiais restauradores e fundamentos de oclusão.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
        ],
      },
      {
        id: "especialidades-e-seguranca",
        title: "Especialidades, urgências e biossegurança",
        lessons: [
          { id: "farmacologia", title: "Farmacologia odontológica", objective: "Revisar anestésicos, anti-inflamatórios e antibioticoterapia.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
          { id: "especialidades", title: "Periodontia, odontopediatria e endodontia", objective: "Consolidar diagnóstico e condutas básicas das especialidades previstas.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
          { id: "urgencia", title: "Cirurgia, urgência e biossegurança", objective: "Revisar pronto atendimento, esterilização e prevenção de riscos.", evidencePage: sourcePage, video: "awaiting_editorial_selection", pdf: "awaiting_editorial_generation", audio: "awaiting_editorial_generation", questions: "awaiting_editorial_generation" },
        ],
      },
    ],
    productionRules: [
      "Vídeos só podem ser incorporados após checagem de licença, disponibilidade e adequação pedagógica.",
      "Toda questão deve citar a página do edital ou uma fonte bibliográfica revisada.",
      "Todo PDF precisa ter imagens com referência, fonte ao final e layout editorial OdontoTrack.",
      "Áudios e explicações de IA precisam identificar que são material complementar, não texto oficial do edital.",
    ],
  };
}
