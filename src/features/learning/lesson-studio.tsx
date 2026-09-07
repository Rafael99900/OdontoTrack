"use client";

import { useState } from "react";
import { susLessonProduction } from "@/lib/learning/maua-dentistry-production";

type AiSource = { label: string; url: string; page?: number };

export function LessonStudio() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<AiSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [questionFeedback, setQuestionFeedback] = useState<Record<number, string>>({});
  const [savingQuestion, setSavingQuestion] = useState<number | null>(null);

  async function answerQuestion(questionIndex: number, optionIndex: number) {
    setSelectedOptions((current) => ({ ...current, [questionIndex]: optionIndex }));
    setSavingQuestion(questionIndex);
    const response = await fetch("/api/cursos/questoes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonKey: "sus", questionKey: String(questionIndex + 1), selectedOptionIndex: optionIndex }),
    });
    const body = await response.json() as { correct?: boolean; error?: string };
    const item = susLessonProduction.questions[questionIndex];
    setQuestionFeedback((current) => ({
      ...current,
      [questionIndex]: body.error ?? (body.correct ? "Resposta correta. Progresso salvo." : `Revise: a resposta esperada é ${String.fromCharCode(65 + item.correctOptionIndex)}.`),
    }));
    setSavingQuestion(null);
  }

  async function askAi() {
    if (!question.trim()) return;
    setLoading(true); setAnswer(null); setAiSources([]);
    try {
      const response = await fetch("/api/ia/perguntar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, lessonKey: "maua-sus" }) });
      const body = await response.json() as { answer?: string; error?: string; sources?: AiSource[] };
      setAnswer(body.answer ?? body.error ?? "Não foi possível responder agora.");
      setAiSources(body.sources ?? []);
    } catch {
      setAnswer("Não foi possível conectar ao assistente agora. Tente novamente em alguns instantes.");
    } finally { setLoading(false); }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(susLessonProduction.notebookPrompt);
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  }

  function playAudio() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(susLessonProduction.audioScript);
    utterance.lang = "pt-BR"; window.speechSynthesis.speak(utterance);
  }

  return <section className="lesson-studio" data-cy="lesson-studio">
    <span className="tag">PRÉVIA EDITORIAL</span><h2>{susLessonProduction.title}</h2>
    <p data-cy="lesson-objective"><b>Objetivo:</b> {susLessonProduction.objective}</p>
    {susLessonProduction.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <div className="lesson-tools" data-cy="lesson-media-tools">
      <a className="secundario" href={susLessonProduction.media[0].externalUrl} target="_blank" rel="noreferrer" data-cy="lesson-curated-media">Abrir curso complementar UNA-SUS</a>
      <button type="button" className="secundario" onClick={playAudio} aria-label="Ouvir o resumo desta aula" data-cy="lesson-play-audio">Ouvir resumo</button>
      <button type="button" className="secundario" onClick={copyPrompt} data-cy="lesson-copy-notebook-prompt">{copied ? "Prompt copiado" : "Copiar prompt para NotebookLM"}</button>
      <a className="secundario" href="/editorial-assets/sus-principios-diretrizes-estrutura.pdf" target="_blank" rel="noreferrer" data-cy="lesson-open-pdf">Abrir PDF editorial</a>
    </div>
    <p className="lesson-disclaimer">O curso externo é aberto no site de origem. O áudio usa a voz disponível no dispositivo. Ambos são complementares e não substituem as fontes listadas.</p>
    <div className="lesson-questions" data-cy="lesson-questions"><h3>Questões autorais para revisão</h3><p>Escolha uma alternativa. Sua resposta é registrada na sua trilha.</p>{susLessonProduction.questions.map((item, index) => <article className="question-card" key={item.prompt}><p><b>{index + 1}. {item.prompt}</b></p><div className="question-options" role="radiogroup" aria-label={`Alternativas da questão ${index + 1}`}>{item.options.map((option, optionIndex) => <button type="button" role="radio" aria-checked={selectedOptions[index] === optionIndex} className={selectedOptions[index] === optionIndex ? "selected" : ""} onClick={() => answerQuestion(index, optionIndex)} disabled={savingQuestion === index} key={option} data-cy={`lesson-question-${index + 1}-option-${optionIndex + 1}`}><b>{String.fromCharCode(65 + optionIndex)}.</b> {option}</button>)}</div>{questionFeedback[index] && <p role="status" aria-live="polite" className="question-feedback" data-cy={`lesson-question-${index + 1}-feedback`}>{questionFeedback[index]}</p>}<details><summary>Ver explicação e fonte</summary><p>{item.explanation}</p><a href={item.sources[0].url} target="_blank" rel="noreferrer">Consultar fonte oficial</a></details></article>)}</div>
    <div className="lesson-ai" data-cy="lesson-contextual-ai"><h3>Pergunte à IA sobre esta aula</h3><p>A resposta recebe somente o contexto e as fontes revisadas desta aula.</p><label htmlFor="lesson-ai-question">Sua pergunta</label><textarea id="lesson-ai-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Como diferenciar universalidade e integralidade?" data-cy="lesson-ai-question" /><button type="button" onClick={askAi} disabled={loading} aria-busy={loading} data-cy="lesson-ai-send">{loading ? "Consultando" : "Perguntar"}</button>{answer && <div role="status" aria-live="polite" data-cy="lesson-ai-answer"><p className="lesson-ai-answer">{answer}</p>{aiSources.length > 0 && <section className="lesson-ai-sources" aria-label="Fontes consultadas pela IA"><h4>Fontes consultadas</h4><ul>{aiSources.map((source) => <li key={`${source.label}-${source.url}`}><a href={source.url} target="_blank" rel="noreferrer">{source.label}{source.page ? `, página ${source.page}` : ""}</a></li>)}</ul></section>}</div>}</div>
  </section>;
}
