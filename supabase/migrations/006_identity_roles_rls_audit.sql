-- OT-02/OT-03: identidade do aluno, papéis editoriais e privacidade por RLS.
-- Depende de Supabase Auth (`auth.users`). Não cria usuários editoriais.

create type public.app_role as enum ('student', 'editor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (length(trim(display_name)) between 1 and 120),
  education_level text check (education_level in ('secondary', 'technical', 'higher', 'other')),
  municipalities text[] not null default '{}'::text[],
  weekly_study_hours numeric(4, 1) check (weekly_study_hours is null or weekly_study_hours > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  primary key (user_id, role)
);

create index user_roles_editor_idx on public.user_roles (user_id) where role = 'editor';

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (length(trim(action)) > 0),
  entity_type text not null check (length(trim(entity_type)) > 0),
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at desc);

-- Todo usuário autenticado recebe somente perfil e papel de aluno.
-- Editor é concedido apenas por fluxo administrativo server-side posterior.
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'student') on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_auth_user_created();

-- Cobertura para contas criadas antes desta migration; não há papel editor implícito.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'student'::public.app_role from auth.users
on conflict do nothing;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_profile_updated_at();

-- Função de apoio para policies editoriais futuras. O cliente não recebe
-- permissão de alterar papéis; ela apenas consulta o papel do próprio usuário.
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'editor'
  );
$$;

revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to authenticated;

-- Auditoria mínima e append-only para mudança de perfil e concessão/revogação
-- de papel. Função security definer evita exigir INSERT do aluno em audit_logs.
create or replace function public.audit_identity_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  old_data jsonb;
  new_data jsonb;
  changed_id uuid;
begin
  old_data := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  new_data := case when tg_op = 'DELETE' then null else to_jsonb(new) end;

  if tg_table_name = 'user_roles' then
    changed_id := (coalesce(new_data, old_data) ->> 'user_id')::uuid;
  else
    changed_id := (coalesce(new_data, old_data) ->> 'id')::uuid;
  end if;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, after_data)
  values (auth.uid(), 'identity.' || lower(tg_table_name) || '.' || lower(tg_op), tg_table_name, changed_id, old_data, new_data);
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger profiles_audit_change
  after insert or update or delete on public.profiles
  for each row execute procedure public.audit_identity_change();

create trigger user_roles_audit_change
  after insert or update or delete on public.user_roles
  for each row execute procedure public.audit_identity_change();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_logs enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.user_roles from public, anon, authenticated;
revoke all on table public.audit_logs from public, anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.user_roles to authenticated;
grant select, insert on table public.audit_logs to service_role;
grant select, insert, update on table public.profiles to service_role;
grant select, insert, update on table public.user_roles to service_role;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy user_roles_select_own
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);
