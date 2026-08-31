import { requireOperationalToken, OperationalTokenConfigurationError, OperationalTokenUnauthorizedError } from "../workers/collector/operational-token.mjs";

try {
  requireOperationalToken("Bearer any", "");
  throw new Error("Token ausente deveria bloquear o disparo.");
} catch (error) {
  if (!(error instanceof OperationalTokenConfigurationError)) throw error;
}

try {
  requireOperationalToken("Bearer incorreto", "token-de-teste");
  throw new Error("Token incorreto deveria bloquear o disparo.");
} catch (error) {
  if (!(error instanceof OperationalTokenUnauthorizedError)) throw error;
}

requireOperationalToken("Bearer token-de-teste", "token-de-teste");
console.log("Operational token contract passed: missing and invalid tokens are rejected.");
