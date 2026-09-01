# Pipeline editorial de cursos

## Regra de entrada

Um curso só pode ser produzido quando a versão do edital estiver aprovada editorialmente. O sistema mantém o rascunho de módulos e aulas separado da publicação. Dados pendentes, retificações não comparadas ou evidências sem página impedem a publicação.

## Ordem de produção

1. Criar curso a partir da versão aprovada do edital.
2. Transformar cada matéria em módulos e aulas com páginas de evidência.
3. Selecionar vídeos por licença, disponibilidade e adequação didática.
4. Produzir PDF com layout OdontoTrack, imagens referenciadas e fontes ao final.
5. Gerar áudio e prompt de IA como apoio, identificados como material complementar.
6. Criar questões com explicação e referências revisadas.
7. Revisar e publicar cada ativo de forma independente.

## Critérios para mídia e PDF

Vídeos externos não são copiados nem baixados pelo sistema. O editor registra a URL, a autoria, a licença ou permissão aplicável e a data de verificação. PDFs têm referências de imagem no ponto de uso e pelo menos uma fonte bibliográfica ao final. Conteúdo gerado por IA deve ter fontes verificáveis e revisão humana antes de publicação.

## Segurança

Todas as tabelas de produção são privadas por padrão. Apenas operações de servidor podem gravar cursos e ativos. A futura publicação para o aluno deverá usar uma função controlada que confira status do edital, evidências, referências e revisão editorial.

## Implementação da primeira prévia

A primeira prévia de conteúdo está registrada em `src/lib/learning/maua-dentistry-production.ts`. Ela vincula explicitamente o Anexo II, página 31, do edital de Mauá à Lei nº 8.080/1990. A página de cursos apresenta resumo, questões autorais, prompt para NotebookLM, áudio pelo dispositivo, link UNA-SUS e PDF editorial. Consulte `docs/first-course-content-delivery.md` para a matriz de fontes e as regras de publicação.

A rota de IA exige usuário autenticado e recebe uma chave de aula. O servidor monta o contexto e as fontes permitidas. O cliente não pode trocar URLs de fonte nem escolher um contexto de edital arbitrário.
