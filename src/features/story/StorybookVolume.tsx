import { Grimoire, ChapterNavigation, ExecutionTrace, usePageTurn } from "../library/Grimoire";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, LockKeyhole, RotateCcw, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import { usePreferences } from "../settings/PreferencesContext";
import { LEVEL_PACES, LevelStage, showLevelStage } from "../learning/LevelStage";
import type { CodingStoryBook } from "../../content/storyBooks";
import { formatPuzzleValue, PuzzleCodeError, runPuzzleTests, type PuzzleTestResult } from "../learning/puzzleRunner";
import { BookCutscene } from "./BookCutscene";
import { BOOK_SCENE_ART, BOOK_SCENE_CHARACTERS, DEFAULT_BOOK_SCENE_ART } from "./bookSceneAssets";
import { CodingEditorPanel, type CodingEditorError } from "../learning/CodingEditorPanel";
import { BookCompletionSpread } from "../learning/BookCompletionSpread";
import { WizardingLevelReveal } from "./WizardingLevelReveal";

interface StorybookVolumeProps {
  book: CodingStoryBook;
  completed: string[];
  progressStatus: string;
  onLevels: () => void;
  onComplete: (chapterId: string) => Promise<boolean>;
  initialChapterId?: string | null;
  onChapterChange?: (chapterId: string) => void;
  onWatchMovie: (chapterId: string) => void;
}

const starterCode = (functionName: string, parameters: readonly string[]) =>
  `def ${functionName}(${parameters.join(", ")}):\n    # Write your spell here.\n    return None\n`;
export function StorybookVolume({ book, completed, progressStatus, onLevels, onComplete, initialChapterId, onChapterChange, onWatchMovie }: StorybookVolumeProps) {
  const navigation = usePageTurn();
  const { preferences } = usePreferences();
  const stageRef = useRef<HTMLElement>(null);
  const [pace, setPace] = useState<number>(LEVEL_PACES[1].value);
  const [saving, setSaving] = useState(false);
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
  const [showCompletion, setShowCompletion] = useState(false);
  const [revealReady, setRevealReady] = useState(false);
  const liveRun = useRef(0);
  useEffect(() => () => { liveRun.current++; }, []);
  const chapterGuideRef = useRef<HTMLDetailsElement>(null);
  const chapter = book.chapters.find((item) => item.chapterId === selectedId) ?? book.chapters[0];
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const chapterIndex = Math.max(0, book.chapters.findIndex((item) => item.chapterId === chapter?.chapterId));
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
      setShowCompletion(false);
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
    setShowCompletion(false);
    setRevealReady(false);
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
    const run = ++liveRun.current;
    showLevelStage(stageRef.current, preferences.reduced_motion);
    setBusy(true);
    setNotice("");
    setResultsById(current => ({ ...current, [chapter.chapterId]: [] }));
    setConsoleById(current => ({ ...current, [chapter.chapterId]: [`$ storicode run · ${chapter.title}`] }));
    setErrorsById((current) => ({ ...current, [chapter.chapterId]: null }));
    try {
      // Let the casting state paint; cancel if this page is left before execution.
      await new Promise((resolve) => setTimeout(resolve, 120));
      if (run !== liveRun.current) return;
      const outcome = runPuzzleTests(code, chapter.functionName, chapter.tests);
      const quiet = preferences.reduced_motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      for (const [index, item] of outcome.entries()) {
        await new Promise(resolve => setTimeout(resolve, quiet ? 0 : pace));
        if (run !== liveRun.current) return;
        setResultsById(current => ({ ...current, [chapter.chapterId]: outcome.slice(0, index + 1) }));
        setConsoleById(current => ({ ...current, [chapter.chapterId]: [
          ...current[chapter.chapterId], ...item.trace, `${item.passed ? "✓" : "✕"} ${item.label} · ${formatPuzzleValue(item.actual)}`,
        ] }));
      }
      if (outcome.every((item) => item.passed)) {
        setSceneSequence((value) => value + 1);
        speak(`${chapter.chapterTitle}. All ${outcome.length} code checks passed. ${chapter.lesson} ${chapter.outcome}`);
        setSaving(true);
        const saved = await onComplete(chapter.chapterId);
        if (run !== liveRun.current) return;
        if (saved) {
          setLocalOutcomeId(chapter.chapterId);
          setRevealReady(false);
          setShowCompletion(true);
          setNotice("");
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
      if (run === liveRun.current) {
        setBusy(false);
        setSaving(false);
      }
    }
  }

  if (!chapter) return null;
  const relicImage = BOOK_SCENE_ART[chapter.chapterId] ?? DEFAULT_BOOK_SCENE_ART;
  const sceneCharacter = BOOK_SCENE_CHARACTERS[chapter.chapterId];
  const chapterSparkId = chapter.sparkLessonId;

  if (goalReached && showCompletion) {
    const nextChapter = book.chapters[chapterIndex + 1];
    const completionSteps = (results ?? []).map((result) => `✓ ${result.label} · ${formatPuzzleValue(result.actual)}`);

    return (
      <BookCompletionSpread
        theme="wizarding"
        bookId={book.id}
        bookTitle={book.title}
        chapterLabel={`SPELL COMPLETE · CHAPTER ${String(chapterIndex + 1).padStart(2, "0")}`}
        title={chapter.chapterTitle}
        outcome={chapter.outcome}
        explanation={chapter.lesson}
        code={code}
        lessonId={chapterSparkId}
        executionSteps={completionSteps}
        scene={(
          <WizardingLevelReveal
            chapter={chapter}
            sequence={sceneSequence}
            onStart={() => setRevealReady(false)}
            onFinish={() => setRevealReady(true)}
          />
        )}
        canContinue={revealReady}
        onContinue={() => nextChapter ? setChapter(nextChapter.chapterId) : onLevels()}
        continueLabel={nextChapter ? "Continue to next chapter →" : "Return to levels →"}
        onReview={() => setShowCompletion(false)}
        onReadAloud={readScene}
        speaking={speaking}
        narrationNotice={notice}
      />
    );
  }

  return (
    <section className={`sc-story-volume sc-simple-quest sc-volume--${book.theme} sc-coding-book--${book.theme} sc-grimoire-quest`} aria-labelledby="sc-volume-heading">
      <ChapterNavigation title={chapter.chapterTitle} number={chapterIndex + 1} disabled={busy} onPrevious={chapterIndex > 0 ? () => setChapter(book.chapters[chapterIndex - 1].chapterId) : undefined} onNext={chapterIndex < book.chapters.length - 1 && canOpenChapter(chapterIndex + 1) ? () => setChapter(book.chapters[chapterIndex + 1].chapterId) : undefined} />
      <details className="sc-grimoire-chapter-directory"><summary>All chapters</summary>
      <nav className="sc-volume-index" aria-label={`${book.title} chapter index`}>
        {book.chapters.map((item, index) => {
          const unlocked = canOpenChapter(index);
          const isDone = completedSet.has(item.chapterId);
          return (
            <button
              type="button"
              key={item.chapterId}
              disabled={!unlocked || busy}
              aria-current={chapter.chapterId === item.chapterId ? "page" : undefined}
              onClick={() => navigation.turn(() => setChapter(item.chapterId), index < chapterIndex ? "previous" : "next")}
            >
              <span className="sc-volume-index__number">{isDone ? <Check size={14} aria-label="Completed" /> : String(index + 1).padStart(2, "0")}</span>
              <span className="sc-volume-index__title">{item.chapterTitle}</span>
              {!unlocked && <LockKeyhole size={13} aria-label="Locked" />}
            </button>
          );
        })}
      </nav></details>

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

      <Grimoire label={`${book.title} spellbook`} coverColor={book.coverColor} className="sc-grimoire--coding" pageKey={chapter.chapterId} navigationDisabled={busy}
        onPreviousPage={chapterIndex > 0 ? () => setChapter(book.chapters[chapterIndex - 1].chapterId) : undefined}
        onNextPage={chapterIndex < book.chapters.length - 1 && canOpenChapter(chapterIndex + 1) ? () => setChapter(book.chapters[chapterIndex + 1].chapterId) : undefined}
        left={
        <CodingEditorPanel
          code={code}
          onCodeChange={(next) => {
            setCodeById((current) => ({ ...current, [chapter.chapterId]: next }));
            setErrorsById((current) => ({ ...current, [chapter.chapterId]: null }));
            setNotice("");
          }}
          onRun={() => void runSpell()}
          onStop={saving ? undefined : () => {
            liveRun.current++;
            setBusy(false);
            setNotice("Spell stopped. Run it again when you’re ready.");
          }}
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
            const guide = chapterGuideRef.current;
            if (guide) {
              guide.open = true;
              guide.querySelector("summary")?.focus();
            }
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

        } right={<>
        <LevelStage title={chapter.subtitle.split(" · ")[0]} stageRef={stageRef}
          status={busy ? "Running" : goalReached ? "Complete" : "Ready"}
          state={busy ? "casting" : errorsById[chapter.chapterId] || results?.some(item => !item.passed) ? "failed" : "ready"}
          stepLabel={busy || results?.length ? `Step ${results?.length ?? 0} / ${chapter.tests.length}` : "Watch your spell unfold"}
          pace={pace} onPaceChange={setPace}
          caption={busy ? results?.at(-1)?.label ?? "Preparing your spell…" : results?.length ? `${passedChecks} / ${chapter.tests.length} checks passed` : goalReached ? "Quest complete" : `Pass all ${chapter.tests.length} chapter checks`}>
          <div className="htp-puzzle-stage">
            <BookCutscene chapter={chapter} relicImage={relicImage} characterImage={sceneCharacter}
              completed={goalReached} sequence={sceneSequence} mode="level" embedded playing={busy && !saving} />
            <ol className="htp-puzzle-tiles" aria-label="Spell steps">
              {chapter.tests.map((test, index) => {
                const result = results?.[index];
                const state = result ? result.passed ? "passed" : "failed" : !busy && goalReached && !results ? "passed" : "waiting";
                return <li key={test.label} data-state={state} aria-label={`${test.label}: ${state}`}>
                  {state === "passed" ? "✓" : state === "failed" ? "×" : index + 1}
                </li>;
              })}
            </ol>
          </div>
        </LevelStage>
        <ExecutionTrace running={busy} logs={consoleById[chapter.chapterId] ?? []}>
          <section className="sc-volume-checks" aria-label="Level goal checks" aria-live="polite">
            <h3><span>Goal checks</span><small>{goalReached ? chapter.tests.length : passedChecks} / {chapter.tests.length}</small></h3>
            <ol>
              {chapter.tests.map((test, index) => {
                const result = results?.[index];
                const passed = result ? result.passed : goalReached;
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
        </ExecutionTrace>
        </>} />

      <footer className="sc-volume-footer">
        <span>{progressStatus}</span>
        {chapterIndex === book.chapters.length - 1 && finished && <span role="status">This book is complete.</span>}
      </footer>
    </section>
  );
}
