# Evidências de QA, responsividade e acessibilidade

Atualizado em 01/09/2026. Este documento descreve o que já foi verificado no código. Ele não substitui uma execução em navegador real nem transforma conteúdos ainda editoriais em conteúdo publicado.

## Jornada coberta

| Fluxo | Viewports-alvo | Evidência automatizada | Resultado atual |
|---|---|---|---|
| Login e callback | 360 x 800, 412 x 915, 768 x 1024, 1280 x 800 | `scripts/test-interface-qa-contract.mjs` e `scripts/test-auth-contract.mjs` | Estrutura e contrato aprovados; entrega real de e-mail permanece em validação operacional. |
| Área privada | 360 x 800, 768 x 1024, 1280 x 800 | `scripts/test-interface-qa-contract.mjs` | Seletores de navegação e proteção de rota cobertos por contrato. |
| Revisão editorial | 360 x 800, 768 x 1024, 1280 x 800 | `scripts/test-interface-qa-contract.mjs` | Cartão de edital, evidências e checklist possuem seletores estáveis; aprovação persistida é outro aceite. |
| Curso e prévia de aula | 360 x 800, 800 x 1280, 1280 x 800 | `scripts/test-interface-qa-contract.mjs`, `scripts/test-learning-content.mjs` | Recursos de aula, PDF, áudio, prompt e IA possuem pontos de teste; publicação depende da revisão editorial. |

O viewport de 800 x 1280 representa o Galaxy Tab S6 Lite em retrato. Os tamanhos 360 e 412 representam celulares Android e iPhones atuais. A checagem visual em dispositivo ou navegador real continua obrigatória antes de classificar OT-31 ou OT-43 como concluídos.

## Verificação publicada

Em 01/09/2026, a rota publicada de login foi inspecionada em 360 x 800, 800 x 1280 e 1280 x 800. Em todos os tamanhos, o documento manteve `scrollWidth` igual a `clientWidth`, sem rolagem horizontal, e expôs o título e os três controles esperados: e-mail, envio de link e entrada Google. Esta é uma evidência de estrutura e não substitui a navegação autenticada em dispositivo real.

## Controles de acessibilidade implementados

- Foco de teclado visível em links, botões, campos, área de texto e itens expansíveis.
- Alvos interativos com altura mínima de 44 px.
- Preferência de redução de movimento respeitada.
- Campo de e-mail com rótulo explícito, preenchimento automático e descrição de ajuda.
- Sucesso e falha de autenticação anunciados por região viva.
- Botões e links críticos mantêm `data-cy` estável, sem depender de texto, posição ou classe visual.
- Fluxos de curso, revisão e área privada permanecem em uma coluna nos breakpoints móveis, reduzindo risco de rolagem horizontal.

## Execução local

```powershell
node scripts/test-interface-qa-contract.mjs
node scripts/test-auth-contract.mjs
node scripts/test-learning-content.mjs
npm run build
```

## Limites conhecidos e próximo aceite

Não há suíte E2E de navegador instalada no projeto. Por isso, este contrato impede regressões estruturais, mas não substitui testes de tabulação, leitor de tela e capturas reais. OT-31 e OT-43 devem permanecer **Em validação** até a execução documentada nos viewports-alvo e a confirmação de que não há rolagem horizontal.

Nenhum método de pagamento é utilizado, solicitado ou necessário por esta frente de QA.
