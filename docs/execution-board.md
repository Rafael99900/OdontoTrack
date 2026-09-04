# Quadro executivo de entrega

Atualizado em 04/09/2026. Este é o registro de fonte de verdade para a execução do produto. Um item não é considerado concluído por possuir tela, mock, migration ou documentação isolada: precisa cumprir todos os critérios de aceite e apontar para evidência verificável.

## Política operacional

- Nenhuma atividade desta entrega autoriza inserir, cadastrar ou solicitar método de pagamento.
- Dados de edital só ficam públicos depois de fonte oficial, versão, evidência por página e revisão editorial.
- Chaves, tokens, senhas, e-mails de login e URLs com credenciais não são evidência e nunca entram em cards, commits ou documentação.
- A alteração local existente em `src/app/page.tsx` pertence ao usuário e não faz parte deste escopo.

## Visão dos nove objetivos

| Objetivo | Card principal | Estado auditado | Evidência já disponível | Próximo portão de aceite |
|---|---|---|---|---|
| 1. Extrair e revisar o primeiro edital real | [OT-12](https://github.com/Rafael99900/OdontoTrack/issues/11), [OT-13](https://github.com/Rafael99900/OdontoTrack/issues/33) | Em andamento | Edital Mauá 01/2025 extraído e PDF oficial arquivado | Aprovar ou rejeitar a versão em fila, com decisão e histórico persistidos |
| 2. Coleta diária e cobertura Grande ABC | [OT-14](https://github.com/Rafael99900/OdontoTrack/issues/35), [OT-11](https://github.com/Rafael99900/OdontoTrack/issues/10) | Em validação operacional | Cron Vercel diário, relatório sanitizado, falha parcial observável e 8 fontes monitoradas | Observar duas execuções reais consecutivas e validar contrato municipal de documentos para cada portal sem índice estruturado |
| 3. Interface editorial de revisão | [OT-13](https://github.com/Rafael99900/OdontoTrack/issues/33) | Em andamento | Rota de revisão e fila editorial no código | Editor aprova/rejeita fatos e documentos reais com RLS e auditoria |
| 4. Cursos, trilhas, questões, PDFs e mídia | [OT-30](https://github.com/Rafael99900/OdontoTrack/issues/16), [OT-32](https://github.com/Rafael99900/OdontoTrack/issues/18), [OT-34](https://github.com/Rafael99900/OdontoTrack/issues/22), [OT-40](https://github.com/Rafael99900/OdontoTrack/issues/24) | Em andamento | Schema editorial de aprendizagem e rascunho de curso | Gerar e publicar uma trilha completa somente a partir de edital aprovado |
| 5. SMTP próprio Resend | [OT-02](https://github.com/Rafael99900/OdontoTrack/issues/7) | Em validação | SMTP customizado e login Google disponível | Confirmar entrega e retorno de um magic link novo ou tornar Google o único caminho inicial |
| 6. Dashboard e análise verificável | [OT-20](https://github.com/Rafael99900/OdontoTrack/issues/12), [OT-21](https://github.com/Rafael99900/OdontoTrack/issues/13), [OT-22](https://github.com/Rafael99900/OdontoTrack/issues/14) | A iniciar após aprovação editorial | Protótipo e requisitos documentados | Consultar apenas dados aprovados, com filtro, versão, fonte e cálculo explicável |
| 7. Assistente de IA factual e pedagógico | [OT-41](https://github.com/Rafael99900/OdontoTrack/issues/26), [OT-42](https://github.com/Rafael99900/OdontoTrack/issues/34) | A iniciar | Adaptador Gemini no servidor e política de fontes | Responder somente com contexto aprovado, citações e recusa segura quando faltar evidência |
| 8. Experiência mobile, tablet e acessibilidade | [OT-31](https://github.com/Rafael99900/OdontoTrack/issues/17), [OT-43](https://github.com/Rafael99900/OdontoTrack/issues/28) | A iniciar | Convenção `data-cy` e protótipo responsivo | E2E e auditoria no Galaxy Tab S6 Lite, iPhones e Samsung atuais |
| 9. Operação, QA, logs, backup e monitoramento | [OT-15](https://github.com/Rafael99900/OdontoTrack/issues/36) | Em validação operacional | Health 200, cron protegido, testes de relatório/contrato e procedimento de backup/restauração | Registrar evidência de duas execuções reais, configurar alerta no painel e realizar simulação trimestral de restauração |

## Cards criados para fechar lacunas de rastreabilidade

Os cards complementares foram criados no GitHub em 01/09/2026:

- [**OT-14 Coleta diária de fontes oficiais do Grande ABC**](https://github.com/Rafael99900/OdontoTrack/issues/35): separa a cobertura regional do primeiro conector PMSP. Não rebaixa o aceite já registrado em OT-11.
- [**OT-15 Operação, observabilidade, backup e QA de produção**](https://github.com/Rafael99900/OdontoTrack/issues/36): concentra requisitos de confiabilidade que não cabem em uma história de interface.

## Critérios de aceite executivos

### Objetivo 1: primeiro edital revisado

```gherkin
Cenário: decisão editorial rastreável
  Dado o PDF oficial arquivado e uma versão candidata do edital de Mauá
  Quando um editor aprova ou rejeita a versão com justificativa
  Então a decisão, o autor, o horário e as evidências por página permanecem registrados
  E somente fatos aprovados podem alimentar o dashboard ou um curso
```

### Objetivo 2: coleta diária do ABC

```gherkin
Cenário: execução diária sem duplicação
  Dadas fontes oficiais ativas dos sete municípios do Grande ABC
  Quando o agendador diário roda
  Então cada fonte registra sucesso, ausência de mudança ou falha sanitizada
  E uma repetição com o mesmo conteúdo não cria versão duplicada
```

### Objetivo 3: revisão editorial

```gherkin
Cenário: revisão protegida por papel
  Dado um usuário sem papel editorial e uma versão pendente
  Quando ele tenta aprovar um fato
  Então a operação é negada

Cenário: aprovação de fato
  Dado um editor e uma evidência válida da mesma versão
  Quando ele aprova o fato crítico
  Então a versão vigente é atualizada atomicamente e a decisão é auditada
```

### Objetivo 4: primeira trilha completa

```gherkin
Cenário: curso gerado somente de edital aprovado
  Dado um edital aprovado com conteúdo programático evidenciado
  Quando o editor gera a trilha
  Então módulos, aulas, questões e ativos nascem como rascunho editorial
  E nenhum vídeo, PDF, áudio ou questão sem licença e revisão é publicado
```

### Objetivo 5: acesso confiável

```gherkin
Cenário: autenticação sem dependência do limite padrão
  Dado o SMTP próprio configurado ou o provedor Google habilitado
  Quando o aluno inicia o acesso
  Então ele recebe retorno claro de sucesso ou falha
  E nenhum segredo é exposto no navegador, log ou repositório
```

### Objetivo 6: decisão por edital

```gherkin
Cenário: análise filtrada e verificável
  Dado um edital publicado e aprovado
  Quando o aluno filtra por município, escolaridade e Odontologia
  Então o resultado mostra requisitos, remuneração, prova, versão, fonte e evidências
  E a estimativa de estudo explica os parâmetros usados
```

### Objetivo 7: IA com limite factual

```gherkin
Cenário: pergunta sem evidência
  Dada uma pergunta sobre um fato não coberto pelas fontes aprovadas
  Quando o assistente responde
  Então informa que não encontrou base suficiente
  E não inventa prazo, vaga, requisito ou conteúdo
```

### Objetivo 8: estudo acessível em dispositivos-alvo

```gherkin
Cenário: conclusão da aula em tablet
  Dada uma aula publicada
  Quando o aluno a usa no Galaxy Tab S6 Lite em retrato ou paisagem
  Então ele acessa conteúdo, notas e avanço sem rolagem horizontal
  E todos os controles possuem nome acessível e foco de teclado visível
```

### Objetivo 9: operação recuperável

```gherkin
Cenário: falha de coleta observável
  Dado um adaptador oficial indisponível
  Quando o job diário falha
  Então a falha sanitizada é registrada, o alerta é acionável e a última versão aprovada permanece pública

Cenário: restauração validada
  Dado um backup programado
  Quando uma restauração é simulada em ambiente seguro
  Então a equipe consegue comprovar a recuperação sem perda silenciosa de dados
```

## Ordem de execução aprovada

1. Fechar a decisão editorial do edital de Mauá e validar o acesso que será o caminho principal do usuário.
2. Garantir o conector diário do ABC com contratos por município e execução observável.
3. Publicar dashboard e análise exclusivamente sobre dados aprovados.
4. Gerar a primeira trilha editorial e os recursos de aula, mantendo conteúdo em revisão até licença, fonte e qualidade estarem validadas.
5. Encerrar IA, qualidade de dispositivos e operação antes de abrir o produto a terceiros.

## Definição de pronto comum

- Implementação integrada, sem alteração não autorizada em arquivos do usuário.
- Testes proporcionais ao risco aprovados e evidência anexada ao card.
- Estados de sucesso, vazio, erro e permissão avaliados.
- Documentação e links de rastreabilidade atualizados.
- Nenhum pagamento, plano pago ou instrumento de cobrança cadastrado.
