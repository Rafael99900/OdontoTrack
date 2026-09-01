-- OT-14: cursos e materiais derivados só nascem de uma versão editorialmente
-- aprovada. O catálogo público permanece separado dos rascunhos internos.

create type public.learning_course_status as enum (
  'draft', 'editorial_review', 'ready', 'published', 'archived'
);

create type public.learning_asset_kind as enum (
  'video', 'pdf', 'audio', 'notebook_prompt'
);

create type public.learning_asset_status as enum (
  'planned', 'in_review', 'approved', 'published', 'rejected'
);

create table public.learning_courses (
  id uuid primary key default gen_random_uuid(),
  source_notice_version_id uuid not null references public.notice_versions(id) on delete restrict,
  owner_user_id uuid,
  title text not null check (length(trim(title)) > 0),
  status public.learning_course_status not null default 'draft',
  source_pages integer[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_notice_version_id, owner_user_id)
);

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.learning_courses(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (course_id, position)
);

create table public.learning_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  objective text not null check (length(trim(objective)) > 0),
  position integer not null check (position > 0),
  source_pages integer[] not null,
  generated_with_ai boolean not null default false,
  editorial_status public.learning_asset_status not null default 'planned',
  created_at timestamptz not null default now(),
  unique (module_id, position),
  check (array_length(source_pages, 1) > 0)
);

create table public.learning_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  asset_kind public.learning_asset_kind not null,
  status public.learning_asset_status not null default 'planned',
  title text not null check (length(trim(title)) > 0),
  asset_url text check (asset_url is null or asset_url ~ '^https?://'),
  storage_bucket text,
  storage_path text,
  source_attribution jsonb not null default '[]'::jsonb,
  content_hash text,
  generated_with_ai boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (lesson_id, asset_kind),
  check ((asset_url is not null) or (storage_bucket is not null and storage_path is not null) or status in ('planned', 'in_review', 'rejected')),
  check ((status = 'published') = (published_at is not null))
);

create table public.learning_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  prompt text not null check (length(trim(prompt)) > 0),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  correct_option_index integer not null check (correct_option_index >= 0),
  explanation text not null check (length(trim(explanation)) > 0),
  source_references jsonb not null default '[]'::jsonb,
  editorial_status public.learning_asset_status not null default 'planned',
  generated_with_ai boolean not null default false,
  created_at timestamptz not null default now(),
  check (correct_option_index < jsonb_array_length(options))
);

create index learning_courses_notice_status_idx on public.learning_courses (source_notice_version_id, status);
create index learning_modules_course_position_idx on public.learning_modules (course_id, position);
create index learning_lessons_module_position_idx on public.learning_lessons (module_id, position);
create index learning_assets_lesson_status_idx on public.learning_assets (lesson_id, status);
create index learning_questions_lesson_status_idx on public.learning_questions (lesson_id, editorial_status);

alter table public.learning_courses enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.learning_assets enable row level security;
alter table public.learning_questions enable row level security;

revoke all on table public.learning_courses, public.learning_modules, public.learning_lessons, public.learning_assets, public.learning_questions from public, anon, authenticated;
grant select, insert, update, delete on table public.learning_courses, public.learning_modules, public.learning_lessons, public.learning_assets, public.learning_questions to service_role;

-- A função de publicação será criada com o gerador de cursos. Ela deverá
-- recusar source_notice_version_id cujo status não seja approved/published.
