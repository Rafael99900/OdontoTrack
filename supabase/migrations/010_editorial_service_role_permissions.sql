-- Permissões exclusivas do processo servidor para persistir editais oficiais.
-- Usuários autenticados continuam restritos às políticas RLS já existentes.
grant select, insert, update on table
  public.sources,
  public.notices,
  public.notice_versions,
  public.positions,
  public.evidence,
  public.notice_version_facts
to service_role;

grant usage, select on all sequences in schema public to service_role;
