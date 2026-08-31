# Gap analysis técnico do MVP

## Base avaliada

- Código: protótipo Next.js em `src/app/page.tsx`, uma rota de IA e catálogos estáticos de fontes.
- Documentação: requisitos, arquitetura alvo, plano de entrega, backlog e políticas de conteúdo.
- Conclusão: a direção de produto está bem documentada. O repositório ainda é um protótipo demonstrativo, sem persistência, autenticação, coleta ou conteúdo real publicado.

## O que já existe

| Área | Evidência no repositório | Situação |
| --- | --- | --- |
| Interface do aluno | `src/app/page.tsx` apresenta telas locais de dashboard, edital, trilha, aula, PDF, prompt, questões e áudio | Demonstração visual, sem rotas, dados ou ações persistidas |
| IA inicial | `src/app/api/ia/perguntar/route.ts` e `src/lib/ai/gemini.ts` chamam Gemini no servidor | Parcial: não há autenticação, limite, RAG, validação de citações nem isolamento de dados |
| Fontes oficiais | `src/lib/sources/official-sources.ts` possui cinco fontes iniciais | Catálogo estático, sem validação de URL, job, captura ou histórico |
| Qualidade de interface | `src/lib/qa/selectors.ts` e atributos `data-cy` no protótipo | Base de seleção, sem framework ou cenários automatizados |
| Definição do SaaS | `docs/*.md` descreve fluxos, conteúdo, direitos e entregas | Pronto como referência, aguardando implementação verificável |

## Lacunas por épico

| Épico | Existe hoje | Falta para o MVP real | Dependências | Evidência técnica mínima para aceite |
| --- | --- | --- | --- | --- |
| Fundação e autenticação | Next.js local | Projeto Supabase, perfis, login, sessão, RLS, variáveis de ambiente, auditoria | Supabase, definição de papéis editorial/aluno | Migration aplicada, políticas RLS testadas com dois usuários, teste de login e captura de tela do perfil persistido |
| Inteligência de editais | Lista estática de 5 fontes e UI demonstrativa | Schema de fontes/editais/versões/evidências, Storage, coletor, OCR, extração, comparação e painel de revisão | Credenciais de Storage, fontes validadas, worker/cron, política de retenção | PDF oficial salvo com hash; campos extraídos citam página; retificação preserva versão anterior; execução de coleta registrada |
| Catálogo e análise | Dashboard e página de edital locais | Consultas reais, filtros, estados de publicação, histórico de versões, detalhes de cargo e cálculo explicável | Dados revisados do épico de editais; taxonomia de cargos/tópicos | API retorna só registros publicados; filtro funciona; página mostra evidências e mudança de retificação |
| Trilha e progresso | Tela de trilha e aula, apenas estado React | Modelo de disciplinas, tópicos, módulos, aulas, vínculo edital-versão, trilha por aluno, progresso e revisões | Conteúdo editorial aprovado; autenticação; dados de edital normalizados | Trilha criada para um usuário e retomada em outra sessão; alterações de edital sinalizam itens impactados; testes de autorização |
| Conteúdo da aula | Abas de vídeo, resumo, PDF, prompt, questão e áudio simuladas | CMS editorial, ativos versionados, publicação, PDF renderizado, player seguro, transcrição, questões e explicações | Professor/curador, licenças, template visual, Storage/provedor de vídeo | Aula publicada tem ativo válido, direito registrado, resumo e PDF versionados; vídeo indisponível aciona fallback; render do PDF revisado |
| IA factual e pedagógica | Chamada Gemini aceita contexto livre enviado pelo cliente | Recuperação por fonte aprovada, citações verificadas, separação factual/pedagógica, limites, logs seguros, tratamento de baixa confiança | Base vetorial/FTS, evidências extraídas, política de dados e chave Gemini | Pergunta factual sem evidência recebe recusa; resposta citada aponta para versão/página; teste bloqueia instrução maliciosa e acesso entre usuários |
| Governança e direitos | Políticas documentadas | Tabelas de direitos/revisão, fluxo de aprovação, validade de licenças, retirada e trilha de auditoria | Modelo contratual e responsável editorial | Tentativa de publicar ativo sem licença é bloqueada; expiração despublica ou alerta; auditoria registra decisão |
| Qualidade, segurança e operação | ESLint e seletores de QA | Testes unitários/integrados/E2E, CI, monitoramento, rate limit, backups, acessibilidade e métricas de jobs | Conta de hospedagem, Sentry/monitoramento, política LGPD | Pipeline verde; fluxo crítico E2E; relatório de acessibilidade; alerta de falha de coletor e backup restaurável |

## Riscos arquiteturais que exigem decisão antes do código

1. **Fonte de verdade:** o banco só pode expor fatos de edital após evidência e revisão. A rota de IA atual recebe `noticeContext` do cliente, portanto não é adequada para fatos oficiais em produção.
2. **Coleta heterogênea:** cada município/banca pode exigir um adaptador específico. Não assumir que uma única técnica de scraping funcionará para todas as fontes.
3. **Direitos de conteúdo:** a existência de `embed_url` não substitui licença ou validação de incorporação. Vídeo, áudio, questão e PDF precisam de registro de direito antes da publicação.
4. **OCR e extração:** dados de PDF devem carregar confiança, trecho e página. Campos ambíguos devem ficar pendentes, sem preenchimento pela IA.
5. **Modelo de conteúdo reutilizável:** aulas devem ser canônicas por tópico e ligadas à versão do edital via cobertura, não duplicadas para cada concurso.
6. **Dados pessoais:** anotações, desempenho e conversas são privados. A IA deve receber apenas o mínimo necessário e nunca usar dados de outro aluno como contexto.

## Sequência técnica recomendada

1. Criar Supabase, migrations e RLS, incluindo `profiles`, `sources`, `notices`, `notice_versions`, `evidence` e logs de coleta.
2. Entregar um conector completo para uma fonte, com arquivo, hash, extração assistida e revisão humana. Só então expandir municípios.
3. Trocar o dashboard demonstrativo por catálogo e análise do primeiro edital real publicado.
4. Modelar a taxonomia de tópicos, o CMS de aulas e a trilha persistida.
5. Implementar progresso, questões e PDF autoral antes de expandir a IA.
6. Construir RAG no servidor contra evidências e materiais aprovados, com citações verificadas.
7. Fechar automação, testes, acessibilidade e observabilidade antes do piloto externo.

## Indicador de prontidão atual

| Dimensão | Prontidão | Motivo |
| --- | ---: | --- |
| Experiência demonstrável | Média | Fluxo visual principal já está prototipado |
| Dados oficiais confiáveis | Baixa | Não há coleta, banco, arquivo, revisão ou evidência real |
| Aprendizagem funcional | Baixa | Recursos de aula são estáticos e não persistem |
| IA segura e citada | Baixa | Há adaptador de provedor, mas o contexto é controlado pelo cliente |
| Operação e conformidade | Baixa | Sem autenticação, RLS, testes, métricas ou trilha de auditoria |

O primeiro marco de valor é um edital real de uma fonte oficial, versionado, revisado e exibido com suas evidências, do qual um aluno autenticado consegue gerar e retomar uma trilha mínima.
