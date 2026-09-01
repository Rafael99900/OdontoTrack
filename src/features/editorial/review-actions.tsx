"use client";

import { useEffect, useState } from "react";

type QueueItem = { queue_id: string; status: "pending" | "in_review"; classification: string; review_reason: string; candidate_version_number: number };

export function EditorialReviewActions() {
  const [item, setItem] = useState<QueueItem | null>(null);
  const [message, setMessage] = useState("Carregando sua fila editorial…");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/editorial/revisoes", { cache: "no-store" })
      .then(async (response) => ({ response, payload: await response.json() }))
      .then(({ response, payload }) => {
        if (!response.ok) return setMessage(payload.error ?? "A fila editorial ainda não está disponível.");
        const first = payload.items?.[0] ?? null;
        setItem(first);
        setMessage(first ? "Fila carregada. Revise as evidências antes da decisão." : "Nenhum item aberto. A persistência do edital criará a primeira fila aqui.");
      })
      .catch(() => setMessage("Não foi possível carregar a fila editorial agora."));
  }, []);

  async function decide(decision: "in_review" | "approved" | "rejected") {
    if (!item) return;
    if ((decision === "approved" || decision === "rejected") && !note.trim()) {
      setMessage("Escreva uma nota editorial antes da decisão final.");
      return;
    }
    setLoading(true);
    const response = await fetch("/api/editorial/revisoes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ queueId: item.queue_id, decision, reviewNote: note }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) return setMessage(payload.error ?? "Não foi possível registrar a decisão.");
    if (decision === "in_review") {
      setItem({ ...item, status: "in_review" });
      setMessage("Revisão iniciada. A versão continua privada e não publicada.");
    } else {
      setItem(null);
      setMessage(decision === "approved" ? "A versão foi aprovada editorialmente e permanece não publicada." : "A versão foi rejeitada e ficou registrada na auditoria.");
    }
  }

  return <section className="editorial-decision" data-cy="editorial-review-actions">
    <span className="tag">DECISÃO RASTREÁVEL</span>
    <h2>Concluir a revisão</h2>
    <p data-cy="editorial-review-feedback">{message}</p>
    {item && <>
      <div className="editorial-queue-meta">Versão {item.candidate_version_number} · {item.classification.replaceAll("_", " ")}</div>
      {item.status === "pending" ? <button className="secundario" type="button" disabled={loading} onClick={() => decide("in_review")} data-cy="editorial-start-review">Iniciar revisão</button> : <>
        <label htmlFor="editorial-note">Nota editorial</label>
        <textarea id="editorial-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Registre a conferência das fontes e eventuais ressalvas." data-cy="editorial-review-note" />
        <div className="editorial-actions">
          <button className="primario" type="button" disabled={loading} onClick={() => decide("approved")} data-cy="editorial-approve">Aprovar versão</button>
          <button className="secundario" type="button" disabled={loading} onClick={() => decide("rejected")} data-cy="editorial-reject">Rejeitar versão</button>
        </div>
      </>}
    </>}
  </section>;
}
