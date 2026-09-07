"use client";

import { useState, type FormEvent } from "react";

export function CatalogAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true); setAnswer(null);
    const response = await fetch("/api/ia/perguntar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question }) });
    const body = await response.json() as { answer?: string; error?: string };
    setAnswer(body.answer ?? body.error ?? "Não foi possível responder agora."); setLoading(false);
  }
  return <aside className={open ? "catalog-ai open" : "catalog-ai"} aria-label="Assistente OdontoTrack">
    <button type="button" className="catalog-ai-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} data-cy="global-ai-toggle"><span aria-hidden="true">✦</span> IA</button>
    {open && <div className="catalog-ai-panel" data-cy="global-ai-panel"><div className="catalog-ai-title"><div><span className="tag">IA COM FONTES</span><h2>Assistente OdontoTrack</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar assistente">×</button></div><p>Posso orientar a navegação e explicar o material aprovado. Para fatos de edital, confira sempre a fonte indicada.</p><form onSubmit={submit}><label htmlFor="catalog-ai-question">Sua pergunta</label><textarea id="catalog-ai-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Como organizar meus estudos para um edital de odontologia?" /><button className="primario" disabled={loading}>{loading ? "Consultando" : "Perguntar"}</button></form>{answer && <p className="catalog-ai-answer" role="status" aria-live="polite">{answer}</p>}<a href="/area/cursos#lesson-studio">Abrir IA contextual da aula SUS</a></div>}
  </aside>;
}
