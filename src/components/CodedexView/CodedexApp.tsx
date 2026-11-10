import { CodingEditorPanel } from "../../features/learning/CodingEditorPanel";
import { QuestAftermath } from "../../features/learning/QuestAftermath";
import { realmForLesson } from "../../content/journey";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
} from "lucide-react";
import { StageWorld } from "./StageWorld";
import { QuestDialogs } from "../../features/learning/QuestDialogs";
import { useQuestEngine } from "../../features/learning/useQuestEngine";
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
  const [bridgeCrossed, setBridgeCrossed] = useState(false);
  useEffect(() => {
    if (!questSuccess) setBridgeCrossed(false);
  }, [questSuccess, lesson.id]);
  const crossing = lesson.stageType === "bridge" && questSuccess && !bridgeCrossed;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error("Copy was blocked. Select and copy the code instead.");
    }
  }
  if (questSuccess && !crossing) return <QuestAftermath key={lesson.id} id={lesson.id} code={code} logs={terminalLogs} onContinue={lesson.id < CODEDEX_LESSONS.length ? handleNextQuest : onExit}/>;

  return (
    <div className="sc-page sc-simple-quest sc-coding-book--cinder">
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
        <span className="sc-coding-book__type">THE LAST LIGHT <i aria-hidden="true">·</i> LEVEL TYPE: {lesson.conceptName}</span>
        <h1>{lesson.title}</h1>
        <p>{lesson.taskObjective}</p>
        {FOREST_CHAPTERS.find((chapter) => chapter.id === lesson.id) && (
          <p className="sc-chapter-story">
            {FOREST_CHAPTERS.find((chapter) => chapter.id === lesson.id)?.story}
          </p>
        )}
      </header>
      <div className="sc-coding-layout sc-coding-book-spread">
        <CodingEditorPanel
          code={code}
          onCodeChange={(next) => {
            setCode(next);
            if (errorPointer) setErrorPointer(null);
          }}
          onRun={() => {
            if (window.matchMedia("(max-width: 1100px)").matches) {
              worldRef.current?.scrollIntoView({
                block: "start",
                behavior:
                  preferences.reduced_motion ||
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
              });
            }
            void handleRunCode();
          }}
          onReset={() => {
            resetStage();
            setCode(lesson.initialCode);
          }}
          onCopy={() => void copyCode()}
          onGuide={() => setIsTutorialOpen(true)}
          onStop={state.stopRun}
          onSolutionUse={(next) => {
            if (isExecuting) return;
            setCode(next);
            setErrorPointer(null);
          }}
          sparkBookId="cinder"
          sparkLessonId={lesson.id}
          isRunning={isExecuting}
          copied={copiedCode}
          activeLine={activeLine}
          error={errorPointer}
          textareaRef={textareaRef}
          consoleLogs={terminalLogs}
        />
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

            <div className="sc-stage-content">
              <StageWorld key={lesson.id} state={state} bridgeCrossed={bridgeCrossed}
                onBridgeCrossed={() => setBridgeCrossed(true)} />
            </div>
          </div>
          <p className="sc-action-caption" role="status">
            {questSuccess
              ? crossing ? "Crossing the bridge…" : "Quest complete"
              : state.executionStep.label}
          </p>

        </section>
      </div>
      <QuestDialogs state={state} />
    </div>
  );
};
