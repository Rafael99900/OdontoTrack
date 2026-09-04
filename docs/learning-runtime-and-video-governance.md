# Execução individual e curadoria de vídeo

## Trilha persistida

O botão "Criar minha trilha" chama uma rota autenticada. O servidor verifica que existe uma versão aprovada do edital de Mauá antes de criar qualquer registro. A criação é idempotente por usuário e versão do edital.

A estrutura persistida contém três módulos e oito aulas. Cada aula guarda a página 31 como evidência de aderência ao edital. Os materiais começam como planejados ou em revisão. A trilha nasce em revisão editorial, portanto a persistência não torna o material público.

## Progresso

O aluno pode marcar uma aula como concluída. A rota de progresso consulta no servidor se a aula pertence a um curso do próprio usuário antes de gravar. Não existe atualização de progresso usando apenas um identificador fornecido pelo navegador.

## Vídeos externos

`learning_video_candidates` guarda plataforma, URL, autor ou canal, evidência de direitos, situação da licença e revisão. A primeira referência é o curso da UNA-SUS sobre situações odontológicas comuns na atenção primária. Ela está registrada como `link_only_verified` e abre somente no site de origem.

O produto não baixa, hospeda, reproduz em iframe ou vende o conteúdo da UNA-SUS. Para incorporar algum vídeo no futuro, a curadoria deve registrar a autorização ou licença aplicável e mudar o status para `embed_permission_verified` após revisão humana.

## Aplicação da migração

Execute `supabase/migrations/010_learning_course_runtime.sql` depois da migração 008. Ela cria o progresso individual e a tabela de candidatos de vídeo, ambos privados e operados pelas rotas do servidor.
