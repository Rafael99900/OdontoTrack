import { NextResponse } from "next/server";
import { requireLessonOwner, validateAssetInput } from "@/lib/learning/manual-authoring";
import { authenticatedUser, bodyOf, manualError } from "@/app/api/manual/_lib";
type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: Context) { const user = await authenticatedUser(); if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 }); try { const id = (await params).id; const { admin } = await requireLessonOwner(user.id, id); const asset = validateAssetInput(await bodyOf(request)); const { data, error } = await admin.from("learning_assets").upsert({ lesson_id: id, ...asset }, { onConflict: "lesson_id,asset_kind" }).select("*").single(); if (error) throw error; return NextResponse.json({ asset }, { status: 201 }); } catch (error) { return manualError(error); } }
