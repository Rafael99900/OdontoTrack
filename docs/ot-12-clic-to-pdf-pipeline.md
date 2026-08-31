# OT-12: fluxo real CLIC para edital pendente

## Escopo

O CLIC da Prefeitura de São Paulo é apenas índice. O worker descobre links no índice oficial, obtém o documento final, identifica PDF e extrai metadados mínimos para criar uma versão **pendente de revisão**. Nenhuma etapa publica um edital, altera a versão pública atual ou usa IA para completar lacunas.

## Contrato de dados por etapa

| Etapa | Entrada confiável | Saída mínima |
| --- | --- | --- |
| Índice CLIC | URL cadastrada, ativa e HTTPS | snapshot do índice, URL final, hash, captura, status HTTP e links candidatos |
| Descoberta | link encontrado no HTML do índice | URL absoluta, texto âncora, URL pós-redirecionamento, host aprovado e origem (`index_snapshot_id`) |
| Documento | candidato de host aprovado | snapshot próprio do PDF, bytes imutáveis no Storage, SHA-256, MIME, tamanho, URL final e captura |
| Extração | PDF identificado | título, órgão, referência externa quando existir, município/UF, data de publicação quando explícita e trechos/páginas dos fatos encontrados |
| Classificação OT-12 | documento/snapshot e fatos evidenciados | `notice_version` N+1 em `pending_review`, diff e fila interna, ou rejeição/`unchanged` |

O `source_snapshot` do índice não substitui o snapshot do PDF. Cada PDF candidato aceito recebe seu próprio snapshot, associado à mesma fonte, para que `notice_versions.origin_snapshot_id` aponte ao arquivo efetivamente extraído.

## Regras de descoberta e download

1. Resolver links relativos contra a URL final do CLIC, remover fragmentos e normalizar URL canônica sem parâmetros de rastreamento.
2. Aceitar somente HTTPS e hosts na allowlist mantida por fonte. Redirecionamento para host não aprovado é rejeitado e registrado como falha sanitizada.
3. Fazer `GET` com timeout, limite de redirecionamentos, user-agent identificável e limite de tamanho. Não tentar contornar CAPTCHA, bloqueio, login ou rate limit.
4. Confirmar PDF por `Content-Type` compatível **e** assinatura de bytes `%PDF-`; divergência gera `needs_manual_review`/falha, não extração.
5. Salvar o arquivo original em objeto imutável nomeado pelo SHA-256, com URL de origem, URL final, MIME, tamanho e timestamp nos metadados do snapshot. Não sobrescrever objeto cujo hash já exista.
6. Extrair texto com ferramenta isolada. Se o PDF for imagem, OCR marca método e confiança; páginas sem texto/evidência não originam fatos críticos automáticos.

## Anti-duplicação e versionamento

- Repetição do mesmo PDF para a mesma URL canônica: hash igual atualiza apenas `last_seen_at` e cria `collection_runs.unchanged`.
- O mesmo link repetido no índice é deduplicado antes do download por URL canônica; diferentes links que levam ao mesmo hash são preservados como origens, mas não criam versão duplicada para o mesmo aviso.
- A identidade do aviso usa `external_reference` quando estável; na ausência, `(source_id, canonical_url)`. Título não é chave de deduplicação.
- `notice_versions` já impede o mesmo `content_hash` no mesmo aviso. Para hash novo, o worker usa transação e lock por aviso, calcula N+1 e cria no máximo uma fila por versão candidata.
- A versão candidata, posições, evidências e fatos recebem `pending_review`. `notices.current_version_id` continua na última versão aprovada/publicada até a decisão editorial OT-13.
- Metadados ausentes não podem ser inventados: campo fica vazio e a fila recebe `needs_manual_review`.

## Critério mínimo para enfileirar

O PDF só chega à fila quando: fonte ativa/oficial, host e URL HTTPS aprovados, snapshot completo, hash válido, documento armazenado, vínculo `source_id` consistente e ao menos título/órgão ou referência suficiente para identificar o aviso. Para `potential_retification`, é obrigatório haver fato crítico alterado, valor normalizado e evidência de página/trecho na candidata.

## Riscos legais e operacionais

- Editais podem ser públicos, mas o produto deve preservar URL e PDF oficiais, respeitar termos do portal, limites de acesso e não republicar materiais de terceiros além do necessário para rastreabilidade.
- PDFs podem conter nomes, CPF ou listas de candidatos. O pipeline deve restringir-se a edital/retificação, evitar indexar listas pessoais e manter o arquivo privado quando houver dado pessoal.
- PDFs malformados, links externos e redirecionamentos são vetores de segurança. Download e extração devem ser isolados, com allowlist, limites de tamanho/tempo e sem acesso à rede interna.
- Mudanças no HTML, WAF, indisponibilidade ou bloqueio não autorizam fallback para fontes não oficiais. Devem gerar falha auditável e alerta operacional.

## Evidência antes de considerar OT-12 funcional

- Execução de Preview com um link real do CLIC, registrando somente URL, hash, status e IDs sanitizados.
- Um PDF identificado e armazenado, com página/trecho extraído para ao menos um fato crítico ou marcado para revisão manual.
- Reexecução do mesmo documento com `unchanged`, sem nova versão ou fila.
- Versão de PDF alterada que cria N+1 pendente e preserva a versão publicada anterior na consulta pública.
- Testes de host não aprovado, HTML disfarçado de PDF, timeout e PDF sem evidência, todos sem publicação.
