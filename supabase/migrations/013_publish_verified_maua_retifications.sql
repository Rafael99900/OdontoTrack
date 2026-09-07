-- Retificações oficiais do CP 01/2025 de Mauá. Elas são documentos públicos
-- distintos, com hash imutável obtido do Diário Oficial. A cláusula de itens
-- inalterados não permite substituir fatos do cargo da abertura; por isso a
-- análise usa a versão 1 como origem dos fatos e esta versão como vigente.

with notice_row as (
  select id from public.notices
  where external_reference = 'maua-cp-01-2025-cirurgiao-dentista-20h'
), documents(version_number, publication_date, document_url, content_hash, change_summary) as (
  values
    (2, date '2025-12-29', 'https://dom.maua.sp.gov.br/public/docs/b9eabcf7d7e784a29ae07b7f9e5a1afb.pdf', '2f3a8f0cf9c0651fd5329c5ac6b25b8132d6a8491c0e11296efee32c47a2233c', 'Retificação oficial do Edital 01/2025. O documento informa que os demais itens do edital permanecem inalterados.'),
    (3, date '2026-01-14', 'https://dom.maua.sp.gov.br/public/docs/1e9b18ff0d2e67aaebb8455c2db551f1.pdf', 'c29247eb525cbcdce621ec38cb7c915a5e5894cde9b51bc2ad7a916dd11ccb40', 'Retificação nº 02 oficial do Edital 01/2025. O documento informa que os demais itens do edital permanecem inalterados.')
)
insert into public.notice_versions (notice_id, version_number, source_url, document_url, content_hash, captured_at, publication_date, editorial_status, change_summary)
select n.id, d.version_number, 'https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11', d.document_url, d.content_hash, now(), d.publication_date, 'approved', d.change_summary
from notice_row n cross join documents d
where not exists (select 1 from public.notice_versions v where v.notice_id = n.id and v.content_hash = d.content_hash);

with retification_evidence(document_url, content_hash, page_number, excerpt) as (
  values
    ('https://dom.maua.sp.gov.br/public/docs/b9eabcf7d7e784a29ae07b7f9e5a1afb.pdf', '2f3a8f0cf9c0651fd5329c5ac6b25b8132d6a8491c0e11296efee32c47a2233c', 1, 'RETIFICAÇÃO DO EDITAL DE ABERTURA - CONCURSO PÚBLICO N° 01/2025'),
    ('https://dom.maua.sp.gov.br/public/docs/b9eabcf7d7e784a29ae07b7f9e5a1afb.pdf', '2f3a8f0cf9c0651fd5329c5ac6b25b8132d6a8491c0e11296efee32c47a2233c', 4, 'Os demais itens do Edital permanecem inalterados.'),
    ('https://dom.maua.sp.gov.br/public/docs/1e9b18ff0d2e67aaebb8455c2db551f1.pdf', 'c29247eb525cbcdce621ec38cb7c915a5e5894cde9b51bc2ad7a916dd11ccb40', 1, 'RETIFICAÇÃO Nº 02 DO EDITAL DE ABERTURA - CONCURSO PÚBLICO N° 01/2025'),
    ('https://dom.maua.sp.gov.br/public/docs/1e9b18ff0d2e67aaebb8455c2db551f1.pdf', 'c29247eb525cbcdce621ec38cb7c915a5e5894cde9b51bc2ad7a916dd11ccb40', 7, 'Os demais itens do Edital permanecem inalterados.')
)
insert into public.evidence (notice_version_id, source_url, content_hash, page_number, excerpt, captured_at, extraction_method, editorial_status)
select v.id, r.document_url, r.content_hash, r.page_number, r.excerpt, now(), 'pdf_text', 'approved'
from retification_evidence r
join public.notice_versions v on v.content_hash = r.content_hash
where not exists (select 1 from public.evidence e where e.notice_version_id = v.id and e.page_number = r.page_number and e.excerpt = r.excerpt);

update public.notices n
   set current_version_id = (
     select v.id from public.notice_versions v
      where v.notice_id = n.id and v.editorial_status in ('approved', 'published')
      order by v.version_number desc limit 1
   ),
   editorial_status = 'approved',
   updated_at = now()
 where n.external_reference = 'maua-cp-01-2025-cirurgiao-dentista-20h';
