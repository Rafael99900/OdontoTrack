-- OT-50: origem manual, privada e separada do catálogo oficial.
-- Nenhum dado desta estrutura é lido por notices, notice_versions ou catálogo.

create type public.manual_notice_status as enum ('draft', 'in_review', 'ready', 'archived');

create table public.manual_notices (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  status public.manual_notice_status not null default 'draft',
  title text not null check (length(trim(title)) between 3 and 160),
  position_title text not null check (length(trim(position_title)) between 1 and 160),
  organization_name text not null check (length(trim(organization_name)) between 1 and 160),
  city text not null check (length(trim(city)) between 1 and 120),
  state_code char(2) not null check (state_code ~ '^[A-Z]{2}$'),
  registration_start_at date,
  registration_end_at date,
  exam_at date,
  remuneration_cents integer check (remuneration_cents is null or remuneration_cents >= 0),
  workload_hours_week integer check (workload_hours_week is null or workload_hours_week > 0),
  requirements text,
  notice_url text check (notice_url is null or notice_url ~ '^https?://'),
  storage_bucket text,
  storage_path text,
  retification_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ready_at timestamptz,
  check (registration_end_at is null or registration_start_at is null or registration_end_at >= registration_start_at),
  check ((storage_bucket is null and storage_path is null) or (storage_bucket is not null and storage_path is not null))
);

create table public.manual_notice_subjects (
  id uuid primary key default gen_random_uuid(),
  manual_notice_id uuid not null references public.manual_notices(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160),
  priority smallint not null default 3 check (priority between 1 and 5),
  estimated_hours numeric(6, 1) check (estimated_hours is null or estimated_hours > 0),
  notes text,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (manual_notice_id, position),
  unique (manual_notice_id, title)
);

create index manual_notices_owner_status_idx on public.manual_notices (owner_user_id, status, updated_at desc);
create index manual_notice_subjects_notice_position_idx on public.manual_notice_subjects (manual_notice_id, position);

create or replace function public.set_manual_notice_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'ready' and (tg_op = 'INSERT' or old.status is distinct from 'ready') then
    new.ready_at := coalesce(new.ready_at, now());
  end if;
  return new;
end;
$$;

create trigger manual_notices_set_updated_at
  before insert or update on public.manual_notices
  for each row execute procedure public.set_manual_notice_updated_at();

create or replace function public.set_manual_notice_subject_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger manual_notice_subjects_set_updated_at
  before update on public.manual_notice_subjects
  for each row execute procedure public.set_manual_notice_subject_updated_at();

alter table public.manual_notices enable row level security;
alter table public.manual_notice_subjects enable row level security;

revoke all on public.manual_notices, public.manual_notice_subjects from public, anon, authenticated;
grant select, insert, update on public.manual_notices to authenticated;
grant select, insert, update on public.manual_notice_subjects to authenticated;
grant select, insert, update, delete on public.manual_notices, public.manual_notice_subjects to service_role;

create policy manual_notices_select_own
  on public.manual_notices for select to authenticated
  using ((select auth.uid()) = owner_user_id);

create policy manual_notices_insert_own
  on public.manual_notices for insert to authenticated
  with check ((select auth.uid()) = owner_user_id);

create policy manual_notices_update_own
  on public.manual_notices for update to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

create policy manual_notice_subjects_select_own
  on public.manual_notice_subjects for select to authenticated
  using (exists (select 1 from public.manual_notices n where n.id = manual_notice_id and n.owner_user_id = (select auth.uid())));

create policy manual_notice_subjects_insert_own
  on public.manual_notice_subjects for insert to authenticated
  with check (exists (select 1 from public.manual_notices n where n.id = manual_notice_id and n.owner_user_id = (select auth.uid())));

create policy manual_notice_subjects_update_own
  on public.manual_notice_subjects for update to authenticated
  using (exists (select 1 from public.manual_notices n where n.id = manual_notice_id and n.owner_user_id = (select auth.uid())))
  with check (exists (select 1 from public.manual_notices n where n.id = manual_notice_id and n.owner_user_id = (select auth.uid())));

-- O rascunho não possui rota de deleção física. Arquivamento é mudança de status.

alter table public.learning_courses
  alter column source_notice_version_id drop not null,
  add column manual_notice_id uuid references public.manual_notices(id) on delete restrict;

alter table public.learning_courses
  add constraint learning_courses_exactly_one_source_check
  check (num_nonnulls(source_notice_version_id, manual_notice_id) = 1),
  add constraint learning_courses_manual_owner_required_check
  check (manual_notice_id is null or owner_user_id is not null);

create index learning_courses_manual_notice_status_idx on public.learning_courses (manual_notice_id, status)
  where manual_notice_id is not null;

create unique index learning_courses_manual_notice_owner_key
  on public.learning_courses (manual_notice_id, owner_user_id)
  where manual_notice_id is not null;
