# Retificações de Mauá e inventário de editais reais

Este registro separa documento oficial, extração e decisão editorial. Nenhum item abaixo é publicado automaticamente ou apresentado como concurso vigente.

## Concurso Público 01/2025 de Mauá

O edital de abertura do cargo de Cirurgião-Dentista 20h continua sendo a referência de conteúdo da primeira trilha. A página oficial do concurso lista o cargo e as duas retificações. Os PDFs foram obtidos diretamente do Diário Oficial de Mauá.

| Documento | Publicação | Evidência no PDF | Resultado da comparação para Cirurgião-Dentista 20h |
| --- | --- | --- | --- |
| [Edital de abertura](https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf) | 17/12/2025 | cargo na p. 2; conteúdo específico na p. 31 | versão de referência, pendente de aprovação editorial |
| [Retificação](https://dom.maua.sp.gov.br/public/docs/b9eabcf7d7e784a29ae07b7f9e5a1afb.pdf) | 29/12/2025 | identifica CP 01/2025 na p. 1; cláusula de preservação dos demais itens na p. 4 | não há menção extraída ao cargo; `document_update`, sem mudança automática de fatos |
| [Retificação nº 02](https://dom.maua.sp.gov.br/public/docs/1e9b18ff0d2e67aaebb8455c2db551f1.pdf) | 14/01/2026 | identifica CP 01/2025 na p. 1; cláusula de preservação dos demais itens na p. 7 | não há menção extraída ao cargo; `document_update`, sem mudança automática de fatos |

As duas retificações entram em versões separadas, com hash, cópia privada do PDF, páginas de evidência e fila editorial. A regra deliberadamente conservadora não conclui que “não houve mudança” no edital inteiro: ela conclui somente que não foi extraída alteração do cargo acompanhado. Se o editor localizar impacto indireto, ele deve registrar o fato com página e trecho antes de aprovar qualquer atualização.

## Segundo candidato oficial, capital

O [Comunicado 015/2013 da Autarquia Hospitalar Municipal](https://www.prefeitura.sp.gov.br/cidade/secretarias/upload/saude/autarquia_hospitalar_municipal/publicacoes_ingresso/COMUNICADO%20015%20ES-CirDent%20Buco.pdf) é um documento real de São Paulo, hospedado pela Prefeitura. Ele abre processo seletivo emergencial, e não concurso público, para Especialista em Saúde - Cirurgião-Dentista. O PDF informa 35 vagas na p. 1, graduação em Odontologia e CRO ativo na p. 2.

Ele é mantido no inventário apenas como referência histórica para Odontologia. Sua natureza e data impedem que seja exibido como oportunidade ativa. A persistência pública dependerá de captura por fonte oficial, hash do documento e revisão editorial.

## Operação e teste

- `workers/collector/persist-maua-retifications.mjs` cria versões candidatas idempotentes após a versão de abertura já existir.
- `POST /api/operacoes/persistir-retificacoes-maua` exige o token operacional do servidor.
- `npm run test:maua-retifications` garante que ausência de menção ao cargo não gere alteração pública.
- `workers/collector/official-notice-candidates.mjs` mantém somente candidatos com URL oficial e escopo explícito.
