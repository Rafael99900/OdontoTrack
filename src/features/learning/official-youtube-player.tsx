"use client";

import { useState } from "react";
import { youtubeWatchUrl, type CuratedYouTubeVideo } from "@/lib/learning/youtube-curation";

export function OfficialYouTubePlayer({ video }: { video: CuratedYouTubeVideo }) {
  const [unavailable, setUnavailable] = useState(false);
  const watchUrl = youtubeWatchUrl(video.videoId);
  return <section className="official-video" data-cy="official-youtube-player">
    <h4>Vídeo complementar</h4>
    {!unavailable && <div className="official-video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`} title={video.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen onError={() => setUnavailable(true)} data-cy="youtube-iframe" /></div>}
    <p><b>{video.title}</b><br /><span>{video.channelName} · cobertura: {video.coverage}</span></p>
    <p><a href={watchUrl} target="_blank" rel="noreferrer" data-cy="youtube-open-source">Abrir no YouTube</a>{unavailable && " · O player não foi disponibilizado pela fonte. Use o link oficial."}</p>
    <small>Player oficial do YouTube; vídeo não hospedado, baixado ou reeditado pelo OdontoTrack. Curadoria revisada em {video.reviewedAt}.</small>
  </section>;
}
