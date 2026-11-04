import { Headphones, Pause, Play } from "lucide-react";
import { useMusic } from "./MusicContext";
import { usePreferences } from "../settings/PreferencesContext";

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const { track, playing, loading, error, play, pause } = useMusic();
  const { preferences, update } = usePreferences();
  return (
    <aside className="sc-mini-player" aria-label="Music player">
      <button
        className="sc-mini-info"
        onClick={onOpen}
        aria-label={`Open music tools. ${track.title} by ${track.artist}`}
      >
        <Headphones size={17} />
        <span>
          <strong>{track.title}</strong>
          <small>{track.artist}</small>
        </span>
      </button>
      <button
        className="sc-mini-play"
        aria-label={playing ? "Pause music" : "Play music"}
        disabled={loading}
        onClick={() => (playing ? pause() : void play())}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <label className="sc-mini-volume">
        <span className="sr-only">Music volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={preferences.music_volume}
          onChange={(event) =>
            void update({ music_volume: Number(event.target.value) }).catch(
              () => {},
            )
          }
        />
      </label>
      {error && (
        <span role="status" className="sr-only">
          {error}
        </span>
      )}
    </aside>
  );
}
