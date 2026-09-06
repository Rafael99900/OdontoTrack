# Operação das fontes oficiais do Grande ABC

## Incidente de 06/09/2026

Na execução diária de 11:18 UTC, Diadema e São Bernardo falharam na busca e Santo André excedeu o tempo permitido. A investigação reproduziu as respostas sem autenticação e encontrou os seguintes ajustes oficiais:

| Município | Causa | Fonte diária selecionada | Evidência preservada |
| --- | --- | --- | --- |
| Santo André | O subdomínio legado `web.santoandre.sp.gov.br` ultrapassou 20 segundos em ambiente serverless. | `https://www.santoandre.sp.gov.br/` | O índice dedicado de editais continua registrado no metadado `sourceEvidenceUrl` e só documentos dele seguem para extração. |
| São Bernardo do Campo | A variante sem `www` excedeu o tempo de busca. | `https://www.saobernardo.sp.gov.br/web/sbc/em-andamento` | A variante sem `www` permanece como fallback. |
| Diadema | O antigo subdomínio `diariooficial.diadema.sp.gov.br` falhou. | `https://www.diadema.sp.gov.br/diario-oficial/` | A URL canônica redireciona para o portal oficial e o portal raiz é fallback. |

## Contrato do coletor

Cada tentativa fica nos metadados do snapshot com URL, resultado sanitizado (`selected`, `timeout`, `http_###` ou `network_error`) e indicador de fallback. O hash continua sendo calculado apenas sobre o conteúdo que respondeu com sucesso. O relatório operacional expõe somente a fonte escolhida, status e ID de snapshot, nunca token, conteúdo ou cabeçalho.

O limite padrão por tentativa é oito segundos. Isso permite que os municípios sejam processados em paralelo sem um portal lento consumir toda a janela da função Vercel. Um erro ainda cria `collection_runs` com status `failed`; não é transformado em publicação nem apaga a última versão aprovada.

## Validação realizada

Em 06/09/2026, após os ajustes, as seis fontes do Grande ABC retornaram HTTP 200 no coletor: Santo André, São Bernardo do Campo, Ribeirão Pires, São Caetano do Sul, Diadema e Rio Grande da Serra. A execução foi somente de leitura; a evidência produtiva definitiva será a próxima execução agendada gravada em `collection_runs`.
