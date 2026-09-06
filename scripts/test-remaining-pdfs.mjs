import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
const root = new URL("../public/editorial-assets/", import.meta.url);
const names = ["atencao-basica", "diagnostico", "prevencao", "dentistica", "farmacologia", "especialidades", "urgencia"];
const script = readFileSync(new URL("./generate-remaining-lesson-pdfs.py", import.meta.url), "utf8");
assert.equal(script.includes("—"), false, "O gerador não pode conter travessão.");
assert.match(script, /Fontes consultadas/); assert.match(script, /Ilustração autoral OdontoTrack/);
for (const name of names) assert.ok(existsSync(new URL(`${name}.pdf`, root)), `PDF ausente: ${name}`);
console.log("Remaining editorial PDFs contract passed.");
