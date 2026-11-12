import { useEffect, useRef, useState } from "react";
import { BOOK_VIDEOS, canWatchMovie, locateMovieTime, movieTimeline, playableVideo, validResume } from "../../content/bookMedia";
import { readLocal, writeLocal } from "../../lib/validation";
import { useAuth } from "../../contexts/AuthContext";

interface FilmLibraryProps {
  bookId: string;
  chapters: { id: string; title: string }[];
  completed: string[];
  chapterOnly?: boolean;
}
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** Account changes remount the player. Playback bookmarks cannot grant progress. */
export function BookVideoLibrary(props: FilmLibraryProps) {
  const { user } = useAuth();
  const storageKey = `htp-video:${user?.id ?? "guest"}:${props.bookId}`;
  return <FilmLibrary key={storageKey} {...props} storageKey={storageKey} />;
}

function FilmLibrary({ bookId, chapters, completed, chapterOnly = false, storageKey }: FilmLibraryProps & { storageKey: string }) {
  const [active, setActive] = useState<number | null>(null);
  const [movie, setMovie] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const player = useRef<HTMLVideoElement>(null);
  const cinema = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastSave = useRef(0);
  const playAfterLoad = useRef(false);
  const pendingTime = useRef(0);
  const loadedChapter = useRef<string | null>(null);
  const checkpoint = useRef<{ chapter: string; time: number } | null>(null);
  const previousSource = useRef<string>();
  const media = BOOK_VIDEOS[bookId] ?? {};
  const movieAvailable = canWatchMovie(chapters, completed, media);
  const chapter = active === null ? undefined : chapters[active];
  const video = chapter && media[chapter.id];
  const allowed = !!chapter && completed.includes(chapter.id) && (!movie || movieAvailable);
  const times = chapters.map(c => durations[c.id] ?? media[c.id]?.duration);
  const timeline = movieTimeline(times);
  const overall = timeline && active !== null ? Math.min(timeline.total, timeline.offsets[active] + time) : 0;
  const nextIndex = active === null ? -1 : chapters.findIndex((c, i) => i > active && completed.includes(c.id) && playableVideo(media[c.id]));

  function persist() { if (checkpoint.current) writeLocal(storageKey, checkpoint.current); }
  function capture() {
    const el = player.current;
    if (!el || !loadedChapter.current || !Number.isFinite(el.currentTime)) return;
    checkpoint.current = { chapter: loadedChapter.current, time: el.currentTime };
    setTime(el.currentTime);
  }
  // Save on refresh and route changes. No clip is fetched before selection.
  useEffect(() => {
    const save = () => { if (checkpoint.current) writeLocal(storageKey, checkpoint.current); };
    window.addEventListener("pagehide", save);
    return () => { window.removeEventListener("pagehide", save); save(); };
  }, [storageKey]);
  useEffect(() => {
    if (active !== null) {
      heading.current?.focus({ preventScroll: true });
      // Two configured chapters may reuse a file; changing the chapter still
      // needs a fresh metadata/seek cycle, while retaining the playback element.
      if (previousSource.current === video?.src) player.current?.load();
      previousSource.current = video?.src;
    }
  }, [active, video?.src]);

  function start(index: number, asMovie: boolean, position?: number, autoplay = true) {
    const target = chapters[index];
    if (!target || !completed.includes(target.id) || !playableVideo(media[target.id]) || (asMovie && !movieAvailable)) return;
    capture(); persist();
    const saved = validResume(readLocal(storageKey, null), chapters.map(c => c.id));
    const seek = position ?? (saved?.chapter === target.id ? saved.time : 0);
    pendingTime.current = seek;
    playAfterLoad.current = autoplay;
    setError(""); setLoadFailed(false); setEnded(false); setMovie(asMovie); setTime(seek);
    if (index === active && player.current?.readyState) {
      loadedChapter.current = target.id;
      player.current.currentTime = Math.min(seek, Number.isFinite(player.current.duration) ? player.current.duration : seek);
      capture();
      playAfterLoad.current = false;
      if (autoplay) void player.current.play().catch(() => setError("Press Play to start playback."));
    } else { loadedChapter.current = null; setActive(index); }
  }
  function resumeMovie() {
    const saved = validResume(readLocal(storageKey, null), chapters.map(c => c.id));
    start(Math.max(0, chapters.findIndex(c => c.id === saved?.chapter)), true, saved?.time ?? 0);
  }
  function seekMovie(value: number) {
    const target = locateMovieTime(times, value);
    if (target) start(target.index, true, target.time, !player.current?.paused && !ended);
  }
  function close() { capture(); persist(); player.current?.pause(); loadedChapter.current = null; setActive(null); }

  return <section className="htp-video-library" aria-label="Chapter videos">
    {chapterOnly ? (!allowed && <button className="sc-button htp-movie-unlocked" disabled={!completed.includes(chapters[0]?.id) || !playableVideo(media[chapters[0]?.id])} onClick={() => start(0, false)}>Watch chapter video</button>) : <>
    <h2>Memories on film</h2>
    <p>{movieAvailable ? "Your full movie is unlocked." : `${chapters.filter(c => completed.includes(c.id)).length} / ${chapters.length} chapters complete.`}</p>
    <button className={`sc-button ${movieAvailable ? "htp-movie-unlocked" : ""}`} disabled={!movieAvailable} onClick={resumeMovie}>Watch as a movie</button>
    {!chapters.some(c => playableVideo(media[c.id])) && <p>Chapter videos are not available yet. You can still watch the animated scenes in Read story.</p>}
    <details className="htp-film-index"><summary>Chapter films</summary>
      <ol>{chapters.map((c, i) => <li key={c.id}><span>{i + 1}. {c.title}</span><button disabled={!completed.includes(c.id) || !playableVideo(media[c.id])} onClick={() => start(i, false)}>{!completed.includes(c.id) ? "Locked" : !playableVideo(media[c.id]) ? "Awaiting video" : "Watch chapter"}</button></li>)}</ol>
    </details>
    </>}
    {allowed && playableVideo(video) && <div className="htp-cinema" ref={cinema}>
      <h3 ref={heading} tabIndex={-1}>{movie ? `Movie · ${active! + 1}/${chapters.length} · ` : ""}{chapter!.title}</h3>
      <video ref={player} controls playsInline preload="metadata" poster={video.poster} crossOrigin={video.captions?.some(c => c.src.startsWith("https://")) ? "anonymous" : undefined} src={video.src} aria-label={`${chapter!.title} video`}
        onLoadedMetadata={event => {
          const el = event.currentTarget;
          loadedChapter.current = chapter!.id;
          if (Number.isFinite(el.duration) && el.duration > 0) {
            setDurations(previous => ({ ...previous, [chapter!.id]: el.duration }));
            el.currentTime = Math.min(pendingTime.current, el.duration);
          }
          capture();
        }}
        onTimeUpdate={() => { capture(); if (Date.now() - lastSave.current > 2000) { persist(); lastSave.current = Date.now(); } }}
        onPause={() => { capture(); persist(); }}
        onError={() => { playAfterLoad.current = false; setLoadFailed(true); setError("This video could not load. Check your connection, then retry."); }}
        onEnded={() => {
          checkpoint.current = { chapter: chapter!.id, time: 0 };
          if (movie && active! + 1 < chapters.length) { loadedChapter.current = null; start(active! + 1, true, 0); }
          else {
            loadedChapter.current = null;
            if (movie) checkpoint.current = { chapter: chapters[0].id, time: 0 };
            persist(); setEnded(true);
          }
        }}
        onCanPlay={() => {
          if (!playAfterLoad.current) return;
          playAfterLoad.current = false;
          void player.current?.play().catch(() => setError("Press Play to continue. Your browser paused automatic playback."));
        }}>
        {video.captions?.map(c => <track key={`${chapter!.id}:${c.language}`} kind="subtitles" src={c.src} srcLang={c.language} label={c.label} />)}
      </video>
      {movie && timeline && <label className="htp-movie-timeline">Full movie · {clock(overall)} / {clock(timeline.total)}
        <input type="range" min={0} max={timeline.total} step="any" value={overall} aria-label="Seek across the full movie" aria-valuetext={`${clock(overall)} of ${clock(timeline.total)}`} onChange={e => seekMovie(Number(e.target.value))} />
      </label>}
      {movie && !timeline && <p>Chapter {active! + 1} of {chapters.length} · Use the video controls to seek within this chapter.</p>}
      {error && <div role="status"><p>{error}</p>{loadFailed && <button onClick={() => { setError(""); setLoadFailed(false); pendingTime.current = time; playAfterLoad.current = true; player.current?.load(); }}>Retry video</button>}</div>}
      {ended && <p role="status">{movie ? "The end. Your adventure is complete." : "Chapter film complete."}</p>}
      <div className="htp-cinema-actions">
        {!movie && nextIndex >= 0 && <button onClick={() => start(nextIndex, false)}>Next unlocked chapter →</button>}
        {ended && <button onClick={() => start(movie ? 0 : active!, movie, 0)}>Replay {movie ? "movie" : "chapter"}</button>}
        <button onClick={() => {
          if (!cinema.current?.requestFullscreen) { setError("Use the fullscreen button in the video controls."); return; }
          void cinema.current.requestFullscreen().catch(() => setError("Use the fullscreen button in the video controls."));
        }}>Fullscreen</button>
        <button onClick={close}>{chapterOnly ? "Close chapter video" : "Return to contents"}</button>
      </div>
    </div>}
  </section>;
}
