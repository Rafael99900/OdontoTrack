import { readFile } from "node:fs/promises";

const [vercel, route] = await Promise.all([
  readFile("vercel.json", "utf8"),
  readFile("src/app/api/cron/coletar-fontes/route.ts", "utf8"),
]);
const config = JSON.parse(vercel);
const cron = config.crons?.find((item) => item.path === "/api/cron/coletar-fontes");
if (!cron || cron.schedule !== "0 11 * * *") throw new Error("O cron diário de coleta não está configurado para 11:00 UTC.");
for (const fragment of ["requireToken", "CRON_SECRET", "Promise.allSettled", "buildDailyCollectionReport", "report.status === \"ok\" ? 200 : 503"]) {
  if (!route.includes(fragment)) throw new Error(`Contrato operacional ausente: ${fragment}`);
}
console.log("Contrato cron: agenda diária, autenticação e alerta para falha parcial presentes.");
