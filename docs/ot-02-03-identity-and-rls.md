# OT-02/OT-03: identidade, papéis, RLS e auditoria

## Decisão de modelo

A migration `006_identity_roles_rls_audit.sql` cria um perfil para toda conta de `auth.users` e atribui somente o papel `student`. O papel `editor` é adicional, não substitui o de aluno, e só pode ser concedido/revogado por fluxo administrativo no servidor. A interface do aluno nunca recebe permissão para criar papéis ou gravar logs de auditoria.

| Objeto | Finalidade | Acesso do aluno autenticado |
| --- | --- | --- |
| `profiles` | preferências e disponibilidade de estudo | lê e atualiza apenas o próprio registro |
| `user_roles` | `student` e `editor` | lê apenas os próprios papéis; não cria/edita/remove |
| `audit_logs` | mudanças de perfil e papel, append-only | nenhum acesso direto |

O gatilho de `auth.users` cria perfil e papel `student`; a migration também cobre contas existentes. Não replicamos e-mail nem outros dados de autenticação em `profiles`.

## RLS e auditoria

- RLS fica ativa nas três tabelas. `anon` não lê nem escreve.
- `authenticated` recebe somente `SELECT`/`UPDATE` sobre `profiles` com políticas de próprio `auth.uid()`, e `SELECT` de seus próprios papéis.
- Não existe policy para `audit_logs`; as entradas são geradas por triggers com `security definer` ou inseridas pelo servidor. O aplicativo não concede `UPDATE` ou `DELETE` sobre logs.
- `is_editor()` é uma função de consulta para policies futuras. Ela não concede acesso por si só e não permite alteração de papéis.
- `service_role` é server-only e usada em rotas administrativas. O uso dela deve ser registrado; para privilégio de banco mais estrito, criar papel administrativo dedicado em etapa posterior.

## Aplicação segura

1. Aplicar primeiro em Preview após as migrations 002–005. A migration depende de `auth.users` já existente no Supabase.
2. Rodar `supabase/tests/ot_02_03_identity_rls_verify.sql` com administrador e registrar saída sanitizada.
3. Criar duas contas de teste pelo fluxo normal de Auth. Confirmar que cada uma recebeu perfil e papel `student`.
4. Com a sessão da conta A, consultar/atualizar seu perfil: deve funcionar. Tentar consultar/alterar o perfil B: deve retornar zero linhas ou negação, conforme cliente/API.
5. Como A, tentar `INSERT`, `UPDATE` ou `DELETE` em `user_roles` e qualquer operação em `audit_logs`: deve ser negado.
6. Pelo fluxo administrativo server-only, conceder `editor` a uma conta de Preview. A conta consegue ler o próprio papel, mas não atribuí-lo a outra pessoa. Confirmar a entrada de auditoria.
7. Só após esses testes, aplicar em Produção. Não criar editor por SQL ad hoc fora do fluxo administrativo aprovado.

## Gherkin de aceite

```gherkin
Cenário: isolamento de perfil
  Dado dois alunos autenticados A e B
  Quando A consulta ou atualiza dados de B
  Então o acesso é negado e nenhum dado de B é alterado

Cenário: papel editorial protegido
  Dado um aluno autenticado sem papel editor
  Quando tenta conceder um papel ou escrever no log de auditoria
  Então a operação é negada

Cenário: administração no servidor
  Dado um administrador usando credencial server-only
  Quando concede o papel editor a um usuário de Preview
  Então a mudança é persistida e gera uma entrada append-only em audit_logs
```

## Limites e riscos

- RLS não protege dados acessados com `service_role`; essa chave não pode chegar ao navegador ou a jobs não confiáveis.
- A migration não cria uma conta editor inicial. A identidade dessa pessoa e o procedimento de concessão precisam de autorização explícita.
- `audit_logs` registra mudanças dessas três estruturas, não substitui auditoria de todos os domínios de edital/conteúdo. OT-13 deve usar o mesmo padrão para aprovações editoriais.
- Exclusão de um usuário remove perfil e papéis; os logs preservam o evento com `actor_user_id` nulo quando o usuário Auth for removido.
