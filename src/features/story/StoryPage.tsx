import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Play } from "lucide-react";
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
  const [metadata, setMetadata] = useState({title:FIRST_LIGHT.title,description:FIRST_LIGHT.description});
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
  const [source, setSource] = useState("Included edition");
  const [attempt, setAttempt] = useState(0);
  const chapter = chapters[active] ?? chapters[0];
  const record = progress[chapter.id] ?? { completed: false, choices: {} };
  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.from('stories').select('title,description').eq('id',FIRST_LIGHT.id).eq('published',true).maybeSingle().then(({data,error})=>{
      if(!cancelled&&!error&&data) setMetadata(data);
    });
    void supabase
      .from("story_chapters")
      .select("id,title,subtitle,lesson_id,position,content")
      .eq("story_id", FIRST_LIGHT.id)
      .eq("published", true)
      .order("position")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.length && data.every(isStoryChapter)) {
          setChapters(data);
          setSource("Published edition");
        } else setSource("Included edition · available offline");
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
    <div className="sc-page">
      <div className="sc-page-heading">
        <div>
          <span className="sc-eyebrow">THE STORY SO FAR</span>
            <h1>{metadata.title}</h1>
            <p>{metadata.description}</p>
        </div>
        <span className="sc-pill">
          <BookOpen size={14} />
          {source}
        </span>
      </div>
      <div className="sc-story-layout">
        <nav className="sc-card sc-chapter-list" aria-label="Story chapters">
          {chapters.map((c, i) => (
            <button
              key={c.id}
              className={active === i ? "active" : ""}
              onClick={() => {
                setActive(i);
                setError("");
              }}
            >
              <span>
                {progress[c.id]?.completed ? (
                  <Check size={16} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div>
                {c.title}
                <small>
                  {completed.includes(c.lesson_id)
                    ? "Quest complete"
                    : "Chapter " + (i + 1)}
                </small>
              </div>
            </button>
          ))}
        </nav>
        <article className="sc-card sc-reading" key={chapter.id}>
          <span className="sc-eyebrow">
            CHAPTER {String(active + 1).padStart(2, "0")}
          </span>
          <h2>{chapter.title}</h2>
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
          <div className="sc-reading-action">
            <div>
              <strong>Your turn to shape the story.</strong>
              <p>Bring this chapter to life in the coding quest.</p>
            </div>
            <button
              className="sc-button"
              onClick={() => onQuest(chapter.lesson_id)}
            >
              <Play size={17} />
              Open quest
            </button>
          </div>
          <div className="sc-reading-nav">
            <button
              className="sc-button secondary"
              disabled={active === 0}
              onClick={() => setActive((n) => n - 1)}
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
              disabled={active === chapters.length - 1}
              onClick={() => setActive((n) => n + 1)}
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
