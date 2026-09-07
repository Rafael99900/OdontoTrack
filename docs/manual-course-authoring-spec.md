# Especificação: concurso e trilha manual

Atualizado em 07/09/2026. Esta é a definição de implementação para o autor criar um concurso e uma trilha sem depender do coletor automático. O objetivo é dar autonomia ao usuário sem transformar material manual em dado oficial nem interferir nos editais já versionados.

## Decisão de arquitetura

O fluxo manual será uma origem paralela, privada e rastreável.

- Editais coletados continuam em `notices` e `notice_versions`, com publicação vinculada a fonte oficial e revisão editorial.
- Um cadastro manual nasce em `manual_notices`, tem `owner_user_id` e jamais entra no catálogo público de editais.
- A trilha manual reutiliza `learning_courses`, `learning_modules`, `learning_lessons`, `learning_assets`, `learning_questions`, progresso e tentativas já existentes.
- `learning_courses` receberá `manual_notice_id` opcional. O curso terá exatamente uma origem: uma versão oficial **ou** um concurso manual.
- O autor pode salvar e estudar seu rascunho. Somente ele vê ou altera o material, salvo permissão futura explícita.

Essa separação protege o dashboard e o coletor: uma informação digitada manualmente nunca aparece como oportunidade oficial, nem modifica retificações ou fatos do banco.

## Problema e meta

Hoje uma trilha só é criada a partir do edital de Mauá processado. O usuário precisa preparar seu próprio concurso, inclusive quando ainda não existe conector, PDF extraído ou revisão editorial automática.

O primeiro lançamento deve permitir criar, editar, revisar e estudar uma trilha manual completa em uma única conta, sem publicar dados como se fossem oficiais.

## Fora do escopo da primeira versão

- Publicação do concurso manual no dashboard público.
- Compartilhamento com outros alunos, marketplace ou cobrança.
- OCR automático, extração por IA ou validação jurídica do edital anexado.
- Download, cópia ou hospedagem não autorizada de vídeos de terceiros.
- Transformar o rascunho manual em edital oficial sem uma revisão editorial separada.

## Jornada do usuário

1. Em **Meus cursos**, o usuário seleciona **Criar concurso manual**.
2. Preenche os dados do concurso e salva como rascunho.
3. Adiciona matérias, cria módulos e adiciona aulas em ordem.
4. Em cada aula, adiciona objetivo, resumo, prompt NotebookLM, PDF, áudio, vídeo YouTube ou link externo, e questões.
5. Revisa a prévia de desktop, tablet e celular.
6. Marca a trilha como pronta para estudo. Ela permanece privada.
7. Estuda, responde questões e acompanha progresso como nas trilhas geradas.

## Campos do formulário de concurso

| Grupo | Campo | Regra |
| --- | --- | --- |
| Identificação | título do concurso | obrigatório, 3 a 160 caracteres |
| Cargo | cargo | obrigatório |
| Organização | órgão ou banca | obrigatório |
| Local | cidade e UF | obrigatórios |
| Datas | inscrições, prova e observações de retificação | opcionais, com data ISO quando houver data estruturada |
| Condições | remuneração, jornada e requisitos | opcionais, texto e valores separados quando aplicável |
| Edital | URL pública ou arquivo privado | ao menos um opcional; origem sempre identificada como manual |
| Matérias | matéria, prioridade, carga sugerida e observações | ao menos uma para enviar à revisão |

## Modelo de dados e migração

### `manual_notices`

| Campo | Finalidade |
| --- | --- |
| `id` | identificador UUID |
| `owner_user_id` | autor e dono da informação |
| `status` | `draft`, `in_review`, `ready`, `archived` |
| `title`, `position_title`, `organization_name` | identificação do concurso |
| `city`, `state_code` | localização |
| `registration_start_at`, `registration_end_at`, `exam_at` | datas estruturadas opcionais |
| `remuneration_cents`, `workload_hours_week`, `requirements` | condições do cargo |
| `notice_url`, `storage_bucket`, `storage_path` | referência do edital sem publicação pública |
| `retification_note` | registro manual de mudança |
| `created_at`, `updated_at`, `ready_at` | auditoria |

### `manual_notice_subjects`

Matérias vinculadas ao concurso manual com `title`, `priority`, `estimated_hours`, `notes` e `position`. Esta tabela gera módulos ou serve de referência para o editor.

### Extensão segura de `learning_courses`

1. Adicionar `manual_notice_id uuid references manual_notices(id)`.
2. Remover apenas o `NOT NULL` de `source_notice_version_id`.
3. Adicionar restrição XOR: uma e somente uma origem deve existir.
4. Criar índice e unicidade de `manual_notice_id, owner_user_id`.
5. Manter todos os cursos oficiais existentes válidos sem alteração de dados.

### Conteúdo manual de aula

`learning_lessons` receberá `summary`, `notebook_prompt`, `audio_script` e `authoring_status` opcionais. `learning_assets` receberá `embed_provider`, `embed_id` e `source_label`. Todo vídeo YouTube será salvo como ID validado, não HTML arbitrário. PDFs e áudios enviados ficam em bucket privado, servidos por URL assinada.

## Estados e regras de publicação

| Estado | Autor pode editar | Aluno vê | Regra |
| --- | --- | --- | --- |
| Rascunho | sim | não | dados incompletos e materiais em edição |
| Em revisão | sim, com nova revisão | não | checklist de campos e ativos em conferência |
| Pronto para estudo | sim, com aviso de republicação | somente o dono | trilha privada utilizável |
| Arquivado | leitura | não inicia estudo | preserva histórico |

O termo “publicar” na interface manual significará **publicar para minha área de estudo**, nunca publicar no catálogo oficial.

## Endpoints

| Método e rota | Função | Proteção |
| --- | --- | --- |
| `POST /api/manual/concursos` | cria rascunho | usuário autenticado |
| `GET /api/manual/concursos` | lista somente concursos do autor | RLS + dono |
| `GET/PATCH/DELETE /api/manual/concursos/[id]` | consulta, edita ou arquiva | RLS + dono |
| `POST /api/manual/concursos/[id]/materias` | ordena matérias | RLS + dono |
| `POST /api/manual/concursos/[id]/trilha` | cria curso idempotente | concurso pronto e dono |
| `PATCH /api/manual/aulas/[id]` | salva conteúdo e ordem | curso do dono |
| `POST /api/manual/aulas/[id]/ativos` | anexa PDF, áudio ou vídeo | valida domínio, tipo e atribuição |
| `POST /api/manual/aulas/[id]/questoes` | salva questão e resposta correta | curso do dono |
| `POST /api/manual/concursos/[id]/pronto` | valida checklist e libera estudo | dono |

## Interface

### Meus cursos

- Ação primária **Criar concurso manual**.
- Lista separada: “Trilhas automáticas” e “Minhas trilhas manuais”.
- Cada card mostra estado, última edição, número de matérias e percentual estudado.

### Assistente de criação

1. Dados do concurso.
2. Matérias e esforço.
3. Módulos e aulas.
4. Materiais de cada aula.
5. Questões e prompts.
6. Revisão e liberação para estudo.

O assistente preserva rascunho a cada avanço e permite voltar sem perda. Em mobile, cada passo ocupa uma única coluna, com barra de progresso e ações fixas acessíveis.

### Editor de aula

- Título, objetivo, resumo e tempo previsto.
- URL YouTube com prévia pelo player oficial, origem e fallback.
- Upload de PDF e áudio com nome, tamanho, fonte e status.
- Prompt NotebookLM com botão de cópia.
- Questões com alternativas, gabarito e explicação.
- Prévia de como o aluno verá a aula.

## Segurança e não regressão

- Todas as leituras e escritas filtram `owner_user_id = auth.uid()`.
- Não usar cliente administrativo no navegador.
- Arquivos privados usam URL assinada de curta duração.
- Sanitizar texto e nunca aceitar `iframe` ou HTML fornecido pelo usuário.
- Validar YouTube por ID e permitir somente `youtube.com`, `youtu.be` e `youtube-nocookie.com` para vídeo incorporado.
- As rotas atuais de Mauá continuam intactas; testes de criação oficial e progresso serão executados após a migração.
- A exclusão inicial será arquivo lógico, não remoção física de curso, respostas ou arquivos.

## Histórias e critérios de aceite

### OT-50 Criar concurso manual

Como aluno, quero registrar um concurso manualmente para começar uma trilha mesmo sem coleta automática.

```gherkin
Cenário: salvar rascunho manual
  Dado que estou autenticado
  Quando preencho título, cargo, órgão, cidade e UF e salvo
  Então vejo o concurso em “Minhas trilhas manuais” com estado Rascunho
  E nenhum dado aparece no dashboard de editais oficiais
```

### OT-51 Editar matérias e gerar trilha

Como aluno, quero definir matérias, módulos e aulas para organizar meu estudo.

```gherkin
Cenário: gerar uma trilha privada
  Dado um concurso manual com ao menos uma matéria
  Quando gero a trilha
  Então módulos e aulas ficam vinculados ao meu concurso manual
  E outro usuário não consegue lê-los ou alterá-los
```

### OT-52 Editar recursos de aula

Como aluno, quero adicionar meus materiais para estudar em um único lugar.

```gherkin
Cenário: adicionar vídeo YouTube
  Dada uma aula da minha trilha manual
  Quando informo uma URL válida e incorporável do YouTube
  Então o player oficial aparece com link de origem
  E uma URL fora dos domínios permitidos é recusada
```

### OT-53 Revisar e liberar para estudo

Como aluno, quero verificar o que está faltando antes de iniciar a trilha.

```gherkin
Cenário: liberar trilha completa
  Dado um concurso manual com matéria, módulo e aula válidos
  Quando marco a trilha como pronta para estudo
  Então recebo a lista de itens incompletos ou a confirmação de liberação
  E a trilha aparece na minha área de estudo, sem ficar pública
```

## Sequência de implementação

1. Migration e RLS do concurso manual, sem alterar a leitura de editais oficiais.
2. API de rascunho e formulário do primeiro passo.
3. Matérias, criação idempotente de módulos e aulas.
4. Editor de recursos, questões e prompt.
5. Checklist de liberação e listagem de trilhas manuais.
6. Testes unitários, integração, autorização entre dois usuários e QA em desktop, tablet e celular.

## Métricas de aceite

- 100% dos concursos manuais privados a outros usuários no teste RLS.
- Criação de rascunho em menos de dois minutos em teste manual.
- Nenhuma URL não permitida é incorporada como vídeo.
- Fluxos principais funcionam em 360 px, 600 px e desktop sem rolagem horizontal.
- Criação de concurso manual não altera resultados ou versões do catálogo oficial.
