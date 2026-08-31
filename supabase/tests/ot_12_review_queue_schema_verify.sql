-- Verificação somente de leitura após a migration 005.
select c.relname as table_name, c.relrowsecurity as rls_enabled,
       has_table_privilege('anon', c.oid, 'select') as anon_can_select,
       has_table_privilege('authenticated', c.oid, 'insert') as authenticated_can_insert,
       has_table_privilege('service_role', c.oid, 'select') as service_role_can_select,
       has_table_privilege('service_role', c.oid, 'insert') as service_role_can_insert,
       has_table_privilege('service_role', c.oid, 'update') as service_role_can_update
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('notice_version_changes', 'notice_review_queue')
order by c.relname;

select a.attname = 'origin_snapshot_id' as notice_version_has_origin_snapshot
from pg_attribute a
join pg_class c on c.oid = a.attrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'notice_versions'
  and a.attname = 'origin_snapshot_id' and not a.attisdropped;

-- Aceite: duas tabelas internas com RLS ativa; anon/authenticated falsos,
-- service_role verdadeiro para select/insert/update; a última consulta retorna true.
