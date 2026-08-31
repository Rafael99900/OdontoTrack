# Blueprint de implementação

## Situação atual

O repositório possui um protótipo de interface em `src/app/page.tsx`. Os caminhos abaixo descrevem a estrutura alvo do SaaS. Eles devem ser criados progressivamente, com um card, teste e critério de aceite para cada etapa.

## Estrutura alvo do código

```text
src/
  app/
    (public)/login/page.tsx
    (protected)/dashboard/page.tsx
    (protected)/editais/[editalId]/page.tsx
    (protected)/trilhas/[trilhaId]/page.tsx
    (protected)/aulas/[aulaId]/page.tsx
    api/
      editais/route.ts
      editais/[editalId]/route.ts
      trilhas/route.ts
      aulas/[aulaId]/pdf/route.ts
      ia/perguntar/route.ts
  components/
    edital/
    trilha/
    aula/
    pdf/
    ui/
  features/
    auth/
    editais/
    planejamento/
    trilhas/
    conteudo/
    ia/
  lib/
    supabase/
    edital/
    video/
    pdf/
    validation/
  types/
supabase/
  migrations/
  seed.sql
workers/
  collector/
  extractor/
  content-curator/
  pdf-generator/
tests/
  unit/
  integration/
  e2e/
```

## Passo 1. Conta e dados privados

**Código:** `src/features/auth`, `src/lib/supabase`, `supabase/migrations/001_auth_profiles.sql`.

**Dados:** `profiles`, `user_preferences`, `study_notes`, `study_progress`.

**Entrega verificável:** cadastro e login por e-mail; somente o dono lê ou altera preferências, anotações e progresso. Isso é imposto por RLS do Supabase, não apenas pela interface.

**Critérios de aceite:**

1. O aluno entra e volta autenticado em outro dispositivo.
2. Uma consulta feita com outro usuário não retorna notas nem progresso alheios.
3. A página de dashboard mostra as preferências reais do perfil.

## Passo 2. Catálogo oficial de editais

**Código:** `workers/collector`, `workers/extractor`, `src/features/editais`, `src/app/api/editais`.

**Dados:** `sources`, `notices`, `notice_versions`, `notice_fields`, `source_evidence`, `collection_runs`.

**Fluxo técnico:**

1. O coletor visita uma fonte previamente cadastrada.
2. Ele salva URL, data de coleta, arquivo original e hash do arquivo.
3. O extrator identifica órgão, cargo, escolaridade, município, remuneração, vagas, prazo de inscrição, prova e conteúdo programático.
4. Cada campo extraído guarda página ou trecho de evidência e um status de revisão.
5. Uma retificação cria uma nova versão e recalcula os campos atuais sem apagar a versão anterior.
6. O dashboard consulta apenas registros publicados após a revisão.

**Critérios de aceite:**

1. Um edital mostra PDF original, fonte, data de coleta e versão atual.
2. Uma retificação preserva a data de prova anterior e destaca a nova data.
3. Se a extração falhar, o item não inventa dados e fica pendente de revisão.

## Passo 3. Decisão de estudo

**Código:** `src/features/planejamento`, `src/features/editais/components/NoticeAnalysis.tsx`.

**Dados:** `notice_topics`, `student_topic_mastery`, `study_estimates`, `decision_records`.

**Regra:** a estimativa soma a carga dos tópicos do edital, desconta domínio informado pelo aluno e divide pelas horas semanais. A tela exibe os fatores usados no cálculo, sem prometer aprovação.

**Critérios de aceite:**

1. O aluno visualiza matérias, submatérias, carga estimada e data de prova.
2. Alterar horas semanais recalcula a previsão.
3. O aluno pode registrar "vou estudar" e criar sua trilha, ou "acompanhar" sem gerar curso.

## Passo 4. Geração de trilha por edital

**Código:** `src/features/trilhas`, `src/features/conteudo`, `src/app/api/trilhas`.

**Dados:** `content_modules`, `content_lessons`, `lesson_assets`, `study_paths`, `study_path_items`.

**Regra:** módulos reutilizáveis aprovados são combinados com os tópicos daquele edital. O sistema não cria conteúdo inexistente nem marca uma matéria como coberta se não houver aula compatível.

**Critérios de aceite:**

1. Criar uma trilha gera itens ordenados, vinculados ao edital e à versão analisada.
2. O aluno pode reorganizar sua ordem pessoal sem alterar a matriz do edital.
3. Se surgir retificação de conteúdo, a trilha avisa quais itens precisam de nova análise.

## Passo 5. Aula completa

**Código:** `src/app/(protected)/aulas/[aulaId]`, `src/components/aula`, `src/features/conteudo`.

**Dados:** `lesson_assets`, `questions`, `question_explanations`, `lesson_prompts`, `study_notes`, `study_progress`.

**Componentes da página:** título, objetivo, vídeo incorporado autorizado, resumo, PDF autoral, prompt copiável para NotebookLM ou Gemini, questões comentadas, notas privadas, áudio opcional, conclusão e tutor de IA.

**Critérios de aceite:**

1. Concluir uma aula persiste o progresso e atualiza a trilha.
2. Copiar o prompt inclui contexto da aula e instrução para não inventar fontes.
3. A página mantém leitura e ações principais em celular e tablet.

## Passo 6. IA com limite de confiança

**Código:** `src/features/ia`, `src/app/api/ia/perguntar`, `src/lib/edital/citations.ts`.

**Regra:** perguntas sobre edital recebem somente contexto do documento versionado e devolvem referências de página. Perguntas pedagógicas usam materiais aprovados para a aula. Quando a base não responder, a IA informa a limitação e direciona ao PDF oficial ou à revisão humana.

**Critérios de aceite:**

1. A resposta factual traz link ou referência à evidência disponível.
2. A IA não afirma datas, vagas ou requisitos sem fonte.
3. Conversas e notas do aluno ficam isoladas por usuário.

## Passo 7. PDF autoral

**Código:** `src/lib/pdf`, `workers/pdf-generator`, `src/app/api/aulas/[aulaId]/pdf`.

**Dados:** `pdf_templates`, `generated_pdfs`, `lesson_assets`.

**Fluxo:** a aula aprovada aciona o gerador; o conteúdo passa por validação editorial; o PDF recebe capa, objetivos, resumo, explicação, exemplos, imagens didáticas com referência, exercícios e fontes finais; o arquivo é renderizado, revisado visualmente e publicado no Storage do Supabase.

**Critérios de aceite:**

1. O PDF usa identidade OdontoTrack e contém a versão da aula.
2. A revisão bloqueia texto com travessão, fontes sem referência ou conteúdo sem aprovação.
3. Todo PDF tem ao menos uma fonte verificável ao final e cada imagem tem legenda e origem.
4. O aluno abre o PDF em tablet e celular, e acessa alternativa HTML na aula.

## Evidência obrigatória por card

Cada card só passa para Concluído após conter: link do código, migration quando houver dados, teste automatizado, evidência visual da funcionalidade e atualização do documento correspondente.
