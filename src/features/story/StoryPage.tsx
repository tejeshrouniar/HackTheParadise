import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Play } from "lucide-react";
import {
  FIRST_LIGHT,
  isStoryChapter,
  type StoryChapter,
} from "../../content/story";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { errorMessage, readLocal, writeLocal } from "../../lib/validation";
import { useProgress } from "../learning/ProgressContext";
import { ErrorNotice, Loading } from "../../components/ui/Status";
import { StoryArtwork } from "./StoryArtwork";
import { chapterOutcome } from "../../content/eldoria";
interface Reading {
  completed: boolean;
  choices: Record<string, string>;
}
export default function StoryPage({
  onQuest,
}: {
  onQuest: (id: number) => void;
}) {
  const { user } = useAuth();
  const { completed } = useProgress();
  const key = `storicode_reading_${user?.id ?? "guest"}`;
  const [metadata, setMetadata] = useState({
    title: FIRST_LIGHT.title,
    description: FIRST_LIGHT.description,
  });
  const [chapters, setChapters] = useState<StoryChapter[]>(
    FIRST_LIGHT.chapters,
  );
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState<Record<string, Reading>>(() =>
    readLocal(key, {}),
  );
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const chapter = chapters[active] ?? chapters[0];
  const record = progress[chapter.id] ?? { completed: false, choices: {} };
  const readingMinutes = Math.max(
    1,
    Math.ceil(
      chapter.content
        .map((s) => s.text)
        .join(" ")
        .split(/\s+/).length / 180,
    ),
  );
  function selectChapter(index: number) {
    if (busy) return;
    setActive(index);
    setError("");
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setLoading(false);
      return;
    }
    // Fetch one coherent edition. An older database must not replace the new
    // bundled story with the retired dragon narrative while migration 004 awaits application.
    void Promise.all([
      supabase
        .from("stories")
        .select("title,description,edition")
        .eq("id", FIRST_LIGHT.id)
        .eq("published", true)
        .maybeSingle(),
      supabase
        .from("story_chapters")
        .select("id,title,subtitle,lesson_id,position,content")
        .eq("story_id", FIRST_LIGHT.id)
        .eq("published", true)
        .order("position"),
    ])
      .then(([meta, { data, error }]) => {
        if (cancelled) return;
        if (
          !meta.error &&
          meta.data &&
          meta.data.edition >= FIRST_LIGHT.edition &&
          !error &&
          data?.length &&
          data.every(isStoryChapter)
        ) {
          setMetadata({
            title: meta.data.title,
            description: meta.data.description,
          });
          setChapters(data);
          setActive((index) => Math.min(index, data.length - 1));
        }
      })
      .catch(() => {
        /* The bundled edition remains readable. */
      });
    if (user)
      void supabase
        .from("story_progress")
        .select("chapter_id,completed,choices")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) setError(errorMessage(error));
          else {
            setProgress(
              Object.fromEntries(
                (data ?? []).map((r) => [
                  r.chapter_id,
                  { completed: r.completed, choices: r.choices },
                ]),
              ),
            );
            setError("");
          }
          setLoading(false);
        });
    return () => {
      cancelled = true;
    };
  }, [user?.id, attempt]);
  async function save(next: Reading) {
    setBusy(true);
    setError("");
    try {
      if (user && supabase) {
        const { error } = await supabase
          .from("story_progress")
          .upsert(
            { user_id: user.id, chapter_id: chapter.id, ...next },
            { onConflict: "user_id,chapter_id" },
          );
        if (error) throw error;
      }
      const updated = { ...progress, [chapter.id]: next };
      setProgress(updated);
      if (!writeLocal(key, updated) && !user)
        throw new Error(
          "This browser could not save your reading progress. Allow site storage and try again.",
        );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sc-page sc-story-page sc-simple-story">
      <div className="sc-page-heading">
        <div>
          <h1>{metadata.title}</h1>
        </div>
      </div>
      <div className="sc-reader-toolbar">
        <label htmlFor="story-chapter">Chapter</label>
        <select
          id="story-chapter"
          value={active}
          disabled={busy}
          onChange={(e) => selectChapter(Number(e.target.value))}
        >
          {chapters.map((c, i) => (
            <option key={c.id} value={i}>
              {i + 1}. {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="sc-story-layout">
        <article
          className="sc-card sc-reading sc-illustrated-reading"
          key={chapter.id}
        >
          <figure className="sc-reading-illustration">
            <StoryArtwork lesson={chapter.lesson_id} priority />
            <figcaption>
              Eldoria · {chapter.subtitle.split(" · ")[0]}
            </figcaption>
          </figure>
          <div className="sc-reading-meta">
            <span className="sc-eyebrow">
              CHAPTER {String(active + 1).padStart(2, "0")}
            </span>
            <span>
              <Clock3 size={13} />
              {readingMinutes} min read
            </span>
          </div>
          <h2 ref={headingRef} tabIndex={-1}>
            {chapter.title}
          </h2>
          <p className="sc-reading-subtitle">{chapter.subtitle}</p>
          {loading ? (
            <Loading label="Restoring your place…" />
          ) : (
            chapter.content.map((section) => (
              <section
                key={section.id}
                className={`sc-story-section ${section.type}`}
              >
                {section.speaker && (
                  <span className="sc-speaker">{section.speaker}</span>
                )}
                <p>{section.text}</p>
                {section.type === "choice" && (
                  <div className="sc-choices">
                    {section.options?.map((option) => (
                      <button
                        disabled={busy}
                        key={option.id}
                        aria-pressed={record.choices[section.id] === option.id}
                        onClick={() =>
                          void save({
                            ...record,
                            choices: {
                              ...record.choices,
                              [section.id]: option.id,
                            },
                          })
                        }
                        className={
                          record.choices[section.id] === option.id
                            ? "selected"
                            : ""
                        }
                      >
                        {option.label}
                        {record.choices[section.id] === option.id && (
                          <Check size={16} />
                        )}
                      </button>
                    ))}
                    {record.choices[section.id] && (
                      <p className="sc-choice-response">
                        {
                          section.options?.find(
                            (o) => o.id === record.choices[section.id],
                          )?.response
                        }
                      </p>
                    )}
                  </div>
                )}
              </section>
            ))
          )}
          {error && (
            <ErrorNotice
              message={error}
              retry={() => setAttempt((n) => n + 1)}
            />
          )}
          {completed.includes(chapter.lesson_id) && (
            <aside className="sc-story-outcome">
              <span className="sc-eyebrow">
                <Check size={14} /> QUEST COMPLETE · WHAT HAPPENS NEXT
              </span>
              <p>{chapterOutcome(chapter.lesson_id, completed)}</p>
            </aside>
          )}
          <div className="sc-reading-action">
            <div>
              <strong>Try the spell yourself.</strong>
            </div>
            <button
              className="sc-button"
              onClick={() => onQuest(chapter.lesson_id)}
            >
              <Play size={17} />
              Play this chapter
            </button>
          </div>
          <div className="sc-reading-nav">
            <button
              className="sc-button secondary"
              disabled={busy || active === 0}
              onClick={() => selectChapter(active - 1)}
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <button
              className="sc-button secondary"
              disabled={busy || loading || record.completed}
              onClick={() => void save({ ...record, completed: true })}
            >
              <Check size={16} />
              {record.completed ? "Read" : "Mark as read"}
            </button>
            <button
              className="sc-button secondary"
              disabled={busy || active === chapters.length - 1}
              onClick={() => selectChapter(active + 1)}
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
