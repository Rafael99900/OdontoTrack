-- OT-18: respostas de questões autorais pertencem ao aluno e à aula da sua trilha.
create table public.learning_question_attempts (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.learning_lessons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_key text not null check (length(trim(question_key)) > 0),
  selected_option_index integer not null check (selected_option_index >= 0),
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, user_id, question_key)
);

create index learning_question_attempts_user_lesson_idx on public.learning_question_attempts (user_id, lesson_id);
alter table public.learning_question_attempts enable row level security;
revoke all on public.learning_question_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.learning_question_attempts to service_role;
