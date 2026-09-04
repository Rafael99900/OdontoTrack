"use client";
import { useEffect, useState } from "react";

type Lesson = { id: string; title: string; objective: string; position: number };
type Module = { id: string; title: string; position: number; learning_lessons: Lesson[] };
type Course = { id: string; title: string; status: string; learning_modules: Module[] };

export function CourseProgress() {
  const [course, setCourse] = useState<Course | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { fetch("/api/cursos/maua-odontologia").then(async (response) => {
    if (!response.ok) return; const body = await response.json() as { course?: Course | null }; setCourse(body.course ?? null);
  }).catch(() => undefined); }, []);
  async function toggle(lessonId: string) {
    const next = new Set(completed); const done = !next.has(lessonId);
    const response = await fetch("/api/cursos/progresso", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, completed: done }) });
    if (!response.ok) { setMessage("Não foi possível salvar o progresso."); return; }
    done ? next.add(lessonId) : next.delete(lessonId); setCompleted(next); setMessage(done ? "Aula marcada como concluída." : "Aula reaberta para revisão.");
  }
  if (!course) return null;
  const lessons = course.learning_modules.flatMap((module) => module.learning_lessons);
  const percent = lessons.length ? Math.round((completed.size / lessons.length) * 100) : 0;
  return <section className="course-runtime" data-cy="course-runtime"><span className="tag">MINHA TRILHA</span><h2>{course.title}</h2><p>{percent}% concluído, {completed.size} de {lessons.length} aulas.</p><progress value={completed.size} max={lessons.length} aria-label="Progresso da trilha" />
    {course.learning_modules.sort((a, b) => a.position - b.position).map((module) => <article key={module.id}><h3>{module.title}</h3>{module.learning_lessons.sort((a, b) => a.position - b.position).map((lesson) => <div className="runtime-lesson" key={lesson.id}><div><b>{lesson.title}</b><small>{lesson.objective}</small></div><button type="button" onClick={() => toggle(lesson.id)} data-cy={`lesson-progress-${lesson.id}`}>{completed.has(lesson.id) ? "Concluída" : "Marcar concluída"}</button></div>)}</article>)}
    {message && <p role="status" aria-live="polite" data-cy="course-progress-status">{message}</p>}</section>;
}
