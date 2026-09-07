"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { courseSources, lessonKeyForTitle, mauaCourseContent, type CourseLessonKey } from "@/lib/learning/maua-course-content";
import { mauaYouTubeVideos } from "@/lib/learning/youtube-curation";
import { OfficialYouTubePlayer } from "@/features/learning/official-youtube-player";

type Lesson = { id: string; title: string; objective: string; position: number };
type Module = { id: string; title: string; position: number; learning_lessons: Lesson[] };
type Course = { id: string; title: string; status: string; learning_modules: Module[]; progress?: { lesson_id: string; completed_at: string | null }[] };

export function CourseProgress() {
  const [course, setCourse] = useState<Course | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/cursos/maua-odontologia").then(async (response) => {
    if (!response.ok) return;
    const body = await response.json() as { course?: Course | null };
    const loaded = body.course ?? null;
    setCourse(loaded);
    if (loaded) {
      setCompleted(new Set((loaded.progress ?? []).filter((item) => item.completed_at).map((item) => item.lesson_id)));
      setActiveId(loaded.learning_modules.flatMap((module) => module.learning_lessons)[0]?.id ?? null);
    }
  }).catch(() => undefined); }, []);

  const lessons = useMemo(() => course?.learning_modules.slice().sort((a, b) => a.position - b.position).flatMap((module) => module.learning_lessons.slice().sort((a, b) => a.position - b.position)) ?? [], [course]);
  const active = lessons.find((lesson) => lesson.id === activeId) ?? lessons[0];
  const key = active ? lessonKeyForTitle(active.title) : null;
  const content = key ? mauaCourseContent[key] : null;

  async function toggle(lessonId: string) {
    const done = !completed.has(lessonId); setSaving(true);
    const response = await fetch("/api/cursos/progresso", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, completed: done }) });
    setSaving(false);
    if (!response.ok) { setMessage("Não foi possível salvar o progresso. Tente novamente."); return; }
    setCompleted((current) => { const next = new Set(current); done ? next.add(lessonId) : next.delete(lessonId); return next; });
    setMessage(done ? "Aula marcada como concluída e salva na sua conta." : "Aula reaberta para revisão.");
  }

  async function answerQuestion(optionIndex: number) {
    if (!key) return; setSelectedOption(optionIndex); setSaving(true); setFeedback(null);
    const response = await fetch("/api/cursos/questoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonKey: key, questionKey: "1", selectedOptionIndex: optionIndex }) });
    const body = await response.json() as { correct?: boolean; error?: string };
    setSaving(false);
    setFeedback(body.error ?? (body.correct ? "Resposta correta. Sua tentativa foi salva." : `Resposta registrada. ${content?.question.explanation ?? "Revise o material antes de seguir."}`));
  }

  if (!course) return <section className="course-runtime" data-cy="course-runtime"><p>Crie sua trilha para liberar as aulas privadas.</p></section>;
  const percent = lessons.length ? Math.round((completed.size / lessons.length) * 100) : 0;
  const video = key ? mauaYouTubeVideos[key] : null;

  return <section className="course-runtime" data-cy="course-runtime">
    <span className="tag">MINHA TRILHA</span><h2>{course.title}</h2><p>{percent}% concluído, {completed.size} de {lessons.length} aulas.</p><progress value={completed.size} max={lessons.length || 1} aria-label="Progresso da trilha" />
    <div className="course-player-layout">
      <nav aria-label="Aulas da trilha" className="course-lesson-nav" data-cy="course-lesson-navigation">
        {course.learning_modules.slice().sort((a, b) => a.position - b.position).map((module) => <div key={module.id}><h3>{module.title}</h3>{module.learning_lessons.slice().sort((a, b) => a.position - b.position).map((lesson) => <button key={lesson.id} type="button" className={lesson.id === active?.id ? "active" : ""} onClick={() => { setActiveId(lesson.id); setSelectedOption(null); setFeedback(null); }} data-cy={`course-open-lesson-${lesson.id}`}><span>{completed.has(lesson.id) ? "✓" : "○"}</span>{lesson.title}</button>)}</div>)}
      </nav>
      {active && content && <article className="runtime-lesson-detail" data-cy="course-active-lesson">
        <span className="tag">AULA {lessons.findIndex((lesson) => lesson.id === active.id) + 1}</span><h3>{active.title}</h3><p><b>Objetivo:</b> {active.objective}</p><p>{content.summary}</p>
        <div className="lesson-tools"><a className="secundario" href={content.pdf} target="_blank" rel="noreferrer" data-cy="course-lesson-pdf">Abrir PDF editorial</a><button type="button" className="secundario" onClick={() => { const utterance = new SpeechSynthesisUtterance(content.audio); utterance.lang = "pt-BR"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); }} data-cy="course-lesson-audio">Ouvir resumo</button><button className="primario" type="button" disabled={saving} onClick={() => toggle(active.id)} data-cy="course-lesson-progress">{completed.has(active.id) ? "Reabrir para revisão" : "Marcar como concluída"}</button></div>
        {video && <OfficialYouTubePlayer video={video} />}
        <section className="lesson-questions" data-cy="course-lesson-question"><h4>Questão de revisão</h4><p>{content.question.prompt}</p><div className="question-options" role="radiogroup" aria-label="Alternativas da questão de revisão">{content.question.options.map((option, index) => <button key={option} type="button" role="radio" aria-checked={selectedOption === index} className={selectedOption === index ? "selected" : ""} disabled={saving} onClick={() => answerQuestion(index)} data-cy={`course-question-option-${index + 1}`}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>{feedback && <p role="status" aria-live="polite" className="question-feedback">{feedback}</p>}</section>
        <p className="lesson-disclaimer">Fontes: {courseSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>).reduce<ReactNode[]>((all, link, index) => index ? [...all, ", ", link] : [link], [])}.</p>
      </article>}
    </div>{message && <p role="status" aria-live="polite" data-cy="course-progress-status">{message}</p>}
  </section>;
}
