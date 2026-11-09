import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Headphones, LockKeyhole, RotateCcw, Target, Volume2, VolumeX } from "lucide-react";
import { useMusic } from "../tools/MusicContext";
import { soundscapes } from "../../services/music";
import type { CodingStoryBook } from "../../content/storyBooks";
import { formatPuzzleValue, PuzzleCodeError, runPuzzleTests, type PuzzleTestResult } from "../learning/puzzleRunner";
import { BookCutscene } from "./BookCutscene";
import { BOOK_SCENE_ART, BOOK_SCENE_CHARACTERS, DEFAULT_BOOK_SCENE_ART } from "./bookSceneAssets";

interface StorybookVolumeProps {
  book: CodingStoryBook;
  completed: string[];
  progressStatus: string;
  onComplete: (chapterId: string) => Promise<boolean>;
  initialChapterId?: string | null;
  onChapterChange?: (chapterId: string) => void;
  onWatchMovie: (chapterId: string) => void;
}

const starterCode = (functionName: string, parameters: readonly string[]) =>
  `def ${functionName}(${parameters.join(", ")}):\n    # Write your spell here.\n    return None\n`;
export function StorybookVolume({ book, completed, progressStatus, onComplete, initialChapterId, onChapterChange, onWatchMovie }: StorybookVolumeProps) {
  const music = useMusic();
  const [selectedId, setSelectedId] = useState(() =>
    initialChapterId && book.chapters.some((item) => item.chapterId === initialChapterId)
      ? initialChapterId
      : book.chapters[0]?.chapterId ?? "",
  );
  const [codeById, setCodeById] = useState<Record<string, string>>({});
  const [resultsById, setResultsById] = useState<Record<string, PuzzleTestResult[]>>({});
  const [errorsById, setErrorsById] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [sceneSequence, setSceneSequence] = useState(0);
  const [localOutcomeId, setLocalOutcomeId] = useState<string | null>(null);
  const chapter = book.chapters.find((item) => item.chapterId === selectedId) ?? book.chapters[0];
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const chapterIndex = Math.max(0, book.chapters.findIndex((item) => item.chapterId === chapter?.chapterId));
  const soundtrack = soundscapes.find((track) => track.id === book.musicTrackId);
  const playingBookScore = music.playing && music.track.id === book.musicTrackId;
  const code = codeById[chapter?.chapterId ?? ""] ?? starterCode(chapter?.functionName ?? "spell", chapter?.parameters ?? []);
  const results = resultsById[chapter?.chapterId ?? ""];
  const finished = !!chapter && completedSet.has(chapter.chapterId);
  const goalReached = finished || localOutcomeId === chapter?.chapterId;
  const passedChecks = results?.filter((item) => item.passed).length ?? 0;
  const previousChaptersComplete = !!chapter && book.chapters.slice(0, chapterIndex).every((item) => completedSet.has(item.chapterId));
  const canOpenChapter = (index: number) =>
    completedSet.has(book.chapters[index].chapterId) || book.chapters.slice(0, index).every((item) => completedSet.has(item.chapterId));

  useEffect(() => {
    if (initialChapterId && book.chapters.some((item) => item.chapterId === initialChapterId)) {
      setSelectedId(initialChapterId);
    }
  }, [book, initialChapterId]);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function setChapter(id: string) {
    setSelectedId(id);
    onChapterChange?.(id);
    setNotice("");
    setSpeaking(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window) || !chapter) {
      setNotice("Read-aloud is unavailable in this browser. The full text stays on the page.");
      return false;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
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
    return true;
  }

  function readPage() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    speak(`${chapter?.chapterTitle}. ${chapter?.story} Lesson: ${chapter?.lesson} Your task: ${chapter?.taskObjective}${finished ? ` ${chapter?.outcome}` : ""}`);
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
        setSceneSequence((value) => value + 1);
        speak(`${chapter.chapterTitle}. All ${outcome.length} code checks passed. ${chapter.lesson} ${chapter.outcome}`);
        const saved = await onComplete(chapter.chapterId);
        if (saved) {
          setLocalOutcomeId(chapter.chapterId);
          setNotice("The goal is reached. Your progress is saved.");
        } else setNotice("This chapter is still locked. Complete the earlier pages first.");
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

  if (!chapter) return null;
  const relicImage = BOOK_SCENE_ART[chapter.chapterId] ?? DEFAULT_BOOK_SCENE_ART;
  const sceneCharacter = BOOK_SCENE_CHARACTERS[chapter.chapterId];

  return (
    <section className={`sc-story-volume sc-volume--${book.theme}`} aria-labelledby="sc-volume-heading">
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
          <h3 id="sc-volume-heading">{chapter.chapterTitle}</h3>
          <p className="sc-volume-page__subtitle">{chapter.subtitle}</p>
          <p className="sc-volume-story">{chapter.story}</p>
          <div className="sc-volume-lesson">
            <span>LEVEL TYPE</span>
            <strong>{chapter.conceptName}</strong>
            <p>{chapter.lesson}</p>
          </div>
          <aside className="sc-volume-objective">
            <span>YOUR TASK</span>
            <p id={`objective-${chapter.chapterId}`}>{chapter.taskObjective}</p>
          </aside>
          <button className="sc-volume-read" type="button" onClick={readPage}>
            {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {speaking ? "Stop reading" : "Read this page aloud"}
          </button>
          <div className="sc-volume-editor">
            <label htmlFor={`spell-${chapter.chapterId}`}>{finished ? "Your spell" : "Write the spell"} <code>{chapter.functionName}({chapter.parameters.join(", ")})</code></label>
            <textarea
              id={`spell-${chapter.chapterId}`}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              value={code}
              onChange={(event) => setCodeById((current) => ({ ...current, [chapter.chapterId]: event.target.value }))}
              aria-describedby={`objective-${chapter.chapterId}`}
            />
            <details className="sc-volume-guide">
              <summary>Need a clue?</summary>
              <p>{chapter.lesson}</p>
            </details>
            <button className="sc-button sc-volume-run" type="button" onClick={() => void runSpell()} disabled={busy || !previousChaptersComplete}>
              {busy ? "Checking…" : finished ? "Run again" : "Run spell"}
              <ArrowRight size={16} />
            </button>
            {errorsById[chapter.chapterId] && <p className="sc-volume-feedback sc-volume-feedback--error" role="alert">{errorsById[chapter.chapterId]}</p>}
            {notice && <p className="sc-volume-notice" role="status">{notice}</p>}
          </div>
        </article>

        <div className="sc-volume-spine" aria-hidden="true" />

        <article className="sc-volume-page sc-volume-page--play" aria-label={`${chapter.chapterTitle} coding page`}>
          <p className="sc-volume-goal" data-complete={finished || localOutcomeId === chapter.chapterId} role="status">
            {goalReached ? <Check size={15} aria-hidden="true" /> : <Target size={15} aria-hidden="true" />}
            {goalReached
              ? `Goal reached · ${chapter.tests.length} of ${chapter.tests.length} checks passed`
              : results
                ? `Goal · ${passedChecks} of ${chapter.tests.length} checks passed`
                : `Goal · pass all ${chapter.tests.length} chapter checks`}
          </p>
          <BookCutscene
            chapter={chapter}
            relicImage={relicImage}
            characterImage={sceneCharacter}
            completed={finished || localOutcomeId === chapter.chapterId}
            sequence={sceneSequence}
            mode="level"
            onNarrate={readPage}
            narrating={speaking}
          />

          <div className="sc-volume-tools">
            <button type="button" onClick={() => soundtrack && (playingBookScore ? music.pause() : void music.play(soundtrack, [soundtrack]))} disabled={!soundtrack}>
              <Headphones size={15} /> {playingBookScore ? "Pause score" : "Play this book’s score"}
            </button>
          </div>

          <section className="sc-volume-checks" aria-label="Level goal checks" aria-live="polite">
            <h4><span>Goal checks</span><small>{goalReached ? chapter.tests.length : passedChecks} / {chapter.tests.length}</small></h4>
            <ol>
              {chapter.tests.map((test, index) => {
                const result = results?.[index];
                const passed = goalReached || result?.passed === true;
                const failed = !passed && result?.passed === false;
                return (
                  <li key={test.label} data-state={passed ? "passed" : failed ? "failed" : "waiting"}>
                    <span className="sc-volume-checks__icon" aria-hidden="true">{passed ? <Check size={13} /> : failed ? <RotateCcw size={13} /> : String(index + 1).padStart(2, "0")}</span>
                    <strong>{test.label}</strong>
                    <small>{passed ? "Passed" : failed ? "Try again" : "Waiting"}</small>
                    {result && <code>{formatPuzzleValue(result.actual)}</code>}
                  </li>
                );
              })}
            </ol>
          </section>

          {finished && (
            <div className="sc-volume-aftermath" role="status">
              <span className="sc-volume-page__number">THE PAGE TURNS</span>
              <h4>{chapter.title}</h4>
              <p>{chapter.outcome}</p>
              <p className="sc-volume-aftermath__lesson"><strong>What the code did:</strong> {chapter.lesson}</p>
              <button className="sc-button sc-volume-next" type="button" onClick={() => onWatchMovie(chapter.chapterId)}>
                Watch this chapter’s film
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </article>
      </div>

      <footer className="sc-volume-footer">
        <span>{progressStatus}</span>
        {chapterIndex === book.chapters.length - 1 && finished && <span role="status">This book is complete.</span>}
      </footer>
    </section>
  );
}
