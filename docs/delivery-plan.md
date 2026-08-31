# Plano de entrega: do protótipo ao SaaS

## Marco 1 — Base real

- Conectar aplicação à instância Supabase `odontotrack`.
- Implementar autenticação por e-mail e perfil.
- Criar schema e políticas RLS para usuário, edital, fonte, versão e trilha.
- Substituir dados demonstrativos por consultas reais.

**Aceite:** o usuário entra, cria/edita perfil e vê apenas seus dados persistidos.

## Marco 2 — Editais confiáveis

- Cadastrar fontes oficiais prioritárias.
- Criar coletor, armazenamento de PDF, hash, OCR/extrator e versionamento.
- Criar painel de revisão e alerta de retificação.

**Aceite:** um edital real é coletado, revisado, exibido com fonte/página e atualizado após uma alteração.

## Marco 3 — Decisão e trilha

- Estruturar conteúdos programáticos em taxonomia.
- Implementar cálculo de esforço transparente.
- Criar trilha persistida a partir de edital, cargo e carga semanal.
- Registrar progresso e revisões.

**Aceite:** a análise de um edital real gera uma trilha, que o aluno retoma em outro dispositivo.

## Marco 4 — Aprendizagem e IA

- Criar painel editorial para capítulos e recursos.
- Publicar PDF próprio, vídeo autorizado, áudio e questões.
- Implementar IA factual citada e tutor pedagógico separado.

**Aceite:** cada capítulo publicado contém recursos válidos e a IA distingue fatos oficiais de explicações pedagógicas.

## Controle de qualidade

- Card só avança para `Em revisão` com teste de fluxo e evidência de aceite.
- Card só avança para `Concluído` com documentação atualizada e sem problema crítico.
- O dashboard não exibirá um dado oficial como fato sem fonte e versão.
