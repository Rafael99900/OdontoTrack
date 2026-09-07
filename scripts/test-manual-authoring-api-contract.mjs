import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
async function source(path) { return readFile(new URL(path, root), "utf8"); }

const routes = await Promise.all([
  source("src/app/api/manual/concursos/route.ts"),
  source("src/app/api/manual/concursos/[id]/route.ts"),
  source("src/app/api/manual/concursos/[id]/materias/route.ts"),
  source("src/app/api/manual/concursos/[id]/trilha/route.ts"),
  source("src/app/api/manual/concursos/[id]/pronto/route.ts"),
  source("src/app/api/manual/aulas/[id]/route.ts"),
  source("src/app/api/manual/aulas/[id]/ativos/route.ts"),
  source("src/app/api/manual/aulas/[id]/questoes/route.ts"),
]);
for (const route of routes) assert.match(route, /authenticatedUser/, "Toda rota manual exige usuário autenticado.");
const authoring = await source("src/lib/learning/manual-authoring.ts");
for (const fragment of ["requireManualOwner", "requireLessonOwner", "extractYouTubeId", "youtube.com", "youtu.be", "youtube-nocookie.com", "createManualCourse"]) assert.match(authoring, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.doesNotMatch(authoring, /iframe|<script|embed_html/i, "A API não pode persistir HTML incorporado.");
assert.match(authoring, /created: false/, "A criação de trilha precisa ser idempotente.");
console.log("Manual authoring API contract passed: autenticação, dono, idempotência e vídeo seguro.");
