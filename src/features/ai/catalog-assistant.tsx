"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type AiSource = { label: string; url: string; page?: number };
type AiResponse = { answer?: string; error?: string; sources?: AiSource[] };

export function CatalogAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<AiSource[]>([]);
  const [loading, setLoading] = useState(false);
  const questionId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    setSources([]);
    try {
      const response = await fetch("/api/ia/perguntar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = await response.json() as AiResponse;
      setAnswer(body.answer ?? body.error ?? "Não foi possível responder agora.");
      setSources(body.sources ?? []);
    } catch {
      setAnswer("Não foi possível conectar ao assistente agora. Tente novamente em alguns instantes.");
    } finally {
      setLoading(false);
    }
  }

  return <aside className={open ? "catalog-ai open" : "catalog-ai"} aria-label="Assistente OdontoTrack">
    <button type="button" className="catalog-ai-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} data-cy="global-ai-toggle"><span aria-hidden="true">✦</span> IA</button>
    {open && <div className="catalog-ai-panel" role="dialog" aria-modal="true" aria-labelledby={`${questionId}-title`} data-cy="global-ai-panel">
      <div className="catalog-ai-title"><div><span className="tag">IA COM FONTES</span><h2 id={`${questionId}-title`}>Assistente OdontoTrack</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar assistente">×</button></div>
      <p>Posso orientar a navegação e explicar o material aprovado. Para fatos de edital, confira sempre a fonte indicada.</p>
      <form onSubmit={submit}><label htmlFor={questionId}>Sua pergunta</label><textarea ref={inputRef} id={questionId} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Como organizar meus estudos para um edital de odontologia?" /><button className="primario" disabled={loading} aria-busy={loading}>{loading ? "Consultando" : "Perguntar"}</button></form>
      {answer && <div className="catalog-ai-result" role="status" aria-live="polite" data-cy="global-ai-answer"><p className="catalog-ai-answer">{answer}</p>{sources.length > 0 && <section className="catalog-ai-sources" aria-label="Fontes consultadas"><h3>Fontes consultadas</h3><ul>{sources.map((source) => <li key={`${source.label}-${source.url}`}><a href={source.url} target="_blank" rel="noreferrer">{source.label}{source.page ? `, página ${source.page}` : ""}</a></li>)}</ul></section>}</div>}
      <a href="/area/cursos#lesson-studio">Abrir IA contextual da aula SUS</a>
    </div>}
  </aside>;
}
