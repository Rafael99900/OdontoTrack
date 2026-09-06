import { compareRetificationForPosition, MAUA_CP_01_2025_RETIFICATIONS } from "../workers/collector/maua-cp-01-retifications.mjs";

const unchanged = "RETIFICAÇÃO DO EDITAL DE ABERTURA - CONCURSO PÚBLICO N° 01/2025. Os demais itens do Edital permanecem inalterados.";
const result = compareRetificationForPosition({ documentText: unchanged, finalUnchangedClauseFound: true });
if (result.classification !== "document_update" || result.positionMentioned || result.changedFacts.length !== 0 || result.publicFactsMayChange) {
  throw new Error("Uma retificação sem menção ao cargo não pode alterar fatos públicos de Odontologia.");
}
const mentioned = compareRetificationForPosition({ documentText: `${unchanged} CIRURGIÃO DENTISTA 20H`, finalUnchangedClauseFound: true });
if (!mentioned.positionMentioned || mentioned.positionImpact !== "requires_editorial_fact_review") throw new Error("Menção ao cargo precisa exigir revisão editorial.");
if (MAUA_CP_01_2025_RETIFICATIONS.length !== 2 || !MAUA_CP_01_2025_RETIFICATIONS.every((record) => record.documentUrl.startsWith("https://dom.maua.sp.gov.br/"))) {
  throw new Error("O inventário deve conter as duas retificações oficiais de Mauá.");
}
console.log("Retificações Mauá: comparação conservadora, duas fontes oficiais e nenhuma alteração pública automática.");
