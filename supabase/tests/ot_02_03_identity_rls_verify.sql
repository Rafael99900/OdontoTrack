-- Verificação somente de leitura após a migration 006.
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       has_table_privilege('anon', c.oid, 'select') as anon_can_select,
       has_table_privilege('authenticated', c.oid, 'insert') as authenticated_can_insert,
       has_table_privilege('service_role', c.oid, 'select') as service_role_can_select,
       has_table_privilege('service_role', c.oid, 'insert') as service_role_can_insert
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'user_roles', 'audit_logs')
order by c.relname;

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'user_roles', 'audit_logs')
order by tablename, policyname;

-- Aceite estrutural:
-- * RLS ativa nas três tabelas;
-- * anon não lê nenhuma;
-- * authenticated não insere diretamente em nenhuma;
-- * service_role lê/insere no contexto server-side;
-- * policies apenas profiles_select_own, profiles_update_own e user_roles_select_own.
