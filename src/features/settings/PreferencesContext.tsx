import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { errorMessage, readLocal, writeLocal } from "../../lib/validation";
import { sound } from "../../utils/sound";

export interface Preferences {
  sound_effects: boolean;
  reduced_motion: boolean;
  music_volume: number;
  focus_minutes: number;
  gender: string;
}
const defaults: Preferences = {
  sound_effects: false,
  reduced_motion: false,
  music_volume: 0.35,
  focus_minutes: 25,
  gender: "",
};
export type BookMotion = "system" | "full" | "gentle";
const bookMotionKey = "storicode-book-motion";
const reducedMotionQuery = "(prefers-reduced-motion: reduce), (forced-colors: active)";
function subscribeToDeviceMotion(callback: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

const Context = createContext<{
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => Promise<void>;
  error: string;
  loading: boolean;
  bookMotion: BookMotion;
  gentleBookMotion: boolean;
  setBookMotion: (value: BookMotion) => void;
}>({
  preferences: defaults,
  update: async () => {},
  error: "",
  loading: false,
  bookMotion: "system",
  gentleBookMotion: false,
  setBookMotion: () => {},
});
export function PreferencesProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const key = `storicode_preferences_${user?.id ?? "guest"}`;
  const [preferences, setPreferences] = useState<Preferences>(() => ({
    ...defaults,
    ...readLocal(key, {}),
  }));
  const current = useRef(preferences);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!user);
  const [bookMotion, setBookMotion] = useState<BookMotion>(() => {
    const saved = readLocal<string>(bookMotionKey, "system");
    return saved === "full" || saved === "gentle" ? saved : "system";
  });
  const deviceReducesMotion = useSyncExternalStore(subscribeToDeviceMotion, () => window.matchMedia(reducedMotionQuery).matches);
  const gentleBookMotion = bookMotion === "gentle" || (bookMotion === "system" && (preferences.reduced_motion || deviceReducesMotion));
  useEffect(() => {
    let active = true;
    if (user && supabase)
      void supabase
        .from("user_preferences")
        .select(
          "sound_effects,reduced_motion,music_volume,focus_minutes,gender",
        )
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!active) return;
          if (error) setError(errorMessage(error));
          else if (data) {
            current.current = { ...defaults, ...data };
            setPreferences(current.current);
            writeLocal(key, current.current);
          }
          setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [user?.id]);
  useEffect(() => {
    sound.setEffectsEnabled(preferences.sound_effects);
    document.documentElement.dataset.reduceMotion = String(
      preferences.reduced_motion,
    );
  }, [preferences.sound_effects, preferences.reduced_motion]);
  const update = async (patch: Partial<Preferences>) => {
    const next = { ...current.current, ...patch };
    current.current = next;
    setPreferences(next);
    writeLocal(key, next);
    if (user && supabase) {
      // Only changed fields: concurrent tabs cannot overwrite unrelated preferences.
      const { error } = await supabase
        .from("user_preferences")
        .update(patch)
        .eq("user_id", user.id)
        .select("user_id")
        .single();
      if (error) {
        setError(errorMessage(error));
        throw error;
      }
    }
    setError("");
  };
  return (
    <Context.Provider value={{ preferences, update, error, loading, bookMotion, gentleBookMotion, setBookMotion: (value) => {
      setBookMotion(value);
      writeLocal(bookMotionKey, value);
    } }}>
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
