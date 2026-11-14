import { useEffect, useRef, useState } from "react";
import { useMusic } from "../tools/MusicContext";
import { BOOK_VIDEOS, playableVideo } from "../../content/bookMedia";

/** Starts only after a successful run's visual sequence has finished. */
export function ChapterCompletionFilm({ bookId, chapterId, title }: { bookId: string; chapterId: string; title: string }) {
  const { pause } = useMusic();
  const player = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("");
  const media = BOOK_VIDEOS[bookId]?.[chapterId];
  useEffect(() => {
    const video = player.current;
    if (!video) return;
    let active = true;
    window.speechSynthesis?.cancel();
    void video.play().catch(() => {
      if (active && !video.error) setMessage("Select Play to start your chapter film.");
    });
    return () => {
      active = false;
      video.pause();
    };
  }, [media?.src]);
  if (!playableVideo(media)) return <p>This chapter's film is not available yet.</p>;
  return <section className="sc-completion-film" aria-label={`${title} chapter film`}>
    <h2>{title} · Chapter film</h2>
    <video ref={player} key={chapterId} controls playsInline preload="auto" poster={media.poster}
      aria-label={`${title} video`}
      crossOrigin={media.captions?.some(track => track.src.startsWith("https://")) ? "anonymous" : undefined}
      src={media.src.startsWith("media/") ? `${import.meta.env.BASE_URL}${media.src}` : media.src}
      onPlay={() => { pause(); setMessage(""); }}
      onError={() => setMessage("The film could not load. You can continue and replay it from Story Lore.")}>
      {media.captions?.map(track => <track key={track.src} kind="captions" src={track.src} srcLang={track.language} label={track.label} />)}
    </video>
    {message && <p role="status">{message}</p>}
  </section>;
}
