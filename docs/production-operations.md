# Operação de produção e QA

## Escopo

Este guia cobre a operação do OdontoTrack em Vercel e Supabase. Não armazene senhas, chaves de API, tokens de coleta ou segredos de OAuth neste repositório, em issues ou em documentos públicos.

## Verificação diária

1. Consulte `GET /api/health`. O retorno esperado é HTTP 200 com `status: "ok"`.
2. Confirme no painel Vercel que a execução diária de `/api/cron/coletar-fontes` terminou sem erro.
3. Abra a fila editorial e valide alterações, retificações e novas versões antes de publicar curso ou trilha.
4. Confirme no Supabase a conclusão de `collection_runs` e a integridade dos documentos arquivados no bucket privado.

## Incidente

Se a saúde retornar `degraded`, não exponha detalhes de configuração ao usuário. Verifique as variáveis de ambiente da produção no Vercel e os três segredos operacionais. Se a coleta falhar, preserve o histórico, registre a ocorrência na fila editorial e execute apenas a rota operacional autenticada apropriada.

## Backup e recuperação

O Supabase mantém o banco e o bucket de documentos oficiais. Antes de alterações estruturais, registre a migration no repositório e execute o teste de schema associado. Para recuperação, restaure a partir do backup disponível no projeto Supabase e reaplique as migrations versionadas, sem sobrescrever documentos oficiais sem rastreabilidade.

## QA mínimo antes de publicar

1. `npm run build`
2. `npm run test:auth-contract`
3. `npm run test:production-readiness`
4. Verificação manual em celular, tablet e desktop: login Google, área privada, revisão editorial, curso e links de fonte.

## Dados de teste

Os elementos de interface críticos devem manter atributos `data-cy`. Eles são o contrato para testes futuros com Cypress ou Playwright. Não teste fluxos de login com credenciais de terceiros e não inclua dados pessoais em fixtures versionadas.
