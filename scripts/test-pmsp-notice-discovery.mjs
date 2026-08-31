import { discoverPmspNoticeDocuments } from "../workers/collector/pmsp-notice-discovery.mjs";

const html = `
  <a href="/storage/edital-odontologia.pdf">Edital de concurso para Odontologia</a>
  <a href="https://clic.prefeitura.sp.gov.br/storage/edital-odontologia.pdf#pagina-3">Cópia</a>
  <a href="https://externo.exemplo.org/edital.pdf">Não oficial</a>
  <a href="/storage/guia.xlsx">Guia institucional</a>
  <a href="/concursos">Página de concursos</a>
`;

const candidates = discoverPmspNoticeDocuments(html);
if (candidates.length !== 2) throw new Error(`Esperados 2 documentos oficiais, recebidos ${candidates.length}.`);
if (candidates[0].documentUrl !== "https://clic.prefeitura.sp.gov.br/storage/edital-odontologia.pdf") throw new Error("A URL documental não foi canonizada.");
if (!candidates[0].possibleNotice || candidates[1].possibleNotice) throw new Error("A classificação inicial do link é incorreta.");
if (candidates.some((candidate) => candidate.documentUrl.includes("externo.exemplo.org"))) throw new Error("Um domínio externo foi aceito.");

console.log("OT-12 descoberta de documentos PMSP: ok");
