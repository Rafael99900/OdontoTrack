# Auditoria de frontend publicado

Data da execução: 6 de setembro de 2026

Ambiente auditado: `https://odonto-track.vercel.app/`

## Conclusão executiva

A página principal publicada é um protótipo de navegação em memória. Ela não é
o frontend operacional das rotas autenticadas em `/area`, `/area/editais` e
`/area/cursos`. Os dados, progresso, IA, vídeo, áudio e PDF exibidos nessa
rota principal não usam a base de produção.

O problema não é apenas visual. A implementação em `src/app/page.tsx` mantém
o estado local `tela`, `aba`, `respondeu` e `iaAberta`, e os conteúdos de Santo
André, Cariologia, percentuais e datas aparecem como literais no componente.

## Percurso executado

1. Abertura da página inicial e acionamento de `Entrar na minha área`.
2. Dashboard, botão de perfil, análise do edital e criação de trilha.
3. Navegação Cursos, Minha trilha, aula e abas de conteúdo.
4. Assistente de IA, sugestões, campo de pergunta e envio.
5. Botões de vídeo, PDF, áudio, prompt e questão.
6. Inspeção visual em desktop, 360 x 800 e 768 x 1024.

## Itens simulados ou sem integração

| ID | Área | Evidência | Impacto |
| --- | --- | --- | --- |
| FQA-01 | Aplicação principal | `src/app/page.tsx` troca telas somente com `setTela(...)`. Não consulta API, Supabase ou as rotas reais. | Crítico |
| FQA-02 | Dashboard | Concurso Santo André, datas, vagas, remuneração, percentuais e atualizações são textos fixos. | Crítico |
| FQA-03 | Edital | Fonte oficial é uma âncora sem `href`; versão, fatos, estimativa e matérias são valores fixos. | Crítico |
| FQA-04 | Criação de trilha | `Criar minha trilha` apenas muda para a tela local `trilha`; não cria curso nem registra proprietário, módulos ou progresso. | Crítico |
| FQA-05 | Cursos e progresso | Curso Santo André, 23 capítulos, 34% e cartões são estáticos. Não há persistência de progresso nessa página. | Alto |
| FQA-06 | IA do cabeçalho | Sugestões não possuem ação. O formulário usa `preventDefault`, o campo não é controlado e Enviar não chama `/api/ia/perguntar`. | Crítico |
| FQA-07 | Vídeo | O player é uma `div` com símbolo de play e texto. Não há elemento `video`, iframe, URL, controle ou evento de reprodução. | Crítico |
| FQA-08 | PDF e áudio | Os botões Abrir material em PDF e Ouvir agora não têm ação. | Crítico |
| FQA-09 | Prompt | Copiar prompt usa texto fixo para Santo André e Cariologia. Não usa edital, aula ou fontes selecionadas. | Alto |
| FQA-10 | Perfil | Ajustar perfil não possui manipulador de clique. | Médio |
| FQA-11 | Questões | A questão somente alterna a resposta correta localmente; não possui banco de questões, resposta persistida ou correção adaptativa. | Alto |
| FQA-12 | Transições | A troca de telas é instantânea, sem rota, histórico ou transição; atualizar a página retorna à entrada. | Médio |

## O que funcionou, mas somente como demonstração

- Botões de navegação exibem outras telas do mesmo componente.
- Abas Resumo, PDF, Prompt IA, Questões e Áudio alternam conteúdo local.
- A questão exibe um feedback local após o clique.
- O layout principal se reorganiza em largura de 360 px, mas continua exibindo
  dados simulados e apresenta composição de marca pouco equilibrada no topo.

## Funcionalidade real existente fora da página principal

As rotas abaixo são distintas da demonstração e possuem integração de servidor:

- `/area`: sessão autenticada pelo Supabase.
- `/area/editais`: catálogo de edital aprovado.
- `/area/editais/maua`: análise vinculada à evidência oficial.
- `/area/cursos`: criação persistida da trilha de Mauá, módulos, aulas e
  progresso.
- `/api/ia/perguntar`: Gemini autenticado e validado na aula SUS.

Essas rotas não estão conectadas à experiência exibida em `/`.

## Defeitos visuais observados

- A versão mobile do dashboard principal esconde a navegação, mas mantém uma
  marca com hierarquia visual inadequada no cabeçalho.
- Não existem transições de tela ou indicação de carregamento.
- A página principal possui conteúdo de protótipo e linguagem de demonstração,
  incompatíveis com uma experiência de produção.

## Ordem recomendada de correção

1. Substituir a página principal demonstrativa pela aplicação real autenticada
   ou por uma landing page que direcione para `/login`.
2. Unificar Dashboard, Edital, Curso e Aula em rotas reais com dados do
   Supabase, sem estado local de navegação.
3. Conectar IA contextual, PDF, áudio e vídeos somente pelos registros
   editoriais aprovados.
4. Implementar persistência de progresso, respostas e perfil.
5. Refazer identidade visual, navegação responsiva e transições após a
   substituição da base demonstrativa.
