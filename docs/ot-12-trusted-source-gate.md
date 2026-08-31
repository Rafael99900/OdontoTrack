# OT-12: portão de confiança para fontes reais

## Decisão

O classificador em modo real só pode iniciar uma transação de versão/fila para um `source_snapshot` que tenha origem oficial verificável. Um hash ou URL isolado não é suficiente. Fixtures pertencem exclusivamente ao banco descartável e ao cliente de teste, nunca ao worker configurado para fonte real.

## Contrato de elegibilidade

Antes de criar `notice_versions`, `notice_version_changes` ou `notice_review_queue`, o serviço deve validar todos os itens abaixo:

| Regra | Verificação obrigatória |
| --- | --- |
| Fonte existente e ativa | `source_snapshots.source_id` não é nulo, existe em `sources` e `sources.is_active = true` |
| Tipo oficial | `sources.source_kind` é `official_portal` ou `official_gazette`; banca é complementar e não habilita classificação real sozinha |
| Origem verificável | URL canônica da fonte e do snapshot usam HTTPS; a URL final pertence ao conector aprovado para aquela fonte |
| Snapshot completo | há `captured_at`, hash SHA-256 de 64 caracteres, URL canônica HTTPS e metadados de conteúdo necessários para auditoria |
| Coerência | `source_id` do snapshot é igual ao `source_id` do aviso localizado/criado; o hash da versão candidata corresponde ao documento extraído daquele snapshot |
| Evidência | para `potential_retification`, todo fato crítico alterado tem página/trecho e evidência da mesma versão candidata; baixa confiança de OCR leva a `needs_manual_review` |
| Ambiente | cliente de teste/fixture só roda em banco isolado. Modo real rejeita domínios de fixture e não recebe estado local ou seed como entrada |

O serviço deve responder com um código sanitizado, por exemplo `UNTRUSTED_SOURCE_SNAPSHOT`, antes de abrir a transação de criação. A rejeição não cria versão, diff, fila, alteração em `current_version_id` ou publicação. O `collection_runs` pode registrar a falha com causa genérica, sem tokens, HTML bruto ou segredo.

## Fluxo seguro

1. Buscar snapshot, fonte e aviso em leitura.
2. Executar todas as verificações de elegibilidade acima.
3. Se alguma falhar, encerrar com rejeição auditável e sem escrita de candidato.
4. Só então abrir transação, obter lock lógico e seguir o algoritmo de [comparação e revisão OT-12](ot-12-change-detection-and-review.md).
5. Hash igual encerra como `unchanged`. Hash diferente cria N+1 em `pending_review` e uma fila; a classificação só pode ser `potential_retification` quando o diff tiver evidência suficiente.
6. `notices.current_version_id` e a consulta pública continuam apontando para a versão publicada até aprovação editorial.

## Enforcement: o que o schema atual consegue garantir

As migrations 002–005 garantem FKs, hashes, RLS de filas/snapshots e unicidade de versão por hash, mas **não** garantem a confiança da origem:

- `source_snapshots.source_id` ainda permite nulo.
- `sources.source_kind` é uma declaração, não um registro de verificação editorial.
- `CHECK` não consegue consultar `sources.is_active` nem comparar a origem do snapshot com a fonte do aviso.
- RLS/grants controlam quem acessa; não expressam a regra de negócio “fonte ativa e oficial”.
- `service_role` ignora RLS, logo não é uma barreira suficiente contra um worker com bug.

Portanto, a implementação imediata exige um **guard server-side obrigatório e testado**. Ele é suficiente para o worker atual se a credencial continuar exclusivamente no servidor e nenhum outro processo gravar versões.

Para proteção forte antes de abrir múltiplos workers ou acesso editorial automatizado, recomenda-se uma migration incremental posterior, sem reescrever migrations aplicadas:

1. adicionar a `sources` um campo de habilitação explícita após verificação editorial, com data/responsável;
2. adicionar `CHECK (source_id is not null) NOT VALID` em `source_snapshots`, corrigir legados e validar a constraint;
3. criar uma função transacional interna que valide fonte/snapshot, crie candidata/diff/fila e atualize a execução;
4. usar um papel de banco dedicado ao coletor, com `EXECUTE` apenas nessa função, em vez de usar `service_role` para escrita ampla.

Essa migration não foi criada agora porque exige decidir o modelo de perfis editoriais e o modo de conexão do worker. Criá-la sem esses dados poderia bloquear snapshots legítimos já persistidos.

## Casos de verificação

- [ ] Fonte ativa oficial, snapshot completo HTTPS, hash de 64 caracteres e evidência válida: classificador cria apenas N+1 `pending_review`, diffs e uma fila pendente.
- [ ] Mesmo snapshot/hash: registra `unchanged`, sem nova versão, diff ou fila.
- [ ] Snapshot sem `source_id`, fonte inativa, tipo `exam_board`, URL HTTP, hash inválido, host fora do conector ou ausência de evidência: retorna `UNTRUSTED_SOURCE_SNAPSHOT` e não cria nenhuma entidade candidata.
- [ ] Fixture `example.test` em cliente/banco de teste: funciona apenas no teste isolado; o modo real a rejeita antes de qualquer transação.
- [ ] Consulta pública após hash diferente e fila pendente: continua retornando a versão publicada anterior.

## Riscos residuais

- O catálogo `sources` atual não contém data/responsável de verificação nem allowlist de hosts. Essa verificação fica temporariamente no conector/guard e precisa de auditoria de código.
- Um operador com `service_role` pode contornar o guard por acesso direto ao banco. A função com papel dedicado é a mitigação definitiva.
- Redirecionamentos, subdomínios e links de CDN precisam de allowlist por fonte; validar só HTTPS não prova oficialidade.
- A separação de ambientes deve impedir que seeds sejam carregados em Preview compartilhado ou Produção.
