"use client";

import { useMemo, useState } from "react";
import type { NoticeCatalogItem } from "@/lib/notices/catalog";

type Props = { notices: NoticeCatalogItem[] };

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "data não informada" : date.toLocaleDateString("pt-BR");
}

export function OpportunityDashboard({ notices }: Props) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const cities = useMemo(() => Array.from(new Set(notices.map((notice) => notice.municipality))).sort(), [notices]);
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return notices.filter((notice) => {
      const matchingCity = city === "all" || notice.municipality === city;
      const haystack = `${notice.title} ${notice.municipality} ${notice.organizationName}`.toLocaleLowerCase("pt-BR");
      return matchingCity && (!query || haystack.includes(query));
    });
  }, [city, notices, search]);

  return <section className="opportunity-dashboard" data-cy="opportunity-dashboard">
    <div className="dashboard-toolbar">
      <div>
        <span className="tag">OPORTUNIDADES VERIFICADAS</span>
        <h1>Concursos para acompanhar.</h1>
        <p>Resultados publicados somente após conferência editorial e vínculo com a fonte oficial.</p>
      </div>
      <a className="secundario" href="/area/revisoes" data-cy="dashboard-open-editorial">Revisão editorial</a>
    </div>

    <div className="dashboard-summary" aria-label="Resumo do catálogo">
      <article><span>Editais publicados</span><strong data-cy="dashboard-notice-count">{notices.length}</strong></article>
      <article><span>Municípios com resultado</span><strong>{cities.length}</strong></article>
      <article><span>Atualização mais recente</span><strong>{notices[0] ? formatDate(notices[0].lastCapturedAt) : "Aguardando"}</strong></article>
    </div>

    <form className="dashboard-filters" onSubmit={(event) => event.preventDefault()} data-cy="dashboard-filters">
      <label htmlFor="notice-search">Buscar edital ou órgão</label>
      <input id="notice-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex.: Cirurgião-dentista ou Mauá" data-cy="dashboard-search" />
      <label htmlFor="notice-city">Município</label>
      <select id="notice-city" value={city} onChange={(event) => setCity(event.target.value)} data-cy="dashboard-city-filter">
        <option value="all">Todos os municípios</option>
        {cities.map((item) => <option value={item} key={item}>{item}</option>)}
      </select>
    </form>

    <div className="dashboard-results" aria-live="polite" data-cy="dashboard-results">
      {visible.length ? visible.map((notice) => <article key={notice.id} className="opportunity-card" data-cy={`dashboard-notice-${notice.id}`}>
        <div><span className="tag">{notice.municipality} · {notice.stateCode}</span><h2>{notice.title}</h2><p>{notice.organizationName}</p></div>
        <div className="opportunity-meta"><span>Fonte: {notice.sourceName ?? "órgão oficial"}</span><span>Atualizado em {formatDate(notice.lastCapturedAt)}</span></div>
        <div className="opportunity-actions">
          {notice.municipality === "Mauá" ? <a className="primario" href="/area/editais/maua">Analisar edital</a> : <a className="primario" href="/area/editais">Ver detalhe</a>}
          <a className="secundario" href={notice.canonicalUrl} target="_blank" rel="noreferrer">Fonte oficial</a>
        </div>
      </article>) : <article className="dashboard-empty" data-cy="dashboard-empty"><h2>Nenhum resultado publicado com esse filtro.</h2><p>Novas oportunidades só aparecem após validação editorial. Ajuste a busca ou confira novamente após a próxima coleta.</p></article>}
    </div>
  </section>;
}
