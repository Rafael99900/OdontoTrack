# Revisão crítica do sistema OdontoTrack

**Data:** 07/09/2026  
**Escopo:** aplicação publicada, código em `main`, banco Supabase e fluxos que foram exercitados em produção.  
**Objetivo:** diferenciar o que já é funcional do que ainda não é seguro chamar de produto pronto.

## Conclusão executiva

O OdontoTrack deixou de ser apenas o protótipo de página única que existia anteriormente. Hoje há autenticação, catálogo protegido, edital real de Mauá com evidências e retificações, criação persistida de curso, oito aulas navegáveis, respostas de questões persistidas, player oficial do YouTube, assistente Gemini no servidor e autoria manual privada.

Ainda não é uma plataforma pronta para operar com muitos editais e alunos. O principal problema não é uma tela isolada: boa parte da solução real continua especial-casada para Mauá, enquanto a proposta do produto exige um motor genérico de editais, análise e trilhas. Há também lacunas de operação, observabilidade, uploads privados, personalização e QA em dispositivos físicos.

### Leitura de maturidade

| Dimensão | Leitura | Motivo |
| --- | --- | --- |
| Acesso e isolamento básico | Boa base | Login Google, rotas autenticadas e verificação de proprietário nos fluxos manuais. |
| Dados oficiais e confiabilidade editorial | Parcial | Mauá possui evidências e versões; a cobertura publicada ainda é pequena e o motor não é genérico. |
| Experiência de estudo | Parcial funcional | Curso, vídeo, PDF, áudio, questão e IA existem, mas faltam continuidade e personalização de verdade. |
| Autoria manual | Boa primeira versão | Concurso, matérias, aulas, recursos, questões e ciclo de status funcionam para o dono. |
| UX e responsividade | Em evolução | Há validação em viewports, mas não aceite em dispositivos físicos nem jornada de aluno polida. |
| Segurança e privacidade | Boa base, precisa endurecimento | Segredos ficam no servidor e há checagem de dono; faltam limites, auditoria operacional e teste multiusuário formal. |
| Operação | Insuficiente para escala | Cron e conectores existem; alertas, restauração comprovada e monitoramento contínuo ainda não. |

## O que está efetivamente entregue

| Fluxo | Situação verificada | Limite atual |
| --- | --- | --- |
| Login | Google e magic link estão integrados ao Supabase. | Magic link ainda depende de uma validação final de entrega consistente pelo SMTP configurado. |
| Edital oficial | O edital de Cirurgião-Dentista de Mauá expõe fatos, PDF oficial, versões e aviso de origem da evidência. | O detalhe continua acessível por uma rota específica de Mauá. |
| Retificações | A análise preserva fatos da versão que contém a evidência quando a última retificação não repete o dado. | Falta uma comparação visual de mudanças campo a campo, reutilizável para qualquer edital. |
| Curso | A trilha Mauá tem oito aulas navegáveis, PDFs, links/prompt, áudio do dispositivo, questões e progresso. | A geração ainda é específica para esse edital e não cobre uma biblioteca ampla. |
| Vídeo | Há iframe oficial do YouTube, responsivo, com atribuição e link alternativo. | O progresso é de aula, não progresso granular do vídeo; o fallback de falha do iframe não detecta todo bloqueio interno do YouTube. |
| Questões | Resposta e tentativa são persistidas pelo servidor. | Falta agendamento de revisão espaçada, painel de erros e explicação adaptativa. |
| IA Gemini | Painel global autenticado e contexto de aula/catálogo, com fontes retornadas pela API. | Não há limite de uso, histórico persistido, avaliação de resposta ou recuperação semântica dos PDFs. |
| Concurso manual | Formulário em etapas cria rascunho privado, matérias, curso, aula, recursos, questões e status de autoria. | Não há upload privado de arquivo; PDF e áudio são URLs externas. |

## Achados críticos e recomendações

### P0 — corrigir antes de chamar o produto de plataforma escalável

#### 1. Generalizar o fluxo que hoje depende de Mauá

**Evidência:** `firstRealNoticeCandidate`, `createMauaCourseForUser` e a rota `/api/cursos/maua-odontologia` ainda determinam o edital e a trilha por código.

**Risco:** cada concurso novo exige alteração de software, aumenta chance de inconsistência e impede que o catálogo seja a fonte de verdade.

**Correção:** criar rotas por identificador de edital, por exemplo `/area/editais/[noticeId]` e `/area/cursos/[courseId]`; gerar análise e trilha apenas com dados aprovados no banco, vinculando a versão específica que originou a trilha.

**Aceite:** publicar dois editais aprovados diferentes, gerar uma trilha para cada um sem mudança de código e demonstrar que cada curso mantém sua versão de origem.

#### 2. Remover a evidência fictícia de página em trilhas manuais

**Evidência:** a criação de aula manual insere `source_pages: [1]`, embora uma trilha manual possa não ter documento-fonte.

**Risco:** uma página inexistente parece evidência editorial verdadeira e compromete auditoria futura.

**Correção:** criar uma origem explícita `manual_authoring` ou permitir `source_pages` vazio nas aulas manuais. Exigir fonte real somente quando a aula declarar que deriva de edital ou PDF.

**Aceite:** uma aula criada manualmente não exibe número de página nem fonte fictícia; uma aula derivada de edital exige versão e páginas reais.

#### 3. Concluir operação verificável do coletor

**Evidência:** há cron e conectores, mas ainda não há prova contínua de ciclos, alerta acionável e restauração testada.

**Risco:** fontes podem falhar silenciosamente, repetir itens ou expor prazo desatualizado.

**Correção:** registrar métricas por fonte e execução, alertar em falha/zero resultados/anomalia, criar painel de saúde e executar um teste documentado de restauração em ambiente seguro.

**Aceite:** sete execuções diárias consecutivas sem duplicação, um alerta recebido em falha simulada e evidência de restauração de backup.

#### 4. Criar uma suíte E2E de regressão que exerça dados reais

**Evidência:** há QA navegacional e testes de viewport, mas não uma suíte de aceite contínua para os principais fluxos.

**Risco:** mudanças rápidas podem reintroduzir botões visuais sem persistência ou quebrar autorização.

**Correção:** automatizar login de ambiente de teste, edital, criação de trilha, resposta de questão, autoria manual, tentativa de acesso indevido e painel Gemini. Executar no deploy de pré-produção.

**Aceite:** a suíte bloqueia promoção quando um fluxo P0 falha e produz artefatos de captura por execução.

### P1 — próximo ciclo de produto

#### 5. Transformar o dashboard em descoberta real

O catálogo precisa de busca, filtros por município, área, escolaridade e status, ordenação por prazo/atualização, estados vazio/erro e favoritos. A página inicial autenticada deve responder “o que mudou hoje?” sem o aluno precisar procurar manualmente.

#### 6. Tornar a análise de edital uma decisão personalizada

Hoje a estimativa depende de conteúdo conhecido, mas precisa considerar disponibilidade semanal, data da prova, nível atual e matérias já estudadas. Esses parâmetros e a decisão de estudar devem persistir por usuário, com a fórmula exposta de forma simples.

#### 7. Evoluir o curso de conteúdo para jornada de aluno

Adicionar notas privadas, retomada clara, progresso por recurso, agenda de revisão, fila de erros, objetivos por aula e indicadores de conclusão. O curso manual também deve aparecer como uma seção explícita, separada dos cursos oficiais, para não confundir origem e confiança.

#### 8. Concluir a mídia com origem e robustez

Usar a API oficial do player do YouTube para identificar erro de player e manter o link de origem visível. Para PDFs e áudios enviados pelo autor, implementar bucket privado, URL assinada de curta duração, validação de MIME/tamanho, antivírus quando houver upload e registro de fonte/licença/revisão. Não rebaixar conteúdo de terceiros nem fazer download/reupload de YouTube.

#### 9. Endurecer a IA antes de ampliar uso

Adicionar limite por usuário e por minuto, teto de custo, telemetria sem conteúdo sensível, feedback de utilidade, histórico opt-in e regra para responder "não encontrei evidência" em vez de inferir fatos. Cada resposta sobre edital deve apontar fatos a uma versão/fonte, não apenas receber instrução textual no prompt.

#### 10. Corrigir a documentação de estado

`docs/system-flow-inventory.md` e `docs/frontend-mock-audit.md` descrevem uma versão anterior do produto: dizem que a IA é só da aula SUS, que vídeos e tentativas não existem e que a raiz é protótipo. A raiz já redireciona para a área autenticada e os fluxos evoluíram. Esses documentos precisam ser marcados como históricos ou atualizados para evitar decisões baseadas em informação vencida.

### P2 — evolução após estabilizar o núcleo

- Alertas por preferências de cidade, cargo e prazo.
- Comparador visual de versões e retificações, com diff por campo e impacto ao aluno.
- Importação assistida de conteúdo programático a partir de PDF, sempre em rascunho e com revisão humana.
- Perfil de estudo, metas semanais e calendário.
- Indicadores editoriais de qualidade de vídeo, PDF, questão e fonte.
- Métricas de aprendizado agregadas, com consentimento e sem usar respostas sensíveis como treinamento.

## Melhorias de UX e responsividade

1. **Informar a origem em cada camada.** Etiquetas claras: “oficial”, “manual privado”, “em revisão” e “publicado”. Isso evita que uma trilha criada pelo usuário pareça um curso editorial do OdontoTrack.
2. **Separar navegação por intenção.** “Oportunidades”, “Minhas trilhas”, “Criar manualmente” e “Revisão editorial” devem ser destinos distintos. Hoje o curso oficial e o criador manual coexistem sem uma hierarquia suficientemente explícita.
3. **Reforçar continuidade.** Depois de criar uma trilha, levar diretamente à primeira aula e explicar o próximo passo. Depois de responder uma questão, mostrar resultado, explicação e ação seguinte.
4. **Tratar carregamento e indisponibilidade.** Toda leitura do banco, player, IA e PDF precisa de esqueleto, mensagem recuperável e alternativa de link.
5. **Validar dispositivos reais.** Simulação de viewport não substitui Galaxy Tab S6 Lite, iPhone e Samsung atual. O aceite deve cobrir retrato/paisagem, zoom 200%, teclado, leitor de tela e rede móvel lenta.

## Riscos técnicos que merecem decisão explícita

| Risco | Decisão recomendada |
| --- | --- |
| Publicar poucos editais com aparência de cobertura ampla | Exibir contagem, data de atualização e escopo de cobertura de forma honesta. |
| Conteúdo de vídeo muda ou fica indisponível | Revisão periódica, data de checagem, link externo de contingência e status do ativo. |
| Resposta plausível, porém incorreta, da IA | Citações estruturadas, recusa sem evidência, limite de escopo e botão de reportar problema. |
| Curso manual mistura-se ao oficial | Selo visual e políticas distintas de origem, privacidade e publicação. |
| Crescimento de custo do Gemini | Rate limit, quotas por usuário, cache de contexto e monitoramento de consumo. |
| Dependência de um único administrador | Procedimento de backup, conta de recuperação, runbook e segredo fora do repositório. |

## Ordem de implementação recomendada

1. Corrigir a semântica de evidência manual e documentar o estado real.
2. Generalizar edital, análise e geração de trilha por identificador persistido.
3. Construir dashboard de oportunidades e decisão personalizada de horas.
4. Implantar uploads privados, notas, revisão espaçada e progresso detalhado.
5. Instrumentar cron, alertas, backup/restauração e a suíte E2E.
6. Finalizar validação em dispositivos físicos e acessibilidade assistiva.

## Critério honesto para uma próxima liberação pública

O produto só deve ser chamado de pronto para uso contínuo quando os fluxos oficiais forem genéricos, os dados publicados forem sempre versionados e aprovados, a autoria manual não fabricar evidência, a operação tiver alerta/restauração comprovados e o aluno conseguir completar uma jornada inteira em celular, tablet e desktop sem depender de texto fixo ou intervenção técnica.
