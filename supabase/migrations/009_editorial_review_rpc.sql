-- OT-15: revisão editorial autenticada sem expor service_role no navegador.
-- A aprovação torna a versão apta à próxima etapa, mas não a publica no catálogo.

create or replace function public.editorial_review_queue_items()
returns table (
  queue_id uuid,
  notice_id uuid,
  status public.notice_review_status,
  classification public.notice_change_classification,
  review_reason text,
  enqueued_at timestamptz,
  candidate_version_id uuid,
  candidate_version_number integer,
  candidate_document_url text,
  changes jsonb
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    q.id,
    q.notice_id,
    q.review_status,
    q.classification,
    q.review_reason,
    q.enqueued_at,
    v.id,
    v.version_number,
    v.document_url,
    coalesce(jsonb_agg(jsonb_build_object(
      'key', c.change_key,
      'path', c.change_path,
      'previousValue', c.previous_value,
      'candidateValue', c.candidate_value
    ) order by c.created_at) filter (where c.id is not null), '[]'::jsonb)
  from public.notice_review_queue q
  join public.notice_versions v on v.id = q.candidate_notice_version_id
  left join public.notice_version_changes c on c.candidate_notice_version_id = v.id
  where public.is_editor() and q.review_status in ('pending', 'in_review')
  group by q.id, v.id;
$$;

create or replace function public.editorial_transition_review_queue(
  p_queue_id uuid,
  p_decision public.notice_review_status,
  p_review_note text default null
)
returns public.notice_review_queue
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  item public.notice_review_queue;
  next_item public.notice_review_queue;
begin
  if not public.is_editor() then
    raise exception 'Apenas editores podem decidir a fila editorial' using errcode = '42501';
  end if;
  if p_decision not in ('in_review', 'approved', 'rejected') then
    raise exception 'Decisão editorial inválida' using errcode = '22023';
  end if;
  select * into item from public.notice_review_queue where id = p_queue_id for update;
  if not found then raise exception 'Item de revisão não encontrado' using errcode = 'P0002'; end if;
  if item.review_status = 'pending' and p_decision <> 'in_review' then
    raise exception 'A fila precisa entrar em revisão antes da decisão final' using errcode = '22023';
  end if;
  if item.review_status = 'in_review' and p_decision not in ('approved', 'rejected') then
    raise exception 'A fila em revisão exige aprovação ou rejeição' using errcode = '22023';
  end if;
  if item.review_status not in ('pending', 'in_review') then
    raise exception 'A fila já foi decidida' using errcode = '22023';
  end if;
  if p_decision in ('approved', 'rejected') and coalesce(length(trim(p_review_note)), 0) = 0 then
    raise exception 'A nota editorial é obrigatória para a decisão final' using errcode = '22023';
  end if;

  update public.notice_review_queue
     set review_status = p_decision,
         reviewed_at = case when p_decision in ('approved', 'rejected') then now() else null end,
         reviewed_by = case when p_decision in ('approved', 'rejected') then auth.uid() else null end,
         review_note = case when p_decision in ('approved', 'rejected') then trim(p_review_note) else null end
   where id = item.id
   returning * into next_item;

  if p_decision = 'approved' then
    update public.notice_versions set editorial_status = 'approved' where id = item.candidate_notice_version_id;
    update public.notices set editorial_status = 'approved', last_captured_at = now() where id = item.notice_id;
  elsif p_decision = 'rejected' then
    update public.notice_versions set editorial_status = 'rejected' where id = item.candidate_notice_version_id;
  end if;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata)
  values (auth.uid(), 'editorial.review.' || p_decision::text, 'notice_review_queue', item.id, to_jsonb(item), to_jsonb(next_item), jsonb_build_object('notice_id', item.notice_id));
  return next_item;
end;
$$;

revoke all on function public.editorial_review_queue_items() from public, anon;
revoke all on function public.editorial_transition_review_queue(uuid, public.notice_review_status, text) from public, anon;
grant execute on function public.editorial_review_queue_items() to authenticated;
grant execute on function public.editorial_transition_review_queue(uuid, public.notice_review_status, text) to authenticated;
