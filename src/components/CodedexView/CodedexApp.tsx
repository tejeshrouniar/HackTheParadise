import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CODEDEX_LESSONS, CodedexLesson } from '../../data/codedexLessons';
import { useProgress } from '../../features/learning/ProgressContext';
import { usePreferences } from '../../features/settings/PreferencesContext';
import { compileQuestCode, QuestCodeError } from '../../features/learning/questCompiler';
import { sound } from '../../utils/sound';


import {
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
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
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  X,
  Menu,
} from 'lucide-react';

import { useQuestEngine } from '../../features/learning/useQuestEngine';
export const CodedexApp = ({initialLessonId=1,onExit=()=>{},onLessonChange}:{initialLessonId?:number;onExit?:()=>void;onLessonChange?:(id:number)=>void}) => {
  const { completedLessons, complete, preferences, updatePreferences, runId, running, currentLessonId, changeLessonId, setCurrentLessonId, lesson, code, setCode, showHint, setShowHint, showSolution, setShowSolution, isTutorialOpen, setIsTutorialOpen, isExecuting, setIsExecuting, activeLine, setActiveLine, errorPointer, setErrorPointer, terminalLogs, setTerminalLogs, questSuccess, setQuestSuccess, dragon, setDragon, collectedCrystal, setCollectedCrystal, potionVars, setPotionVars, isBrewed, setIsBrewed, bloomedFlowers, setBloomedFlowers, bridgeTiles, setBridgeTiles, purifiedRunes, setPurifiedRunes, stargateFlux, setStargateFlux, stargateRingsAligned, setStargateRingsAligned, chronoCrystals, setChronoCrystals, isVortexStabilized, setIsVortexStabilized, bossHp, setBossHp, playerShield, setPlayerShield, bossHitFlash, setBossHitFlash, isMuted, setIsMuted, copiedCode, setCopiedCode, textareaRef, isChapterDrawerOpen, setIsChapterDrawerOpen, showTerminal, setShowTerminal, resetStage, handleRunCode, moveDragon, turnDragon, checkQuestVictory, handleNextQuest, isTaskTyped, codeLinesWithoutComments, isEditorEmpty, nextIncompleteTaskIndex, allTasksTyped, isReadyToRun, currentStageInfo } = useQuestEngine(initialLessonId,onLessonChange);
  return (
    <div className="sc-quest min-h-screen bg-[#0e0a19] text-[#FFF2D8] flex flex-col font-body selection:bg-magic selection:text-white">
      <header className="sc-quest-header"><button className="sc-link" onClick={onExit}><ChevronLeft size={17}/>Back to adventure</button><div className="sc-row"><span className="sc-pill">Python-inspired teaching sandbox</span><button className="sc-icon-button" aria-label="Toggle quest hint" onClick={()=>setShowHint(!showHint)}><Lightbulb size={19}/></button><button className="sc-icon-button" aria-label={preferences.sound_effects?'Disable sound effects':'Enable sound effects'} onClick={()=>void updatePreferences({sound_effects:!preferences.sound_effects}).catch(()=>{})}>{preferences.sound_effects?<Volume2 size={19}/>:<VolumeX size={19}/>}</button></div></header>

      {/* ── CHAPTER NAV STRIP (TOP) ── */}
      <div
        className="w-full border-b border-purple-800/30 relative"
        style={{ background: 'linear-gradient(135deg, #130a24 0%, #1f113a 50%, #130a24 100%)' }}
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
          background: 'linear-gradient(135deg, #10081f 0%, #1c0e35 50%, #10081f 100%)',
        }}
      >
        {/* Subtle accent sheen */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 10% 50%, rgba(243,169,212,0.2) 0%, transparent 40%), radial-gradient(circle at 90% 50%, rgba(146,116,216,0.18) 0%, transparent 40%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Quest Title */}
          <h1
            className="font-fantasy font-black text-xl sm:text-2xl tracking-wide select-none shrink-0"
            style={{
              background: 'linear-gradient(90deg, #fed894, #F3A9D4, #fed894)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

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
                  <strong className="text-runeAmber">Hint:</strong> {lesson.hint}
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
                    <span className="text-runeAmber font-bold">👉 How to Fix:</span>
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
                <span className="font-code font-bold text-moonCream">main.py</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] text-moonCream/70 hover:text-white px-2 py-1 rounded bg-white/5"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-manaMint" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
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
                {Array.from({ length: Math.max(10, code.split('\n').length) }).map((_, i) => {
                  const isErr = errorPointer?.lineIndex === i;
                  const isActive = activeLine === i;

                  return (
                    <div
                      key={i}
                      className={
                        isErr
                          ? 'text-cursedRed font-bold bg-cursedRed/20 rounded'
                          : isActive
                          ? 'text-runeAmber font-bold animate-pulse'
                          : ''
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
                      Start typing here: <code className="text-manaMint font-bold">{lesson.tasks[0]?.codeKeyword}</code>
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
                  <span>{isExecuting ? 'Running Magic...' : '▶ Cast Spell (Run Code)'}</span>
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
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-fantasy font-bold transition-all cursor-pointer',
                    showSolution
                      ? 'bg-spellPink/20 border-spellPink/50 text-spellPink'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-moonCream/80'
                  )}
                  title="Toggle Solution Code"
                >
                  {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSolution ? 'Hide Solution' : 'Solution'}</span>
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
                    'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs border transition-colors cursor-pointer',
                    showTerminal
                      ? 'bg-manaMint/20 border-manaMint/40 text-manaMint'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-moonCream/60'
                  )}
                  title="Toggle Console Output Terminal"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-code hidden sm:inline">Console</span>
                  {showTerminal ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Solution Banner – collapsible downward drawer */}
          <AnimatePresence>
            {showSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-spellPink/50 text-xs space-y-2 shadow-xl">
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
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
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
                        log.includes('❌') || log.includes('Error')
                          ? 'text-cursedRed font-semibold'
                          : log.includes('🎉')
                          ? 'text-manaMint font-bold'
                          : log.startsWith('$')
                          ? 'text-moonCream/40'
                          : 'text-manaMint/90'
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

                {/* Level 1: Dragon 5x5 Grid */}
                {lesson.stageType === 'dragon' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 w-full"
                  >
                    <div className="grid grid-cols-5 gap-2.5 p-4 rounded-2xl bg-[#090610] border border-magic/40 w-full max-w-sm aspect-square shadow-2xl">
                      {Array.from({ length: 25 }).map((_, idx) => {
                        const x = idx % 5;
                        const y = Math.floor(idx / 5);
                        const isDragon = dragon.x === x && dragon.y === y;
                        const isTarget = x === 2 && y === 2;
                        const isRock = x === 1 && y === 1;
                        const isErrorTile = errorPointer?.tileCoords?.x === x && errorPointer?.tileCoords?.y === y;

                        return (
                          <div
                            key={idx}
                            className={cn(
                              'relative rounded-xl border flex items-center justify-center transition-all',
                              isErrorTile
                                ? 'bg-red-950/80 border-cursedRed ring-2 ring-cursedRed shadow-[0_0_15px_rgba(255,89,100,0.8)]'
                                : isDragon
                                ? 'bg-magic/35 border-magic shadow-magic scale-105'
                                : isTarget
                                ? 'bg-amber-500/20 border-amber-400/80 animate-pulse'
                                : isRock
                                ? 'bg-red-950/50 border-red-900/50'
                                : 'bg-white/5 border-white/5'
                            )}
                          >
                            {/* DYNAMIC ERROR ARROW */}
                            {isErrorTile && (
                              <div className="absolute -top-7 z-30 flex flex-col items-center animate-bounce pointer-events-none">
                                <span className="text-[9px] font-bold text-white bg-cursedRed px-1.5 py-0.5 rounded shadow">
                                  Blocked!
                                </span>
                                <ArrowDown className="w-3.5 h-3.5 text-cursedRed stroke-[3]" />
                              </div>
                            )}

                            {isTarget && (
                              <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,179,71,0.9)] animate-bounce">
                                💎
                              </span>
                            )}

                            {isRock && <span className="text-lg">🪨</span>}

                            {isDragon && (
                              <div
                                className={cn(
                                  'text-2xl transition-transform duration-300',
                                  dragon.direction === 'RIGHT'
                                    ? 'rotate-0'
                                    : dragon.direction === 'DOWN'
                                    ? 'rotate-90'
                                    : dragon.direction === 'LEFT'
                                    ? 'rotate-180 -scale-y-100'
                                    : '-rotate-90'
                                )}
                              >
                                🐲
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs text-moonCream/80 flex items-center gap-3 font-code">
                      <span>Pos: ({dragon.x}, {dragon.y})</span>
                      <span>Facing: {dragon.direction}</span>
                      <span className="text-runeAmber font-bold">
                        {collectedCrystal ? 'Crystal Collected 💎' : '0/1 Crystal'}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Level 2: Potion Cauldron */}
                {lesson.stageType === 'potion' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6 w-full max-w-md py-4"
                  >
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="p-4 rounded-2xl bg-[#0e0a19]/90 border border-spellPink/50 text-center shadow-lg">
                        <span className="text-3xl">🍾</span>
                        <div className="text-xs font-code font-bold text-moonCream mt-1.5">mana_flask</div>
                        <div className="text-base font-bold text-spellPink font-code mt-0.5">
                          {potionVars['mana_flask'] !== undefined ? potionVars['mana_flask'] : 'empty'}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0e0a19]/90 border border-manaMint/50 text-center shadow-lg">
                        <span className="text-3xl">✨</span>
                        <div className="text-xs font-code font-bold text-moonCream mt-1.5">star_dew</div>
                        <div className="text-base font-bold text-manaMint font-code mt-0.5">
                          {potionVars['star_dew'] !== undefined ? potionVars['star_dew'] : 'empty'}
                        </div>
                      </div>
                    </div>

                    <div className="relative w-48 h-36 rounded-b-[4.5rem] bg-gradient-to-b from-[#35254a] to-[#160d21] border-4 border-[#523b72] flex items-center justify-center shadow-2xl">
                      <div
                        className={cn(
                          'w-36 h-20 rounded-b-[4rem] transition-all duration-700 flex items-center justify-center',
                          isBrewed
                            ? 'bg-gradient-to-r from-spellPink via-magic to-manaMint shadow-[0_0_30px_rgba(243,169,212,0.9)]'
                            : 'bg-purple-950/50'
                        )}
                      >
                        <span className="text-3xl animate-bounce">{isBrewed ? '🌟' : '🫧'}</span>
                      </div>
                    </div>

                    <div className="text-sm font-code text-moonCream font-medium bg-[#0e0a19]/70 px-4 py-1.5 rounded-xl border border-white/10">
                      Cauldron: {isBrewed ? 'Elixir Transmuted! 🎉' : 'Awaiting ingredients...'}
                    </div>
                  </motion.div>
                )}

                {/* Level 3: Garden */}
                {lesson.stageType === 'garden' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 w-full max-w-sm"
                  >
                    <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#0a1813] border border-manaMint/40 shadow-inner w-full">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const isBloomed = idx < bloomedFlowers;

                        return (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0.8, opacity: 0.4 }}
                            animate={isBloomed ? { scale: 1.05, opacity: 1 } : { scale: 1, opacity: 0.4 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                              'aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300',
                              isBloomed
                                ? 'bg-manaMint/25 border border-manaMint shadow-mana'
                                : 'bg-[#0e0a19]/60 border border-white/5'
                            )}
                          >
                            <span className="text-3xl">{isBloomed ? '🌸' : '🌱'}</span>
                            <span className="text-[10px] font-bold text-manaMint mt-1">
                              {isBloomed ? `Bloom ${idx + 1}` : 'Seed'}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="text-xs font-code font-bold text-manaMint">
                      {bloomedFlowers} / 6 Flowers Bloomed
                    </div>
                  </motion.div>
                )}

                {/* Level 4: Bridge */}
                {lesson.stageType === 'bridge' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between gap-1 w-full max-w-sm py-4"
                  >
                    <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
                      <span className="text-2xl">🧙‍♂️</span>
                      <span className="text-[9px] text-white/60">Cliff</span>
                    </div>

                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 h-12 rounded-lg border flex items-center justify-center text-xs transition-all',
                          i < bridgeTiles
                            ? 'bg-gradient-to-t from-magic to-manaMint border-manaMint shadow-mana text-night-950 font-bold scale-105'
                            : 'bg-white/5 border-dashed border-white/10 opacity-30'
                        )}
                      >
                        {i < bridgeTiles ? '✨' : ''}
                      </div>
                    ))}

                    <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
                      <span className="text-2xl">🏰</span>
                      <span className="text-[9px] text-white/60">Tower</span>
                    </div>
                  </motion.div>
                )}

                {/* Level 5: Curse */}
                {lesson.stageType === 'curse' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
                  >
                    <div className="flex items-center justify-center gap-3">
                      {[
                        { id: 1, sym: 'ᚠ' },
                        { id: 2, sym: 'ᚢ' },
                        { id: 3, sym: 'ᚦ' },
                      ].map((r) => {
                        const isClean = purifiedRunes.includes(r.id);

                        return (
                          <div
                            key={r.id}
                            className={cn(
                              'w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all',
                              isClean
                                ? 'bg-manaMint/20 border-manaMint text-manaMint shadow-mana scale-105'
                                : 'bg-red-950/40 border-cursedRed text-cursedRed animate-pulse'
                            )}
                          >
                            <span className="text-2xl font-bold">{r.sym}</span>
                            <span className="text-[10px] mt-1 font-code">#{r.id}</span>
                            <span className="text-[8px] uppercase font-bold">
                              {isClean ? 'Clean' : 'Cursed'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0e0a19]/70 border border-white/10 text-center w-full text-xs">
                      Dungeon Vault:{' '}
                      <strong className={purifiedRunes.length === 3 ? 'text-manaMint' : 'text-cursedRed'}>
                        {purifiedRunes.length === 3 ? '🔓 UNLOCKED!' : '🔒 SEALED BY HEX'}
                      </strong>
                    </div>
                  </motion.div>
                )}

                {/* Level 6: Stargate */}
                {lesson.stageType === 'stargate' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
                  >
                    <div className="relative w-44 h-44 rounded-full flex items-center justify-center border-4 border-dashed border-[#8B5CF6]/40 p-2">
                      {/* Ring 1 */}
                      <div
                        className={cn(
                          'absolute inset-2 rounded-full border-2 transition-all duration-1000',
                          stargateRingsAligned
                            ? 'border-[#5EEAD4] shadow-[0_0_20px_#5EEAD4] rotate-0'
                            : 'border-white/20 rotate-45'
                        )}
                      />
                      {/* Ring 2 */}
                      <div
                        className={cn(
                          'absolute inset-5 rounded-full border-2 transition-all duration-1000',
                          stargateRingsAligned
                            ? 'border-[#F472B6] shadow-[0_0_20px_#F472B6] rotate-0'
                            : 'border-white/20 -rotate-90'
                        )}
                      />
                      {/* Ring 3 (Inner Portal) */}
                      <div
                        className={cn(
                          'w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all duration-700',
                          stargateFlux >= 200
                            ? 'bg-gradient-to-tr from-[#5EEAD4] via-[#8B5CF6] to-[#F472B6] shadow-[0_0_35px_rgba(94,234,212,0.9)] scale-110 animate-spin'
                            : 'bg-black/60 border border-white/20'
                        )}
                      >
                        {stargateFlux >= 200 ? '🌌' : '🪐'}
                      </div>
                    </div>

                    {/* Flux Power Meter */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs font-code">
                        <span className="text-[#5EEAD4]">Stargate Flux</span>
                        <span className="font-bold text-[#F472B6]">{stargateFlux} / 200 MW</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-[#5EEAD4] via-[#8B5CF6] to-[#F472B6] transition-all duration-500"
                          style={{ width: `${Math.min(100, (stargateFlux / 200) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] font-code text-center text-white/80">
                      Status: {stargateFlux >= 200 ? '🌌 WORMHOLE ACTIVE & STABLE' : '⚡ AWAITING POWER INJECTION'}
                    </div>
                  </motion.div>
                )}

                {/* Level 7: Chrono Matrix */}
                {lesson.stageType === 'chrono' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
                  >
                    <div className="grid grid-cols-4 gap-2 w-full">
                      {chronoCrystals.map((val, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500',
                            val === idx + 1
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105'
                              : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
                          )}
                        >
                          <span className="text-2xl animate-bounce" style={{ animationDelay: `${idx * 0.15}s` }}>
                            💎
                          </span>
                          <span className="font-pixel text-lg font-bold">#{val}</span>
                          <span className="text-[9px] font-code opacity-60">idx [{idx}]</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-full p-2.5 rounded-xl bg-[#0e0a19]/70 border border-white/10 text-center text-xs">
                      Timeline Vortex:{' '}
                      <strong className={isVortexStabilized ? 'text-emerald-400' : 'text-amber-400'}>
                        {isVortexStabilized ? '🌀 100% STABILIZED (NO PARADOX)' : '⚠️ CHRONO ANOMALY DETECTED'}
                      </strong>
                    </div>
                  </motion.div>
                )}

                {/* Level 8: Boss Battle Arena */}
                {lesson.stageType === 'boss' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
                  >
                    {/* Glitch Chimera Sprite */}
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'text-6xl transition-all duration-200',
                          bossHitFlash ? 'scale-125 filter drop-shadow-[0_0_25px_#EF4444]' : 'animate-bounce'
                        )}
                        style={{ animationDuration: '2s' }}
                      >
                        👾
                      </div>
                      <div className="font-pixel text-[11px] text-[#F472B6] font-bold mt-1">
                        Glitch Chimera Overlord
                      </div>
                    </div>

                    {/* Boss Health Bar */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs font-code">
                        <span className="text-red-400">Boss HP</span>
                        <span className="font-bold text-red-400">{bossHp} / 100 HP</span>
                      </div>
                      <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-red-500/40">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-400"
                          style={{ width: `${Math.max(0, bossHp)}%` }}
                        />
                      </div>
                    </div>

                    {/* Player Mana Shield */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs font-code">
                        <span className="text-[#5EEAD4]">Player Mana Shield</span>
                        <span className="font-bold text-[#5EEAD4]">{playerShield} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/40">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-[#5EEAD4] transition-all duration-400"
                          style={{ width: `${Math.min(100, playerShield)}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] font-code text-center">
                      {bossHp <= 0 ? (
                        <span className="text-emerald-400 font-bold">🏆 VICTORY! ARCHMAGE TITLE CONFERRED!</span>
                      ) : (
                        <span className="text-amber-300">⚔️ COMBAT ENGAGED: DEFEND & SMITE</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quest Success Banner */}
            <AnimatePresence>
              {questSuccess && (
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
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
      </main>

      {/* ── CHAPTER DRAWER (slides from left) ── */}
      <AnimatePresence>
        {isChapterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsChapterDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#130d22] border-r border-magic/30 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="font-fantasy font-bold text-moonCream flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-spellPink" /> Chapters
                </h2>
                <button
                  onClick={() => setIsChapterDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white/60 hover:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {CODEDEX_LESSONS.map((l) => {
                  const isCurrent = l.id === currentLessonId;
                  const isDone = completedLessons.includes(l.id);

                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        sound.playClick();
                        setCurrentLessonId(l.id);
                        setIsChapterDrawerOpen(false);
                      }}
                      className={cn(
                        'w-full text-left p-3 rounded-xl flex items-center gap-3 transition-transform duration-150 active:scale-[0.98] cursor-pointer',
                        isCurrent ? 'bg-magic/25 border border-magic/50 shadow-sm' : 'hover:bg-white/5'
                      )}
                    >
                      <span
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-pixel shrink-0',
                          isCurrent
                            ? 'bg-magic text-white'
                            : isDone
                            ? 'bg-manaMint/20 text-manaMint'
                            : 'bg-white/10 text-white/50'
                        )}
                      >
                        {isDone && !isCurrent ? '✓' : l.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'text-sm font-fantasy font-bold truncate',
                            isCurrent ? 'text-moonCream' : 'text-moonCream/80'
                          )}
                        >
                          {l.title}
                        </div>
                        <div className="text-[10px] text-moonCream/40 font-code truncate">{l.chapter}</div>
                      </div>
                      {isCurrent && <ChevronRight className="w-4 h-4 text-magic shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── TUTORIAL POPUP MODAL ── */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#151026] border-2 border-magic/50 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto relative text-moonCream">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-magic/20 border border-magic/40 text-spellPink text-xs font-pixel uppercase">
                    {lesson.chapter}
                  </span>
                  <span className="text-xs font-code text-manaMint font-semibold">
                    {completedLessons.includes(lesson.id) ? '✓ Completed' : 'In Progress'}
                  </span>
                </div>
                <h2 className="font-fantasy font-black text-2xl text-moonCream">
                  {lesson.title}
                </h2>
                <div className="text-xs text-magic-light">
                  Concept: <strong className="text-moonCream">{lesson.conceptName}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsTutorialOpen(false);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Close Tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Concept Explanation */}
            <div className="space-y-2">
              <h3 className="font-fantasy font-bold text-sm text-moonCream flex items-center gap-1.5">
                <span>📖</span> {lesson.whatIsThisTitle}
              </h3>
              <p className="text-xs text-moonCream/85 leading-relaxed">
                {lesson.whatIsThisBody}
              </p>
              {lesson.whatIsThisCallout && (
                <div className="p-3 rounded-xl bg-magic/15 border border-magic/30 text-xs text-magic-light leading-snug">
                  💡 <strong>Key Insight:</strong> {lesson.whatIsThisCallout}
                </div>
              )}
            </div>

            {/* Section 2: How to write it (Syntax Example) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-fantasy font-bold text-sm text-moonCream flex items-center gap-1.5">
                  <span>🪄</span> {lesson.howToWriteTitle}
                </h3>
                <button
                  onClick={() => {
                    sound.playClick();
                    setCode(lesson.codeExample);
                    setIsTutorialOpen(false);
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-magic/25 hover:bg-magic/40 border border-magic/50 text-spellPink font-bold transition-colors cursor-pointer"
                >
                  Insert Example into Editor
                </button>
              </div>
              <p className="text-xs text-moonCream/85 leading-relaxed">
                {lesson.howToWriteBody}
              </p>
              <pre className="p-3 rounded-2xl bg-[#090610] border border-purple-900/50 font-code text-xs text-manaMint overflow-x-auto leading-relaxed shadow-inner">
                <code>{lesson.codeExample}</code>
              </pre>
            </div>

            {/* Section 3: Quest Tasks */}
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <h3 className="font-fantasy font-bold text-sm text-moonCream flex items-center gap-1.5">
                <span>🎯</span> Quest Tasks
              </h3>
              <p className="text-xs text-moonCream/80 font-medium">
                {lesson.taskObjective}
              </p>

              <div className="space-y-2">
                {lesson.tasks.map((task, idx) => {
                  const typed = isTaskTyped(task.codeKeyword);

                  return (
                    <div
                      key={task.id}
                      className={
                        'p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ' +
                        (typed
                          ? 'bg-emerald-950/40 border-manaMint/40 text-moonCream'
                          : 'bg-[#0e0a19]/60 border-white/10 text-moonCream/70')
                      }
                    >
                      <div
                        className={
                          'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ' +
                          (typed ? 'bg-manaMint text-night-950' : 'border border-white/30 text-white/40')
                        }
                      >
                        {typed ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1">
                        <span className={typed ? 'text-manaMint font-semibold' : ''}>
                          {task.description}
                        </span>
                        <div className="text-[10px] text-magic-light font-code mt-0.5">
                          Code: <code>{task.codeKeyword}</code>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer: Got it button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsTutorialOpen(false);
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-magic to-spellPink text-night-950 font-fantasy font-black text-xs uppercase tracking-wider shadow-magic hover:opacity-95 transition-all cursor-pointer text-center"
              >
                🚀 Got it, Let's Code!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
