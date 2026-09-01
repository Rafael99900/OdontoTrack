import { NextResponse } from "next/server";
import { susLessonProduction } from "@/lib/learning/maua-dentistry-production";

/** Prévia privada. A publicação no banco continua dependente da revisão editorial. */
export async function GET() {
  return NextResponse.json({ publication: "editorial_review_required", lesson: susLessonProduction });
}
