import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { errorMessage, readLocal, writeLocal } from "../../lib/validation";
import { sound } from "../../utils/sound";

export interface Preferences {
  sound_effects: boolean;
  music_volume: number;
  focus_minutes: number;
  gender: string;
}
const defaults: Preferences = {
  sound_effects: true,
  music_volume: 0.35,
  focus_minutes: 25,
  gender: "",
};
const Context = createContext<{
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => Promise<void>;
  error: string;
  loading: boolean;
}>({
  preferences: defaults,
  update: async () => {},
  error: "",
  loading: false,
});
export function PreferencesProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const key = `storicode_preferences_${user?.id ?? "guest"}`;
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = readLocal<Partial<Preferences>>(key, {});
    return {
      sound_effects: saved.sound_effects ?? defaults.sound_effects,
      music_volume: saved.music_volume ?? defaults.music_volume,
      focus_minutes: saved.focus_minutes ?? defaults.focus_minutes,
      gender: saved.gender ?? defaults.gender,
    };
  });
  const current = useRef(preferences);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!user);
  useEffect(() => {
    let active = true;
    if (user && supabase)
      void supabase
        .from("user_preferences")
        .select(
          "sound_effects,music_volume,focus_minutes,gender",
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
  }, [preferences.sound_effects]);
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
    <Context.Provider value={{ preferences, update, error, loading }}>
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
