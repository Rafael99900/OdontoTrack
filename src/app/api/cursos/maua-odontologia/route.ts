import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createMauaCourseForUser, getMauaCourseForUser, LearningCourseError } from "@/lib/learning/maua-course-persistence";

async function userId() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  try { return NextResponse.json({ course: await getMauaCourseForUser(id) }); }
  catch (error) { return NextResponse.json({ error: error instanceof LearningCourseError ? error.message : "Não foi possível carregar a trilha." }, { status: 409 }); }
}

export async function POST() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 });
  try { return NextResponse.json({ course: await createMauaCourseForUser(id) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof LearningCourseError ? error.message : "Não foi possível criar a trilha." }, { status: 409 }); }
}
