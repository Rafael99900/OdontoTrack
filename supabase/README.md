# OT-10 — base rastreável de editais

Arquivos desta entrega:

- `migrations/002_official_notice_traceability.sql`: estrutura versionada.
- `seed/ot_10_traceability_seed.sql`: duas versões sintéticas de um edital.
- `tests/ot_10_traceability_verify.sql`: asserts e consultas de verificação.
- `tests/ot_10_schema_verify.sql`: verificação somente de leitura para um ambiente já migrado.
- `migrations/004_collection_audit_access_control.sql`: RLS e grants mínimos para os registros operacionais de OT-11.
- `tests/ot_11_collection_access_verify.sql`: verificação somente de leitura do acesso de OT-11.
- `migrations/005_notice_version_review_queue.sql`: vínculo de snapshot, diff de versão e fila interna de revisão de OT-12.
- `tests/ot_12_review_queue_schema_verify.sql`: verificação de schema e acesso da fila OT-12.
- `migrations/006_identity_roles_rls_audit.sql`: perfis, papéis estudante/editor, RLS e auditoria mínima de OT-02/OT-03.
- `tests/ot_02_03_identity_rls_verify.sql`: verificação estrutural das políticas de identidade.

Antes de conectar ao Supabase existente, siga o [plano de aplicação OT-10](../docs/ot-10-supabase-application-plan.md). Ele separa a validação com dados sintéticos da aplicação segura em Produção.

Para `collection_runs` e `source_snapshots`, siga também o [controle de acesso OT-11](../docs/ot-11-collection-access-control.md). A migration 004 deve ser aplicada após a 003.

A migration 005 depende das migrations 002, 003 e 004. O fluxo de comparação e a classificação de retificação estão em [OT-12: comparação e revisão](../docs/ot-12-change-detection-and-review.md).

A migration 006 depende do Supabase Auth (`auth.users`) e deve ser validada com [identidade, RLS e auditoria](../docs/ot-02-03-identity-and-rls.md) antes de Produção.

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

Sem PostgreSQL, é possível validar a estrutura e os asserts esperados sem
rede, banco, credenciais ou variáveis de ambiente:

```sh
npm run validate:ot-10
```

Isso não substitui a execução SQL: valida que os contratos exigidos existem
nos três arquivos da entrega.

## O que ainda depende do Supabase externo

- Aplicar a migration no projeto Supabase alvo.
- Configurar RLS e permissões para os papéis de coleta e revisão editorial.
- Configurar Storage para os PDFs originais; esta migration armazena URL e hash, não o arquivo.
- Integrar o coletor e o extrator para inserir snapshots, versões, fatos e evidências reais.
- Configurar `SUPABASE_URL` e `SUPABASE_ANON_KEY` no ambiente de servidor para
  que `GET /api/editais` consulte apenas editais publicados. Sem elas, a rota
  responde `503` com o código `CATALOG_NOT_CONFIGURED`, sem tentar conexão.
