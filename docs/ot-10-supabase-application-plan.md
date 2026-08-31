# Plano de aplicação da migration OT-10 no Supabase

## Objetivo e limite

Aplicar `supabase/migrations/002_official_notice_traceability.sql` em um projeto Supabase existente para criar a base rastreável de fontes, editais, versões, cargos, evidências e fatos críticos. Este plano não cria projeto, bucket, usuário, política RLS nem executa comandos contra a nuvem. Essas ações exigem acesso explícito ao projeto Supabase correto.

## Pré-requisitos externos

1. Nome e `project-ref` do projeto Supabase de destino, confirmados pelo responsável técnico.
2. Acesso de administrador ao projeto e credenciais do Supabase CLI ou acesso ao SQL Editor.
3. Backup lógico/restauração testável do banco de destino, ou ponto de recuperação confirmado antes da alteração.
4. Janela de manutenção aprovada para produção. A migration é curta, mas cria estruturas de schema e índices.
5. Confirmação de que a migration `002` não foi aplicada por outro fluxo. Não há migration `001` neste repositório, portanto o histórico do ambiente precisa ser verificado em vez de presumido.

## Ordem de aplicação

### 1. Escolher o ambiente e congelar o artefato

- Aplicar primeiro em um projeto Supabase de desenvolvimento ou Preview vazio/descartável.
- Conferir o hash do arquivo `002_official_notice_traceability.sql` que será aplicado e registrar data, ambiente e executor no card OT-10.
- Nunca usar `supabase/seed/ot_10_traceability_seed.sql` em Preview com dados compartilhados ou Produção. Ele cria registros sintéticos com UUIDs fixos.

### 2. Executar pré-checagens no destino

No SQL Editor do destino, rodar somente leitura:

```sql
select current_database(), current_user, now();

select to_regtype('public.editorial_status') as editorial_status_type,
       to_regclass('public.sources') as sources_table,
       to_regclass('public.notices') as notices_table,
       to_regclass('public.notice_versions') as notice_versions_table,
       to_regclass('public.positions') as positions_table,
       to_regclass('public.evidence') as evidence_table,
       to_regclass('public.notice_version_facts') as notice_version_facts_table;
```

**Critério para prosseguir:** a identidade retornada é a do ambiente pretendido e todos os objetos OT-10 acima estão nulos. Se algum existir, interromper. Comparar o schema existente com a migration antes de qualquer reaplicação. A migration não é idempotente e pode falhar em objetos parcialmente criados.

Pelo Supabase CLI, antes de aplicar, também inspecionar o histórico de migrations do projeto vinculado. O comando exato pode variar pela versão instalada; o requisito é que o histórico mostre se `002_official_notice_traceability` já foi aplicado. Não usar comandos de reparo do histórico sem aprovação explícita.

### 3. Validar em ambiente descartável

1. Aplicar a migration pelo fluxo versionado aprovado, preferencialmente `supabase db push` após vincular **somente** o projeto de desenvolvimento/Preview.
2. Rodar `supabase/tests/ot_10_schema_verify.sql`.
3. Em banco vazio e descartável, rodar na ordem: migration, `seed/ot_10_traceability_seed.sql` e `tests/ot_10_traceability_verify.sql`.
4. Confirmar as duas asserções: evidências críticas versionadas e preservação de duas versões do edital.
5. Descartar ou limpar o ambiente de teste. Não promover dados sintéticos.

### 4. Aplicar em Produção

1. Repetir as pré-checagens imediatamente antes da janela.
2. Confirmar backup/ponto de recuperação e que não há processo de coleta ou edição escrevendo nas tabelas alvo.
3. Aplicar exclusivamente `002_official_notice_traceability.sql` pela migration history do Supabase CLI ou pelo SQL Editor, preservando o arquivo sem alterações.
4. Executar apenas `supabase/tests/ot_10_schema_verify.sql` no banco produtivo. Ele é somente leitura.
5. Registrar o resultado, timestamp, executor, hash do arquivo e saída do verificador como evidência do OT-10.

## Validações pós-aplicação

- O verificador de schema retorna `ot_10_schema_ready | true`.
- Todas as relações foram criadas no schema `public` e a enumeração `editorial_status` existe.
- Existem as FKs que impedem uma versão atual ou evidência pertencerem a outro edital/versão.
- Existem os cinco índices esperados.
- Não existem dados de exemplo (`example.test` ou UUIDs de `ot_10_traceability_seed.sql`) no destino de produção.
- O Supabase CLI, quando usado, mostra a migration como aplicada no projeto correto.

## Reversibilidade e incidentes

Esta migration cria apenas novos tipos, tabelas e índices; antes de OT-11 não deve haver dados de produção nessas tabelas. Ainda assim, **não executar um `DROP ... CASCADE` automaticamente**. Em Produção, a reversão preferencial é restaurar o ponto de recuperação/backup confirmado no pré-requisito.

Se houver aprovação explícita para rollback manual e for comprovado que nenhuma tabela OT-10 contém dados, a ordem conceitual é: remover `notice_version_facts`, `evidence`, `positions`, `notice_versions`, `notices`, `sources` e por último o tipo `editorial_status`. A remoção deve ocorrer somente após inspeção de dependências em `pg_depend`; ela pode afetar objetos adicionados por cards posteriores, como RLS, views, jobs ou tabelas de revisão. Por isso, após OT-11, o rollback deve ser feito por migration compensatória revisada, não por este procedimento.

## Dependências que continuam bloqueadas

- OT-01 concluído de fato: projeto Supabase, acesso, variáveis por ambiente e processo de deploy.
- OT-03: RLS, papéis de coletor/editor e auditoria. OT-10 não publica dados nem cria políticas.
- Storage/bucket privado para PDFs oficiais e permissões de leitura controladas.
- OT-11: worker de coleta, extração/OCR, persistência dos hashes e execução agendada.

## Evidências necessárias para mover OT-10 para revisão

1. Link ou export da migration aplicada no ambiente de Preview, com hash do arquivo.
2. Saída de `ot_10_schema_verify.sql` e, em ambiente descartável, de `ot_10_traceability_verify.sql`.
3. Registro de que o seed sintético não foi aplicado em Produção.
4. Confirmação do backup/ponto de recuperação e plano de rollback aprovado.
5. Diagrama/schema e revisão técnica das constraints de rastreabilidade.
