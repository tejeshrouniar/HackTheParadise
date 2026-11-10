import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Headphones, LockKeyhole, RotateCcw, Target, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import { useMusic } from "../tools/MusicContext";
import { soundscapes } from "../../services/music";
import type { CodingStoryBook } from "../../content/storyBooks";
import { formatPuzzleValue, PuzzleCodeError, runPuzzleTests, type PuzzleTestResult } from "../learning/puzzleRunner";
import { BookCutscene } from "./BookCutscene";
import { BOOK_SCENE_ART, BOOK_SCENE_CHARACTERS, DEFAULT_BOOK_SCENE_ART } from "./bookSceneAssets";
import { CodingEditorPanel, type CodingEditorError } from "../learning/CodingEditorPanel";

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
  const [errorsById, setErrorsById] = useState<Record<string, CodingEditorError | null>>({});
  const [consoleById, setConsoleById] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [sceneSequence, setSceneSequence] = useState(0);
  const [localOutcomeId, setLocalOutcomeId] = useState<string | null>(null);
  const chapterGuideRef = useRef<HTMLDetailsElement>(null);
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

  function readTask() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    speak(`${chapter?.chapterTitle}. Your task: ${chapter?.taskObjective} Lesson: ${chapter?.lesson}`);
  }

  function readScene() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    speak(`${chapter?.chapterTitle}. ${chapter?.story}${goalReached ? ` ${chapter?.outcome}` : ""}`);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied");
    } catch {
      toast.error("Copy was blocked. Select and copy the code instead.");
    }
  }

  async function runSpell() {
    if (!chapter || !previousChaptersComplete || busy) return;
    setBusy(true);
    setNotice("");
    setErrorsById((current) => ({ ...current, [chapter.chapterId]: null }));
    try {
      const outcome = runPuzzleTests(code, chapter.functionName, chapter.tests);
      setResultsById((current) => ({ ...current, [chapter.chapterId]: outcome }));
      setConsoleById((current) => ({
        ...current,
        [chapter.chapterId]: [
          `$ storicode run · ${chapter.title}`,
          ...outcome.map((item) => `${item.passed ? "✓" : "✕"} ${item.label}${item.passed ? "" : ` · got ${formatPuzzleValue(item.actual)}`}`),
        ],
      }));
      if (outcome.every((item) => item.passed)) {
        setSceneSequence((value) => value + 1);
        speak(`${chapter.chapterTitle}. All ${outcome.length} code checks passed. ${chapter.lesson} ${chapter.outcome}`);
        const saved = await onComplete(chapter.chapterId);
        if (saved) {
          setLocalOutcomeId(chapter.chapterId);
          setNotice("The goal is reached. Your progress is saved.");
        } else setNotice("This chapter is still locked. Complete the earlier pages first.");
      } else {
        setNotice("Some checks still need work. Open Hints and solution for a clue, then try again.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The spell could not be read.";
      const lineIndex = error instanceof PuzzleCodeError && error.line > 0 ? error.line - 1 : 0;
      const line = error instanceof PuzzleCodeError && error.line > 0 ? `Line ${error.line}: ${message}` : message;
      setErrorsById((current) => ({ ...current, [chapter.chapterId]: { lineIndex, message, suggestion: "Check the highlighted line and compare it with the task." } }));
      setConsoleById((current) => ({ ...current, [chapter.chapterId]: [`$ storicode run · ${chapter.title}`, `Error: ${line}`] }));
      setResultsById((current) => ({ ...current, [chapter.chapterId]: [] }));
    } finally {
      setBusy(false);
    }
  }

  if (!chapter) return null;
  const relicImage = BOOK_SCENE_ART[chapter.chapterId] ?? DEFAULT_BOOK_SCENE_ART;
  const sceneCharacter = BOOK_SCENE_CHARACTERS[chapter.chapterId];
  const chapterSparkId = chapter.sparkLessonId;

  return (
    <section className={`sc-story-volume sc-simple-quest sc-volume--${book.theme} sc-coding-book--${book.theme}`} aria-labelledby="sc-volume-heading">
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

      <div className="sc-quest-topline">
        <span>Chapter {String(chapterIndex + 1).padStart(2, "0")} of {book.chapters.length}</span>
        <span>{progressStatus}</span>
      </div>
      <header className="sc-quest-intro">
        <span className="sc-coding-book__type">{book.title.toUpperCase()} <i aria-hidden="true">·</i> LEVEL TYPE: {chapter.conceptName}</span>
        <h1 id="sc-volume-heading">{chapter.chapterTitle}</h1>
        <p>{chapter.taskObjective}</p>
        <button className="sc-volume-read" type="button" onClick={readTask}>
          {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {speaking ? "Stop narration" : "Read task aloud"}
        </button>
      </header>

      <div className="sc-coding-layout sc-coding-book-spread" key={chapter.chapterId}>
        <CodingEditorPanel
          code={code}
          onCodeChange={(next) => {
            setCodeById((current) => ({ ...current, [chapter.chapterId]: next }));
            setErrorsById((current) => ({ ...current, [chapter.chapterId]: null }));
            setNotice("");
          }}
          onRun={() => void runSpell()}
          onReset={() => {
            setCodeById((current) => ({ ...current, [chapter.chapterId]: starterCode(chapter.functionName, chapter.parameters) }));
            setResultsById((current) => {
              const next = { ...current };
              delete next[chapter.chapterId];
              return next;
            });
            setErrorsById((current) => ({ ...current, [chapter.chapterId]: null }));
            setConsoleById((current) => {
              const next = { ...current };
              delete next[chapter.chapterId];
              return next;
            });
            setNotice("");
          }}
          onCopy={() => void copyCode()}
          onGuide={() => {
            if (chapterGuideRef.current) chapterGuideRef.current.open = true;
          }}
          onSolutionUse={(next) => {
            setCodeById((current) => ({ ...current, [chapter.chapterId]: next }));
            setErrorsById((current) => ({ ...current, [chapter.chapterId]: null }));
            setNotice("Solution loaded into the editor. Run it to watch the spell unfold.");
          }}
          sparkBookId={book.id}
          sparkLessonId={chapterSparkId}
          canRun={previousChaptersComplete}
          isRunning={busy}
          runLabel={finished ? "Run again" : "Run spell"}
          error={errorsById[chapter.chapterId]}
          consoleLogs={consoleById[chapter.chapterId] ?? [`$ storicode load · ${chapter.title}`, "> Type your solution, then run the spell."]}
        >
          <details className="sc-quest-disclosure" ref={chapterGuideRef}>
            <summary>Chapter guide</summary>
            <p>{chapter.lesson}</p>
          </details>
          {notice && <p className="sc-volume-notice" role="status">{notice}</p>}
        </CodingEditorPanel>

        <section className="sc-card sc-live-world sc-volume-live-world" aria-label={`${chapter.chapterTitle} live scene`}>
          <header>
            <h2>{chapter.subtitle.split(" · ")[0]}</h2>
            <span className={goalReached ? "complete" : ""}>{goalReached ? "Complete" : busy ? "Checking" : "Ready"}</span>
          </header>
          <div className="sc-playback-bar">
            <span>{goalReached ? "Your code opened the next story beat" : "Write and run the spell to reveal the clue"}</span>
            <button type="button" onClick={() => soundtrack && (playingBookScore ? music.pause() : void music.play(soundtrack, [soundtrack]))} disabled={!soundtrack}>
              <Headphones size={15} /> {playingBookScore ? "Pause score" : "Play book score"}
            </button>
          </div>
          <BookCutscene
            chapter={chapter}
            relicImage={relicImage}
            characterImage={sceneCharacter}
            completed={goalReached}
            sequence={sceneSequence}
            mode="level"
            onNarrate={readScene}
            narrating={speaking}
          />
          <p className="sc-action-caption sc-volume-goal" data-complete={goalReached} role="status">
            {goalReached ? <Check size={15} aria-hidden="true" /> : <Target size={15} aria-hidden="true" />}
            {goalReached
              ? `Goal reached · ${chapter.tests.length} of ${chapter.tests.length} checks passed`
              : results
                ? `Goal · ${passedChecks} of ${chapter.tests.length} checks passed`
                : `Goal · pass all ${chapter.tests.length} chapter checks`}
          </p>
          <section className="sc-volume-checks" aria-label="Level goal checks" aria-live="polite">
            <h3><span>Goal checks</span><small>{goalReached ? chapter.tests.length : passedChecks} / {chapter.tests.length}</small></h3>
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
          {goalReached && (
            <div className="sc-volume-aftermath" role="status">
              <span className="sc-page-kicker">THE STORY CONTINUES</span>
              <h3>{chapter.title}</h3>
              <p>{chapter.outcome}</p>
              <p className="sc-volume-aftermath__lesson"><strong>What your code did:</strong> {chapter.lesson}</p>
              <button className="sc-button sc-volume-next" type="button" onClick={() => onWatchMovie(chapter.chapterId)}>
                Watch this chapter’s film <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      <footer className="sc-volume-footer">
        <span>{progressStatus}</span>
        {chapterIndex === book.chapters.length - 1 && finished && <span role="status">This book is complete.</span>}
      </footer>
    </section>
  );
}
