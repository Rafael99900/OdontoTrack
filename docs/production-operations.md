# Operação de produção e QA

## Escopo

Este guia cobre a operação do OdontoTrack em Vercel e Supabase. Não armazene senhas, chaves de API, tokens de coleta ou segredos de OAuth neste repositório, em issues ou em documentos públicos.

## Verificação diária

1. Consulte `GET /api/health`. O retorno esperado é HTTP 200 com `status: "ok"`.
2. Confirme no painel Vercel que a execução diária de `/api/cron/coletar-fontes`, às 11:00 UTC, terminou com HTTP 200. A rota exige o segredo de cron, não aceita parâmetros em URL e devolve somente um relatório sanitizado.
3. Registre no card operacional o `collectedAt`, os totais `changed`, `unchanged` e `failed`, e os IDs de snapshot retornados. Um HTTP 503 ou `status: "degraded"` significa que ao menos uma fonte falhou e requer investigação, mesmo que outras tenham sido coletadas.
4. Abra a fila editorial e valide alterações, retificações e novas versões antes de publicar curso ou trilha.
5. Confirme no Supabase a conclusão de `collection_runs` e a integridade dos documentos arquivados no bucket privado.

## Incidente

Se a saúde retornar `degraded`, não exponha detalhes de configuração ao usuário. Verifique as variáveis de ambiente da produção no Vercel e os três segredos operacionais. Se a coleta falhar, preserve o histórico, registre a ocorrência na fila editorial e execute apenas a rota operacional autenticada apropriada.

## Monitoramento e evidência repetida

O relatório do cron é a primeira evidência de execução: ele nunca contém token, chave, URL assinada, conteúdo de edital ou dados pessoais. O coletor persiste cada tentativa em `collection_runs`; para conteúdo já conhecido, atualiza `last_seen_at` no mesmo `source_snapshots`, preservando uma nova linha de execução. Isso permite comprovar uma execução repetida sem duplicar o snapshot.

Rotina semanal:

1. Compare duas execuções consecutivas de uma fonte estável: dois `collection_runs`, mesmo `snapshotId`, com a segunda em `unchanged`.
2. Em uma execução com mudança real, confirme novo snapshot, `review_required = true` e fila editorial antes de qualquer publicação.
3. Em erro parcial, mantenha a última versão aprovada pública, abra incidente no card OT-15 e corrija o adaptador sem apagar as linhas de falha.

## Backup e recuperação

O Supabase mantém o banco e o bucket de documentos oficiais. O nível e a retenção de backup dependem do plano contratado; não assuma retenção, PITR ou exportação automática sem confirmar no painel do projeto.

Antes de uma alteração estrutural:

1. Registre a migration e o teste de schema no repositório, confirme o ponto de recuperação/backup exibido pelo Supabase e pare apenas os jobs de escrita necessários.
2. Exporte, por canal administrativo seguro, o banco e um inventário do bucket privado com `path`, SHA-256, tamanho e data. Não baixe ou publique PDFs oficiais sem necessidade.
3. Anote no card a data do backup, ambiente, versão Git e quantidade esperada de `notices`, `notice_versions`, `evidence`, `collection_runs` e objetos do bucket. Nunca anote chaves.

### Simulação trimestral de restauração

1. Crie um projeto Supabase separado, sem dados pessoais de aluno e sem apontar a Vercel de produção para ele.
2. Restaure primeiro o schema e todas as migrations versionadas; depois importe um conjunto mínimo autorizado de registros e objetos com hash conhecido.
3. Rode os testes de schema, consulte as contagens e valide que cada versão de edital referencia o caminho privado esperado, sem URL pública ou sobrescrita de objeto.
4. Registre duração, divergências e resultado no card OT-15. Falha na simulação bloqueia mudanças destrutivas até haver novo backup validado.

## QA mínimo antes de publicar

1. `npm run build`
2. `npm run test:auth-contract`
3. `npm run test:production-readiness`
4. Verificação manual em celular, tablet e desktop: login Google, área privada, revisão editorial, curso e links de fonte.

## Dados de teste

Os elementos de interface críticos devem manter atributos `data-cy`. Eles são o contrato para testes futuros com Cypress ou Playwright. Não teste fluxos de login com credenciais de terceiros e não inclua dados pessoais em fixtures versionadas.
