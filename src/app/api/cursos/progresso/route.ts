import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LearningCourseError, saveLessonProgress } from "@/lib/learning/maua-course-persistence";

export async function PATCH(request: Request) {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  const body = await request.json() as { lessonId?: string; completed?: boolean };
  if (!body.lessonId || typeof body.completed !== "boolean") return NextResponse.json({ error: "Aula e status são obrigatórios." }, { status: 400 });
  try { await saveLessonProgress(user.id, body.lessonId, body.completed); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof LearningCourseError ? error.message : "Não foi possível atualizar o progresso." }, { status: 409 }); }
}
