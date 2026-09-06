import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const template = await readFile(new URL("../src/lib/learning/maua-course-template.ts", import.meta.url), "utf8");
const persistence = await readFile(new URL("../src/lib/learning/maua-course-persistence.ts", import.meta.url), "utf8");
const review = await readFile(new URL("../docs/maua-video-curation-review.md", import.meta.url), "utf8");

for (const lesson of ["sus", "atencao-basica", "diagnostico", "prevencao", "dentistica", "farmacologia", "especialidades", "urgencia"]) {
  assert.match(template, new RegExp(`(?:${lesson}|"${lesson}")\\s*:`), `Política ausente para ${lesson}`);
}
assert.match(template, /usage: "external_link_only"/);
assert.match(template, /produce_original_video_or_obtain_authorization/);
assert.match(template, /dentistica: \{ candidates: \[\]/);
assert.match(template, /farmacologia: \{ candidates: \[\]/);
assert.match(persistence, /reviewStatus === "approved"/);
assert.match(persistence, /videoPolicy\.candidates\.map/);
assert.match(review, /nunca um arquivo copiado nem um `iframe`/);
console.log("Video curation contract passed.");
