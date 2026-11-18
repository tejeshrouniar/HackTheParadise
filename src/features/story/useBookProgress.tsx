import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { isCodingStoryBook, STORY_BOOKS } from "../../content/storyBooks";
import { useAuth } from "../../contexts/AuthContext";
import { errorMessage, readLocal, writeLocal } from "../../lib/validation";
import { supabase } from "../../lib/supabase";

const codingBooks = STORY_BOOKS.filter(isCodingStoryBook);
const chapterIds = codingBooks.flatMap((book) => book.chapters.map((chapter) => chapter.chapterId));
const chapterIdSet = new Set(chapterIds);
const localKey = (userId?: string) => `storicode_book_progress_${userId ?? "guest"}`;
function validChapters(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && chapterIdSet.has(id)))]
    : [];
}

/** Coding-book chapter IDs sync independently of Cinder's lesson progress. */
function useBookProgressState() {
  const { user } = useAuth();
  const key = localKey(user?.id);
  const [completed, setCompleted] = useState<string[]>(() => validChapters(readLocal(key, [])));
  const current = useRef(completed);
  const synced = useRef(new Set<string>());
  const [status, setStatus] = useState(user ? "Loading book progress…" : "Saved on this device");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user || !supabase) return;
    const request = new AbortController();

    setStatus("Syncing book progress…");
    void (async () => {
      try {
        const { data, error } = await supabase!
          .from("story_progress")
          .select("chapter_id")
          .eq("user_id", user.id)
          .eq("completed", true)
          .in("chapter_id", chapterIds)
          .abortSignal(request.signal);
        if (error) throw error;
        if (request.signal.aborted) return;
        const remote = validChapters((data ?? []).map(row => row.chapter_id));
        for (const id of remote) synced.current.add(id);
        const merged = [...new Set([...remote, ...current.current])];
        current.current = merged;
        setCompleted(merged);
        writeLocal(key, merged);
        const pending = merged.filter(id => !synced.current.has(id));
        if (pending.length) {
          const saved = await supabase!
            .from("story_progress")
            .upsert(pending.map((chapter_id) => ({ user_id: user.id, chapter_id, completed: true })), { onConflict: "user_id,chapter_id" });
          if (saved.error) throw saved.error;
          for (const id of pending) synced.current.add(id);
        }
        if (!request.signal.aborted) setStatus("Synced to your account");
      } catch (error) {
        if (!request.signal.aborted) setStatus(`Saved on this device · ${errorMessage(error)}`);
      }
    })();
    return () => request.abort();
  }, [user?.id, key, attempt]);

  const complete = useCallback(async (chapterId: string) => {
    const book = codingBooks.find((item) => item.chapters.some((chapter) => chapter.chapterId === chapterId));
    const index = book?.chapters.findIndex((chapter) => chapter.chapterId === chapterId) ?? -1;
    if (!book || index < 0) return false;
    if (index > 0 && !current.current.includes(book.chapters[index - 1].chapterId)) return false;
    if (synced.current.has(chapterId)) return true;

    const merged = [...new Set([...current.current, chapterId])];
    current.current = merged;
    setCompleted(merged);
    const stored = writeLocal(key, merged);
    if (!user || !supabase) {
      setStatus(stored ? "Saved on this device" : "Device storage unavailable; keep this tab open.");
      return true;
    }

    setStatus("Saving book progress…");
    try {
      const { error } = await supabase
        .from("story_progress")
        .upsert({ user_id: user.id, chapter_id: chapterId, completed: true }, { onConflict: "user_id,chapter_id" });
      if (error) throw error;
      synced.current.add(chapterId);
      setStatus("Synced to your account");
    } catch (error) {
      setStatus(`${stored ? "Saved on this device" : "Keep this tab open"} · ${errorMessage(error)}`);
    }
    return true;
  }, [key, user?.id]);

  return { completed, status, complete, retry: () => setAttempt((value) => value + 1) };
}

const BookProgressContext = createContext<ReturnType<typeof useBookProgressState> | null>(null);

export function BookProgressProvider({ children }: PropsWithChildren) {
  return <BookProgressContext.Provider value={useBookProgressState()}>{children}</BookProgressContext.Provider>;
}

export function useBookProgress() {
  const progress = useContext(BookProgressContext);
  if (!progress) throw new Error("useBookProgress requires BookProgressProvider");
  return progress;
}
