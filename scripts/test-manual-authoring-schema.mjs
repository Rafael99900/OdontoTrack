import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/014_manual_course_authoring_foundation.sql", import.meta.url), "utf8");
const lessonMigration = await readFile(new URL("../supabase/migrations/015_manual_lesson_authoring_fields.sql", import.meta.url), "utf8");

for (const fragment of [
  "create table public.manual_notices",
  "owner_user_id uuid not null references auth.users(id)",
  "create table public.manual_notice_subjects",
  "alter table public.manual_notices enable row level security",
  "alter table public.manual_notice_subjects enable row level security",
  "create policy manual_notices_select_own",
  "create policy manual_notice_subjects_select_own",
  "add column manual_notice_id uuid references public.manual_notices(id)",
  "alter column source_notice_version_id drop not null",
  "learning_courses_exactly_one_source_check",
  "num_nonnulls(source_notice_version_id, manual_notice_id) = 1",
  "learning_courses_manual_notice_owner_key",
]) {
  assert.match(migration, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.doesNotMatch(migration, /delete\s+from\s+public\.learning_courses/i, "A fundação não pode apagar cursos existentes.");
assert.doesNotMatch(migration, /insert\s+into\s+public\.notices/i, "Material manual não pode entrar no catálogo oficial.");
for (const fragment of ["add column summary text", "add column notebook_prompt text", "add column audio_script text", "add column authoring_status", "add column embed_provider text", "add column embed_id text", "add column source_label text", "learning_assets_safe_embed_check", "embed_provider = 'youtube'"]) {
  assert.match(lessonMigration, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
assert.doesNotMatch(lessonMigration, /add column (iframe|embed_html|html)/i, "A migração não pode persistir HTML incorporado.");
console.log("Manual authoring foundation contract passed: private schema, RLS, XOR e não regressão de catálogo.");
