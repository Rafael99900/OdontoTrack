-- OT-12: arquivo privado e imutável de documentos oficiais já verificados.
-- O coletor usa service_role; nenhuma política concede leitura ao cliente.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'official-documents',
  'official-documents',
  false,
  26214400,
  array['application/pdf']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.notice_versions
  add column if not exists document_storage_bucket text,
  add column if not exists document_storage_path text,
  add column if not exists document_content_type text,
  add column if not exists document_byte_length integer;

alter table public.notice_versions
  add constraint notice_versions_document_storage_pair_check
  check (
    (document_storage_bucket is null and document_storage_path is null)
    or
    (document_storage_bucket = 'official-documents' and document_storage_path is not null)
  );

alter table public.notice_versions
  add constraint notice_versions_document_content_type_check
  check (document_content_type is null or document_content_type = 'application/pdf');

alter table public.notice_versions
  add constraint notice_versions_document_byte_length_check
  check (document_byte_length is null or document_byte_length > 0);

comment on column public.notice_versions.document_storage_path is
  'Caminho privado no bucket official-documents. A URL pública nunca é armazenada.';
