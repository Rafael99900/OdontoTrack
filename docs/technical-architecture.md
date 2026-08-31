# Arquitetura técnica

## Stack inicial

- Next.js + TypeScript hospedado na Vercel.
- Supabase: Auth, PostgreSQL, Storage e funções agendadas/Edge Functions.
- Worker Python separado apenas para coleta, OCR e extração de PDFs quando a Vercel não for suficiente.
- YouTube por incorporação autorizada/API oficial; provedor de IA intercambiável no servidor.

## Domínios

`sources`, `source_snapshots`, `notices`, `notice_versions`, `positions`, `syllabus_items`, `evidence`, `learning_paths`, `path_modules`, `lessons`, `assets`, `questions`, `attempts`, `student_lesson_progress`, `content_rights` e `audit_logs`.

## Fluxo de versão

1. Job diário lê fontes cadastradas.
2. Arquivo ou página recebe hash, URL canônica e data de captura.
3. Um hash diferente cria nova versão e compara campos críticos.
4. Mudanças de data, inscrição, vagas, remuneração ou prova entram em revisão antes do alerta.

## Segurança

- Chaves somente em variáveis de ambiente da Vercel/Supabase.
- O contrato de variáveis, os ambientes e o comportamento seguro para configuração ausente estão em [Configuração de ambientes](environment-configuration.md).
- Row Level Security: cada aluno vê apenas conta, progresso e anotações próprios.
- PDFs oficiais preservam URL e versão; dados pessoais de listas de classificados não são indexados.
