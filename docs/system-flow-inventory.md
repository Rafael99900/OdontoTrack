# Levantamento funcional do OdontoTrack

Atualizado em 06/09/2026. Este documento descreve o que a aplicação publicada entrega de fato, o que é parcial e o que ainda não foi construído. Não considera uma tela existente como funcionalidade concluída sem integração, persistência e validação.

## Como acessar o que existe hoje

| Entrada | Rota | Estado atual |
| --- | --- | --- |
| Domínio público | `/` | Redireciona para `/area`; não exibe mais o protótipo demonstrativo antigo. |
| Login | `/login` | Google e magic link por e-mail. Depende da configuração do provedor de autenticação. |
| Área privada | `/area` | Entrada autenticada com links para editais, revisão editorial e cursos. É funcional, mas é uma tela inicial mínima. |
| Editais | `/area/editais` | Lista registros visíveis consultados no banco. O detalhamento completo ainda não existe para todos os editais. |
| Análise de Mauá | `/area/editais/maua` | Mostra dados do edital candidato de Mauá e um PDF oficial. Parte dos valores e da estimativa ainda é fixa no código. |
| Revisão editorial | `/area/revisoes` | Fila e ações para revisão. Precisa validação completa de papéis, persistência e auditoria em produção. |
| Cursos | `/area/cursos` | Curso de Mauá e a prévia de uma aula de SUS. É a única tela que expõe a IA Gemini ao aluno. |

## Onde está a IA Gemini

O controle visível fica no fim de `/area/cursos`, na seção **“Pergunte à IA sobre esta aula”** da aula **“Princípios, diretrizes e estrutura do SUS”**.

Fluxo atual:

1. O aluno autenticado digita uma pergunta na aula de SUS.
2. O navegador envia a pergunta para `POST /api/ia/perguntar`.
3. A API aceita somente a chave de aula `maua-sus` e monta o contexto no servidor.
4. O servidor chama Gemini Flash usando `GEMINI_API_KEY`.
5. A resposta retorna para a própria caixa da aula.

Limitações atuais:

- Não há ícone ou painel global de IA no cabeçalho.
- Não há IA em editais, dashboard, outras aulas ou cursos.
- Não existe conversa persistida, histórico, avaliação de resposta, limite de uso ou recuperação semântica dos PDFs.
- O contexto permitido é somente o material da aula de SUS. Portanto, a IA não deve ser apresentada como assistente completo do sistema.

## Mapa de fluxos planejados versus entrega atual

| Fluxo planejado | Experiência esperada | Estado real | Lacuna objetiva |
| --- | --- | --- | --- |
| Acesso e perfil | Entrar, editar preferências e retomar jornada | Parcial | Há Google e magic link. Não há perfil, preferências, disponibilidade semanal ou onboarding. |
| Dashboard de oportunidades | Atualizações de SP e Grande ABC, filtros e alertas | Não entregue | A página inicial real é apenas uma área de entrada. Não há dashboard, filtros, favoritos, alertas ou cards de atualização. |
| Coleta diária | Buscar fontes oficiais, detectar mudanças e registrar histórico | Parcial técnico | Há conectores, cron e execução registrada. Ainda faltam ciclos observados, cobertura completa e apresentação segura para aluno. |
| Catálogo de editais | Listar somente editais aprovados com fonte e versão | Parcial | A rota consulta itens visíveis. Faltam filtros, paginação, estados completos e volume de editais reais revisados. |
| Análise do edital | Cargo, local, vagas, salário, prova, requisitos, versão e alterações | Parcial e específica para Mauá | A análise de Mauá usa um candidato definido no código. Faltam detalhe dinâmico por edital, versão vigente, diff de retificações e fatos integralmente vindos do banco. |
| Decisão de estudo | Usuário informa horas e recebe estimativa explicável | Não entregue | A tela de Mauá mostra 96 horas, 12 semanas e 10 horas semanais fixas. Não há formulário nem cálculo personalizado. |
| Criar trilha | Confirmar criação vinculada ao edital e à versão | Parcial | Há botão e endpoint para a trilha de Mauá, condicionado à aprovação editorial. Falta o fluxo genérico por edital e feedback consistente na interface. |
| Página de curso | Módulos, aulas, progresso e retomada | Parcial | Existe a estrutura de 8 aulas de Mauá. A maior parte é rascunho editorial e não uma experiência de curso navegável por aula. |
| Aula completa | Vídeo, resumo, PDF, prompt, questões, áudio, notas e IA | Parcial somente para SUS | Resumo, PDF, prompt, 3 questões, áudio por voz do dispositivo e Gemini existem para uma aula. Não há player próprio, notas, persistência de respostas nem as demais aulas publicadas. |
| Vídeos | Player incorporado com licença, curadoria e progresso | Não entregue | Há link externo UNA-SUS para uma aula e política de curadoria. Não há player, catálogo licenciado, progresso de vídeo nem vídeos próprios. |
| PDFs editoriais | PDF por aula com layout, imagens e fontes | Parcial | PDFs editoriais foram gerados para tópicos. Falta publicação por aula, vínculo no banco, revisão e navegação editorial consistente. |
| Questões e revisão | Responder, corrigir, registrar erro e agendar revisão | Parcial visual | As 3 questões da aula SUS exibem gabarito em detalhes. Não há escolha registrada, correção interativa, histórico ou revisão espaçada. |
| NotebookLM | Prompt específico copiável em cada capítulo | Parcial | Há cópia de prompt somente na aula SUS. Não há prompts gerados por aula nem integração além da cópia. |
| IA pedagógica | Assistente contextual em toda aula, com fontes e segurança | Parcial somente para SUS | Gemini funciona por API autenticada para uma chave de aula. Faltam cobertura, citações visíveis, logs, limites, feedback e RAG de materiais aprovados. |
| Painel editorial | Conferir evidências, aprovar ou rejeitar, guardar auditoria | Parcial | Há tela e ações. Faltam prova de autorização por papel, operação cotidiana e uma experiência de revisão suficientemente completa. |
| Responsividade e acessibilidade | Uso confortável no Galaxy Tab S6 Lite, iPhone e Samsung atuais | Não entregue como aceite | Há estilos e atributos `data-cy`. Falta revisão de design, navegação responsiva final, teclado, leitor de tela e testes reais nos dispositivos alvo. |
| Operação | Health check, logs, alerta, backup e restauração | Parcial técnico | Há health check, cron e procedimentos. Faltam alertas configurados, restauração testada e rotina de acompanhamento. |

## Telas existentes, controle por controle

### Login `/login`

- Real: entrada por Google, solicitação de magic link e callback de autenticação.
- Falta: mensagem de estado mais confiável, recuperação de erro, perfil e navegação visual alinhada ao produto.

### Área privada `/area`

- Real: protege a rota por sessão e expõe o e-mail autenticado.
- Falta: dashboard, navegação lateral, cabeçalho, busca, IA global, alertas, preferências e conteúdo útil sem cliques adicionais.

### Editais `/area/editais`

- Real: exige login, busca editais visíveis e abre fonte oficial.
- Falta: filtro por cidade, escolaridade, cargo e situação; busca; favoritos; atualização destacada; cartões de análise; paginação; estados de carregamento e erro.

### Análise de Mauá `/area/editais/maua`

- Real: apresenta o cargo, evidências, PDF oficial e ligação para curso.
- Parcial: dados e cálculo estão concentrados em um único caso e não refletem um motor de análise genérico.
- Falta: versão, linha do tempo de retificações, comparação destacada, aderência calculada, entrada de horas e decisão persistida do aluno.

### Revisão editorial `/area/revisoes`

- Real: exibe evidências candidatas e ações editoriais.
- Falta: fila de múltiplos editais, filtros, versões lado a lado, motivo obrigatório, auditoria legível e comprovação de permissões.

### Cursos `/area/cursos`

- Real: estrutura de módulos do edital de Mauá, trava editorial, criação condicionada e uma aula demonstrável.
- Real na aula SUS: link UNA-SUS, áudio nativo do navegador, PDF editorial, prompt NotebookLM, três questões expansíveis e formulário Gemini.
- Falta: selecionar uma aula, player de vídeo, progresso por conteúdo, notas, resposta persistida, revisão espaçada, curso gerado para outros editais e publicação das sete aulas restantes.

## Integrações existentes

| Integração | Ponto técnico | Estado |
| --- | --- | --- |
| Supabase Auth | Cliente e callback de autenticação | Existe; login Google foi validado anteriormente. |
| Supabase dados | Catálogo, cursos, revisão e progresso | Parcial; nem todas as telas são alimentadas por dados persistidos. |
| Gemini | `src/lib/ai/gemini.ts` e `POST /api/ia/perguntar` | Existe e é restrito à aula SUS autenticada. |
| Vercel Cron | `GET /api/cron/coletar-fontes` | Existe; requer evidência contínua de execuções de produção. |
| Coleta oficial | Workers de PMSP, Mauá e Grande ABC | Parcial; conectores existem, mas ainda não há catálogo amplo revisado e publicado. |
| PDF | Arquivos em `public/editorial-assets` | Existe como ativo estático; falta ciclo editorial de publicação e vínculo por aula. |
| Vídeo | Link externo curado | Parcial; não existe player ou catálogo de aulas em vídeo. |

## Ordem segura das correções

1. Reconstruir a experiência autenticada: layout, navegação, dashboard e design responsivo.
2. Transformar catálogo e detalhe de edital em telas dinâmicas baseadas somente em dados aprovados.
3. Implementar análise, retificações, aderência e cálculo personalizado de horas.
4. Fazer a criação e a navegação de trilha realmente persistentes.
5. Concluir a página de aula com mídia licenciada, PDFs vinculados, notas, questões e progresso.
6. Promover Gemini para um painel global e contextual, com fontes visíveis, limites e histórico seguro.
7. Rodar QA de ponta a ponta em desktop, tablet e celular após cada bloco acima.

## Backlog corretivo aprovado

Os seguintes pontos foram confirmados como defeitos prioritários de produto em 06/09/2026. Eles só podem ser encerrados com fluxo real, dados persistidos quando aplicável e revisão de responsividade em celular, tablet e desktop.

1. Construir o dashboard de oportunidades.
2. Substituir a análise fixa de Mauá por análise dinâmica e estimativa de horas personalizada.
3. Completar o curso para além de uma aula parcialmente funcional.
4. Entregar vídeo com player, estado de licença e progresso, sem uso indevido de conteúdo de terceiros.
5. Registrar respostas, correções e revisões das questões.
6. Tornar Gemini uma IA contextual disponível onde fizer sentido, além da aula SUS.
7. Refazer navegação e responsividade como experiência de produto.
8. Converter telas editoriais em jornadas completas e claras para aluno.

## Critério para considerar o produto não mockado

Uma função só será considerada pronta quando tiver uma ação visível, resultado persistido ou vindo de fonte real, estado de carregamento e erro, teste de fluxo e comportamento responsivo validado. Uma página com textos fixos, botões sem efeito, dados no código ou recurso externo sem vínculo não atende esse critério.
