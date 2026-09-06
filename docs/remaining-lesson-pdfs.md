# PDFs editoriais das aulas restantes

Os sete arquivos abaixo completam a coleção editorial inicial da trilha de Cirurgião-Dentista 20h, do Concurso Público 01/2025 de Mauá.

| Aula | Arquivo | Fonte técnica complementar |
| --- | --- | --- |
| Atenção básica e saúde bucal | `atencao-basica.pdf` | Caderno de Atenção Básica nº 17, Ministério da Saúde |
| Exame clínico, anamnese e diagnóstico | `diagnostico.pdf` | Ficha de Atendimento Odontológico Individual, e-SUS APS |
| Prevenção, flúor e higiene dental | `prevencao.pdf` | Guia de recomendações para o uso de fluoretos no Brasil |
| Dentística, materiais e oclusão | `dentistica.pdf` | Diretrizes Clínicas para a APS, Ministério da Saúde |
| Farmacologia odontológica | `farmacologia.pdf` | Diretrizes Clínicas para a APS, Ministério da Saúde |
| Periodontia, odontopediatria e endodontia | `especialidades.pdf` | Diretrizes Clínicas para a APS, Ministério da Saúde |
| Cirurgia, urgência e biossegurança | `urgencia.pdf` | Saúde bucal na Atenção Primária à Saúde, Ministério da Saúde |

Todos estão em `public/editorial-assets/`, têm duas páginas, diagrama autoral OdontoTrack com referência, seção de fontes e nota editorial. A fonte que define o escopo é o Anexo II, página 31, do edital oficial de Mauá. As fontes técnicas são usadas para aprofundamento e não modificam o que o edital cobra.

## Revisão executada

1. Geração pelo script `scripts/generate-remaining-lesson-pdfs.py`.
2. Renderização da primeira página de cada PDF e inspeção visual de amostra.
3. Inspeção da página final com fontes.
4. Leitura com `pypdf`, confirmando duas páginas, seção de fontes e ausência do caractere de travessão.

Antes de mudar algum arquivo para publicado no banco, o responsável editorial deve revisar o conteúdo técnico da aula e registrar a aprovação do ativo.
