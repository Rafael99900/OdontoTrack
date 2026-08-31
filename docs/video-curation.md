# Curadoria e origem de vídeos

## Regra de origem

O produto não pode baixar, republicar ou vender vídeos de terceiros sem licença. Cada vídeo precisa ter origem, URL, autor ou canal, licença, tema, duração, idioma, data de validação e situação de incorporação registrados em `lesson_assets`.

## Fontes por etapa

| Etapa | Fonte | Uso permitido no produto |
| --- | --- | --- |
| MVP | Canal próprio no YouTube | Vídeo incorporado e organizado em trilhas |
| MVP | Vídeos de instituições públicas ou Creative Commons | Incorporar somente após conferir licença e permissão |
| MVP | Professor parceiro com termo de uso | Incorporar ou hospedar conforme contrato |
| Posterior | Biblioteca de vídeo própria | Hospedar no Storage ou provedor de vídeo contratado |
| Proibido | Cursos pagos de terceiros, cópia de aulas, download de YouTube | Não usar sem autorização expressa |

## Como encontrar vídeos adequados

O curador pesquisa no YouTube, canais institucionais de universidades, órgãos públicos, SUS, Ministério da Saúde, escolas de governo e canais de professores que autorizem a incorporação. A busca usa a submatéria, a banca quando relevante e termos como "aula completa", "odontologia", "SUS" ou "saúde coletiva".

Um resultado não entra automaticamente na aula. Ele passa pela fila `video_candidates` com estes campos:

```text
lesson_id
provider
external_url
embed_url
channel_name
author_name
license_status
rights_evidence_url
topic_coverage
duration_seconds
quality_score
review_status
reviewed_at
```

## Nota de qualidade

Cada candidato recebe nota de 0 a 100. A nota exige conteúdo completo, explicação correta, áudio compreensível, resolução adequada, aderência ao tópico e permissão de uso. Só candidatos aprovados entram em uma trilha. O aluno sempre vê o autor, plataforma original e link de origem.

## Estratégia recomendada

Para começar, use uma combinação de vídeos próprios curtos e incorporados autorizados. Para temas de alta recorrência, como Português, SUS, saúde coletiva e fundamentos de Odontologia, produza vídeos próprios. Isso dá continuidade de linguagem e reduz o risco de material sair do ar. Para temas específicos, use vídeos externos apenas como complemento, sempre com uma aula HTML e PDF próprios que sustentem a trilha mesmo se o vídeo for removido.

## Fallback

Se um vídeo ficar indisponível, a aula mantém resumo, PDF, questões e áudio. O sistema avisa o administrador e apresenta um substituto somente depois de nova aprovação.
