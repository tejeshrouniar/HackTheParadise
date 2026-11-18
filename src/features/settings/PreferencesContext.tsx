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
import { defaultPreferences as defaults, readPreferences, type Preferences } from "./preferenceValues";
export type { Preferences } from "./preferenceValues";
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
  const [preferences, setPreferences] = useState<Preferences>(() => readPreferences(readLocal(key, {})));
  const current = useRef(preferences);
  const writes = useRef(Promise.resolve());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!user);
  useEffect(() => {
    let active = true;
    if (user && supabase) {
      // Finish the initial read before applying queued edits, so a late read
      // cannot replace a saved change or discard unrelated cloud preferences.
      writes.current = Promise.resolve(supabase
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
            current.current = readPreferences(data);
            setPreferences(current.current);
            writeLocal(key, current.current);
          }
        })).catch(error => {
          if (active) setError(errorMessage(error));
        }).finally(() => {
          if (active) setLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [user?.id]);
  useEffect(() => {
    sound.setEffectsEnabled(preferences.sound_effects);
  }, [preferences.sound_effects]);
  const update = (patch: Partial<Preferences>) => {
    const operation = writes.current.then(async () => {
      const next = readPreferences({ ...current.current, ...patch });
      const changes = Object.fromEntries(
        Object.keys(patch).map(field => [field, next[field as keyof Preferences]]),
      );
      try {
        if (user && supabase) {
          // Only changed fields: concurrent tabs cannot overwrite unrelated preferences.
          const { error } = await supabase
            .from("user_preferences")
            .update(changes)
            .eq("user_id", user.id)
            .select("user_id")
            .single();
          if (error) throw error;
        }
        current.current = next;
        setPreferences(next);
        writeLocal(key, next);
        setError("");
      } catch (error) {
        setError(errorMessage(error));
        throw error;
      }
    });
    writes.current = operation.catch(() => {});
    return operation;
  };
  return (
    <Context.Provider value={{ preferences, update, error, loading }}>
      {children}
    </Context.Provider>
  );
}
export const usePreferences = () => useContext(Context);
