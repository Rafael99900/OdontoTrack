-- OT-12: liga a versão candidata ao snapshot e mantém a decisão editorial fora
-- do catálogo público. Esta migration não detecta conteúdo nem publica editais.

create type public.notice_change_classification as enum (
  'new_notice',
  'potential_retification',
  'document_update',
  'needs_manual_review'
);

create type public.notice_review_status as enum (
  'pending',
  'in_review',
  'approved',
  'rejected',
  'dismissed'
);

alter table public.notice_versions
  add column origin_snapshot_id uuid references public.source_snapshots(id) on delete restrict;

create index notice_versions_origin_snapshot_idx
  on public.notice_versions (origin_snapshot_id)
  where origin_snapshot_id is not null;

create table public.notice_version_changes (
  id uuid primary key default gen_random_uuid(),
  candidate_notice_version_id uuid not null references public.notice_versions(id) on delete restrict,
  previous_notice_version_id uuid references public.notice_versions(id) on delete restrict,
  -- `notice:exam_date` ou `position:<id>:vacancies`; permite a mesma chave
  -- crítica em mais de um cargo sem duplicar um diff no retry.
  change_path text not null,
  change_key text not null check (change_key in (
    'registration_period', 'exam_date', 'vacancies', 'remuneration',
    'requirements', 'syllabus', 'workload', 'fee', 'document'
  )),
  previous_value jsonb,
  candidate_value jsonb,
  candidate_evidence_id uuid,
  created_at timestamptz not null default now(),
  unique (candidate_notice_version_id, change_path),
  foreign key (candidate_notice_version_id, candidate_evidence_id)
    references public.evidence(notice_version_id, id) on delete restrict,
  check (candidate_evidence_id is not null or change_key = 'document')
);

create table public.notice_review_queue (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.notices(id) on delete restrict,
  candidate_notice_version_id uuid not null,
  previous_notice_version_id uuid,
  classification public.notice_change_classification not null,
  review_status public.notice_review_status not null default 'pending',
  review_reason text not null,
  enqueued_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_note text,
  unique (candidate_notice_version_id),
  foreign key (notice_id, candidate_notice_version_id)
    references public.notice_versions(notice_id, id) on delete restrict,
  foreign key (notice_id, previous_notice_version_id)
    references public.notice_versions(notice_id, id) on delete restrict,
  check ((review_status in ('approved', 'rejected', 'dismissed')) = (reviewed_at is not null))
);

create index notice_review_queue_pending_idx
  on public.notice_review_queue (review_status, enqueued_at)
  where review_status in ('pending', 'in_review');

create index notice_version_changes_candidate_idx
  on public.notice_version_changes (candidate_notice_version_id);

-- Fila e diff são internos. Usuários públicos não podem inspecionar documentos
-- pendentes, trechos extraídos ou metadados de processamento.
alter table public.notice_version_changes enable row level security;
alter table public.notice_review_queue enable row level security;
revoke all on table public.notice_version_changes from public, anon, authenticated;
revoke all on table public.notice_review_queue from public, anon, authenticated;
grant select, insert, update on table public.notice_version_changes to service_role;
grant select, insert, update on table public.notice_review_queue to service_role;
