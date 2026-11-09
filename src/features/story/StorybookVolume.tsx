import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Headphones, LockKeyhole, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { Avatar } from "../../components/ui/Avatar";
import { useMusic } from "../tools/MusicContext";
import { soundscapes } from "../../services/music";
import type { CodingStoryBook } from "../../content/storyBooks";
import { formatPuzzleValue, PuzzleCodeError, runPuzzleTests, type PuzzleTestResult } from "../learning/puzzleRunner";

interface StorybookVolumeProps {
  book: CodingStoryBook;
  completed: string[];
  progressStatus: string;
  onComplete: (chapterId: string) => Promise<boolean>;
}

const starterCode = (functionName: string) => `# Define ${functionName} below.\n`;

export function StorybookVolume({ book, completed, progressStatus, onComplete }: StorybookVolumeProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const music = useMusic();
  const [selectedId, setSelectedId] = useState(book.chapters[0]?.chapterId ?? "");
  const [codeById, setCodeById] = useState<Record<string, string>>({});
  const [resultsById, setResultsById] = useState<Record<string, PuzzleTestResult[]>>({});
  const [errorsById, setErrorsById] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const chapter = book.chapters.find((item) => item.chapterId === selectedId) ?? book.chapters[0];
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const chapterIndex = Math.max(0, book.chapters.findIndex((item) => item.chapterId === chapter?.chapterId));
  const soundtrack = soundscapes.find((track) => track.id === book.musicTrackId);
  const playingBookScore = music.playing && music.track.id === book.musicTrackId;
  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Apprentice";
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url;
  const code = codeById[chapter?.chapterId ?? ""] ?? starterCode(chapter?.functionName ?? "spell");
  const results = resultsById[chapter?.chapterId ?? ""];
  const finished = !!chapter && completedSet.has(chapter.chapterId);
  const previousChaptersComplete = !!chapter && book.chapters.slice(0, chapterIndex).every((item) => completedSet.has(item.chapterId));
  const canOpenChapter = (index: number) =>
    completedSet.has(book.chapters[index].chapterId) || book.chapters.slice(0, index).every((item) => completedSet.has(item.chapterId));

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function setChapter(id: string) {
    setSelectedId(id);
    setNotice("");
    setSpeaking(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function readPage() {
    if (!("speechSynthesis" in window) || !chapter) {
      setNotice("Read-aloud is unavailable in this browser. The full text stays on the page.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${chapter.chapterTitle}. ${chapter.story} ${chapter.taskObjective}`);
    utterance.lang = "en-US";
    utterance.rate = 0.94;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setNotice("The browser could not start narration. You can still read the page text.");
    };
    setNotice("");
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  async function runSpell() {
    if (!chapter || !previousChaptersComplete || busy) return;
    setBusy(true);
    setNotice("");
    setErrorsById((current) => ({ ...current, [chapter.chapterId]: "" }));
    try {
      const outcome = runPuzzleTests(code, chapter.functionName, chapter.tests);
      setResultsById((current) => ({ ...current, [chapter.chapterId]: outcome }));
      if (outcome.every((item) => item.passed)) {
        const saved = await onComplete(chapter.chapterId);
        if (saved) setNotice("The page turns. Your progress is saved.");
        else setNotice("This chapter is still locked. Complete the earlier pages first.");
      } else {
        setNotice("Some checks still need work. Use the journal clue and try again.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The spell could not be read.";
      const line = error instanceof PuzzleCodeError && error.line >= 0 ? `Line ${error.line + 1}: ` : "";
      setErrorsById((current) => ({ ...current, [chapter.chapterId]: `${line}${message}` }));
      setResultsById((current) => ({ ...current, [chapter.chapterId]: [] }));
    } finally {
      setBusy(false);
    }
  }

  function turnPage() {
    const next = book.chapters[chapterIndex + 1];
    if (next && completedSet.has(chapter?.chapterId ?? "")) setChapter(next.chapterId);
  }

  if (!chapter) return null;

  return (
    <section className={`sc-story-volume sc-volume--${book.theme}`} aria-labelledby="sc-volume-heading">
      <header className="sc-volume-heading">
        <div>
          <span className="sc-volume-kicker">HARRY POTTER <span aria-hidden="true">·</span> CHAPTER {String(chapterIndex + 1).padStart(2, "0")} OF {book.chapters.length}</span>
          <h2 id="sc-volume-heading">{book.title}</h2>
          <p>{book.description}</p>
        </div>
        <div className="sc-volume-progress" aria-label={`${book.chapters.filter((item) => completedSet.has(item.chapterId)).length} of ${book.chapters.length} chapters complete`}>
          <strong>{book.chapters.filter((item) => completedSet.has(item.chapterId)).length}<span> / {book.chapters.length}</span></strong>
          <small>pages restored</small>
        </div>
      </header>

      <nav className="sc-volume-index" aria-label={`${book.title} chapter index`}>
        {book.chapters.map((item, index) => {
          const unlocked = canOpenChapter(index);
          const isDone = completedSet.has(item.chapterId);
          return (
            <button
              type="button"
              key={item.chapterId}
              disabled={!unlocked}
              aria-current={chapter.chapterId === item.chapterId ? "page" : undefined}
              onClick={() => setChapter(item.chapterId)}
            >
              <span className="sc-volume-index__number">{isDone ? <Check size={14} aria-label="Completed" /> : String(index + 1).padStart(2, "0")}</span>
              <span className="sc-volume-index__title">{item.chapterTitle}</span>
              {!unlocked && <LockKeyhole size={13} aria-label="Locked" />}
            </button>
          );
        })}
      </nav>

      <div className="sc-volume-open" data-theme={book.theme} key={chapter.chapterId}>
        <article className="sc-volume-page sc-volume-page--story">
          <div className="sc-volume-page__number">CHAPTER {String(chapterIndex + 1).padStart(2, "0")} <span>·</span> THE HORCRUX CODE</div>
          <h3>{chapter.chapterTitle}</h3>
          <p className="sc-volume-page__subtitle">{chapter.subtitle}</p>
          <p className="sc-volume-story">{chapter.story}</p>
          <div className="sc-volume-lesson">
            <span>THE SPELL LESSON</span>
            <strong>{chapter.conceptName}</strong>
            <p>{chapter.lesson}</p>
          </div>
          <aside className="sc-volume-objective">
            <span>YOUR TASK</span>
            <p>{chapter.taskObjective}</p>
          </aside>
          <button className="sc-volume-read" type="button" onClick={readPage}>
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {speaking ? "Stop reading" : "Read this page aloud"}
          </button>
        </article>

        <div className="sc-volume-spine" aria-hidden="true" />

        <article className="sc-volume-page sc-volume-page--play" aria-label={`${chapter.chapterTitle} coding page`}>
          <div className="sc-volume-scene" data-background={book.background} data-scene={chapter.scene}>
            <div className="sc-volume-scene__stars" aria-hidden="true" />
            <div className="sc-volume-scene__moon" aria-hidden="true" />
            <div className="sc-volume-scene__tower sc-volume-scene__tower--left" aria-hidden="true" />
            <div className="sc-volume-scene__tower sc-volume-scene__tower--right" aria-hidden="true" />
            <div className="sc-volume-scene__ridge" aria-hidden="true" />
            <span className="sc-volume-scene__relic" aria-hidden="true">{chapter.symbol}</span>
            <span className="sc-volume-scene__player" role="img" aria-label={`Your apprentice avatar: ${displayName}`}>
              <Avatar name={String(displayName)} url={avatarUrl} size={43} />
            </span>
            <div className="sc-volume-scene__caption"><span>{chapter.scene.replace(/-/g, " ")}</span><strong>{chapter.chapterTitle}</strong></div>
          </div>

          <div className="sc-volume-tools">
            <button type="button" onClick={() => soundtrack && (playingBookScore ? music.pause() : void music.play(soundtrack, [soundtrack]))} disabled={!soundtrack}>
              <Headphones size={15} /> {playingBookScore ? "Pause score" : "Play this book’s score"}
            </button>
          </div>

          {finished ? (
            <div className="sc-volume-aftermath" role="status">
              <span className="sc-volume-page__number">THE PAGE TURNS</span>
              <h4>{chapter.title}</h4>
              <p>{chapter.outcome}</p>
              {chapterIndex < book.chapters.length - 1 && (
                <button className="sc-button sc-volume-next" type="button" onClick={turnPage}>
                  Turn to the next page
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="sc-volume-editor">
              <label htmlFor={`spell-${chapter.chapterId}`}>Write the spell <code>{chapter.functionName}()</code></label>
              <textarea
                id={`spell-${chapter.chapterId}`}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                value={code}
                onChange={(event) => setCodeById((current) => ({ ...current, [chapter.chapterId]: event.target.value }))}
                aria-describedby={`objective-${chapter.chapterId}`}
              />
              <p id={`objective-${chapter.chapterId}`} className="sc-volume-editor__objective">{chapter.taskObjective}</p>
              <button className="sc-button sc-volume-run" type="button" onClick={() => void runSpell()} disabled={busy || !previousChaptersComplete}>
                {busy ? "Checking…" : finished ? "Run again" : "Run spell"}
                <ArrowRight size={16} />
              </button>
              {errorsById[chapter.chapterId] && <p className="sc-volume-feedback sc-volume-feedback--error" role="alert">{errorsById[chapter.chapterId]}</p>}
              {results && results.length > 0 && (
                <div className="sc-volume-results" aria-live="polite">
                  <strong>{results.filter((item) => item.passed).length} of {results.length} checks passed</strong>
                  {results.map((item) => <div key={item.label}><span>{item.passed ? <Check size={13} /> : <RotateCcw size={13} />}{item.label}</span>{!item.passed && <code>Your result: {formatPuzzleValue(item.actual)}</code>}</div>)}
                </div>
              )}
            </div>
          )}
          {notice && <p className="sc-volume-notice" role="status">{notice}</p>}
        </article>
      </div>

      <footer className="sc-volume-footer">
        <span>{progressStatus}</span>
        {chapterIndex === book.chapters.length - 1 && finished && <span role="status">This book is complete.</span>}
      </footer>
    </section>
  );
}
