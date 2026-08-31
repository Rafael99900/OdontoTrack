-- OT-10: catálogo oficial, versionamento e evidências rastreáveis.
-- Esta migration é declarativa; ela não se conecta nem aplica alterações em Supabase.

create extension if not exists pgcrypto;

create type public.editorial_status as enum (
  'pending_review',
  'approved',
  'published',
  'rejected',
  'superseded'
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_name text,
  canonical_url text not null check (canonical_url ~ '^https?://'),
  source_kind text not null check (source_kind in ('official_portal', 'official_gazette', 'exam_board')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_url)
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete restrict,
  external_reference text,
  canonical_url text not null check (canonical_url ~ '^https?://'),
  municipality text not null,
  state_code char(2) not null default 'SP' check (state_code ~ '^[A-Z]{2}$'),
  organization_name text not null,
  title text not null,
  editorial_status public.editorial_status not null default 'pending_review',
  current_version_id uuid,
  first_captured_at timestamptz not null,
  last_captured_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (last_captured_at >= first_captured_at),
  unique (source_id, canonical_url),
  unique (source_id, external_reference)
);

create table public.notice_versions (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.notices(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  source_url text not null check (source_url ~ '^https?://'),
  document_url text check (document_url is null or document_url ~ '^https?://'),
  content_hash text not null check (length(content_hash) >= 32),
  captured_at timestamptz not null,
  publication_date date,
  editorial_status public.editorial_status not null default 'pending_review',
  change_summary text,
  created_at timestamptz not null default now(),
  unique (notice_id, version_number),
  unique (notice_id, content_hash),
  unique (notice_id, id)
);

alter table public.notices
  add constraint notices_current_version_fk
  foreign key (current_version_id) references public.notice_versions(id) on delete restrict;

alter table public.notices
  add constraint notices_current_version_belongs_to_notice_fk
  foreign key (id, current_version_id) references public.notice_versions(notice_id, id) on delete restrict;

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  notice_version_id uuid not null references public.notice_versions(id) on delete restrict,
  title text not null,
  education_level text not null check (education_level in ('secondary', 'higher', 'technical', 'other')),
  area text,
  vacancies integer check (vacancies is null or vacancies >= 0),
  remuneration_cents integer check (remuneration_cents is null or remuneration_cents >= 0),
  workload_hours_week integer check (workload_hours_week is null or workload_hours_week > 0),
  editorial_status public.editorial_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  unique (notice_version_id, title),
  unique (notice_version_id, id)
);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  notice_version_id uuid not null references public.notice_versions(id) on delete restrict,
  source_url text not null check (source_url ~ '^https?://'),
  content_hash text not null check (length(content_hash) >= 32),
  page_number integer check (page_number is null or page_number > 0),
  excerpt text not null check (length(trim(excerpt)) > 0),
  captured_at timestamptz not null,
  extraction_method text not null check (extraction_method in ('manual', 'pdf_text', 'ocr', 'web_capture')),
  editorial_status public.editorial_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  unique (notice_version_id, id)
);

-- Um fato é o registro auditável de qualquer campo crítico (data, vagas,
-- remuneração, requisitos, prova ou conteúdo). A FK composta impede que uma
-- evidência de outra versão seja anexada ao fato atual.
create table public.notice_version_facts (
  id uuid primary key default gen_random_uuid(),
  notice_version_id uuid not null references public.notice_versions(id) on delete restrict,
  position_id uuid references public.positions(id) on delete restrict,
  fact_key text not null check (fact_key in (
    'registration_period', 'exam_date', 'vacancies', 'remuneration',
    'requirements', 'syllabus', 'workload', 'fee'
  )),
  fact_value jsonb not null,
  evidence_id uuid not null,
  editorial_status public.editorial_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  unique (notice_version_id, position_id, fact_key),
  foreign key (notice_version_id, evidence_id)
    references public.evidence(notice_version_id, id) on delete restrict,
  foreign key (notice_version_id, position_id)
    references public.positions(notice_version_id, id) on delete restrict
);

create index notices_municipality_status_idx on public.notices (municipality, state_code, editorial_status);
create index notice_versions_notice_captured_idx on public.notice_versions (notice_id, captured_at desc);
create index positions_version_area_idx on public.positions (notice_version_id, area);
create index evidence_version_idx on public.evidence (notice_version_id);
create index notice_facts_version_key_idx on public.notice_version_facts (notice_version_id, fact_key);
