import toast from "react-hot-toast";
import { useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  HelpCircle,
  Play,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { StageWorld } from "./StageWorld";
import { QuestDialogs } from "../../features/learning/QuestDialogs";
import { useQuestEngine } from "../../features/learning/useQuestEngine";
import { StoryArtwork } from "../../features/story/StoryArtwork";
import { chapterOutcome } from "../../content/eldoria";
import { FOREST_CHAPTERS, FOREST_OUTCOMES } from "../../content/forestCampaign";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";

export const CodedexApp = ({
  initialLessonId = 1,
  onExit = () => {},
  onLessonChange,
}: {
  initialLessonId?: number;
  onExit?: () => void;
  onLessonChange?: (id: number) => void;
}) => {
  const state = useQuestEngine(initialLessonId, onLessonChange);
  const worldRef = useRef<HTMLElement>(null);
  const {
    lesson,
    code,
    setCode,
    preferences,
    updatePreferences,
    isExecuting,
    activeLine,
    errorPointer,
    setErrorPointer,
    questSuccess,
    terminalLogs,
    setIsTutorialOpen,
    textareaRef,
    copiedCode,
    setCopiedCode,
    resetStage,
    handleRunCode,
    handleNextQuest,
    currentStageInfo,
  } = state;
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Copy was blocked. Select and copy the code instead.");
    }
  }
  return (
    <div className="sc-page sc-simple-quest">
      <div className="sc-quest-topline">
        <button className="sc-link sc-context-back" onClick={onExit}>
          <ArrowLeft size={16} />
          Quests
        </button>
        <span>
          Quest {lesson.id} of {CODEDEX_LESSONS.length}
        </span>
        <button
          className="sc-icon-button"
          aria-label={
            preferences.sound_effects
              ? "Disable sound effects"
              : "Enable sound effects"
          }
          onClick={() =>
            void updatePreferences({
              sound_effects: !preferences.sound_effects,
            }).catch(() => {})
          }
        >
          {preferences.sound_effects ? (
            <Volume2 size={18} />
          ) : (
            <VolumeX size={18} />
          )}
        </button>
      </div>
      <header className="sc-quest-intro">
        <h1>{lesson.title}</h1>
        <p>{lesson.taskObjective}</p>
        {FOREST_CHAPTERS.find((chapter) => chapter.id === lesson.id) && (
          <p className="sc-chapter-story">
            {FOREST_CHAPTERS.find((chapter) => chapter.id === lesson.id)?.story}
          </p>
        )}
      </header>
      <div className="sc-coding-layout">
        <section className="sc-card sc-spell-editor">
          <header>
            <h2>Your spell</h2>
            <div>
              <button
                className="sc-icon-button"
                onClick={() => void copyCode()}
                aria-label={copiedCode ? "Code copied" : "Copy code"}
              >
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button
                className="sc-icon-button"
                aria-label="Reset code and world"
                disabled={isExecuting}
                onClick={() => {
                  resetStage();
                  setCode(lesson.initialCode);
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </header>
          <div className="sc-code-input">
            <div className="sc-code-lines" aria-hidden="true">
              {Array.from(
                { length: Math.max(12, code.split("\n").length) },
                (_, i) => (
                  <div
                    key={i}
                    className={
                      errorPointer?.lineIndex === i
                        ? "error"
                        : activeLine === i
                          ? "active"
                          : ""
                    }
                  >
                    {i + 1}
                  </div>
                ),
              )}
            </div>
            <textarea
              aria-label="Quest code editor"
              ref={textareaRef}
              maxLength={20000}
              value={code}
              readOnly={isExecuting}
              onChange={(e) => {
                setCode(e.target.value);
                if (errorPointer) setErrorPointer(null);
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder={lesson.tasks[0]?.codeKeyword}
            />
          </div>
          {errorPointer && (
            <div className="sc-code-error" role="alert">
              <strong>
                Line {errorPointer.lineIndex + 1}: {errorPointer.message}
              </strong>
              <p>{errorPointer.suggestion}</p>
            </div>
          )}
          <div className="sc-spell-actions">
            <button
              className="sc-button mint"
              onClick={() => {
                if (window.matchMedia("(max-width: 1100px)").matches) {
                  worldRef.current?.scrollIntoView({
                    block: "start",
                    behavior:
                      preferences.reduced_motion ||
                      window.matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "auto"
                        : "smooth",
                  });
                }
                void handleRunCode();
              }}
              disabled={isExecuting}
            >
              <Play size={16} />
              {isExecuting ? "Running…" : "Run spell"}
            </button>
            {isExecuting && (
              <button className="sc-button secondary" onClick={state.stopRun}>
                <Square size={14} />
                Stop
              </button>
            )}
            <button
              className="sc-button secondary"
              onClick={() => setIsTutorialOpen(true)}
            >
              <HelpCircle size={16} />
              Quest guide
            </button>
          </div>
          <details className="sc-quest-disclosure">
            <summary>Need a hint?</summary>
            <p>{lesson.hint}</p>
            <details>
              <summary>Show solution</summary>
              <pre>
                <code>{lesson.solutionCode}</code>
              </pre>
              <button
                className="sc-link"
                disabled={isExecuting}
                onClick={() => {
                  setCode(lesson.solutionCode);
                  setErrorPointer(null);
                }}
              >
                Use this code
                <ArrowRight size={14} />
              </button>
            </details>
          </details>
          <details className="sc-quest-disclosure">
            <summary>Console</summary>
            <pre className="sc-code-log" aria-live="polite">
              {terminalLogs.join("\n")}
            </pre>
          </details>
        </section>
        <section className="sc-card sc-live-world" ref={worldRef}>
          <header>
            <h2>{currentStageInfo.name}</h2>
            <span className={questSuccess ? "complete" : ""}>
              {questSuccess ? "Complete" : isExecuting ? "Running" : "Ready"}
            </span>
          </header>
          <div className="sc-playback-bar">
            <span>
              {state.executionStep.total
                ? `Step ${state.executionStep.current} / ${state.executionStep.total}`
                : "Watch your spell unfold"}
            </span>
            <label>
              Pace{" "}
              <select
                aria-label="Animation pace"
                value={state.stepDuration}
                disabled={isExecuting}
                onChange={(e) => state.setStepDuration(Number(e.target.value))}
              >
                <option value={1100}>Relaxed</option>
                <option value={750}>Steady</option>
                <option value={450}>Quick</option>
              </select>
            </label>
          </div>
          <div className="sc-stage-canvas">
            {lesson.stageType !== "boss" && (
              <div className="sc-stage-backdrop">
                <StoryArtwork lesson={lesson.id} decorative compact />
              </div>
            )}
            <div className="sc-stage-content">
              <StageWorld state={state} />
            </div>
          </div>
          <p className="sc-action-caption" role="status">
            {questSuccess
              ? "Beautifully done. Your spell worked."
              : state.executionStep.label}
          </p>
          {questSuccess && (
            <div className="sc-quest-result" role="status">
              <div>
                <Check size={18} />
                <strong>Quest complete</strong>
              </div>
              <button
                className="sc-button mint"
                onClick={
                  lesson.id < CODEDEX_LESSONS.length ? handleNextQuest : onExit
                }
              >
                {lesson.id < CODEDEX_LESSONS.length
                  ? "Next quest"
                  : "Back to quests"}
                <ArrowRight size={16} />
              </button>
              <details>
                <summary>What happens next?</summary>
                <p>
                  {lesson.id <= 8
                    ? chapterOutcome(lesson.id, state.completedLessons)
                    : FOREST_OUTCOMES[lesson.id]}
                </p>
              </details>
            </div>
          )}
        </section>
      </div>
      <QuestDialogs state={state} />
    </div>
  );
};
