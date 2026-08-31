-- OT-11: auditoria de coleta manual. Não cria agendamento nem publica editais.

create table public.collection_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete restrict,
  source_key text not null,
  requested_url text not null check (requested_url ~ '^https?://'),
  canonical_url text check (canonical_url is null or canonical_url ~ '^https?://'),
  content_hash text,
  started_at timestamptz not null,
  completed_at timestamptz,
  http_status integer check (http_status is null or http_status between 100 and 599),
  run_status text not null check (run_status in ('started', 'unchanged', 'change_detected', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  check ((run_status = 'failed') or (completed_at is not null and content_hash is not null)),
  check ((run_status <> 'failed') or error_message is not null)
);

create table public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete restrict,
  source_key text not null,
  canonical_url text not null check (canonical_url ~ '^https?://'),
  content_hash text not null check (length(content_hash) = 64),
  captured_at timestamptz not null,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  content_type text,
  byte_length integer check (byte_length is null or byte_length >= 0),
  review_required boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (last_seen_at >= first_seen_at),
  unique (source_key, canonical_url, content_hash)
);

create index collection_runs_source_started_idx on public.collection_runs (source_key, started_at desc);
create index source_snapshots_source_captured_idx on public.source_snapshots (source_key, captured_at desc);
