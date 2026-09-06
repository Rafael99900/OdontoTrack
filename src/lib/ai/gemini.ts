export type AiSource = {
  label: string;
  url: string;
  page?: number;
};

export type StudyAiRequest = {
  question: string;
  lessonTitle?: string;
  noticeContext?: string;
  sources?: AiSource[];
};

// Modelo aceito para novas chaves no Gemini API. A versão 2.5 Flash foi
// retirada para novos projetos e retornava 404 em produção.
const model = "gemini-3.6-flash";

export async function askGemini(request: StudyAiRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Integração de IA ainda não configurada.");

  const sourceBlock = request.sources?.length
    ? request.sources.map((source) => `Fonte: ${source.label}. ${source.url}${source.page ? `, página ${source.page}` : ""}`).join("\n")
    : "Nenhuma fonte oficial foi fornecida para esta pergunta.";
  const prompt = [
    "Você é o assistente pedagógico do OdontoTrack.",
    "Não invente datas, vagas, requisitos ou conteúdo de edital.",
    "Para perguntas factuais de concurso, responda apenas quando houver fonte e cite a fonte usada.",
    `Aula atual: ${request.lessonTitle ?? "não informada"}.`,
    `Contexto do edital: ${request.noticeContext ?? "não informado"}.`,
    sourceBlock,
    `Pergunta do aluno: ${request.question}`,
  ].join("\n\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    console.error("Gemini generateContent failed", { status: response.status, details });
    throw new Error(`Não foi possível obter resposta da IA. Código ${response.status}.`);
  }
  const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "Não encontrei uma resposta confiável.";
}
