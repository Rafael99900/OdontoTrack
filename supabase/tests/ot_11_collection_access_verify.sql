-- Verificação somente de leitura para executar após a migration 004 no Supabase.
-- Esperado: RLS ativa; anon/authenticated sem privilégio; service_role com operações mínimas.
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       has_table_privilege('anon', c.oid, 'select') as anon_can_select,
       has_table_privilege('anon', c.oid, 'insert') as anon_can_insert,
       has_table_privilege('anon', c.oid, 'update') as anon_can_update,
       has_table_privilege('anon', c.oid, 'delete') as anon_can_delete,
       has_table_privilege('authenticated', c.oid, 'select') as authenticated_can_select,
       has_table_privilege('authenticated', c.oid, 'insert') as authenticated_can_insert,
       has_table_privilege('authenticated', c.oid, 'update') as authenticated_can_update,
       has_table_privilege('authenticated', c.oid, 'delete') as authenticated_can_delete,
       has_table_privilege('service_role', c.oid, 'select') as service_role_can_select,
       has_table_privilege('service_role', c.oid, 'insert') as service_role_can_insert,
       has_table_privilege('service_role', c.oid, 'update') as service_role_can_update,
       has_table_privilege('service_role', c.oid, 'delete') as service_role_has_delete
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('collection_runs', 'source_snapshots')
order by c.relname;

select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('collection_runs', 'source_snapshots');

-- Aceite: duas linhas na consulta acima, com rls_enabled = true, todos os
-- campos anon/authenticated = false, os campos service_role de select/insert/update
-- = true e service_role_has_delete = false.
-- A segunda consulta deve retornar zero linhas: não há policy para usuários finais.
