import { NextResponse } from "next/server";
import { askGemini } from "@/lib/ai/gemini";
import { buildLessonAiContext } from "@/lib/learning/maua-dentistry-production";
import { buildCatalogAiContext } from "@/lib/notices/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const client = await createSupabaseServerClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
    const body = await request.json() as { question?: string; lessonKey?: string };
    if (!body.question?.trim()) return NextResponse.json({ error: "Pergunta obrigatória." }, { status: 400 });
    const context = body.lessonKey === "maua-sus" ? buildLessonAiContext() : await buildCatalogAiContext();
    const answer = await askGemini({ question: body.question.slice(0, 2000), ...context });
    return NextResponse.json({ answer, sources: context.sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: message.includes("configurada") ? 503 : 500 });
  }
}
