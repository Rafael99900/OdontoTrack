# Primeiro edital real para revisão

## Registro candidato

O primeiro caso real separado para a fila editorial é o Concurso Público 01/2025 da Prefeitura de Mauá, no cargo de Cirurgião Dentista 20h.

| Campo | Valor capturado | Situação |
| --- | --- | --- |
| Município | Mauá, SP | Confirmado na fonte oficial |
| Cargo | Cirurgião Dentista 20h | Confirmado na fonte oficial |
| Vagas | 5 gerais e 1 reservada a PCD | Confirmado na fonte oficial |
| Inscrições | 18/12/2025 a 29/01/2026 | Confirmado na fonte oficial |
| Banca | IBAM | Confirmado na fonte oficial |
| Prova prevista | 15/03/2026 | Página 12 do edital de abertura; depende de confirmação por convocação |
| Remuneração | R$ 3.287,43 mensais | Página 2; referência de dezembro de 2025 |
| Requisito | Superior em Odontologia e registro no conselho | Página 2 |
| Conteúdo | SUS, atenção básica, saúde bucal, clínica e especialidades listadas no Anexo II | Página 31 |

Fontes oficiais consultadas em 31/08/2026:

1. https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11
2. https://dom.maua.sp.gov.br/DOM/Index/3942
3. https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf

## Persistência candidata e regra editorial

O PDF de abertura é verificado por assinatura, host HTTPS oficial, tamanho e SHA-256 antes de ir ao bucket privado `official-documents`. A operação idempotente `POST /api/operacoes/persistir-edital-maua` materializa, nesta ordem, o snapshot oficial, a fonte, o edital, a versão candidata, quatro evidências, sete fatos críticos, o cargo e uma fila editorial `pending`. O retorno contém apenas IDs e metadados sanitizados.

Ela nunca atualiza `notices.current_version_id`, não muda o status para `published` e não cria curso. Assim, uma repetição do job não duplica versão, evidências ou fila; apenas reencontra o mesmo hash e mantém o candidato para revisão humana. Retificações e publicações posteriores devem ser comparadas antes da aprovação.

## Automação diária

O agendador diário chama a rota protegida `/api/cron/coletar-fontes` às 11:00 UTC, equivalente a 08:00 em São Paulo enquanto o horário local for UTC-3. Ele coleta a CLIC da PMSP, Mauá e os seis recortes oficiais restantes da Grande ABC: Santo André, São Bernardo do Campo, Ribeirão Pires, São Caetano do Sul, Diário Oficial de Diadema e os atos legislativos de Rio Grande da Serra.

Cada fonte cria somente um snapshot semântico de sua página oficial. O snapshot não é um edital, não é uma classificação automática e não autoriza publicação. Os portais sem índice de concurso estruturado, hoje Diadema e Rio Grande da Serra, permanecem em modo de vigilância oficial: a descoberta de documento exige adaptador municipal e teste de contrato antes de qualquer extração.

Para ativar o agendamento em produção, a Vercel precisa de `CRON_SECRET`, igual ao segredo que ela envia no cabeçalho Authorization. O segredo nunca deve aparecer no código, nos logs ou no GitHub.
