import { mauaCourseTemplate, mauaLessonVideoPolicies } from "@/lib/learning/maua-course-template";
import { mauaSyllabusSource, susLawSource } from "@/lib/learning/maua-dentistry-production";

export type CourseLessonKey = "sus" | "atencao-basica" | "diagnostico" | "prevencao" | "dentistica" | "farmacologia" | "especialidades" | "urgencia";

type LessonContent = {
  key: CourseLessonKey;
  summary: string;
  pdf: string;
  audio: string;
  question: { prompt: string; options: readonly string[]; correctOptionIndex: number; explanation: string };
};

const entries: Omit<LessonContent, "key">[] = [
  { summary: "Leia a Lei nº 8.080/1990 para organizar universalidade, integralidade, descentralização e participação social. Em prova, diferencie princípio do SUS de regra administrativa local.", pdf: "/editorial-assets/sus-principios-diretrizes-estrutura.pdf", audio: "Revise universalidade como acesso, integralidade como cuidado articulado e descentralização como organização próxima do território.", question: { prompt: "Qual princípio assegura acesso aos serviços de saúde em todos os níveis?", options: ["Universalidade", "Centralização", "Seletividade", "Privatização"], correctOptionIndex: 0, explanation: "A universalidade está prevista no art. 7º da Lei nº 8.080/1990." } },
  { summary: "Estude a atenção básica como porta de entrada e coordenação do cuidado. Relacione território, prevenção e saúde bucal à rede do SUS.", pdf: "/editorial-assets/atencao-basica.pdf", audio: "Na atenção básica, a equipe conhece o território, previne agravos e acompanha o cuidado ao longo do tempo.", question: { prompt: "Na rede de saúde, a atenção básica atua principalmente como:", options: ["Porta de entrada e coordenação do cuidado", "Serviço exclusivo de internação", "Substituta de toda especialidade", "Atendimento apenas de urgência"], correctOptionIndex: 0, explanation: "A atenção básica organiza o cuidado e articula os demais pontos da rede." } },
  { summary: "Organize anamnese, exame clínico, hipótese diagnóstica e registro. O diagnóstico exige correlação entre queixa, sinais, sintomas e exames complementares quando indicados.", pdf: "/editorial-assets/diagnostico.pdf", audio: "O diagnóstico começa pela escuta e pela anamnese, segue com exame clínico e só então formula hipóteses e condutas.", question: { prompt: "Qual sequência representa uma abordagem clínica segura?", options: ["Anamnese, exame clínico, hipótese diagnóstica e conduta", "Conduta antes de examinar", "Radiografia sem anamnese", "Prescrição antes do diagnóstico"], correctOptionIndex: 0, explanation: "A conduta deve ser definida após coleta e interpretação dos dados clínicos." } },
  { summary: "Revise medidas coletivas e individuais de prevenção, uso racional de fluoretos, biofilme e orientação de higiene. Relacione risco de cárie e acompanhamento.", pdf: "/editorial-assets/prevencao.pdf", audio: "Prevenção combina orientação, controle do biofilme, exposição adequada ao flúor e acompanhamento conforme risco.", question: { prompt: "O controle do biofilme é relevante porque:", options: ["Integra a prevenção de doenças bucais", "Elimina a necessidade de exame", "Substitui todo tratamento", "É restrito à estética"], correctOptionIndex: 0, explanation: "A remoção do biofilme integra as medidas preventivas e educativas." } },
  { summary: "Diferencie materiais restauradores, indicação clínica e fundamentos de oclusão. Use o PDF para consolidar termos sem transformar indicação didática em prescrição clínica.", pdf: "/editorial-assets/dentistica.pdf", audio: "Em dentística, associe diagnóstico, preparo conservador, material indicado e ajuste oclusal conforme o caso.", question: { prompt: "A escolha de um material restaurador deve considerar principalmente:", options: ["Indicação clínica e condições do caso", "Apenas a cor do material", "Somente a preferência do aluno", "Nenhum exame prévio"], correctOptionIndex: 0, explanation: "A indicação depende da avaliação clínica e das características do procedimento." } },
  { summary: "Revise classes de fármacos, indicação, contraindicação e segurança. Este material é educacional e não substitui protocolos, bula ou julgamento profissional.", pdf: "/editorial-assets/farmacologia.pdf", audio: "Em farmacologia, memorize classe, indicação, contraindicação e precauções antes de pensar em dose ou prescrição.", question: { prompt: "Uma revisão segura de farmacologia odontológica deve incluir:", options: ["Indicação, contraindicação e segurança", "Somente o nome comercial", "Prescrição sem avaliação", "Apenas a via de administração"], correctOptionIndex: 0, explanation: "O estudo deve relacionar indicação, riscos e segurança do paciente." } },
  { summary: "Estruture a revisão por especialidade, distinguindo achados, prevenção e encaminhamento. Não conclua conduta complexa sem contexto clínico e fonte específica.", pdf: "/editorial-assets/especialidades.pdf", audio: "Para especialidades, classifique o problema, reconheça limites da atenção inicial e saiba quando encaminhar.", question: { prompt: "Ao revisar diferentes especialidades, é importante:", options: ["Reconhecer limites e necessidade de encaminhamento", "Aplicar uma mesma conduta a todos os casos", "Ignorar diagnóstico", "Dispensar registro clínico"], correctOptionIndex: 0, explanation: "A identificação de limites e encaminhamento faz parte de uma assistência segura." } },
  { summary: "Priorize acolhimento, avaliação inicial, biossegurança, esterilização e risco ocupacional. Em urgência, diferencie estabilização inicial de tratamento definitivo.", pdf: "/editorial-assets/urgencia.pdf", audio: "Em urgência, acolha, avalie risco, estabilize quando indicado e mantenha as medidas de biossegurança em todas as etapas.", question: { prompt: "Em uma situação de urgência, a prioridade inicial é:", options: ["Avaliar risco e estabilizar o paciente quando indicado", "Ignorar biossegurança", "Iniciar procedimento sem avaliação", "Dispensar registro"], correctOptionIndex: 0, explanation: "A avaliação inicial orienta uma conduta segura e proporcional ao risco." } },
];

const keys = mauaCourseTemplate.modules.flatMap((module) => module.lessons.map((lesson) => lesson.key)) as CourseLessonKey[];
export const mauaCourseContent: Record<CourseLessonKey, LessonContent> = Object.fromEntries(keys.map((key, index) => [key, { key, ...entries[index] }])) as Record<CourseLessonKey, LessonContent>;

export function lessonKeyForTitle(title: string): CourseLessonKey | null {
  return keys.find((key) => mauaCourseTemplate.modules.some((module) => module.lessons.some((lesson) => lesson.key === key && lesson.title === title))) ?? null;
}

export function titleForLessonKey(key: CourseLessonKey): string | null {
  for (const module of mauaCourseTemplate.modules) {
    for (const lesson of module.lessons) if (lesson.key === key) return lesson.title;
  }
  return null;
}

export function lessonVideoPolicy(key: CourseLessonKey) { return mauaLessonVideoPolicies[key]; }
export const courseSources = [mauaSyllabusSource, susLawSource];
