import { NextResponse } from "next/server";
import { askGemini } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { question?: string; lessonTitle?: string; noticeContext?: string; sources?: Array<{ label: string; url: string; page?: number }> };
    if (!body.question?.trim()) return NextResponse.json({ error: "Pergunta obrigatória." }, { status: 400 });
    const answer = await askGemini({ question: body.question, lessonTitle: body.lessonTitle, noticeContext: body.noticeContext, sources: body.sources });
    return NextResponse.json({ answer, sources: body.sources ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: message.includes("configurada") ? 503 : 500 });
  }
}
