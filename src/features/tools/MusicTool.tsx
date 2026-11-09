import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ExternalLink,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import {
  searchMusic,
  soundscapes,
  type MusicTrack,
} from "../../services/music";
import { useMusic } from "./MusicContext";
import { usePreferences } from "../settings/PreferencesContext";
import { ErrorNotice } from "../../components/ui/Status";
import { errorMessage } from "../../lib/validation";
export function MusicTool() {
  const music = useMusic();
  const { preferences, update } = usePreferences();
  const [query, setQuery] = useState("ambient");
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [volumeValue, setVolumeValue] = useState(preferences.music_volume);
  useEffect(
    () => setVolumeValue(preferences.music_volume),
    [preferences.music_volume],
  );
  const controller = useRef<AbortController>();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(
    () => () => {
      controller.current?.abort();
      clearTimeout(timer.current);
    },
    [],
  );
  async function search(e: FormEvent) {
    e.preventDefault();
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setError("");
    const timeout = setTimeout(() => abort.abort(), 25000);
    try {
      const tracks = await searchMusic(query, abort.signal);
      if (controller.current === abort) {
        setResults(tracks);
        setSearched(true);
      }
    } catch (error) {
      if (controller.current === abort)
        setError(
          abort.signal.aborted
            ? "The catalog took too long to respond. Try again, or use an included soundscape."
            : errorMessage(error),
        );
    } finally {
      clearTimeout(timeout);
      if (controller.current === abort) setBusy(false);
    }
  }
  const volume = (value: number) => {
    setVolumeValue(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () =>
        void update({ music_volume: value }).catch((e) =>
          setError(errorMessage(e)),
        ),
      150,
    );
  };
  return (
    <div className="sc-tool-content">
      <div className={`sc-now-playing ${music.playing ? "playing" : ""}`}>
        <div className="sc-record">
          <Headphones size={28} />
        </div>
        <span className="sc-eyebrow">YOUR FOCUS SOUNDTRACK</span>
        <h3>{music.track.title}</h3>
        <p>{music.track.artist}</p>
        <div className="sc-playback">
          <button
            aria-label="Previous track"
            className="sc-icon-button"
            onClick={() => music.skip(-1)}
          >
            <SkipBack size={21} />
          </button>
          <button
            className="sc-play-button"
            aria-label={music.playing ? "Pause music" : "Play music"}
            onClick={() => (music.playing ? music.pause() : void music.play())}
          >
            {music.loading ? (
              <LoaderCircle size={24} className="animate-spin" />
            ) : music.playing ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </button>
          <button
            aria-label="Next track"
            className="sc-icon-button"
            onClick={() => music.skip(1)}
          >
            <SkipForward size={21} />
          </button>
        </div>
        <label className="sc-volume">
          <Volume2 size={18} />
          <span className="sr-only">Music volume</span>
          <input
            aria-label="Music volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumeValue}
            onChange={(e) => volume(Number(e.target.value))}
          />
          <span>{Math.round(volumeValue * 100)}%</span>
        </label>
        {music.track.sourceUrl && (
          <p className="sc-attribution">
            <a href={music.track.sourceUrl} target="_blank" rel="noreferrer">
              {music.track.title} by {music.track.artist}
            </a>{" "}
            ·{" "}
            <a href={music.track.licenseUrl} target="_blank" rel="noreferrer">
              {music.track.license}
            </a>{" "}
            · via{" "}
            <a href="https://openverse.org" target="_blank" rel="noreferrer">
              Openverse
            </a>
          </p>
        )}
      </div>
      {music.error && <ErrorNotice message={music.error} />}
      <h3 className="sc-small-heading">Included soundscapes</h3>
      <p className="sc-muted sc-caption">
        Generated in your browser. No downloads, no ads.
      </p>
      <div className="sc-track-list">
        {soundscapes.map((t) => (
          <button
            className={music.track.id === t.id ? "selected" : ""}
            key={t.id}
            onClick={() => void music.play(t, soundscapes)}
          >
            <Headphones size={17} />
            <span>{t.title}</span>
            <Play size={14} />
          </button>
        ))}
      </div>
      <h3 className="sc-small-heading">
        Discover open music <ExternalLink size={14} />
      </h3>
      <form className="sc-search-form" onSubmit={search}>
        <label className="sr-only" htmlFor="music-query">
          Search music
        </label>
        <input
          id="music-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={100}
          placeholder="Ambient, piano, lofi…"
          required
        />
        <button
          className="sc-icon-button"
          disabled={busy}
          aria-label="Search music"
        >
          {busy ? (
            <LoaderCircle size={19} className="animate-spin" />
          ) : (
            <Search size={19} />
          )}
        </button>
      </form>
      <small>
        CC0 and CC BY recordings. Credits stay attached to every track.
        Availability depends on the original host.
      </small>
      {error && <ErrorNotice message={error} />}
      <div className="sc-track-list">
        {results.map((t) => (
          <button
            className={music.track.id === t.id ? "selected" : ""}
            key={t.id}
            onClick={() => void music.play(t, results)}
          >
            <Play size={17} />
            <span>
              {t.title}
              <small>
                {t.artist} · {t.license}
              </small>
            </span>
          </button>
        ))}
      </div>
      {searched && !results.length && !busy && (
        <p>No tracks found. Try “piano” or “ambient”.</p>
      )}
    </div>
  );
}
