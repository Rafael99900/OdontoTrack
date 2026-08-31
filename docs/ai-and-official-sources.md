# IA inicial e fontes oficiais de concursos

## Decisão de IA

O provedor inicial será o Gemini Developer API, usando o modelo `gemini-2.5-flash` dentro do nível gratuito disponível. A integração fica em `src/lib/ai/gemini.ts` e é chamada somente pelo endpoint do servidor `src/app/api/ia/perguntar/route.ts`. A chave fica em `GEMINI_API_KEY` na Vercel e nunca no navegador, repositório ou PDF.

O nível gratuito possui limites e o provedor informa que o conteúdo pode ser usado para melhorar seus produtos. Portanto, o assistente não recebe dados pessoais desnecessários, anotações privadas inteiras, documentos sensíveis ou credenciais. Para o lançamento, haverá limite diário por usuário e aviso de indisponibilidade quando a cota acabar. O adaptador permite substituir o fornecedor sem alterar as páginas.

## Como o sistema encontra fontes de concurso

1. A lista inicial é cadastrada em `src/lib/sources/official-sources.ts` e depois migra para a tabela `sources` no Supabase.
2. Cada município tem ao menos um portal de concursos e um Diário Oficial verificado manualmente.
3. O coletor salva o arquivo oficial, URL, hash, data de captura e versão.
4. O filtro prioriza cargos com escolaridade média ou superior e termos como Cirurgião Dentista, Odontólogo, Técnico em Saúde Bucal e Auxiliar em Saúde Bucal.
5. Todo registro passa por revisão antes de aparecer como verificado no dashboard.
6. A banca só é usada como fonte complementar, nunca substitui o documento oficial do município.

As primeiras fontes cadastradas são os portais oficiais da Prefeitura de São Paulo, CLIC, Santo André, São Bernardo do Campo e São Caetano do Sul. O catálogo será ampliado para Diadema, Mauá, Ribeirão Pires, Rio Grande da Serra, Guarulhos, Osasco e demais municípios da região depois de validar cada endereço e frequência.

## Convenção de testes

Todo componente interativo recebe `data-cy` estável. O padrão é `dominio-acao`, por exemplo `analyze-notice`, `ai-assistant-toggle` e `courses-catalog`. Textos, classes CSS e posição visual não serão usados como seletor de QA. O mapa inicial está em `src/lib/qa/selectors.ts`.
