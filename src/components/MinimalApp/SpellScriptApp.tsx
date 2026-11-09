import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { SIMPLE_LEVELS, SimpleLevel } from '../../data/simpleLevels';
import { sound } from '../../utils/sound';
import {
  Sparkles,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Check,
  Compass,
  Repeat,
  FlaskConical,
  Wand2,
  ShieldAlert,
  FastForward,
  X,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';

export const SpellScriptApp: React.FC = () => {
  // Level State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const currentLevel = SIMPLE_LEVELS.find((l) => l.id === currentLevelId) || SIMPLE_LEVELS[0];

  // User Code State (initialized with current level's starter code)
  const [userCode, setUserCode] = useState<string>(currentLevel.starterCode);

  // Execution & Simulation States
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'idle' | 'running' | 'success' | 'error';
    message: string;
    hint?: string;
  }>({
    type: 'idle',
    message: 'Write your spell in the editor and click "✨ Cast Spell" to run!',
  });
  const [speed, setSpeed] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('spellscript_completed_levels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // World Simulation States
  // 1. Dragon World
  const [dragon, setDragon] = useState<{
    x: number;
    y: number;
    direction: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';
  }>({ x: 0, y: 0, direction: 'RIGHT' });
  const [hasCollectedCrystal, setHasCollectedCrystal] = useState<boolean>(false);

  // 2. Garden World
  const [bloomedFlowers, setBloomedFlowers] = useState<number>(0);

  // 3. Potion World
  const [potionVars, setPotionVars] = useState<Record<string, number>>({});
  const [isBrewed, setIsBrewed] = useState<boolean>(false);

  // 4. Bridge World
  const [bridgeSegments, setBridgeSegments] = useState<number>(0);

  // 5. Curse World
  const [purifiedRunes, setPurifiedRunes] = useState<number[]>([]);

  // UI state
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When user switches levels, load new starter code and reset world
  useEffect(() => {
    setUserCode(currentLevel.starterCode);
    resetWorld();
  }, [currentLevelId]);

  // Persist completed levels
  useEffect(() => {
    try {
      localStorage.setItem('spellscript_completed_levels', JSON.stringify(completedLevels));
    } catch {}
  }, [completedLevels]);

  const resetWorld = () => {
    setIsExecuting(false);
    setActiveLineIndex(null);
    setFeedback({
      type: 'idle',
      message: 'World reset. Enter or modify code, then press "✨ Cast Spell".',
    });

    // Reset Dragon
    setDragon({
      x: currentLevel.worldConfig?.startX ?? 0,
      y: currentLevel.worldConfig?.startY ?? 0,
      direction: currentLevel.worldConfig?.startDir ?? 'RIGHT',
    });
    setHasCollectedCrystal(false);

    // Reset Garden
    setBloomedFlowers(0);

    // Reset Potion
    setPotionVars({});
    setIsBrewed(false);

    // Reset Bridge
    setBridgeSegments(0);

    // Reset Curse
    setPurifiedRunes([]);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms / speed));

  // Quick Inscribe helper (inserts code at cursor or appends)
  const handleQuickInsert = (snippet: string) => {
    sound.playClick();
    if (!textareaRef.current) {
      setUserCode((prev) => prev + '\n' + snippet);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextCode = userCode.substring(0, start) + snippet + '\n' + userCode.substring(end);
    setUserCode(nextCode);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length + 1;
    }, 50);
  };

  // Run the code
  const executeCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    resetWorldStateOnly();
    sound.playWandCast();
    setFeedback({ type: 'running', message: 'Casting spell instructions step-by-step...' });

    // Local simulation tracking
    let simDragon = {
      x: currentLevel.worldConfig?.startX ?? 0,
      y: currentLevel.worldConfig?.startY ?? 0,
      direction: currentLevel.worldConfig?.startDir ?? 'RIGHT',
    };
    let simCrystal = false;
    let simBlooms = 0;
    let simVars: Record<string, number> = {};
    let simBrewed = false;
    let simBridge = 0;
    let simRunes: number[] = [];

    const lines = userCode.split('\n');

    try {
      // Step-by-step interpreter
      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue;

        setActiveLineIndex(i);

        // 1. Dragon commands
        if (trimmed.includes('dragon.move_forward()')) {
          simDragon = moveDragonForward(simDragon);
          setDragon({ ...simDragon });
          sound.playDragonStep();
          setFeedback({
            type: 'running',
            message: `Sparky moved forward to (${simDragon.x}, ${simDragon.y}).`,
          });
          await delay(450);
        } else if (trimmed.includes('dragon.turn_right()')) {
          simDragon = turnDragon(simDragon, 'RIGHT');
          setDragon({ ...simDragon });
          sound.playClick();
          setFeedback({
            type: 'running',
            message: `Sparky turned right to face ${simDragon.direction}.`,
          });
          await delay(400);
        } else if (trimmed.includes('dragon.turn_left()')) {
          simDragon = turnDragon(simDragon, 'LEFT');
          setDragon({ ...simDragon });
          sound.playClick();
          setFeedback({
            type: 'running',
            message: `Sparky turned left to face ${simDragon.direction}.`,
          });
          await delay(400);
        } else if (trimmed.includes('dragon.collect_crystal()')) {
          const targetX = currentLevel.worldConfig?.targetX ?? 2;
          const targetY = currentLevel.worldConfig?.targetY ?? 2;
          if (simDragon.x === targetX && simDragon.y === targetY) {
            simCrystal = true;
            setHasCollectedCrystal(true);
            sound.playFlowerBloom();
            setFeedback({
              type: 'running',
              message: 'Sparky found and collected the cosmic crystal! 💎',
            });
          } else {
            sound.playError();
            throw new Error(
              `Sparky tried to collect crystal at (${simDragon.x}, ${simDragon.y}), but the crystal is at (${targetX}, ${targetY})!`
            );
          }
          await delay(450);
        }

        // 2. Garden loop command: for step in range(N):
        else if (trimmed.startsWith('for ') && trimmed.includes('range(')) {
          const match = trimmed.match(/range\((\d+)\)/);
          const count = match ? parseInt(match[1]) : 6;
          setFeedback({ type: 'running', message: `Enchanting loop: repeat ${count} times.` });
          await delay(300);

          // Find the loop body lines (next indented lines)
          let loopBodyLines: string[] = [];
          let j = i + 1;
          while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t'))) {
            loopBodyLines.push(lines[j].trim());
            j++;
          }

          for (let step = 0; step < count; step++) {
            if (loopBodyLines.length > 0) {
              for (const bodyLine of loopBodyLines) {
                if (bodyLine.includes('grow_flower()')) {
                  simBlooms++;
                  setBloomedFlowers(simBlooms);
                  sound.playFlowerBloom();
                  setFeedback({
                    type: 'running',
                    message: `Flower #${simBlooms} bloomed along the meadow path! 🌸`,
                  });
                  await delay(350);
                }
              }
            } else {
              // Default grow flower if body was standard
              simBlooms++;
              setBloomedFlowers(simBlooms);
              sound.playFlowerBloom();
              await delay(350);
            }
          }
          // Skip lines processed in loop body
          i = j - 1;
        } else if (trimmed.includes('grow_flower()')) {
          simBlooms++;
          setBloomedFlowers(simBlooms);
          sound.playFlowerBloom();
          setFeedback({
            type: 'running',
            message: `Flower #${simBlooms} bloomed! 🌸`,
          });
          await delay(350);
        }

        // 3. Potion variable commands: var = val
        else if (trimmed.includes('=') && !trimmed.startsWith('def') && !trimmed.startsWith('for')) {
          const parts = trimmed.split('=');
          const varName = parts[0].trim();
          const varVal = parseInt(parts[1].trim()) || 0;
          simVars[varName] = varVal;
          setPotionVars({ ...simVars });
          sound.playPotionBubble();
          setFeedback({
            type: 'running',
            message: `Stored ${varVal} inside bottle "${varName}".`,
          });
          await delay(450);
        } else if (trimmed.includes('cauldron.brew_elixir()')) {
          simBrewed = true;
          setIsBrewed(true);
          sound.playPotionBubble();
          setFeedback({
            type: 'running',
            message: 'Transmuting potion ingredients in the bubbling cauldron...',
          });
          await delay(600);
        }

        // 4. Bridge / Function commands
        else if (trimmed.startsWith('def build_bridge():')) {
          // Register function definition
          setFeedback({
            type: 'running',
            message: 'Inscribed reusable function "build_bridge()" into memory.',
          });
          await delay(400);
        } else if (trimmed.includes('build_bridge()') && !trimmed.startsWith('def')) {
          setFeedback({
            type: 'running',
            message: 'Invoked "build_bridge()": materializing crystal starlight tiles...',
          });
          for (let b = 1; b <= 4; b++) {
            simBridge = b;
            setBridgeSegments(b);
            sound.playWandCast();
            await delay(400);
          }
        } else if (trimmed.includes('place_starlight_tile()')) {
          simBridge++;
          setBridgeSegments(simBridge);
          sound.playWandCast();
          await delay(400);
        }

        // 5. Curse commands
        else if (trimmed.includes('purify_rune')) {
          const match = trimmed.match(/purify_rune\((\d+)\)/) || trimmed.match(/id\s*=\s*(\d+)/);
          const runeId = match ? parseInt(match[1]) : 1;

          if (runeId > 3 || runeId < 1) {
            sound.playError();
            throw new Error(
              `Corrupted Target! You chanted purify_rune(${runeId}), but the altar only has Runes #1, #2, and #3!`
            );
          }

          if (!simRunes.includes(runeId)) {
            simRunes.push(runeId);
            setPurifiedRunes([...simRunes]);
            sound.playCurseBreak();
            setFeedback({
              type: 'running',
              message: `Purified corrupted Rune #${runeId}!`,
            });
            await delay(500);
          }
        }
      }

      // Check win condition
      validateWin(simDragon, simCrystal, simBlooms, simVars, simBrewed, simBridge, simRunes);
    } catch (err: any) {
      sound.playError();
      setFeedback({
        type: 'error',
        message: err.message || 'Spell fizzled unexpectedly.',
        hint: currentLevel.hint,
      });
    } finally {
      setIsExecuting(false);
      setActiveLineIndex(null);
    }
  };

  const resetWorldStateOnly = () => {
    setDragon({
      x: currentLevel.worldConfig?.startX ?? 0,
      y: currentLevel.worldConfig?.startY ?? 0,
      direction: currentLevel.worldConfig?.startDir ?? 'RIGHT',
    });
    setHasCollectedCrystal(false);
    setBloomedFlowers(0);
    setPotionVars({});
    setIsBrewed(false);
    setBridgeSegments(0);
    setPurifiedRunes([]);
  };

  const moveDragonForward = (d: {
    x: number;
    y: number;
    direction: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';
  }) => {
    let nextX = d.x;
    let nextY = d.y;
    if (d.direction === 'UP') nextY -= 1;
    if (d.direction === 'DOWN') nextY += 1;
    if (d.direction === 'LEFT') nextX -= 1;
    if (d.direction === 'RIGHT') nextX += 1;

    // Check bounds (0 to 4 for 5x5 grid)
    if (nextX < 0 || nextX >= 5 || nextY < 0 || nextY >= 5) {
      throw new Error(`Sparky tried to step out of bounds at (${nextX}, ${nextY})! Turn first.`);
    }

    // Check obstacle
    const obstacles: Array<{ x: number; y: number }> = currentLevel.worldConfig?.obstacles || [];
    const hit = obstacles.find((o) => o.x === nextX && o.y === nextY);
    if (hit) {
      throw new Error(`Sparky ran into a stone boulder at (${nextX}, ${nextY})! Turn around.`);
    }

    return { ...d, x: nextX, y: nextY };
  };

  const turnDragon = (
    d: { x: number; y: number; direction: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' },
    dir: 'LEFT' | 'RIGHT'
  ) => {
    const order: Array<'UP' | 'RIGHT' | 'DOWN' | 'LEFT'> = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const idx = order.indexOf(d.direction);
    const nextIdx = dir === 'RIGHT' ? (idx + 1) % 4 : (idx + 3) % 4;
    return { ...d, direction: order[nextIdx] };
  };

  const validateWin = (
    d: any,
    crystal: boolean,
    blooms: number,
    vars: Record<string, number>,
    brewed: boolean,
    bridge: number,
    runes: number[]
  ) => {
    let won = false;

    if (currentLevel.worldType === 'dragon') {
      if (d.x === 2 && d.y === 2 && crystal) {
        won = true;
      } else {
        throw new Error('Sparky did not collect the crystal at (2, 2). Check your movement!');
      }
    } else if (currentLevel.worldType === 'garden') {
      if (blooms >= 6) {
        won = true;
      } else {
        throw new Error(`Only ${blooms} flowers bloomed. You need 6 flowers. Check range(6)!`);
      }
    } else if (currentLevel.worldType === 'potion') {
      if (vars['mana_flask'] === 100 && vars['star_dew'] === 3 && brewed) {
        won = true;
      } else {
        throw new Error('Potion values are incorrect. Set mana_flask = 100 and star_dew = 3!');
      }
    } else if (currentLevel.worldType === 'bridge') {
      if (bridge >= 4) {
        won = true;
      } else {
        throw new Error('The bridge needs 4 segments to cross the canyon. Call build_bridge()!');
      }
    } else if (currentLevel.worldType === 'curse') {
      if (runes.includes(1) && runes.includes(2) && runes.includes(3)) {
        won = true;
      } else {
        throw new Error('Not all 3 runes were cleansed. Purify runes 1, 2, and 3!');
      }
    }

    if (won) {
      sound.playVictoryFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (!completedLevels.includes(currentLevel.id)) {
        setCompletedLevels([...completedLevels, currentLevel.id]);
      }
      setFeedback({
        type: 'success',
        message: '🎉 Amazing! You solved this level with magic logic!',
      });
    }
  };

  const handleNextLevel = () => {
    sound.playClick();
    if (currentLevelId < SIMPLE_LEVELS.length) {
      setCurrentLevelId(currentLevelId + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#110d1e] text-[#FFF2D8] flex flex-col font-body selection:bg-magic selection:text-white">
      {/* 1. MINIMAL HEADER BAR */}
      <header className="w-full bg-[#171228] border-b border-purple-900/40 px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪄</span>
            <div>
              <h1 className="font-fantasy font-black text-lg text-moonCream tracking-wider flex items-center gap-1.5 leading-tight">
                Storicode <Sparkles className="w-3.5 h-3.5 text-spellPink" />
              </h1>
              <p className="text-[10px] text-magic-light font-code">Learn Programming Through Magic</p>
            </div>
          </div>

          {/* Level Selector Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {SIMPLE_LEVELS.map((lvl) => {
              const isActive = lvl.id === currentLevelId;
              const isDone = completedLevels.includes(lvl.id);

              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    sound.playClick();
                    setCurrentLevelId(lvl.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-fantasy font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-magic to-spellPink text-night-950 shadow-magic'
                      : isDone
                      ? 'bg-emerald-950/60 border border-manaMint/40 text-manaMint'
                      : 'bg-white/5 hover:bg-white/10 text-moonCream/70'
                  }`}
                >
                  <span>{lvl.id}.</span>
                  <span>{lvl.title}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-manaMint" />}
                </button>
              );
            })}
          </div>

          {/* Audio & Guide Helpers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playWandCast();
                setShowGuideModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-magic/20 hover:bg-magic/30 border border-magic/40 text-magic-light text-xs font-fantasy font-bold transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to Play</span>
            </button>

            <button
              onClick={() => {
                const muted = sound.toggleMute();
                setIsMuted(muted);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-moonCream/70"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN SPLIT SCREEN: Left Code Editor, Right Magic Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: THE SPELL CODER (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          {/* Mission Card */}
          <div className="p-4 rounded-2xl bg-[#1b152e] border border-purple-800/40 shadow-md space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-spellPink px-2.5 py-0.5 rounded-full bg-spellPink/10 border border-spellPink/20 font-fantasy">
                {currentLevel.conceptBadge}
              </span>
              <span className="text-xs text-moonCream/50 font-code">Level {currentLevel.id} of 5</span>
            </div>

            <h2 className="font-fantasy font-bold text-lg text-moonCream leading-snug">
              Mission: {currentLevel.mission}
            </h2>

            {/* Metaphor explanation callout */}
            <div className="p-2.5 rounded-xl bg-[#231a3b] border border-magic/30 text-xs text-magic-light flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-runeAmber shrink-0 mt-0.5" />
              <div>
                <strong className="text-moonCream">{currentLevel.conceptQuote}</strong>
                <p className="text-moonCream/70 text-[11px] mt-0.5">{currentLevel.conceptExplanation}</p>
              </div>
            </div>
          </div>

          {/* Quick-Click Command Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] text-moonCream/60 font-fantasy uppercase tracking-wider shrink-0 mr-1">
              Click to Insert:
            </span>
            {currentLevel.quickButtons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickInsert(btn.code)}
                className="px-2.5 py-1 rounded-xl bg-magic/20 hover:bg-magic/35 border border-magic/40 text-magic-light text-xs font-code font-semibold shrink-0 transition-all active:scale-95 shadow-sm"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* The Direct, Unhidden Code Editor */}
          <div className="rounded-2xl bg-[#0f0b18] border-2 border-magic/50 shadow-xl overflow-hidden flex flex-col">
            {/* Editor Top Bar with "type code here" quote */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#171226] border-b border-purple-900/40 text-xs">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-spellPink" />
                <span className="font-fantasy font-bold text-moonCream">Spell Script</span>
                <span className="text-[11px] text-spellPink font-code font-bold ml-1 bg-spellPink/10 px-2 py-0.5 rounded border border-spellPink/30">
                  "type code here"
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    navigator.clipboard.writeText(userCode);
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
                    setUserCode(currentLevel.starterCode);
                  }}
                  className="flex items-center gap-1 text-[11px] text-moonCream/70 hover:text-white px-2 py-1 rounded bg-white/5"
                  title="Reset code to starter template"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Code Textarea Area with Line Numbers */}
            <div className="flex relative min-h-[220px]">
              {/* Line Numbers */}
              <div className="w-10 bg-[#120d1e] border-r border-white/5 p-3 select-none text-right font-code text-xs text-moonCream/30 leading-[20px]">
                {Array.from({ length: Math.max(8, userCode.split('\n').length) }).map((_, i) => (
                  <div
                    key={i}
                    className={activeLineIndex === i ? 'text-runeAmber font-bold animate-pulse' : ''}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                spellCheck={false}
                placeholder={`# 🪄 "type code here" — Inscribe your commands below\n# Example: dragon.move_forward()`}
                className="flex-1 bg-transparent text-manaMint font-code text-xs p-3 focus:outline-none resize-none leading-[20px] selection:bg-magic selection:text-white"
              />
            </div>

            {/* Cast Spell Action Bar */}
            <div className="p-3 bg-[#171226] border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-magic via-spellPink to-manaMint text-night-950 font-fantasy font-black text-sm shadow-magic hover:opacity-95 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isExecuting ? 'Casting Spell...' : '✨ Cast Spell (Run Code)'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={resetWorld}
                  disabled={isExecuting}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-moonCream/80 border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Stage</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1);
                  }}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-manaMint border border-white/10 font-code font-bold"
                  title="Speed toggle"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{speed}x</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback & AI Hint Box */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border-manaMint text-manaMint shadow-mana'
                : feedback.type === 'error'
                ? 'bg-red-950/70 border-cursedRed text-spellPink'
                : feedback.type === 'running'
                ? 'bg-purple-950/70 border-magic text-magic-light animate-pulse'
                : 'bg-[#1b152e] border-white/10 text-moonCream/80'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-manaMint shrink-0 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-cursedRed shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-spellPink shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <strong className="block font-fantasy">
                {feedback.type === 'success'
                  ? 'Victory Achieved!'
                  : feedback.type === 'error'
                  ? 'A Curse Occurred (Bug):'
                  : feedback.type === 'running'
                  ? 'Magic in Motion:'
                  : 'How to Play:'}
              </strong>
              <p className="mt-0.5 text-moonCream/90 leading-relaxed">{feedback.message}</p>
              {feedback.hint && (
                <div className="mt-2 p-2 rounded-lg bg-black/40 border border-cursedRed/40 text-[11px] text-runeAmber font-medium">
                  💡 <strong>Mentor Clue:</strong> {feedback.hint}
                </div>
              )}
            </div>

            {feedback.type === 'success' && currentLevelId < SIMPLE_LEVELS.length && (
              <button
                onClick={handleNextLevel}
                className="px-4 py-2 rounded-xl bg-manaMint text-night-950 font-fantasy font-black text-xs shadow-md hover:bg-white transition-all flex items-center gap-1 shrink-0 animate-bounce"
              >
                <span>Next Level</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: THE LIVE MAGICAL STAGE (5 cols) */}
        <section className="lg:col-span-5 sticky top-20">
          <div className="rounded-3xl bg-[#171228] border-2 border-magic/40 p-5 shadow-2xl flex flex-col justify-between min-h-[460px]">
            {/* Stage Title */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {currentLevel.worldType === 'dragon'
                    ? '🐲'
                    : currentLevel.worldType === 'garden'
                    ? '🌸'
                    : currentLevel.worldType === 'potion'
                    ? '⚗️'
                    : currentLevel.worldType === 'bridge'
                    ? '🔮'
                    : '⚡'}
                </span>
                <h3 className="font-fantasy font-bold text-sm text-moonCream">
                  The Magical Stage
                </h3>
              </div>
              <span className="text-[11px] font-code text-magic-light">Live Simulation</span>
            </div>

            {/* STAGE CANVAS DEPENDING ON LEVEL */}
            <div className="my-auto py-6 flex items-center justify-center">
              {/* Level 1: Dragon Grid */}
              {currentLevel.worldType === 'dragon' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-[#0f0b18] border border-magic/30 shadow-inner max-w-xs w-full aspect-square">
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const x = idx % 5;
                      const y = Math.floor(idx / 5);
                      const isDragon = dragon.x === x && dragon.y === y;
                      const isTarget = x === 2 && y === 2;
                      const isRock = x === 1 && y === 1;

                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl border flex items-center justify-center transition-all ${
                            isDragon
                              ? 'bg-magic/30 border-magic shadow-magic scale-105'
                              : isTarget
                              ? 'bg-amber-500/20 border-amber-400/80 animate-pulse'
                              : isRock
                              ? 'bg-red-950/50 border-red-900/50'
                              : 'bg-white/5 border-white/5'
                          }`}
                        >
                          <span className="absolute top-0.5 left-1 text-[8px] text-white/20 select-none">
                            {x},{y}
                          </span>

                          {isTarget && (
                            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,179,71,0.9)] animate-bounce">
                              💎
                            </span>
                          )}

                          {isRock && <span className="text-lg">🪨</span>}

                          {isDragon && (
                            <div
                              className={`text-2xl transition-transform duration-300 ${
                                dragon.direction === 'RIGHT'
                                  ? 'rotate-0'
                                  : dragon.direction === 'DOWN'
                                  ? 'rotate-90'
                                  : dragon.direction === 'LEFT'
                                  ? 'rotate-180 -scale-y-100'
                                  : '-rotate-90'
                              }`}
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
                    <span>Crystal: {hasCollectedCrystal ? 'Collected 💎' : '0/1'}</span>
                  </div>
                </div>
              )}

              {/* Level 2: Garden */}
              {currentLevel.worldType === 'garden' && (
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0c1c16] border border-manaMint/40 shadow-inner w-full max-w-sm">
                    {Array.from({ length: 6 }).map((_, idx) => {
                      const isBloomed = idx < bloomedFlowers;

                      return (
                        <div
                          key={idx}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                            isBloomed
                              ? 'bg-manaMint/25 border border-manaMint shadow-mana scale-105'
                              : 'bg-night-950/60 border border-white/5 opacity-40'
                          }`}
                        >
                          <span className="text-3xl">{isBloomed ? '🌸' : '🌱'}</span>
                          <span className="text-[10px] font-bold text-manaMint mt-1">
                            {isBloomed ? `Bloom ${idx + 1}` : 'Seed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-xs font-code font-bold text-manaMint">
                    {bloomedFlowers} / 6 Blossoms Bloomed
                  </div>
                </div>
              )}

              {/* Level 3: Potion Cauldron */}
              {currentLevel.worldType === 'potion' && (
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                  {/* Potion Bottles */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="p-3 rounded-xl bg-night-950/80 border border-spellPink/40 text-center">
                      <span className="text-2xl">🧪</span>
                      <div className="text-xs font-code font-bold text-moonCream mt-1">mana_flask</div>
                      <div className="text-sm font-bold text-spellPink font-code">
                        {potionVars['mana_flask'] !== undefined ? potionVars['mana_flask'] : 'empty'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-night-950/80 border border-manaMint/40 text-center">
                      <span className="text-2xl">✨</span>
                      <div className="text-xs font-code font-bold text-moonCream mt-1">star_dew</div>
                      <div className="text-sm font-bold text-manaMint font-code">
                        {potionVars['star_dew'] !== undefined ? potionVars['star_dew'] : 'empty'}
                      </div>
                    </div>
                  </div>

                  {/* Cauldron */}
                  <div className="relative w-36 h-28 rounded-b-[3.5rem] bg-gradient-to-b from-[#35254a] to-[#160d21] border-4 border-[#523b72] flex items-center justify-center shadow-2xl">
                    <div
                      className={`w-28 h-16 rounded-b-[3rem] transition-all duration-700 flex items-center justify-center ${
                        isBrewed
                          ? 'bg-gradient-to-r from-spellPink via-magic to-manaMint shadow-[0_0_25px_rgba(243,169,212,0.8)]'
                          : 'bg-purple-950/50'
                      }`}
                    >
                      <span className="text-2xl animate-bounce">{isBrewed ? '🌟' : '🫧'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-moonCream/80 font-code">
                    Status: {isBrewed ? 'Elixir Transmuted! 🎉' : 'Awaiting ingredients...'}
                  </div>
                </div>
              )}

              {/* Level 4: Starlight Bridge */}
              {currentLevel.worldType === 'bridge' && (
                <div className="flex items-center justify-between gap-1 w-full max-w-sm">
                  {/* Left Cliff */}
                  <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
                    <span className="text-2xl">🧙‍♂️</span>
                    <span className="text-[9px] text-white/60">Cliff</span>
                  </div>

                  {/* 4 Bridge Tiles */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-12 rounded-lg border flex items-center justify-center text-xs transition-all ${
                        i < bridgeSegments
                          ? 'bg-gradient-to-t from-magic to-manaMint border-manaMint shadow-mana text-night-950 font-bold scale-105'
                          : 'bg-white/5 border-dashed border-white/10 opacity-30'
                      }`}
                    >
                      {i < bridgeSegments ? '✨' : ''}
                    </div>
                  ))}

                  {/* Right Island */}
                  <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
                    <span className="text-2xl">🏰</span>
                    <span className="text-[9px] text-white/60">Tower</span>
                  </div>
                </div>
              )}

              {/* Level 5: Break the Curse */}
              {currentLevel.worldType === 'curse' && (
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
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
                          className={`w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                            isClean
                              ? 'bg-manaMint/20 border-manaMint text-manaMint shadow-mana scale-105'
                              : 'bg-red-950/40 border-cursedRed text-cursedRed animate-pulse'
                          }`}
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

                  <div className="p-3 rounded-xl bg-night-950/70 border border-white/10 text-center w-full text-xs">
                    Dungeon Vault:{' '}
                    <strong className={purifiedRunes.length === 3 ? 'text-manaMint' : 'text-cursedRed'}>
                      {purifiedRunes.length === 3 ? '🔓 UNLOCKED!' : '🔒 SEALED BY HEX'}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Stage Footer Status */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-moonCream/60">
              <span>Goal: {currentLevel.expectedGoalDesc}</span>
              <span className="text-manaMint">Live Feedback</span>
            </div>
          </div>
        </section>
      </main>

      {/* 3. SIMPLE HOW-TO-PLAY BEGINNER GUIDE MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1b152e] border-2 border-magic/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪄</span>
                <h3 className="font-fantasy font-bold text-lg text-moonCream">
                  How to Play Storicode
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-moonCream/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-moonCream/90 leading-relaxed">
              <div className="p-3 rounded-xl bg-night-950/70 border border-magic/30">
                <strong className="text-spellPink block mb-1">Step 1: Read Your Mission</strong>
                Look at the mission at the top. It tells you where Sparky needs to walk, or how many flowers to grow.
              </div>

              <div className="p-3 rounded-xl bg-night-950/70 border border-magic/30">
                <strong className="text-manaMint block mb-1">
                  Step 2: Inscribe Your Spell in "type code here"
                </strong>
                You can type code directly in the editor, or simply click the <strong>Click to Insert</strong> buttons above the editor to add commands instantly!
              </div>

              <div className="p-3 rounded-xl bg-night-950/70 border border-magic/30">
                <strong className="text-runeAmber block mb-1">
                  Step 3: Click "✨ Cast Spell"
                </strong>
                Watch the magic happen! Your instructions run line-by-line. If something goes wrong, the mentor clue will tell you how to fix it.
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowGuideModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-magic to-spellPink text-night-950 font-fantasy font-black text-xs shadow-magic hover:opacity-95 transition-all"
            >
              Got it! Let's Cast Spells 🪄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

