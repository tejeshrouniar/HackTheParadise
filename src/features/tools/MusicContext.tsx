import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { sound } from "../../utils/sound";
import { soundscapes, type MusicTrack } from "../../services/music";
import { usePreferences } from "../settings/PreferencesContext";
import { readLocal, writeLocal } from "../../lib/validation";
const Context = createContext<{
  track: MusicTrack;
  playing: boolean;
  loading: boolean;
  error: string;
  queue: MusicTrack[];
  play: (track?: MusicTrack, queue?: MusicTrack[]) => Promise<void>;
  pause: () => void;
  skip: (offset: number) => void;
}>({
  track: soundscapes[0],
  playing: false,
  loading: false,
  error: "",
  queue: soundscapes,
  play: async () => {},
  pause: () => {},
  skip: () => {},
});
export function MusicProvider({ children }: PropsWithChildren) {
  const { preferences } = usePreferences();
  const [track, setTrack] = useState<MusicTrack>(
    () =>
      soundscapes.find(
        (t) => t.id === readLocal("storicode_soundscape", "twilight"),
      ) ?? soundscapes[0],
  );
  const [queue, setQueue] = useState<MusicTrack[]>(soundscapes);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement>();
  const generation = useRef(0);
  const queueRef = useRef(queue);
  const trackRef = useRef(track);
  const nextRef = useRef<(n: number) => void>(() => {});
  const pause = () => {
    generation.current++;
    audio.current?.pause();
    sound.stopBgm();
    setPlaying(false);
    setLoading(false);
  };
  async function play(selected = trackRef.current, list = queueRef.current) {
    pause();
    const request = generation.current;
    setError("");
    setLoading(true);
    setTrack(selected);
    trackRef.current = selected;
    setQueue(list);
    queueRef.current = list;
    try {
      if (selected.preset) {
        sound.setTrack(selected.preset);
        sound.setBgmVolume(preferences.music_volume);
        sound.startBgm(selected.preset);
        writeLocal("storicode_soundscape", selected.id);
      } else if (selected.url) {
        if (!audio.current) {
          audio.current = new Audio();
          audio.current.preload = "none";
          audio.current.onended = () => nextRef.current(1);
          audio.current.onerror = () => {
            setPlaying(false);
            setLoading(false);
            setError(
              "This recording cannot be played right now. Try another track or an included soundscape.",
            );
          };
        }
        audio.current.volume = preferences.music_volume;
        if (audio.current.src !== selected.url)
          audio.current.src = selected.url;
        await audio.current.play();
      }
      if (request === generation.current) {
        setPlaying(true);
        setLoading(false);
      }
    } catch (error) {
      if (request === generation.current) {
        setError(
          "Playback could not start. Try another track or an included soundscape.",
        );
        setPlaying(false);
        setLoading(false);
      }
    }
  }
  function skip(offset: number) {
    const list = queueRef.current;
    if (!list.length) return;
    const index = list.findIndex((t) => t.id === trackRef.current.id);
    void play(list[(index + offset + list.length) % list.length], list);
  }
  nextRef.current = skip;
  useEffect(() => {
    if (audio.current) audio.current.volume = preferences.music_volume;
    sound.setBgmVolume(preferences.music_volume);
  }, [preferences.music_volume]);
  useEffect(
    () => () => {
      generation.current++;
      if (audio.current) {
        audio.current.pause();
        audio.current.removeAttribute("src");
        audio.current.load();
      }
      sound.stopBgm();
    },
    [],
  );
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
    });
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", () => void play());
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("nexttrack", () => skip(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => skip(-1));
    return () => {
      for (const action of [
        "play",
        "pause",
        "nexttrack",
        "previoustrack",
      ] as MediaSessionAction[])
        navigator.mediaSession.setActionHandler(action, null);
    };
  }, [track, playing, preferences.music_volume]);
  return (
    <Context.Provider
      value={{ track, playing, loading, error, queue, play, pause, skip }}
    >
      {children}
    </Context.Provider>
  );
}
export const useMusic = () => useContext(Context);
