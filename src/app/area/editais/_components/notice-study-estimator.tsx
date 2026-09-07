"use client";

import { useMemo, useState } from "react";

type Props = { subjectCount: number; defaultHoursPerWeek: number };

export function NoticeStudyEstimator({ subjectCount, defaultHoursPerWeek }: Props) {
  const [hoursPerWeek, setHoursPerWeek] = useState(defaultHoursPerWeek);
  const [coverage, setCoverage] = useState<"essencial" | "completa">("completa");
  const estimatedHours = useMemo(() => {
    const base = Math.max(32, subjectCount * 8);
    return coverage === "completa" ? Math.round(base * 1.35) : base;
  }, [coverage, subjectCount]);
  const weeks = Math.max(1, Math.ceil(estimatedHours / Math.max(1, hoursPerWeek)));

  return <article className="study-estimator" data-cy="notice-study-estimator">
    <span className="tag">PLANEJAMENTO PESSOAL</span>
    <h2>Estimativa de estudo</h2>
    <p>Calculada a partir de {subjectCount} tópico{subjectCount === 1 ? "" : "s"} aprovado{subjectCount === 1 ? "" : "s"} no edital. É uma referência de primeira cobertura, não uma previsão de aprovação.</p>
    <div className="estimator-controls">
      <label htmlFor="hours-per-week">Horas disponíveis por semana
        <input id="hours-per-week" data-cy="study-hours-per-week" type="number" min="1" max="80" value={hoursPerWeek} onChange={(event) => setHoursPerWeek(Math.min(80, Math.max(1, Number(event.target.value) || 1)))} />
      </label>
      <label htmlFor="study-coverage">Profundidade da primeira volta
        <select id="study-coverage" data-cy="study-coverage" value={coverage} onChange={(event) => setCoverage(event.target.value as "essencial" | "completa")}>
          <option value="essencial">Essencial: leitura, aula e revisão curta</option>
          <option value="completa">Completa: teoria, questões e revisão</option>
        </select>
      </label>
    </div>
    <output className="study-estimate" data-cy="study-estimate"><strong>{estimatedHours} horas</strong><span>≈ {weeks} semana{weeks === 1 ? "" : "s"} com {hoursPerWeek} h/semana</span></output>
    <small>Fórmula: 8 h por tópico como base; na cobertura completa, +35% para questões e revisão. Ajuste conforme seu domínio prévio e a proximidade da prova.</small>
  </article>;
}
