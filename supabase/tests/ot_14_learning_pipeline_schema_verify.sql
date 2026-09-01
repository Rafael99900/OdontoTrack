-- Executar após 008_editorial_learning_pipeline.sql no SQL Editor do Supabase.

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('learning_courses', 'learning_modules', 'learning_lessons', 'learning_assets', 'learning_questions')
order by table_name;

select typname
from pg_type
where typnamespace = 'public'::regnamespace
  and typname in ('learning_course_status', 'learning_asset_kind', 'learning_asset_status')
order by typname;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename like 'learning_%'
order by tablename;
