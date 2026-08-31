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
| Prova, remuneração, requisitos e conteúdo | Não preenchidos | Dependem do PDF de abertura arquivado e revisado |

Fontes oficiais consultadas em 31/08/2026:

1. https://www.maua.sp.gov.br/Concursos/Detalhes/2025/11
2. https://dom.maua.sp.gov.br/DOM/Index/3942

## Regra editorial

Esse registro não pode ser publicado, gerar curso ou alterar estimativa de estudo enquanto o PDF de abertura não tiver sido arquivado no bucket privado, extraído com páginas de evidência e aprovado na fila editorial. Retificações e publicações posteriores devem ser comparadas antes da aprovação.

## Automação diária

O agendador diário chama a rota protegida `/api/cron/coletar-fontes` às 11:00 UTC, equivalente a 08:00 em São Paulo enquanto o horário local for UTC-3. Ele começa pela CLIC da PMSP, cuja estrutura já possui coletor e persistência auditável. Santo André, São Bernardo, Mauá e Ribeirão Pires estão cadastrados como fontes oficiais, mas só entram no disparo depois de receberem adaptadores específicos e testes de contrato. Diadema, São Caetano do Sul e Rio Grande da Serra aguardam validação de URL de concursos.

Para ativar o agendamento em produção, a Vercel precisa de `CRON_SECRET`, igual ao segredo que ela envia no cabeçalho Authorization. O segredo nunca deve aparecer no código, nos logs ou no GitHub.
