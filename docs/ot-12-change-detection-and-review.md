# OT-12: comparação de snapshots e revisão de retificações

## Resultado esperado

Uma coleta nunca publica alterações diretamente. Ela identifica uma captura nova, cria uma versão candidata com evidências, calcula um diff normalizado e enfileira a decisão editorial. Uma repetição idêntica é auditada como execução, mas não gera nova `notice_version` nem nova fila.

## Contrato de entrada

O extrator só chama o fluxo OT-12 quando dispõe de:

- `source_snapshot_id` de `source_snapshots`, com URL canônica, hash SHA-256 e data de captura;
- identificador do aviso: `source_id` e URL canônica normalizada, mais `external_reference` quando a fonte fornecer uma referência estável;
- URL final do documento, hash do arquivo/documento e publicação conhecida, quando existir;
- fatos normalizados por chave, cargo quando aplicável e evidência com página/trecho; valores de data em ISO 8601, dinheiro em centavos e números sem formatação;
- nível de confiança da extração. OCR incompleto, ausência de página ou fato crítico sem evidência impede classificação automática como retificação.

Antes de gravar, o worker confirma que o snapshot pertence à mesma `source_id` do aviso e que o hash da versão candidata corresponde ao hash auditado do documento. A migration adiciona `origin_snapshot_id` apenas como ligação rastreável; essa compatibilidade fonte-aviso é uma validação obrigatória do serviço.

## Algoritmo idempotente

1. Abrir transação e adquirir lock lógico por `source_id + canonical_url` ou `notice_id` para evitar duas versões em corridas concorrentes.
2. Localizar o aviso pela referência externa estável; sem ela, por `(source_id, canonical_url)`. Se não existir, criar `notices` com `pending_review`.
3. Consultar `notice_versions` do aviso pelo `content_hash` do documento.
4. Se houver o mesmo hash, registrar a execução como `unchanged`, atualizar o último avistamento do snapshot e encerrar. Não alterar `current_version_id`, não inserir versão, diff ou fila.
5. Se o hash for novo, calcular `version_number = max(version_number) + 1` dentro da transação e inserir uma `notice_version` com `pending_review`, `origin_snapshot_id` e URL/hashes de origem.
6. Inserir posições, evidências e fatos da versão candidata, todos `pending_review`. Cada fato crítico precisa da evidência da mesma versão, conforme a FK composta de OT-10.
7. Comparar valores normalizados contra a última versão aprovada/publicada do mesmo aviso, nunca contra uma candidata rejeitada ou pendente. Persistir cada diferença em `notice_version_changes`, usando um `change_path` estável como `notice:exam_date` ou `position:<id>:vacancies`.
8. Criar uma única `notice_review_queue` por versão candidata. A chave única em `candidate_notice_version_id` torna retries inofensivos.
9. Manter `notices.current_version_id` apontando para a última versão aprovada/publicada. Só o fluxo editorial OT-13 pode apontá-lo para a candidata aprovada e publicar o aviso.

O par único `(notice_id, content_hash)` em `notice_versions` é a segunda defesa contra duplicação. Em conflito de concorrência, o worker relê a versão vencedora e termina como `unchanged`.

## Classificação

| Condição | Classificação | Ação |
| --- | --- | --- |
| Não existe versão anterior aprovada/publicada | `new_notice` | Fila de revisão para primeira publicação |
| Documento novo e pelo menos um fato crítico mudou com evidência válida | `potential_retification` | Fila prioritária; ainda não chamar de retificação pública antes da revisão |
| Documento novo, mas apenas metadado/documento mudou ou não há fato crítico comparável | `document_update` | Fila normal |
| OCR, evidência ou identidade insuficiente para comparação confiável | `needs_manual_review` | Fila prioritária, sem inferência automatizada |

Fatos críticos são: período de inscrição, data de prova, vagas, remuneração, requisitos, conteúdo programático, jornada e taxa. Um documento com a expressão “retificação” continua `potential_retification` até que a evidência e o diff sejam revisados.

## Regras de retenção e publicação

- Não sobrescrever snapshots, versões, fatos, evidências ou diffs.
- Não apagar a versão anterior quando houver alteração.
- A fila e os diffs usam RLS e não são expostos a `anon` ou `authenticated`.
- A consulta pública só pode exibir aviso e versão publicados; candidatos e conteúdo de revisão ficam no servidor/painel editorial autorizado.
- Falha de download, hash, extração ou persistência gera `collection_runs.failed` com erro sanitizado e não insere candidata parcial. A transação é revertida.

## Dependências e limites

- A migration `005_notice_version_review_queue.sql` depende das migrations 002, 003 e 004.
- O fluxo editorial OT-13 ainda precisa definir quem pode aprovar, preencher `reviewed_by`, registrar histórico e atualizar `current_version_id` atomically.
- `reviewed_by` permanece sem FK até OT-02 perfis e OT-03 papéis existirem. Não usar UUID inventado como usuário editorial.
- A detecção depende de um extrator que produza fatos normalizados e evidências; OT-12 não usa IA para preencher ausência de informação oficial.

## Checklist de aceite técnico

- [ ] Snapshot repetido com mesmo hash cria `collection_runs.unchanged`, sem nova versão nem fila.
- [ ] Snapshot novo cria exatamente uma versão candidata e uma fila, mesmo após retry concorrente.
- [ ] Cada fato crítico modificado tem evidência candidata da mesma versão, com página/trecho.
- [ ] A versão anterior e seu `current_version_id` continuam preservados enquanto a fila estiver pendente.
- [ ] Mudança crítica vira `potential_retification`, sem publicação pública automática.
- [ ] Falha durante o fluxo deixa nenhuma candidata parcial e registra falha sanitizada na execução.
- [ ] `anon` e `authenticated` não conseguem ler ou escrever queue/diff; validação SQL de `ot_12_review_queue_schema_verify.sql` aprovada.
