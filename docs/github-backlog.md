# Matriz INVEST e aceite do Product Backlog

Esta é a fonte de refinamento do GitHub Project. Protótipos, mocks e dados demonstrativos não podem ser considerados entrega.

**Definição de pronto comum:** código revisado e integrado; testes relevantes aprovados; estados de erro/vazio/permissão cobertos; documentação atualizada; sem bloqueio crítico; evidência de aceite anexada ao card.

> Status e evidências verificadas em 31/08/2026 estão no [quadro executivo](execution-board.md). Este arquivo mantém o refinamento INVEST de cada história; o GitHub Issue correspondente mantém o histórico de execução.

| Épico | Resultado | Cards |
|---|---|---|
| Fundação e autenticação | Dados privados e persistentes | OT-01 a OT-03 |
| Inteligência de editais | Editais oficiais, versionados e revisáveis | OT-10 a OT-13 |
| Análise e decisão | Descoberta e decisão explicável | OT-20 a OT-23 |
| Trilha de aprendizagem | Capítulos completos e progresso real | OT-30 a OT-34 |
| Conteúdo, IA e qualidade | Conteúdo licenciado, IA segura e inclusão | OT-40 a OT-43 |
| Operação e confiabilidade | Jobs observáveis, recuperação e QA de produção | OT-15 |

## Fundação e autenticação

| Card | Pri. | Dependências | História e valor | Critério de aceite em Gherkin | Evidência esperada |
|---|---:|---|---|---|---|
| OT-01 Configurar Vercel e Supabase | P0 | Nenhuma | Como equipe, quero configurar ambientes para operar base segura e reproduzível. Viabiliza dados, autenticação e deploy. | **Dado** credenciais configuradas, **quando** o deploy de teste roda, **então** a aplicação conecta ao ambiente certo sem expor segredos. | Links dos projetos, variáveis documentadas, deploy e log saudável. |
| OT-02 Autenticação e perfil | P0 | OT-01 | Como aluno, quero entrar por e-mail e salvar perfil para retomar uma experiência personalizada. | **Dado** e-mail válido, **quando** concluo acesso e salvo preferências, **então** elas persistem ao retornar. | Teste de acesso, captura e registro persistido. |
| OT-03 RLS e auditoria | P0 | OT-01, OT-02 | Como aluno, quero dados privados para estudar com segurança. Protege dados pessoais. | **Dado** dois alunos, **quando** um consulta dados do outro, **então** RLS nega acesso. | Migration, políticas, teste com dois usuários e auditoria. |

## Inteligência de editais

| Card | Pri. | Dependências | História e valor | Critério de aceite em Gherkin | Evidência esperada |
|---|---:|---|---|---|---|
| OT-10 Modelar fontes, editais e versões | P0 | OT-01 | Como editor, quero modelar fonte, edital, versão e evidência para publicar fatos auditáveis. É a base de confiança. | **Dado** um edital, **quando** uma versão é gravada, **então** cada campo crítico aponta para evidência e versão. | Diagrama, migrations, seed e testes de integridade. |
| OT-11 Coletar PMSP e DOC | P0 | OT-10 | Como editor, quero coletar PMSP e DOC para encontrar oportunidades. Cria cobertura oficial diária. | **Dada** fonte ativa, **quando** rotina diária executa, **então** URL, hash, captura e resultado ficam registrados. | Código, agenda, log real e arquivo armazenado. |
| OT-12 Detectar retificações | P0 | OT-10, OT-11 | Como candidato, quero identificar retificações para decidir com a versão vigente. Evita prazo desatualizado. | **Dadas** capturas diferentes, **quando** campo crítico muda, **então** nova versão e fila de revisão são criadas. | Diff, teste com duas versões e fila de revisão. |
| OT-13 Painel de revisão editorial | P0 | OT-10, OT-11 | Como editor, quero aprovar evidências antes de publicar para impedir dados incorretos. | **Dado** campo pendente, **quando** o aprovo com evidência, **então** só campo aprovado torna-se público. | Demonstração, teste de permissão e histórico editorial. |

## Análise e decisão

| Card | Pri. | Dependências | História e valor | Critério de aceite em Gherkin | Evidência esperada |
|---|---:|---|---|---|---|
| OT-20 Dashboard de atualizações | P0 | OT-10, OT-13 | Como candidato, quero filtrar atualizações para encontrar concursos compatíveis. Entrega descoberta confiável. | **Dados** editais publicados, **quando** filtro município, escolaridade e área, **então** vejo resultados compatíveis e atualizados. | E2E com dados aprovados, estados vazio e erro. |
| OT-21 Análise verificável do edital | P0 | OT-10, OT-13 | Como candidato, quero análise do edital para entender requisitos e prazos. Traz rastreabilidade prática. | **Dado** edital publicado, **quando** o abro, **então** vejo fatos críticos, PDF, fonte, versão e evidências. | Página testada e links válidos para fonte/PDF. |
| OT-22 Estimar carga de estudo | P0 | OT-02, OT-10 | Como candidato, quero calcular esforço com minhas horas para decidir se estudarei. | **Dado** conteúdo e disponibilidade, **quando** altero horas, **então** estimativa recalcula e explica fatores. | Teste unitário, entradas reproduzíveis e captura. |
| OT-23 Criar trilha por edital | P0 | OT-21, OT-22, OT-30 | Como candidato, quero criar trilha por edital para estudar o conteúdo exigido. | **Dado** edital analisado, **quando** confirmo a decisão, **então** trilha é criada vinculada à versão do edital. | Registro persistido, E2E e evidência do vínculo. |

## Trilha de aprendizagem

| Card | Pri. | Dependências | História e valor | Critério de aceite em Gherkin | Evidência esperada |
|---|---:|---|---|---|---|
| OT-30 Modelar trilhas, módulos e progresso | P0 | OT-01, OT-10 | Como aluno, quero uma trilha ordenada para acompanhar minha jornada. Estrutura reutilizável e mensurável. | **Dada** uma trilha, **quando** adiciono capítulos, **então** ordem e progresso persistem por aluno. | Schema, migrations, testes de isolamento e seed. |
| OT-31 Experiência responsiva da trilha | P0 | OT-30 | Como aluno, quero navegar no tablet e celular para estudar onde estiver. | **Dada** tela alvo, **quando** abro a trilha, **então** leitura e ações permanecem acessíveis sem rolagem horizontal. | Capturas e E2E nos viewports definidos. |
| OT-32 Capítulo de estudo | P0 | OT-30, OT-40 | Como aluno, quero vídeo, resumo, PDF, áudio e notas em um capítulo para aprender sem dispersão. | **Dado** capítulo publicado, **quando** o abro, **então** recursos mostram origem, estado e alternativa quando ausentes. | E2E, conteúdo aprovado, links e captura responsiva. |
| OT-33 Prompt para NotebookLM | P0 | OT-32 | Como aluno, quero copiar prompt contextualizado para aprofundar no NotebookLM. | **Dado** capítulo, **quando** copio prompt, **então** inclui cargo, tema e instrução para usar apenas fontes adicionadas. | Teste de cópia e texto capturado. |
| OT-34 Questões e revisões | P0 | OT-30, OT-40 | Como aluno, quero responder e revisar erros para consolidar matéria. | **Dada** questão aprovada, **quando** respondo, **então** vejo correção, explicação e revisão agendada. | Tentativa persistida, teste de regra e captura. |

## Conteúdo, IA e qualidade

| Card | Pri. | Dependências | História e valor | Critério de aceite em Gherkin | Evidência esperada |
|---|---:|---|---|---|---|
| OT-40 Governança de conteúdo | P0 | OT-01 | Como editor, quero registrar licença e revisão para publicar conteúdo legítimo. | **Dado** um ativo, **quando** não possui licença ou revisão válida, **então** não pode ser publicado. | Modelo de dados, bloqueio e auditoria. |
| OT-41 IA factual com citações | P0 | OT-10, OT-13 | Como candidato, quero respostas com fontes para verificar fatos do edital. | **Dada** pergunta factual, **quando** não há evidência, **então** IA declara limitação sem inventar resposta. | Testes com/sem fonte e citações. |
| OT-42 IA pedagógica aprovada | P1 | OT-32, OT-40 | Como aluno, quero explicações de material aprovado para tirar dúvidas da aula. | **Dado** material aprovado, **quando** pergunto sobre ele, **então** IA responde no escopo pedagógico e separa fatos de edital. | Testes de escopo, log de contexto e revisão docente. |
| OT-43 Acessibilidade e responsividade | P0 | OT-20 a OT-42 | Como aluno, quero usar teclado, leitor de tela e celular sem barreiras. | **Dada** jornada P0, **quando** uso teclado/leitor e viewports alvo, **então** concluo tarefa com contraste e rótulos adequados. | Relatório de auditoria, teste de teclado e capturas. |

## Governança de status

- `Todo`: card refinado, sem implementação iniciada.
- `In Progress`: branch, commit ou execução verificável associada.
- `Done`: definição de pronto e evidência esperada atendidas.
- `Em validação`: implementação ou configuração existe, mas falta comprovação independente do aceite. Não equivale a `Done`.
- `Bloqueado`: há uma dependência externa concreta; o card deve informar dono, impacto e alternativa. Ausência de teste não é bloqueio, é trabalho pendente.

## Rastreabilidade da execução atual

| Objetivo do produto | Cards | Situação honesta | Evidência local | Próxima ação |
|---|---|---|---|---|
| Primeiro edital real | OT-12, OT-13 | Em andamento | `docs/first-real-notice-review.md`, `workers/collector/maua-official-document.mjs`, `scripts/test-maua-official-document.mjs` | Concluir decisão editorial persistida |
| Coleta diária SP e Grande ABC | OT-11, OT-14 | Em andamento | `workers/collector/grande-abc-sources.mjs`, `vercel.json`, `scripts/test-grande-abc-collector.mjs` | Validar contratos e cobertura dos sete municípios |
| Revisão editorial | OT-13 | Em andamento | `src/app/area/revisoes/page.tsx`, `scripts/test-editorial-review-queue.mjs` | Aplicar decisão de editor com auditoria |
| Curso e trilha completos | OT-30, OT-32, OT-34, OT-40 | Em andamento | `supabase/migrations/008_editorial_learning_pipeline.sql`, `docs/learning-production-pipeline.md` | Gerar primeira trilha a partir de versão aprovada |
| Acesso por e-mail/Google | OT-02 | Em validação | `src/features/auth`, `src/app/auth/callback/route.ts`, `scripts/test-auth-contract.mjs` | Confirmar o fluxo principal em produção sem depender de link expirado |
| Dashboard e análise | OT-20, OT-21, OT-22 | A iniciar | `docs/product-requirements.md` | Conectar telas a dados aprovados |
| IA com fonte | OT-41, OT-42 | A iniciar | `src/lib/ai/gemini.ts`, `docs/ai-and-official-sources.md` | Implementar recuperação e citações server-side |
| Acessibilidade e dispositivos | OT-31, OT-43 | A iniciar | `src/lib/qa/selectors.ts` | Criar E2E e auditoria nos dispositivos-alvo |
| Operação e QA | OT-15 | A iniciar | `scripts/test-production-readiness.mjs`, `vercel.json` | Definir alertas, backup e restauração |
