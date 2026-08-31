-- Consulta executável de verificação OT-10. Retorna duas linhas com approved = true.
do $$
begin
  if not exists (
    select 1
    from public.notice_version_facts f
    join public.evidence e on (e.notice_version_id, e.id) = (f.notice_version_id, f.evidence_id)
    where f.fact_key = 'exam_date' and e.page_number = 3 and length(e.excerpt) > 0
  ) then raise exception 'Fato crítico sem evidência, página ou trecho'; end if;

  if (select count(*) from public.notice_versions where notice_id = '00000000-0000-4000-8000-000000000010') <> 2 then
    raise exception 'A nova versão apagou ou deixou de preservar a anterior';
  end if;
end $$;

select 'critical_facts_have_versioned_evidence' as check_name,
       bool_and(e.id is not null and e.page_number is not null and length(e.excerpt) > 0) as approved
from public.notice_version_facts f
join public.evidence e on (e.notice_version_id, e.id) = (f.notice_version_id, f.evidence_id)
where f.fact_key in ('exam_date', 'vacancies');

select 'notice_versions_are_preserved' as check_name,
       count(*) = 2 as approved
from public.notice_versions
where notice_id = '00000000-0000-4000-8000-000000000010';
