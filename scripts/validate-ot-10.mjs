import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const migration = await readFile(resolve(root, "supabase/migrations/002_official_notice_traceability.sql"), "utf8");
const seed = await readFile(resolve(root, "supabase/seed/ot_10_traceability_seed.sql"), "utf8");
const verification = await readFile(resolve(root, "supabase/tests/ot_10_traceability_verify.sql"), "utf8");

const requiredMigrationFragments = [
  "create table public.sources",
  "create table public.notices",
  "create table public.notice_versions",
  "create table public.positions",
  "create table public.evidence",
  "create table public.notice_version_facts",
  "foreign key (notice_version_id, evidence_id)",
  "references public.evidence(notice_version_id, id)",
  "unique (notice_id, version_number)",
  "content_hash text not null",
  "page_number integer",
  "excerpt text not null",
];

const requiredSeedFragments = ["version_number, source_url", " 1, ", " 2, ", "update public.notices set current_version_id"];
const requiredVerificationFragments = ["critical_facts_have_versioned_evidence", "notice_versions_are_preserved", "raise exception"];

function assertIncludes(text, fragments, file) {
  const absent = fragments.filter((fragment) => !text.includes(fragment));
  if (absent.length) throw new Error(`${file} não contém: ${absent.join(", ")}`);
}

assertIncludes(migration, requiredMigrationFragments, "migration OT-10");
assertIncludes(seed, requiredSeedFragments, "seed OT-10");
assertIncludes(verification, requiredVerificationFragments, "verificação OT-10");

console.log("OT-10 static validation passed: schema, seed and traceability assertions are present.");
