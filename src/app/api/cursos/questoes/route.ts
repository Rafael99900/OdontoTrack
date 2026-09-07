import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LearningCourseError, saveQuestionAttempt } from "@/lib/learning/maua-course-persistence";
import { susLessonProduction } from "@/lib/learning/maua-dentistry-production";

export async function POST(request: Request) {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  const body = await request.json() as { lessonKey?: string; questionKey?: string; selectedOptionIndex?: number };
  if (body.lessonKey !== "sus" || !body.questionKey || typeof body.selectedOptionIndex !== "number") return NextResponse.json({ error: "Resposta inválida." }, { status: 400 });
  const questionIndex = Number(body.questionKey) - 1;
  const question = susLessonProduction.questions[questionIndex];
  if (!question || body.selectedOptionIndex < 0 || body.selectedOptionIndex >= question.options.length) return NextResponse.json({ error: "Alternativa inválida." }, { status: 400 });
  try {
    await saveQuestionAttempt(user.id, "sus", body.questionKey, body.selectedOptionIndex, body.selectedOptionIndex === question.correctOptionIndex);
    return NextResponse.json({ ok: true, correct: body.selectedOptionIndex === question.correctOptionIndex });
  } catch (error) {
    return NextResponse.json({ error: error instanceof LearningCourseError ? error.message : "Não foi possível registrar a resposta." }, { status: 409 });
  }
}
