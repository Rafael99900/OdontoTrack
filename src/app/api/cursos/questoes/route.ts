import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LearningCourseError, saveQuestionAttempt } from "@/lib/learning/maua-course-persistence";
import { mauaCourseContent, type CourseLessonKey } from "@/lib/learning/maua-course-content";

export async function POST(request: Request) {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  const body = await request.json() as { lessonKey?: string; questionKey?: string; selectedOptionIndex?: number };
  if (!body.lessonKey || !body.questionKey || typeof body.selectedOptionIndex !== "number") return NextResponse.json({ error: "Resposta inválida." }, { status: 400 });
  const lesson = mauaCourseContent[body.lessonKey as CourseLessonKey];
  const question = body.questionKey === "1" ? lesson?.question : null;
  if (!question || body.selectedOptionIndex < 0 || body.selectedOptionIndex >= question.options.length) return NextResponse.json({ error: "Alternativa inválida." }, { status: 400 });
  try {
    await saveQuestionAttempt(user.id, body.lessonKey, body.questionKey, body.selectedOptionIndex, body.selectedOptionIndex === question.correctOptionIndex);
    return NextResponse.json({ ok: true, correct: body.selectedOptionIndex === question.correctOptionIndex });
  } catch (error) {
    return NextResponse.json({ error: error instanceof LearningCourseError ? error.message : "Não foi possível registrar a resposta." }, { status: 409 });
  }
}
