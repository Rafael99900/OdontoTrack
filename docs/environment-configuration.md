# Configuração de ambientes

## Princípio

Segredos não pertencem ao repositório, ao navegador, a PDFs, logs ou mensagens de erro. O arquivo versionado [`.env.example`](../.env.example) contém apenas nomes de variáveis e valores marcadores inválidos. Cada desenvolvedor cria o próprio `.env.local`, que permanece ignorado pelo Git.

## Contrato de variáveis

| Variável | Exposição | Quando é obrigatória | Uso previsto |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Somente servidor | Para chamar `POST /api/ia/perguntar` | Chamada ao Gemini Developer API |
| `NEXT_PUBLIC_SUPABASE_URL` | Pode ir ao navegador | Quando OT-01 implementar Supabase | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pode ir ao navegador | Quando OT-01 implementar Supabase | Cliente Supabase com RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente servidor | Apenas workers ou rotas administrativas autenticadas | Operações administrativas; nunca expor ao cliente |
| `NEXT_PUBLIC_APP_URL` | Pode ir ao navegador | Quando houver callbacks, links absolutos ou e-mails | Origem canônica da aplicação |

O prefixo `NEXT_PUBLIC_` é permitido apenas para valores que podem ser públicos. Em especial, `GEMINI_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` não podem receber esse prefixo.

## Ambientes

| Ambiente | Onde configurar | Valores esperados | Regra |
| --- | --- | --- | --- |
| Local | `.env.local` | URL local em `NEXT_PUBLIC_APP_URL`; chaves do projeto de desenvolvimento | Nunca copiar arquivos locais para o Git |
| Preview | Variáveis do ambiente Preview na Vercel | Projeto Supabase isolado ou dados não produtivos; URL do preview | Não reutilizar service role de produção |
| Produção | Variáveis do ambiente Production na Vercel | Projeto e Storage produtivos; URL pública final | Alteração de segredo exige rotação no provedor e nova implantação |

Não há recursos externos criados por este repositório. URLs, chaves, projeto Supabase, buckets, políticas e integrações da Vercel precisam ser configurados pelo responsável da infraestrutura antes de cada ambiente ser ativado.

## Comportamento quando falta configuração

- O protótipo pode abrir sem segredo, pois ainda não usa Supabase.
- A rota `POST /api/ia/perguntar` valida `GEMINI_API_KEY` no servidor. Ausente, retorna HTTP `503` e a mensagem segura `Integração de IA ainda não configurada.`
- Enquanto OT-01 não integrar Supabase, as três variáveis de Supabase são reservadas e não devem ser inventadas, validadas no navegador ou exigidas no build.
- Quando Supabase for integrado, a inicialização do cliente servidor deve falhar de modo explícito e seguro se URL, anon key ou service role necessária ao contexto estiverem ausentes. A interface deve mostrar indisponibilidade genérica, sem revelar nomes de segredo ou valores.

## Procedimento local

1. Copie `.env.example` para `.env.local`.
2. Preencha somente as variáveis necessárias à tarefa em execução.
3. Rode `npm run lint` e `npm run build` antes de enviar mudanças.
4. Teste a rota de IA sem `GEMINI_API_KEY` e confirme a resposta 503. Com uma chave válida, a chamada continua exclusivamente no servidor.

## Verificações recomendadas

```powershell
git check-ignore -v .env.local
git check-ignore -v .env.example
git grep -nE "(AIza|service_role|SUPABASE_SERVICE_ROLE_KEY=.{8,})" -- ':!.env.example'
npm run lint
npm run build
```

O primeiro comando deve mostrar a regra `.env*` para `.env.local`. O segundo deve mostrar a exceção `!.env.example`, confirmando que o modelo pode ser versionado. O terceiro ignora deliberadamente o arquivo de exemplo e deve retornar código 1 enquanto não houver padrões de segredo rastreados; ele é uma verificação complementar, não substitui secret scanning no provedor Git.
