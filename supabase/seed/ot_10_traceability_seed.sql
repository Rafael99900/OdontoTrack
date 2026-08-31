-- Executar somente depois de 002_official_notice_traceability.sql.
-- Dados sintéticos: não representam um concurso real.
begin;

insert into public.sources (id, name, organization_name, canonical_url, source_kind)
values ('00000000-0000-4000-8000-000000000001', 'Diário oficial de exemplo', 'Município de teste', 'https://example.test/diario', 'official_gazette');

insert into public.notices (id, source_id, external_reference, canonical_url, municipality, state_code, organization_name, title, editorial_status, first_captured_at, last_captured_at)
values ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'EDITAL-TESTE-01', 'https://example.test/editais/01', 'Santo André', 'SP', 'Prefeitura de teste', 'Cirurgião-Dentista', 'approved', '2026-08-30 12:00:00+00', '2026-08-31 12:00:00+00');

insert into public.notice_versions (id, notice_id, version_number, source_url, document_url, content_hash, captured_at, editorial_status, change_summary)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000010', 1, 'https://example.test/editais/01', 'https://example.test/editais/01-v1.pdf', repeat('a', 64), '2026-08-30 12:00:00+00', 'superseded', 'Publicação inicial'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000010', 2, 'https://example.test/editais/01', 'https://example.test/editais/01-v2.pdf', repeat('b', 64), '2026-08-31 12:00:00+00', 'published', 'Retificação da data de prova');

update public.notices set current_version_id = '00000000-0000-4000-8000-000000000102' where id = '00000000-0000-4000-8000-000000000010';

insert into public.positions (id, notice_version_id, title, education_level, area, vacancies, editorial_status)
values ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000102', 'Cirurgião-Dentista', 'higher', 'odontologia', 4, 'published');

insert into public.evidence (id, notice_version_id, source_url, content_hash, page_number, excerpt, captured_at, extraction_method, editorial_status)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000101', 'https://example.test/editais/01-v1.pdf', repeat('a', 64), 3, 'A prova objetiva será realizada em 20 de outubro de 2026.', '2026-08-30 12:00:00+00', 'pdf_text', 'approved'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000102', 'https://example.test/editais/01-v2.pdf', repeat('b', 64), 3, 'A prova objetiva será realizada em 27 de outubro de 2026.', '2026-08-31 12:00:00+00', 'pdf_text', 'approved');

insert into public.notice_version_facts (notice_version_id, position_id, fact_key, fact_value, evidence_id, editorial_status)
values
  ('00000000-0000-4000-8000-000000000101', null, 'exam_date', '{"date":"2026-10-20"}', '00000000-0000-4000-8000-000000000301', 'approved'),
  ('00000000-0000-4000-8000-000000000102', null, 'exam_date', '{"date":"2026-10-27"}', '00000000-0000-4000-8000-000000000302', 'published'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000201', 'vacancies', '{"count":4}', '00000000-0000-4000-8000-000000000302', 'published');

commit;
