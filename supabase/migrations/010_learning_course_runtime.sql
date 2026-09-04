-- OT-16: execução individual da trilha. O curso permanece privado e somente
-- pode ser criado a partir de uma versão de edital aprovada.

create table public.learning_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz,
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

create table public.learning_video_candidates (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  provider text not null check (length(trim(provider)) > 0),
  external_url text not null check (external_url ~ '^https://'),
  title text not null check (length(trim(title)) > 0),
  channel_name text,
  rights_evidence_url text not null check (rights_evidence_url ~ '^https://'),
  license_status text not null check (license_status in ('link_only_verified', 'embed_permission_verified', 'awaiting_review', 'rejected')),
  review_status public.learning_asset_status not null default 'planned',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (lesson_id, external_url),
  check ((review_status = 'published') = (reviewed_at is not null))
);

create index learning_lesson_progress_user_idx on public.learning_lesson_progress (user_id, lesson_id);
create index learning_video_candidates_lesson_idx on public.learning_video_candidates (lesson_id, review_status);

alter table public.learning_lesson_progress enable row level security;
alter table public.learning_video_candidates enable row level security;

revoke all on public.learning_lesson_progress, public.learning_video_candidates from public, anon;
grant select, insert, update, delete on public.learning_lesson_progress to service_role;
grant select, insert, update, delete on public.learning_video_candidates to service_role;

-- Acesso do aluno é sempre mediado pelas rotas de servidor. Isto evita que um
-- id de aula de outro curso seja usado para falsificar progresso.
