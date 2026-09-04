"use client";
import { useState } from "react";

export function CourseLaunch({ canCreate }: { canCreate: boolean }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function createCourse() {
    setLoading(true); setStatus(null);
    const response = await fetch("/api/cursos/maua-odontologia", { method: "POST" });
    const body = await response.json() as { course?: { title: string }; error?: string };
    setStatus(body.course ? `Trilha criada: ${body.course.title}.` : body.error ?? "Não foi possível criar a trilha."); setLoading(false);
  }
  return <div className="course-launch" data-cy="course-launch">
    <button type="button" className="primario" disabled={!canCreate || loading} onClick={createCourse} data-cy="course-create-button">{loading ? "Criando trilha" : "Criar minha trilha"}</button>
    {status && <p role="status" aria-live="polite" data-cy="course-launch-status">{status}</p>}
  </div>;
}
