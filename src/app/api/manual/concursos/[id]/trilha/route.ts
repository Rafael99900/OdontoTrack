import { NextResponse } from "next/server";
import { createManualCourse } from "@/lib/learning/manual-authoring";
import { authenticatedUser, manualError } from "@/app/api/manual/_lib";
type Context = { params: Promise<{ id: string }> };
export async function POST(_: Request, { params }: Context) { const user = await authenticatedUser(); if (!user) return NextResponse.json({ error: "Autenticação obrigatória." }, { status: 401 }); try { const result = await createManualCourse(user.id, (await params).id); return NextResponse.json(result, { status: result.created ? 201 : 200 }); } catch (error) { return manualError(error); } }
