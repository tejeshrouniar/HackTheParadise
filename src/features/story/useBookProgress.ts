import { useCallback, useEffect, useRef, useState } from "react";
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
export function useBookProgress() {
  const { user } = useAuth();
  const key = localKey(user?.id);
  const [completed, setCompleted] = useState<string[]>(() => validChapters(readLocal(key, [])));
  const current = useRef(completed);
  const [status, setStatus] = useState(user ? "Loading book progress…" : "Saved on this device");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const local = validChapters(readLocal(key, []));
    current.current = local;
    setCompleted(local);
    if (!user || !supabase) {
      setStatus("Saved on this device");
      return () => { active = false; };
    }

    setStatus("Syncing book progress…");
    void (async () => {
      try {
        const { data, error } = await supabase!
          .from("story_progress")
          .select("chapter_id,completed")
          .eq("user_id", user.id)
          .in("chapter_id", chapterIds);
        if (error) throw error;
        if (!active) return;
        const remote = validChapters((data ?? []).filter((row) => row.completed).map((row) => row.chapter_id));
        const merged = [...new Set([...remote, ...local])];
        current.current = merged;
        setCompleted(merged);
        writeLocal(key, merged);
        const pending = local.filter((id) => !remote.includes(id));
        if (pending.length) {
          const saved = await supabase!
            .from("story_progress")
            .upsert(pending.map((chapter_id) => ({ user_id: user.id, chapter_id, completed: true })), { onConflict: "user_id,chapter_id" });
          if (saved.error) throw saved.error;
        }
        if (active) setStatus("Synced to your account");
      } catch (error) {
        if (active) setStatus(`Saved on this device · ${errorMessage(error)}`);
      }
    })();
    return () => { active = false; };
  }, [user?.id, attempt]);

  const complete = useCallback(async (chapterId: string) => {
    const book = codingBooks.find((item) => item.chapters.some((chapter) => chapter.chapterId === chapterId));
    const index = book?.chapters.findIndex((chapter) => chapter.chapterId === chapterId) ?? -1;
    if (!book || index < 0) return false;
    if (index > 0 && !current.current.includes(book.chapters[index - 1].chapterId)) return false;

    const merged = [...new Set([...current.current, chapterId])];
    current.current = merged;
    setCompleted(merged);
    writeLocal(key, merged);
    if (!user || !supabase) {
      setStatus("Saved on this device");
      return true;
    }

    setStatus("Saving book progress…");
    const { error } = await supabase
      .from("story_progress")
      .upsert({ user_id: user.id, chapter_id: chapterId, completed: true }, { onConflict: "user_id,chapter_id" });
    if (error) {
      setStatus("Saved on this device · apply the latest storybook migration to sync this book");
      return true;
    }
    setStatus("Synced to your account");
    return true;
  }, [key, user?.id]);

  return { completed, status, complete, retry: () => setAttempt((value) => value + 1) };
}
