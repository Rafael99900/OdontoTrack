-- Publica somente os fatos já persistidos e vinculados às evidências oficiais
-- do edital de abertura CP 01/2025 de Mauá. Retificações continuam em sua
-- própria versão e não substituem dados do cargo sem fato/evidência revisados.

do $$
declare
  v_notice_id uuid;
  v_opening_version_id uuid;
begin
  select n.id, v.id
    into v_notice_id, v_opening_version_id
  from public.notices n
  join public.notice_versions v on v.notice_id = n.id
  where n.external_reference = 'maua-cp-01-2025-cirurgiao-dentista-20h'
    and v.version_number = 1
    and v.document_url = 'https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf'
  limit 1;

  if v_notice_id is null or v_opening_version_id is null then
    raise exception 'A versão oficial de abertura de Mauá não foi encontrada.';
  end if;

  update public.evidence
     set editorial_status = 'approved'
   where notice_version_id = v_opening_version_id
     and editorial_status = 'pending_review';

  update public.positions
     set editorial_status = 'approved'
   where notice_version_id = v_opening_version_id
     and title = 'Cirurgião Dentista 20h'
     and area = 'Odontologia'
     and editorial_status = 'pending_review';

  update public.notice_version_facts
     set editorial_status = 'approved'
   where notice_version_id = v_opening_version_id
     and fact_key in ('registration_period', 'exam_date', 'syllabus', 'vacancies', 'remuneration', 'requirements', 'workload')
     and editorial_status = 'pending_review';

  update public.notice_versions
     set editorial_status = 'approved'
   where id = v_opening_version_id
     and editorial_status = 'pending_review';

  update public.notices
     set editorial_status = 'approved',
         current_version_id = v_opening_version_id,
         updated_at = now()
   where id = v_notice_id;
end $$;
