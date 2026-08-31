-- Verificação somente de leitura para executar após a migration OT-10.
-- Não insere, atualiza nem remove dados de produção.
do $$
declare
  required_table text;
  required_index text;
begin
  foreach required_table in array array[
    'sources', 'notices', 'notice_versions', 'positions', 'evidence', 'notice_version_facts'
  ] loop
    if to_regclass('public.' || required_table) is null then
      raise exception 'Tabela OT-10 ausente: public.%', required_table;
    end if;
  end loop;

  if to_regtype('public.editorial_status') is null then
    raise exception 'Tipo OT-10 ausente: public.editorial_status';
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'notices_current_version_belongs_to_notice_fk'
  ) then
    raise exception 'Constraint de pertencimento da versão atual ausente';
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'notice_version_facts_notice_version_id_evidence_id_fkey'
  ) then
    raise exception 'Constraint de evidência versionada ausente';
  end if;

  foreach required_index in array array[
    'notices_municipality_status_idx', 'notice_versions_notice_captured_idx',
    'positions_version_area_idx', 'evidence_version_idx', 'notice_facts_version_key_idx'
  ] loop
    if to_regclass('public.' || required_index) is null then
      raise exception 'Índice OT-10 ausente: public.%', required_index;
    end if;
  end loop;
end $$;

select 'ot_10_schema_ready' as check_name, true as approved;
