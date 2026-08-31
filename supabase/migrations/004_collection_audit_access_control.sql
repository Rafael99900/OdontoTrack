-- OT-11: registros operacionais de coleta não são parte da API pública.
-- O coletor de servidor usa a credencial service_role, nunca uma chave NEXT_PUBLIC.

alter table public.collection_runs enable row level security;
alter table public.source_snapshots enable row level security;

-- Não conceder acesso operacional a visitantes, alunos ou ao papel público.
revoke all on table public.collection_runs from public, anon, authenticated;
revoke all on table public.source_snapshots from public, anon, authenticated;

-- A service_role contorna RLS no Supabase. Estes grants documentam o mínimo
-- exigido por este fluxo: criar, consultar para idempotência e finalizar/atualizar.
-- DELETE é deliberadamente omitido para preservar a auditoria.
grant select, insert, update on table public.collection_runs to service_role;
grant select, insert, update on table public.source_snapshots to service_role;
