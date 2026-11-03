import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";

import { sound } from "../../utils/sound";

import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Check,
  Lightbulb,
  Terminal,
  Trophy,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertTriangle,
  HelpCircle,
  Menu,
} from "lucide-react";

import { StageWorld } from "./StageWorld";
import { QuestDialogs } from "../../features/learning/QuestDialogs";
import { useQuestEngine } from "../../features/learning/useQuestEngine";
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
  const {
    preferences,
    updatePreferences,
    currentLessonId,
    lesson,
    code,
    setCode,
    showHint,
    setShowHint,
    showSolution,
    setShowSolution,
    setIsTutorialOpen,
    isExecuting,
    activeLine,
    errorPointer,
    setErrorPointer,
    terminalLogs,
    questSuccess,
    copiedCode,
    setCopiedCode,
    textareaRef,
    setIsChapterDrawerOpen,
    showTerminal,
    setShowTerminal,
    resetStage,
    handleRunCode,
    handleNextQuest,
    isEditorEmpty,
    isReadyToRun,
    currentStageInfo,
  } = state;
  return (
    <div className="sc-quest min-h-screen bg-[#0e0a19] text-[#FFF2D8] flex flex-col font-body selection:bg-magic selection:text-white">
      <header className="sc-quest-header">
        <button className="sc-link" onClick={onExit}>
          <ChevronLeft size={17} />
          Back to adventure
        </button>
        <div className="sc-row">
          <span className="sc-pill">Python-inspired teaching sandbox</span>
          <button
            className="sc-icon-button"
            aria-label="Toggle quest hint"
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb size={19} />
          </button>
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
              <Volume2 size={19} />
            ) : (
              <VolumeX size={19} />
            )}
          </button>
        </div>
      </header>

      {/* ── CHAPTER NAV STRIP (TOP) ── */}
      <div
        className="w-full border-b border-purple-800/30 relative"
        style={{
          background:
            "linear-gradient(135deg, #130a24 0%, #1f113a 50%, #130a24 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Chapters Trigger Pill */}
            <button
              onClick={() => {
                sound.playClick();
                setIsChapterDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-magic/20 hover:bg-magic/35 border border-magic/40 text-moonCream hover:text-white text-xs font-fantasy font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Open Chapters Menu"
            >
              <Menu className="w-4 h-4 text-spellPink" />
              <span>Chapters</span>
            </button>

            {/* Chapter Tag */}
            <span className="font-pixel text-[10px] text-manaMint bg-manaMint/10 border border-manaMint/30 px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 select-none">
              {lesson.chapter}
            </span>
          </div>
        </div>
      </div>

      {/* ── DEDICATED TITLE & OBJECTIVE BANNER (BELOW) ── */}
      <div
        className="w-full border-b border-purple-800/40 shadow-xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #10081f 0%, #1c0e35 50%, #10081f 100%)",
        }}
      >
        {/* Subtle accent sheen */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 50%, rgba(243,169,212,0.2) 0%, transparent 40%), radial-gradient(circle at 90% 50%, rgba(146,116,216,0.18) 0%, transparent 40%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Quest Title */}
          <h1
            className="font-fantasy font-black text-xl sm:text-2xl tracking-wide select-none shrink-0"
            style={{
              background: "linear-gradient(90deg, #fed894, #F3A9D4, #fed894)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {lesson.title}
          </h1>

          {/* Quest Objective - Expands to fill all available horizontal space */}
          <div className="w-full lg:flex-1 flex items-center gap-3 bg-[#090412]/85 border border-magic/35 rounded-2xl px-4 py-2.5 shadow-inner">
            <div className="w-7 h-7 rounded-lg bg-magic/20 border border-magic/30 flex items-center justify-center text-sm shrink-0 shadow-sm">
              🎯
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-pixel text-amber-300 font-bold uppercase tracking-wider leading-none mb-1">
                Mission Objective
              </div>
              <p className="text-xs sm:text-sm text-moonCream font-medium leading-relaxed">
                {lesson.taskObjective}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom luminous border line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-magic/50 to-transparent" />
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT: Code Editor (6 cols) ── */}
        <section className="lg:col-span-6 space-y-4">
          {/* Quick Hint Card */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 rounded-2xl bg-amber-950/60 border border-runeAmber/40 text-xs text-moonCream/95 flex items-start gap-2.5 shadow-lg"
              >
                <Lightbulb className="w-4 h-4 text-runeAmber shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="text-runeAmber">Hint:</strong>{" "}
                  {lesson.hint}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          <AnimatePresence>
            {errorPointer && (
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: [0, -8, 8, -8, 8, 0] }}
                transition={{ duration: 0.4 }}
                className="p-3.5 rounded-2xl bg-red-950/90 border-2 border-cursedRed text-xs shadow-lg flex items-start gap-3"
              >
                <div className="p-1.5 rounded-xl bg-cursedRed/20 text-cursedRed shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-fantasy font-bold text-white bg-cursedRed px-2 py-0.5 rounded">
                      Line {errorPointer.lineIndex + 1}
                    </span>
                    <span className="text-spellPink font-bold text-xs">
                      {errorPointer.message}
                    </span>
                  </div>
                  <div className="text-moonCream font-medium flex items-center gap-1.5 text-[11px] pt-0.5">
                    <span className="text-runeAmber font-bold">
                      👉 How to Fix:
                    </span>
                    <span>{errorPointer.suggestion}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code Editor Panel */}
          <div className="rounded-3xl bg-[#090610] border-2 border-magic/50 shadow-2xl overflow-hidden flex flex-col relative">
            {/* Tab header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#140e24] border-b border-purple-900/40 text-xs">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-spellPink" />
                <span className="font-code font-bold text-moonCream">
                  main.py
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    void navigator.clipboard
                      .writeText(code)
                      .catch(() =>
                        toast.error(
                          "Copy was blocked. Select and copy the code instead.",
                        ),
                      );
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-moonCream/70 hover:text-white px-2 py-1 rounded bg-white/5"
                >
                  {copiedCode ? (
                    <Check className="w-3 h-3 text-manaMint" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setCode(lesson.initialCode);
                    setErrorPointer(null);
                  }}
                  className="flex items-center gap-1 text-[11px] text-moonCream/70 hover:text-white px-2 py-1 rounded bg-white/5"
                  title="Clear or reset to template"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Editable Text Area with Line Numbers */}
            <div className="flex relative min-h-[220px]">
              {/* Line Numbers */}
              <div className="w-10 bg-[#0d0918] border-r border-white/5 p-3 select-none text-right font-code text-xs text-moonCream/30 leading-[20px]">
                {Array.from({
                  length: Math.max(10, code.split("\n").length),
                }).map((_, i) => {
                  const isErr = errorPointer?.lineIndex === i;
                  const isActive = activeLine === i;

                  return (
                    <div
                      key={i}
                      className={
                        isErr
                          ? "text-cursedRed font-bold bg-cursedRed/20 rounded"
                          : isActive
                            ? "text-runeAmber font-bold animate-pulse"
                            : ""
                      }
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>

              {/* Textarea: User types code here */}
              <div className="flex-1 relative">
                <textarea
                  aria-label="Quest code editor"
                  maxLength={20000}
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (errorPointer) setErrorPointer(null);
                  }}
                  spellCheck={false}
                  placeholder={`# 🪄 Inscribe your spell here\n# Follow the tasks on the left!`}
                  className="w-full h-full bg-transparent text-manaMint font-code text-xs p-3 focus:outline-none resize-none leading-[20px] selection:bg-magic selection:text-white min-h-[220px]"
                />

                {/* CONTEXTUAL ARROW: Points inside editor ONLY when editor is empty */}
                {isEditorEmpty && (
                  <div className="absolute top-14 left-4 flex items-center gap-2 pointer-events-none text-xs text-spellPink font-code bg-black/60 px-3 py-1.5 rounded-xl border border-spellPink/40 animate-pulse">
                    <span className="text-base font-black">👉</span>
                    <span>
                      Start typing here:{" "}
                      <code className="text-manaMint font-bold">
                        {lesson.tasks[0]?.codeKeyword}
                      </code>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cast Spell Footer Bar */}
            <div className="p-3 bg-[#140e24] border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-magic via-spellPink to-manaMint text-night-950 font-fantasy font-black text-xs shadow-magic hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {isExecuting
                      ? "Running Magic..."
                      : "▶ Cast Spell (Run Code)"}
                  </span>
                </motion.button>

                {/* CONTEXTUAL ARROW: Points to Cast Spell ONLY when ready to run */}
                {isReadyToRun && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-manaMint font-fantasy font-bold animate-pulse">
                    <ArrowLeft className="w-3.5 h-3.5 text-manaMint animate-bounce" />
                    <span>All set! Click Cast Spell!</span>
                  </div>
                )}
              </div>

              {/* Utility Tools Bar: How to Play, Solution, Reset, Terminal */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsTutorialOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-magic/20 hover:bg-magic/35 border border-magic/40 text-xs text-spellPink font-fantasy font-bold transition-all cursor-pointer shadow-sm"
                  title="How to play this quest"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>How to Play</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setShowSolution(!showSolution);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-fantasy font-bold transition-all cursor-pointer",
                    showSolution
                      ? "bg-spellPink/20 border-spellPink/50 text-spellPink"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-moonCream/80",
                  )}
                  title="Toggle Solution Code"
                >
                  {showSolution ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>{showSolution ? "Hide Solution" : "Solution"}</span>
                </button>

                <button
                  onClick={resetStage}
                  disabled={isExecuting}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-moonCream/80 text-xs border border-white/10 cursor-pointer"
                  title="Reset Stage Simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                {/* Terminal Toggle */}
                <button
                  onClick={() => setShowTerminal((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs border transition-colors cursor-pointer",
                    showTerminal
                      ? "bg-manaMint/20 border-manaMint/40 text-manaMint"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-moonCream/60",
                  )}
                  title="Toggle Console Output Terminal"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-code hidden sm:inline">
                    Console
                  </span>
                  {showTerminal ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Solution Banner – collapsible downward drawer */}
          <AnimatePresence>
            {showSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-2xl bg-[#282132] border border-spellPink/50 text-xs space-y-2 shadow-xl">
                  <div className="font-fantasy font-bold text-spellPink flex items-center justify-between">
                    <span>📜 Solution Code</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCode(lesson.solutionCode);
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-spellPink text-night-950 font-bold hover:bg-white transition-colors cursor-pointer"
                    >
                      Insert to Editor
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-[#090610] font-code text-xs text-manaMint overflow-x-auto">
                    <code>{lesson.solutionCode}</code>
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminal — collapsible */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="overflow-hidden rounded-3xl bg-[#090610] border border-white/10 shadow-lg"
              >
                <div className="px-4 py-2 bg-[#120d1e] border-b border-white/5 flex items-center gap-1.5 text-xs text-moonCream/50 font-code">
                  <Terminal className="w-3.5 h-3.5 text-manaMint" />
                  <span>Console Output</span>
                </div>

                <div className="p-3 font-code text-xs space-y-1 max-h-40 overflow-y-auto leading-relaxed">
                  {terminalLogs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes("❌") || log.includes("Error")
                          ? "text-cursedRed font-semibold"
                          : log.includes("🎉")
                            ? "text-manaMint font-bold"
                            : log.startsWith("$")
                              ? "text-moonCream/40"
                              : "text-manaMint/90"
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── RIGHT: Magic Stage (6 cols - Expanded) ── */}
        <section className="lg:col-span-6">
          <div className="rounded-3xl bg-[#140e24] border border-purple-900/40 shadow-2xl min-h-[580px] flex flex-col overflow-hidden">
            {/* Stage Header */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]">
                  {currentStageInfo.emoji}
                </span>
                <span className="font-fantasy font-black text-lg sm:text-xl text-moonCream tracking-wide">
                  {currentStageInfo.name}
                </span>
              </div>
              <span className="text-[11px] font-pixel text-manaMint bg-manaMint/10 px-2.5 py-1 rounded-md border border-manaMint/20">
                LIVE SANDBOX
              </span>
            </div>

            {/* Stage World Canvas */}
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="flex flex-col items-center justify-center gap-4 w-full">
                <StageWorld state={state} />
              </div>
            </div>

            {/* Quest Success Banner */}
            <AnimatePresence>
              {questSuccess && (
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className="mx-4 mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-900/80 to-emerald-950/90 border-2 border-manaMint flex items-center justify-between shadow-mana"
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-5 h-5 text-manaMint animate-bounce" />
                    <div>
                      <div className="text-xs font-fantasy font-bold text-manaMint">
                        Quest Completed!
                      </div>
                      <div className="text-[10px] text-moonCream/80">
                        You mastered {lesson.conceptName}.
                      </div>
                    </div>
                  </div>

                  {currentLessonId < CODEDEX_LESSONS.length && (
                    <button
                      onClick={handleNextQuest}
                      className="px-4 py-2 rounded-xl bg-manaMint text-night-950 font-fantasy font-black text-xs shadow-md hover:bg-white transition-all flex items-center gap-1 shrink-0 animate-bounce cursor-pointer"
                    >
                      <span>Next Quest</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <QuestDialogs state={state} />
    </div>
  );
};
