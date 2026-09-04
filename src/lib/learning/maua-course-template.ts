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

export const mauaSusVideoCandidate = {
  provider: "UNA-SUS", title: "Situações Odontológicas Comuns em Atenção Primária à Saúde", channelName: "Universidade Federal de Pelotas, pela UNA-SUS",
  externalUrl: "https://www.unasus.gov.br/cursos/curso/44644", rightsEvidenceUrl: "https://www.unasus.gov.br/cursos/curso/44644", licenseStatus: "link_only_verified",
} as const;
