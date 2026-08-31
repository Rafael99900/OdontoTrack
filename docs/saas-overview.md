# OdontoTrack — visão do SaaS

## Proposta

Uma plataforma individual de inteligência de concursos municipais para São Paulo, Grande ABC e municípios adjacentes. Ela transforma editais oficiais em uma decisão de estudo e, quando o aluno decide seguir, em uma trilha pedagógica por cargo e edital.

## Fluxo principal

1. O aluno cria seu perfil: escolaridade, interesse em Odontologia ou nível médio, municípios e horas semanais.
2. O dashboard mostra editais e retificações de fontes monitoradas.
3. A análise do edital mostra fatos rastreáveis: órgão, cargo, localidade, vagas, remuneração, inscrições, prova, requisitos, conteúdo, documento oficial e versão.
4. O motor de planejamento estima o esforço a partir de tópicos e horas disponíveis.
5. O aluno opta por criar uma trilha para aquele edital.
6. A trilha apresenta módulos e capítulos. Cada capítulo combina vídeo, resumo, PDF próprio, notas, prompt para Gemini Notebook, questões, IA pedagógica e áudio opcional.

## Escolha de produto

O modelo é híbrido. Há módulos-base prontos (Português, SUS, Saúde Coletiva e temas recorrentes de Odontologia), porém cada curso só é montado e ordenado após a análise de um edital específico. Isso evita criar cursos completos para concursos que não serão acompanhados e preserva uma experiência personalizada.

## Fontes e confiança

O sistema não promete cobertura total antes de cada fonte ser validada. O MVP cobre Prefeitura de São Paulo, Diário Oficial da Cidade, Grande ABC e municípios adjacentes por conectores cadastrados. Toda informação crítica requer URL oficial, versão do documento, data de captura e evidência de página/trecho. Retificações criam nova versão, nunca sobrescrevem a anterior.

## Limites iniciais

- A versão hoje publicada é um protótipo navegável; seus registros de edital e aula ainda são demonstrações locais.
- Login, coleta, PDFs, IA, questões e progresso só passam a ser funcionalmente verdadeiros quando os respectivos cards forem implementados contra o Supabase e aprovados.
- Vídeos, áudios e questões de terceiros exigem licença ou incorporação permitida.

## Critério de produto real

Uma funcionalidade só é considerada entregue quando possui persistência real, autorização/RLS, evidência de fonte quando aplicável, tratamento de erro, teste e card movido para Concluído no GitHub Project.
