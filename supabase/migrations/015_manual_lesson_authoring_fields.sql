-- OT-52: campos editoriais opcionais para aulas manuais. Cursos existentes
-- continuam válidos porque todos os novos campos aceitam NULL ou têm padrão.

create type public.learning_authoring_status as enum ('draft', 'in_review', 'ready');

alter table public.learning_lessons
  add column summary text check (summary is null or length(trim(summary)) <= 20000),
  add column notebook_prompt text check (notebook_prompt is null or length(trim(notebook_prompt)) <= 20000),
  add column audio_script text check (audio_script is null or length(trim(audio_script)) <= 20000),
  add column authoring_status public.learning_authoring_status not null default 'draft';

alter table public.learning_assets
  add column embed_provider text,
  add column embed_id text,
  add column source_label text check (source_label is null or length(trim(source_label)) between 2 and 200),
  add constraint learning_assets_safe_embed_check
  check (
    (embed_provider is null and embed_id is null)
    or (asset_kind = 'video' and embed_provider = 'youtube' and embed_id ~ '^[A-Za-z0-9_-]{11}$')
  );

comment on column public.learning_assets.embed_id is
  'Identificador validado do provedor. Nenhum HTML, iframe ou script de terceiro é persistido.';
