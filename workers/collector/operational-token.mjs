import { timingSafeEqual } from "node:crypto";

export class OperationalTokenConfigurationError extends Error {
  constructor() {
    super("Disparo operacional não configurado.");
    this.name = "OperationalTokenConfigurationError";
  }
}

export class OperationalTokenUnauthorizedError extends Error {
  constructor() {
    super("Não autorizado.");
    this.name = "OperationalTokenUnauthorizedError";
  }
}

export function requireToken(authorization, configuredToken) {
  if (!configuredToken) throw new OperationalTokenConfigurationError();
  const suppliedToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const expected = Buffer.from(configuredToken);
  const supplied = Buffer.from(suppliedToken);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new OperationalTokenUnauthorizedError();
  }
}

export function requireOperationalToken(authorization, configuredToken = process.env.OPERATIONS_COLLECTOR_TOKEN) {
  requireToken(authorization, configuredToken);
}

export function requireEditorialReviewToken(authorization, configuredToken = process.env.EDITORIAL_REVIEW_TOKEN) {
  requireToken(authorization, configuredToken);
}
