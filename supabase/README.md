# OT-10 — base rastreável de editais

Arquivos desta entrega:

- `migrations/002_official_notice_traceability.sql`: estrutura versionada.
- `seed/ot_10_traceability_seed.sql`: duas versões sintéticas de um edital.
- `tests/ot_10_traceability_verify.sql`: asserts e consultas de verificação.

## Verificação local com PostgreSQL

Com uma instância PostgreSQL vazia e `psql` instalado, execute na ordem abaixo:

```sh
psql "$DATABASE_URL" -f supabase/migrations/002_official_notice_traceability.sql
psql "$DATABASE_URL" -f supabase/seed/ot_10_traceability_seed.sql
psql "$DATABASE_URL" -f supabase/tests/ot_10_traceability_verify.sql
```

Resultado esperado das duas consultas finais:

```text
critical_facts_have_versioned_evidence | true
notice_versions_are_preserved          | true
```

## O que ainda depende do Supabase externo

- Aplicar a migration no projeto Supabase alvo.
- Configurar RLS e permissões para os papéis de coleta e revisão editorial.
- Configurar Storage para os PDFs originais; esta migration armazena URL e hash, não o arquivo.
- Integrar o coletor e o extrator para inserir snapshots, versões, fatos e evidências reais.
