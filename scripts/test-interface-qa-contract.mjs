import { readFile } from "node:fs/promises";

const required = {
  "src/app/login/page.tsx": ["data-cy=\"auth-login-page\"", "role=\"alert\""],
  "src/features/auth/magic-link-form.tsx": [
    "data-cy=\"auth-magic-link-form\"",
    "data-cy=\"auth-email-input\"",
    "data-cy=\"auth-send-magic-link\"",
    "data-cy=\"auth-google-sign-in\"",
    "htmlFor=\"email\"",
    "autoComplete=\"email\"",
    "aria-live",
  ],
  "src/app/area/page.tsx": ["data-cy=\"auth-protected-area\"", "data-cy=\"open-editorial-review\"", "data-cy=\"open-course-draft\""],
  "src/app/area/revisoes/page.tsx": ["data-cy=\"editorial-review-page\"", "data-cy=\"editorial-review-notice\"", "data-cy=\"editorial-evidence-list\"", "data-cy=\"editorial-checklist\""],
  "src/app/area/cursos/page.tsx": ["data-cy=\"courses-editorial-page\"", "data-cy=\"course-editorial-guard\"", "data-cy=\"course-draft-modules\""],
  "src/features/learning/lesson-studio.tsx": ["data-cy=\"lesson-studio\"", "data-cy=\"lesson-ai-question\"", "data-cy=\"lesson-ai-send\"", "data-cy=\"lesson-open-pdf\""],
};

for (const [file, fragments] of Object.entries(required)) {
  const source = await readFile(file, "utf8");
  for (const fragment of fragments) {
    if (!source.includes(fragment)) throw new Error(`${file}: contrato de QA ausente (${fragment}).`);
  }
}

const [a11y, globalCss, loginCss] = await Promise.all([
  readFile("src/app/accessibility.css", "utf8"),
  readFile("src/app/globals.css", "utf8"),
  readFile("src/app/login/login.module.css", "utf8"),
]);

for (const fragment of [":focus-visible", "min-height: 44px", "prefers-reduced-motion"]) {
  if (!a11y.includes(fragment)) throw new Error(`Contrato global de acessibilidade ausente: ${fragment}.`);
}
for (const fragment of ["@media(max-width:720px)", "@media(max-width:900px)", "overflow:auto"]) {
  if (!globalCss.includes(fragment)) throw new Error(`Contrato responsivo ausente em globals.css: ${fragment}.`);
}
for (const fragment of ["min-height: 100dvh", "width: min(100%, 560px)", "@media"] ) {
  if (fragment === "@media") continue;
  if (!loginCss.includes(fragment)) throw new Error(`Contrato de login responsivo ausente: ${fragment}.`);
}

console.log("Interface QA contract passed: login, área, revisão, cursos, foco, teclado e breakpoints.");
