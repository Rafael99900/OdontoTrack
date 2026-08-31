# OT-11 — coleta manual PMSP/CLIC

O recorte inicial consulta exclusivamente a página oficial [CLIC: Concursos](https://clic.prefeitura.sp.gov.br/concursos). Ela é a fonte de índice: a coleta registra a página, URL canônica, hash, data, status HTTP, tipo e tamanho do conteúdo. Não extrai nem publica fatos de edital.

## Executar manualmente

```sh
npm run collect:pmsp -- --state work/pmsp-collection-state.json
```

O arquivo de estado é local e substitui temporariamente o banco para demonstrar o contrato de idempotência. Não deve ser commitado. A cada execução, o coletor acrescenta um `run`; se URL canônica e hash semântico forem iguais, atualiza somente `lastSeenAt` do snapshot existente. Para HTML, scripts, estilos, comentários e espaços voláteis não entram no hash semântico; o hash bruto permanece nos metadados para auditoria. Se o conteúdo significativo mudar, cria um snapshot novo com `reviewRequired: true`.

## Evidência e limites

- A migration `003_collection_runs_and_source_snapshots.sql` contém o modelo a ser aplicado no Supabase.
- O comando não grava em Supabase, Storage nem cria agendamento.
- O filtro por Odontologia/escolaridade ainda não é aplicado: a fonte de índice não fornece, de forma estruturada e verificável, fatos de um edital específico nesta etapa.
- A passagem de snapshot para `notices`/`notice_versions` depende de extrator de documentos e revisão editorial com evidência por página/trecho.

## Persistência opt-in no Supabase

O comando abaixo é separado da coleta local e exige somente variáveis de
servidor: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Nenhuma variável
`NEXT_PUBLIC_*` é usada ou aceita. Sem as duas variáveis, ele encerra com código
2 antes de iniciar a coleta ou qualquer escrita.

```sh
npm run collect:pmsp:supabase
npm run test:collector-pmsp-supabase
```

Quando configurado, cada execução insere uma linha em `collection_runs`. Um hash
novo cria `source_snapshots`; hash igual atualiza `last_seen_at` do snapshot já
existente e não cria outro. Não registre valores de chaves em logs, arquivos de
estado ou commits.
