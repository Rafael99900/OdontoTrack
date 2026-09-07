import type { CourseLessonKey } from "@/lib/learning/maua-course-content";

export type CuratedYouTubeVideo = {
  videoId: string;
  title: string;
  channelName: string;
  coverage: string;
  reviewedAt: string;
};

/**
 * Links públicos verificados por oEmbed em 07/09/2026. O app não baixa nem
 * replica vídeos: usa somente o player oficial e sempre mantém o link de origem.
 */
export const mauaYouTubeVideos: Record<CourseLessonKey, CuratedYouTubeVideo> = {
  sus: { videoId: "t8_2_iXwQyU", title: "Princípios e Diretrizes SUS, Atenção Básica, Doutrinários e Organizativos + Questões", channelName: "Dra. Nathália Lucena Ensina", coverage: "Princípios e diretrizes do SUS e atenção básica.", reviewedAt: "2026-09-07" },
  "atencao-basica": { videoId: "WOuwuoM_eSA", title: "Funções da atenção básica na rede de atenção à saúde - PNAB", channelName: "Dentista Concursada - Amanda Caramel", coverage: "Organização e funções da atenção básica.", reviewedAt: "2026-09-07" },
  diagnostico: { videoId: "k0obgOCHAaU", title: "Exame Físico na Odontologia", channelName: "Estomatopato UEL", coverage: "Exame físico aplicado ao contexto odontológico.", reviewedAt: "2026-09-07" },
  prevencao: { videoId: "4X2Nk5vueJc", title: "FLÚOR: APLICAÇÕES E FUNÇÕES", channelName: "Simpatio Odonto", coverage: "Uso e funções do flúor.", reviewedAt: "2026-09-07" },
  dentistica: { videoId: "Pk9ypVYmTR4", title: "PRINCIPAIS MATERIAIS RESTAURADORES ODONTOLÓGICOS | DENTÍSTICA", channelName: "Dentista Responde", coverage: "Materiais restauradores em dentística.", reviewedAt: "2026-09-07" },
  farmacologia: { videoId: "go2VDb3-w0I", title: "ANTI-INFLAMATÓRIOS EM ODONTOLOGIA", channelName: "Dentista Concursada - Amanda Caramel", coverage: "Anti-inflamatórios em odontologia.", reviewedAt: "2026-09-07" },
  especialidades: { videoId: "TIwV9BbSdBE", title: "(PERIODONTIA): Anatomia do Periodonto", channelName: "OdontoChannel", coverage: "Fundamentos de periodontia; complemente com o PDF para as demais especialidades.", reviewedAt: "2026-09-07" },
  urgencia: { videoId: "82zAatP_2Ow", title: "Biossegurança na Saúde: Guia Completo + Questões Resolvidas!", channelName: "ENFrente Enfermagem Continuada", coverage: "Biossegurança; complemente com o PDF para urgência odontológica.", reviewedAt: "2026-09-07" },
};

export function youtubeWatchUrl(videoId: string) { return `https://www.youtube.com/watch?v=${videoId}`; }
