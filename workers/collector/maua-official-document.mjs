import { fetchVerifiedOfficialPdf } from "./pmsp-notice-discovery.mjs";

export const MAUA_OFFICIAL_DOCUMENT_HOSTS = new Set([
  "dom.maua.sp.gov.br",
  "www.maua.sp.gov.br",
  "maua.sp.gov.br",
]);

export function fetchVerifiedMauaPdf(options) {
  return fetchVerifiedOfficialPdf({ ...options, allowedHosts: MAUA_OFFICIAL_DOCUMENT_HOSTS });
}
