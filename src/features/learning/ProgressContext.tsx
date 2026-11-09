import { canEnterLevel } from "./journeyProgress";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { loadPlayerProgress } from "../../lib/userProgress";
import { supabase } from "../../lib/supabase";
import {
  errorMessage,
  mergeLessons,
  readLocal,
  validLessonIds,
  writeLocal,
} from "../../lib/validation";

const Context = createContext<{
  completed: number[];
  complete: (id: number) => void;
  status: string;
  retry: () => void;
}>({ completed: [], complete: () => {}, status: "", retry: () => {} });
// Guest progress stays local; signed-in progress merges with the server to protect both copies.
export function ProgressProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const key = user
    ? `storicode_completed_lessons_${user.id}`
    : "spellscript_completed_lessons";
  const [completed, setCompleted] = useState(() =>
    validLessonIds(readLocal(key, [])),
  );
  const current = useRef(completed);
  const [status, setStatus] = useState(
    user ? "Syncing progress…" : "Saved on this device",
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!user || !supabase) return;
    let active = true;
    void loadPlayerProgress(user.id)
      .then(async (remote) => {
        if (!active) return;
        const merged = mergeLessons(remote, current.current);
        current.current = merged;
        setCompleted(merged);
        writeLocal(key, merged);
        // Server merges atomically; never replace an entire account's progress after a failed read.
        const { data, error } = await supabase!.rpc("merge_player_progress", {
          lesson_ids: merged,
        });
        if (!active) return;
        if (error) {
          // The server may still be on the eight-quest schema. Sync the original
          // completions separately while retaining newer ones on this device.
          if (
            merged.some((id) => id > 8) &&
            error.message.includes("Invalid lesson identifiers")
          ) {
            const fallback = await supabase!.rpc("merge_player_progress", {
              lesson_ids: merged.filter((id) => id <= 8),
            });
            if (fallback.error) throw fallback.error;
            if (active)
              setStatus(
                "Saved on this device. Forest quests need the latest database update to sync.",
              );
            return;
          }
          throw error;
        }
        current.current = mergeLessons(current.current, data);
        setCompleted(current.current);
        writeLocal(key, current.current);
        setStatus("Progress synced");
      })
      .catch((error) => {
        if (active) setStatus(`Saved on this device. ${errorMessage(error)}`);
      });
    return () => {
      active = false;
    };
  }, [user?.id, attempt]);
  function complete(id: number) {
    if (!validLessonIds([id]).length || !canEnterLevel(id, current.current)) return;
    const next = mergeLessons(current.current, [id]);
    current.current = next;
    setCompleted(next);
    const stored = writeLocal(key, next);
    setStatus(
      stored
        ? user
          ? "Syncing progress…"
          : "Saved on this device"
        : "Device storage unavailable; keep this tab open.",
    );
    if (user) setAttempt((n) => n + 1);
  }
  return (
    <Context.Provider
      value={{
        completed,
        complete,
        status,
        retry: () => setAttempt((n) => n + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useProgress = () => useContext(Context);
