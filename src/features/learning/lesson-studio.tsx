"use client";

import { useState } from "react";
import { susLessonProduction } from "@/lib/learning/maua-dentistry-production";

export function LessonStudio() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function askAi() {
    if (!question.trim()) return;
    setLoading(true); setAnswer(null);
    const response = await fetch("/api/ia/perguntar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, lessonKey: "maua-sus" }) });
    const body = await response.json() as { answer?: string; error?: string };
    setAnswer(body.answer ?? body.error ?? "Não foi possível responder agora."); setLoading(false);
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
    <div className="lesson-questions" data-cy="lesson-questions"><h3>Questões autorais para revisão</h3>{susLessonProduction.questions.map((item, index) => <details key={item.prompt}><summary>{index + 1}. {item.prompt}</summary><ol type="A">{item.options.map((option) => <li key={option}>{option}</li>)}</ol><p><b>Gabarito:</b> {String.fromCharCode(65 + item.correctOptionIndex)}. {item.explanation}</p></details>)}</div>
    <div className="lesson-ai" data-cy="lesson-contextual-ai"><h3>Pergunte à IA sobre esta aula</h3><p>A resposta recebe somente o contexto e as fontes revisadas desta aula.</p><label htmlFor="lesson-ai-question">Sua pergunta</label><textarea id="lesson-ai-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Como diferenciar universalidade e integralidade?" data-cy="lesson-ai-question" /><button type="button" onClick={askAi} disabled={loading} aria-busy={loading} data-cy="lesson-ai-send">{loading ? "Consultando" : "Perguntar"}</button>{answer && <p className="lesson-ai-answer" role="status" aria-live="polite" data-cy="lesson-ai-answer">{answer}</p>}</div>
  </section>;
}
