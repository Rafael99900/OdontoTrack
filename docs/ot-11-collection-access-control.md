# Controle de acesso da auditoria de coleta OT-11

## Decisão

`collection_runs` e `source_snapshots` são registros operacionais, não dados de catálogo. Visitantes, alunos autenticados e a API pública não devem lê-los nem alterá-los. A migration incremental `004_collection_audit_access_control.sql` habilita RLS, revoga todos os privilégios de `public`, `anon` e `authenticated`, e concede ao papel `service_role` somente `select`, `insert` e `update` nessas duas tabelas.

Não há policy RLS para usuário final. Sem policy, mesmo uma concessão futura acidental não deve liberar linhas enquanto RLS estiver ativa. A revogação de grants adiciona uma segunda barreira.

## Credencial do coletor

No recorte atual, o coletor deve executar somente em worker/servidor com `SUPABASE_SERVICE_ROLE_KEY`, armazenada no gerenciador de segredos do ambiente. Ela nunca pode ter prefixo `NEXT_PUBLIC_`, entrar em código do navegador, logs, estado de coleta ou mensagens de erro.

O uso de `service_role` atende ao isolamento do usuário público, porém não é isolamento total dentro do banco, pois esse papel contorna RLS e pode acessar outros objetos para os quais tenha permissão. Se o requisito passar a exigir privilégio estritamente limitado no banco, criar um papel de login dedicado para o worker, com connection string exclusiva guardada no servidor e grants apenas em `sources`, `collection_runs` e `source_snapshots`. Essa mudança requer decisão de infraestrutura e não deve ser simulada com a chave anônima.

## Aplicação e validação

1. Aplicar a migration `004` primeiro em Preview após `003`.
2. Rodar `supabase/tests/ot_11_collection_access_verify.sql` com um administrador.
3. Confirmar que há duas tabelas com RLS ativa, sem políticas para usuário final; todas as permissões de `anon` e `authenticated` são falsas; `service_role` tem `select`, `insert` e `update`, mas não `delete`.
4. Em Preview, testar pela API pública com chave `anon` e por uma sessão autenticada: `GET`, `POST`, `PATCH` e `DELETE` para ambas as tabelas devem ser negados. O coletor no servidor deve conseguir inserir um run, atualizar sua conclusão e inserir/atualizar um snapshot.
5. Guardar a saída do SQL e os resultados HTTP como evidência do card. Não registrar tokens nem cabeçalhos de autorização.

## Checklist do responsável pela aplicação

- [ ] Confirmar que `003_collection_runs_and_source_snapshots.sql` aparece como aplicada no ambiente Preview antes de aplicar a `004`.
- [ ] Confirmar o projeto e ambiente no SQL Editor com `select current_database(), current_user, now();`.
- [ ] Aplicar a `004_collection_audit_access_control.sql` sem editar o conteúdo e registrar o hash do arquivo, data, ambiente e executor.
- [ ] Executar `supabase/tests/ot_11_collection_access_verify.sql`. A saída deve ter duas tabelas, RLS ativa, todos os verbos para `anon` e `authenticated` como `false`, `select`/`insert`/`update` para `service_role` como `true`, e `delete` como `false`.
- [ ] Confirmar que a segunda consulta do verificador não retorna policies. Nenhuma policy para usuário final é necessária.
- [ ] Em Preview, testar a API pública para as duas tabelas com uma chave anônima já configurada fora do terminal: leitura e cada tentativa de escrita devem retornar negação de acesso. Anotar apenas método, tabela, status HTTP e timestamp, nunca o token.
- [ ] Executar o smoke test transacional do job server-only abaixo com a credencial já injetada no ambiente do worker. Ele deve concluir e fazer rollback, sem dados permanentes.
- [ ] Repetir os mesmos checks no ambiente de Produção somente após o aceite de Preview. Não marcar OT-11 concluída até que o coletor real tenha evidência de execução e retenção.

### Smoke test transacional do coletor

Executar pelo contexto de banco que já autentica como `service_role`, apenas em Preview. O `rollback` é obrigatório:

```sql
begin;
set local role service_role;

insert into public.collection_runs (
  source_key, requested_url, started_at, run_status
) values (
  'access-control-smoke', 'https://example.invalid/collector-smoke', now(), 'started'
);

update public.collection_runs
set run_status = 'unchanged', completed_at = now(), content_hash = repeat('0', 64)
where source_key = 'access-control-smoke';

insert into public.source_snapshots (
  source_key, canonical_url, content_hash, captured_at, first_seen_at, last_seen_at, content_type, byte_length
) values (
  'access-control-smoke', 'https://example.invalid/collector-smoke', repeat('0', 64), now(), now(), now(), 'text/plain', 0
);

update public.source_snapshots
set last_seen_at = now()
where source_key = 'access-control-smoke';

rollback;
```

O teste não contém segredo. Se o executor não puder trocar para `service_role` no SQL Editor, executar o job equivalente no worker com o segredo já configurado e verificar apenas o resultado sanitizado.

## Limites e dependências

- A migration só protege as duas tabelas OT-11. A política de RLS para `sources`, `notices` e tabelas OT-10 continua sendo responsabilidade do OT-03/OT-13.
- O worker precisa de acesso de leitura à configuração da fonte. Se ele buscar `sources` diretamente pelo banco, esse acesso deve ser decidido e concedido separadamente, nunca pelo navegador.
- O banco precisa já possuir os papéis Supabase `anon`, `authenticated` e `service_role`; isso é verdadeiro para projetos Supabase padrão. Não aplicar esta migration em PostgreSQL genérico sem revisar os papéis.
