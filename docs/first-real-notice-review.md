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

## Regra editorial

O PDF de abertura foi extraído com evidências por página. O registro ainda não pode ser publicado, gerar curso ou alterar estimativa de estudo enquanto não for arquivado no bucket privado e aprovado na fila editorial. Retificações e publicações posteriores devem ser comparadas antes da aprovação.

## Automação diária

O agendador diário chama a rota protegida `/api/cron/coletar-fontes` às 11:00 UTC, equivalente a 08:00 em São Paulo enquanto o horário local for UTC-3. Ele começa pela CLIC da PMSP, cuja estrutura já possui coletor e persistência auditável. Santo André, São Bernardo, Mauá e Ribeirão Pires estão cadastrados como fontes oficiais, mas só entram no disparo depois de receberem adaptadores específicos e testes de contrato. Diadema, São Caetano do Sul e Rio Grande da Serra aguardam validação de URL de concursos.

Para ativar o agendamento em produção, a Vercel precisa de `CRON_SECRET`, igual ao segredo que ela envia no cabeçalho Authorization. O segredo nunca deve aparecer no código, nos logs ou no GitHub.
