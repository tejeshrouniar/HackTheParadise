import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CODEDEX_LESSONS, CodedexLesson } from '../../data/codedexLessons';
import { HTML_CSS_LESSONS } from '../../data/htmlCssLessons';
import { CodedexHome } from '../CodedexHome/CodedexHome';

export const ALL_CODEDEX_LESSONS: CodedexLesson[] = [...CODEDEX_LESSONS, ...HTML_CSS_LESSONS];
import { sound } from '../../utils/sound';
import {
  ArrowLeft,
  Check,
  Copy,
  HelpCircle,
  Play,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronRight,
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
} from 'lucide-react';

interface ErrorPointer {
  lineIndex: number;
  message: string;
  suggestion: string;
  tileCoords?: { x: number; y: number };
}

export const CodedexApp: React.FC = () => {
  // Navigation View: 'home' (Codédex Hero Meadow) or 'quest' (Coding Lab)
  const [currentView, setCurrentView] = useState<'home' | 'quest'>('home');

  // Lesson state
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const lesson = ALL_CODEDEX_LESSONS.find((l) => l.id === currentLessonId) || CODEDEX_LESSONS[0];

  // User Code State (Starts clean with "type code here")
  const [code, setCode] = useState<string>(lesson.initialCode);

  // Completed lessons tracking
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('spellscript_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Hints and solutions toggles
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Execution & Diagnostics states
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [errorPointer, setErrorPointer] = useState<ErrorPointer | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '$ spellscript init',
    '> Enchanted environment initialized.',
    '> Follow instructions on the left, type code, and press "Cast Spell".',
  ]);
  const [questSuccess, setQuestSuccess] = useState<boolean>(false);

  // Simulation Worlds
  // 1. Dragon
  const [dragon, setDragon] = useState<{ x: number; y: number; direction: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' }>({
    x: 0,
    y: 0,
    direction: 'RIGHT',
  });
  const [collectedCrystal, setCollectedCrystal] = useState<boolean>(false);

  // 2. Potion
  const [potionVars, setPotionVars] = useState<Record<string, number>>({});
  const [isBrewed, setIsBrewed] = useState<boolean>(false);

  // 3. Garden
  const [bloomedFlowers, setBloomedFlowers] = useState<number>(0);

  // 4. Bridge
  const [bridgeTiles, setBridgeTiles] = useState<number>(0);

  // 5. Curse
  const [purifiedRunes, setPurifiedRunes] = useState<number[]>([]);

  // 6. Stargate (Chapter 6)
  const [stargateFlux, setStargateFlux] = useState<number>(0);
  const [stargateRingsAligned, setStargateRingsAligned] = useState<boolean>(false);

  // 7. Chrono Matrix (Chapter 7)
  const [chronoCrystals, setChronoCrystals] = useState<number[]>([4, 1, 3, 2]);
  const [isVortexStabilized, setIsVortexStabilized] = useState<boolean>(false);

  // 8. Boss Arena (Chapter 8)
  const [bossHp, setBossHp] = useState<number>(100);
  const [playerShield, setPlayerShield] = useState<number>(0);
  const [bossHitFlash, setBossHitFlash] = useState<boolean>(false);

  // UI helpers
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync when lesson changes
  useEffect(() => {
    setCode(lesson.initialCode);
    setShowHint(false);
    setShowSolution(false);
    setQuestSuccess(false);
    setErrorPointer(null);
    resetStage();
    setTerminalLogs([
      `$ spellscript load "${lesson.title}"`,
      `> Loaded ${lesson.chapter}.`,
      '> Read the instructions on the left and type code in the editor!',
    ]);
  }, [currentLessonId]);

  // Persist completed lessons
  useEffect(() => {
    try {
      localStorage.setItem('spellscript_completed_lessons', JSON.stringify(completedLessons));
    } catch {}
  }, [completedLessons]);

  const resetStage = () => {
    setIsExecuting(false);
    setActiveLine(null);
    setQuestSuccess(false);
    setErrorPointer(null);

    // Dragon
    setDragon({
      x: lesson.stageConfig?.startX ?? 0,
      y: lesson.stageConfig?.startY ?? 0,
      direction: lesson.stageConfig?.startDir ?? 'RIGHT',
    });
    setCollectedCrystal(false);

    // Potion
    setPotionVars({});
    setIsBrewed(false);

    // Garden
    setBloomedFlowers(0);

    // Bridge
    setBridgeTiles(0);

    // Curse
    setPurifiedRunes([]);

    // Stargate
    setStargateFlux(0);
    setStargateRingsAligned(false);

    // Chrono
    setChronoCrystals([4, 1, 3, 2]);
    setIsVortexStabilized(false);

    // Boss
    setBossHp(100);
    setPlayerShield(0);
    setBossHitFlash(false);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Run the user's typed code
  const handleRunCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setQuestSuccess(false);
    setErrorPointer(null);
    sound.playWandCast();

    resetStage();

    const logs: string[] = [
      lesson.stageType === 'webpage' || lesson.stageType === 'styler' || lesson.stageType === 'layout'
        ? '$ webcraft render index.html'
        : '$ python main.py',
    ];
    setTerminalLogs([...logs]);

    let simDragon = {
      x: lesson.stageConfig?.startX ?? 0,
      y: lesson.stageConfig?.startY ?? 0,
      direction: lesson.stageConfig?.startDir ?? 'RIGHT',
    };
    let simCrystal = false;
    let simPotion: Record<string, number> = {};
    let simBrewed = false;
    let simBlooms = 0;
    let simBridge = 0;
    let simRunes: number[] = [];
    let simFlux = 0;
    let simRingsAligned = false;
    let simCrystals = [4, 1, 3, 2];
    let simVortex = false;
    let simBossHp = 100;
    let simShield = 0;

    const lines = code.split('\n');

    // HTML & CSS Stage Execution
    if (lesson.stageType === 'webpage' || lesson.stageType === 'styler' || lesson.stageType === 'layout') {
      try {
        logs.push(`> Inscribing "${lesson.title}" into the Scrying Mirror...`);
        setTerminalLogs([...logs]);
        await delay(300);

        // Check required keywords from tasks
        const missingTask = lesson.tasks.find((t) => !code.includes(t.codeKeyword));
        if (missingTask) {
          sound.playError();
          const err: ErrorPointer = {
            lineIndex: Math.max(0, lines.length - 1),
            message: `Task Incomplete: ${missingTask.description}`,
            suggestion: `Inscribe "${missingTask.codeKeyword}" into your scroll to satisfy the runes.`,
          };
          setErrorPointer(err);
          throw new Error(err.message);
        }

        sound.playVictoryFanfare();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        logs.push(`> ✨ All runes and incantations verified!`);
        logs.push(`================================`);
        logs.push(`🎉 QUEST COMPLETE! +150 XP`);
        logs.push(`> Web enchantment woven into the Scrying Mirror successfully.`);
        setTerminalLogs([...logs]);
        setQuestSuccess(true);
        setErrorPointer(null);
        if (!completedLessons.includes(lesson.id)) {
          setCompletedLessons([...completedLessons, lesson.id]);
        }
      } catch (e: any) {
        sound.playError();
        logs.push(`⚠️ ${e.message}`);
        setTerminalLogs([...logs]);
      } finally {
        setIsExecuting(false);
      }
      return;
    }

    try {
      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        // Skip comments and blank lines
        if (!trimmed || trimmed.startsWith('#')) continue;

        setActiveLine(i);

        // 1. Dragon commands
        if (trimmed.includes('dragon.move_forward()')) {
          simDragon = moveDragon(simDragon, i);
          setDragon({ ...simDragon });
          sound.playDragonStep();
          logs.push(`> dragon.move_forward() -> Sparky stepped to (${simDragon.x}, ${simDragon.y})`);
          setTerminalLogs([...logs]);
          await delay(450);
        } else if (trimmed.includes('dragon.turn_right()')) {
          simDragon = turnDragon(simDragon, 'RIGHT');
          setDragon({ ...simDragon });
          sound.playClick();
          logs.push(`> dragon.turn_right() -> Facing ${simDragon.direction}`);
          setTerminalLogs([...logs]);
          await delay(400);
        } else if (trimmed.includes('dragon.turn_left()')) {
          simDragon = turnDragon(simDragon, 'LEFT');
          setDragon({ ...simDragon });
          sound.playClick();
          logs.push(`> dragon.turn_left() -> Facing ${simDragon.direction}`);
          setTerminalLogs([...logs]);
          await delay(400);
        } else if (trimmed.includes('dragon.collect_crystal()')) {
          if (simDragon.x === 2 && simDragon.y === 2) {
            simCrystal = true;
            setCollectedCrystal(true);
            sound.playFlowerBloom();
            logs.push(`> dragon.collect_crystal() -> 💎 Cosmic Crystal obtained!`);
            setTerminalLogs([...logs]);
          } else {
            sound.playError();
            const err: ErrorPointer = {
              lineIndex: i,
              message: `Crystal is at (2, 2), but Sparky is at (${simDragon.x}, ${simDragon.y})!`,
              suggestion: 'Guide Sparky to the glowing crystal at (2, 2) before calling collect_crystal().',
              tileCoords: { x: simDragon.x, y: simDragon.y },
            };
            setErrorPointer(err);
            throw new Error(err.message);
          }
          await delay(450);
        }

        // 2. Variable assignments: name = val
        else if (trimmed.includes('=') && !trimmed.startsWith('def') && !trimmed.startsWith('for')) {
          const parts = trimmed.split('=');
          const vName = parts[0].trim();
          const vVal = parseInt(parts[1].trim()) || 0;
          simPotion[vName] = vVal;
          setPotionVars({ ...simPotion });
          sound.playPotionBubble();
          logs.push(`> Set variable: ${vName} = ${vVal}`);
          setTerminalLogs([...logs]);
          await delay(450);
        } else if (trimmed.includes('cauldron.brew_elixir()')) {
          simBrewed = true;
          setIsBrewed(true);
          sound.playPotionBubble();
          logs.push(`> cauldron.brew_elixir() -> Transmuting potion in cauldron...`);
          setTerminalLogs([...logs]);
          await delay(600);
        }

        // 3. Loops: for step in range(N):
        else if (trimmed.startsWith('for ') && trimmed.includes('range(')) {
          const match = trimmed.match(/range\((\d+)\)/);
          const count = match ? parseInt(match[1]) : 6;
          logs.push(`> Starting loop: repeating ${count} times...`);
          setTerminalLogs([...logs]);
          await delay(300);

          let loopBody: string[] = [];
          let j = i + 1;
          while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t'))) {
            loopBody.push(lines[j].trim());
            j++;
          }

          for (let step = 0; step < count; step++) {
            if (loopBody.length > 0) {
              for (const bLine of loopBody) {
                if (bLine.includes('grow_flower()')) {
                  simBlooms++;
                  setBloomedFlowers(simBlooms);
                  sound.playFlowerBloom();
                  logs.push(`> Step ${step + 1}: Flower #${simBlooms} bloomed! 🌸`);
                  setTerminalLogs([...logs]);
                  await delay(350);
                }
              }
            } else {
              simBlooms++;
              setBloomedFlowers(simBlooms);
              sound.playFlowerBloom();
              await delay(350);
            }
          }
          i = j - 1;
        } else if (trimmed.includes('grow_flower()')) {
          simBlooms++;
          setBloomedFlowers(simBlooms);
          sound.playFlowerBloom();
          logs.push(`> grow_flower() -> Flower #${simBlooms} bloomed! 🌸`);
          setTerminalLogs([...logs]);
          await delay(350);
        }

        // 4. Functions
        else if (trimmed.startsWith('def build_bridge():')) {
          logs.push(`> Defined function "build_bridge()"`);
          setTerminalLogs([...logs]);
          await delay(400);
        } else if (trimmed.includes('build_bridge()') && !trimmed.startsWith('def')) {
          logs.push(`> Invoking "build_bridge()"...`);
          for (let s = 1; s <= 4; s++) {
            simBridge = s;
            setBridgeTiles(s);
            sound.playWandCast();
            logs.push(`> Materialized crystal bridge tile #${s} ✨`);
            setTerminalLogs([...logs]);
            await delay(400);
          }
        } else if (trimmed.includes('place_starlight_tile()')) {
          simBridge++;
          setBridgeTiles(simBridge);
          sound.playWandCast();
          logs.push(`> place_starlight_tile() -> Built tile #${simBridge}`);
          setTerminalLogs([...logs]);
          await delay(400);
        }

        // 5. Curses & Debugging
        else if (trimmed.includes('purify_rune')) {
          const m = trimmed.match(/purify_rune\((\d+)\)/);
          const rId = m ? parseInt(m[1]) : 1;

          if (rId > 3 || rId < 1) {
            sound.playError();
            const err: ErrorPointer = {
              lineIndex: i,
              message: `IndexError: purify_rune(${rId}) is invalid!`,
              suggestion: `The altar only has Runes #1, #2, and #3. Change ${rId} to 3!`,
            };
            setErrorPointer(err);
            throw new Error(err.message);
          }

            if (!simRunes.includes(rId)) {
            simRunes.push(rId);
            setPurifiedRunes([...simRunes]);
            sound.playCurseBreak();
            logs.push(`> purify_rune(${rId}) -> Rune #${rId} cleansed! ⚡`);
            setTerminalLogs([...logs]);
            await delay(450);
          }
        }

        // 6. Stargate (Chapter 6)
        else if (trimmed.includes('align_gate_rings()')) {
          simRingsAligned = true;
          setStargateRingsAligned(true);
          sound.playSuccessChime();
          logs.push(`> align_gate_rings() -> 3 Astral Rings aligned in harmony! 🌌`);
          setTerminalLogs([...logs]);
          await delay(400);
        } else if (trimmed.includes('charge_stargate')) {
          simFlux = 200;
          setStargateFlux(200);
          sound.playWandCast();
          logs.push(`> charge_stargate(200) -> Gate charged to 200 Flux! Wormhole open! ✨`);
          setTerminalLogs([...logs]);
          await delay(400);
        }

        // 7. Chrono Matrix (Chapter 7)
        else if (trimmed.includes('crystals.sort()')) {
          simCrystals = [1, 2, 3, 4];
          setChronoCrystals([1, 2, 3, 4]);
          sound.playSuccessChime();
          logs.push(`> crystals.sort() -> Shards stabilized into [1, 2, 3, 4] ⏳`);
          setTerminalLogs([...logs]);
          await delay(450);
        } else if (trimmed.includes('stabilize_vortex')) {
          simVortex = true;
          setIsVortexStabilized(true);
          sound.playCurseBreak();
          logs.push(`> stabilize_vortex(crystals) -> Chrono rift sealed! 🌀`);
          setTerminalLogs([...logs]);
          await delay(400);
        }

        // 8. Boss Arena (Chapter 8)
        else if (trimmed.includes('mana_shield = 100')) {
          simShield = 100;
          setPlayerShield(100);
          sound.playSuccessChime();
          logs.push(`> mana_shield = 100 -> Prismatic Barrier erected! (100 Shield) 🛡️`);
          setTerminalLogs([...logs]);
          await delay(400);
        } else if (trimmed.includes('cast_starlight_bolt()')) {
          simBossHp = Math.max(0, simBossHp - 20);
          setBossHp(simBossHp);
          setBossHitFlash(true);
          sound.playBossHit();
          logs.push(`> cast_starlight_bolt() -> Starlight beam struck Chimera! (-20 HP) ⚡`);
          setTerminalLogs([...logs]);
          await delay(350);
          setBossHitFlash(false);
        } else if (trimmed.includes('holy_smite()')) {
          simBossHp = 0;
          setBossHp(0);
          setBossHitFlash(true);
          sound.playBossHit();
          logs.push(`> holy_smite() -> CRITICAL SMITE! Glitch Chimera banished! 💥`);
          setTerminalLogs([...logs]);
          await delay(400);
          setBossHitFlash(false);
        }
      }

      // Check validation
      checkQuestVictory(simDragon, simCrystal, simPotion, simBrewed, simBlooms, simBridge, simRunes, simRingsAligned, simFlux, simCrystals, simVortex, simBossHp, simShield, logs, lines);
    } catch (err: any) {
      sound.playError();
      logs.push(`❌ ${err.message}`);
      setTerminalLogs([...logs]);
    } finally {
      setIsExecuting(false);
      setActiveLine(null);
    }
  };

  const moveDragon = (
    d: { x: number; y: number; direction: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' },
    lineIdx: number
  ) => {
    let nx = d.x;
    let ny = d.y;
    if (d.direction === 'UP') ny -= 1;
    if (d.direction === 'DOWN') ny += 1;
    if (d.direction === 'LEFT') nx -= 1;
    if (d.direction === 'RIGHT') nx += 1;

    // Bounds check
    if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) {
      const err: ErrorPointer = {
        lineIndex: lineIdx,
        message: `Out of Bounds! Sparky tried to step off the grid at (${nx}, ${ny}).`,
        suggestion: 'Turn before moving so Sparky stays on the 5x5 stone pathway.',
        tileCoords: { x: d.x, y: d.y },
      };
      setErrorPointer(err);
      throw new Error(err.message);
    }

    // Boulder check at (1, 1)
    if (nx === 1 && ny === 1) {
      const err: ErrorPointer = {
        lineIndex: lineIdx,
        message: `Collision! Sparky hit a boulder at (1, 1).`,
        suggestion: 'Turn right or left before moving forward to walk around the boulder!',
        tileCoords: { x: 1, y: 1 },
      };
      setErrorPointer(err);
      throw new Error(err.message);
    }

    return { ...d, x: nx, y: ny };
  };

  const turnDragon = (d: { x: number; y: number; direction: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' }, dir: 'LEFT' | 'RIGHT') => {
    const list: Array<'UP' | 'RIGHT' | 'DOWN' | 'LEFT'> = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const idx = list.indexOf(d.direction);
    const nextIdx = dir === 'RIGHT' ? (idx + 1) % 4 : (idx + 3) % 4;
    return { ...d, direction: list[nextIdx] };
  };

  const checkQuestVictory = (
    d: any,
    crystal: boolean,
    potion: Record<string, number>,
    brewed: boolean,
    blooms: number,
    bridge: number,
    runes: number[],
    ringsAligned: boolean,
    flux: number,
    crystals: number[],
    vortex: boolean,
    bossHpVal: number,
    shieldVal: number,
    logs: string[],
    lines: string[]
  ) => {
    let passed = false;

    if (lesson.stageType === 'dragon') {
      if (d.x === 2 && d.y === 2 && crystal) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: Math.max(0, lines.length - 1),
          message: 'Crystal was not collected!',
          suggestion: 'Sparky must reach (2, 2) and call dragon.collect_crystal() to finish!',
          tileCoords: { x: 2, y: 2 },
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === 'potion') {
      if (potion['mana_flask'] === 100 && potion['star_dew'] === 3 && brewed) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: 'Potion recipe incomplete!',
          suggestion: 'Make sure mana_flask = 100, star_dew = 3, and cauldron.brew_elixir() are written.',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === 'garden') {
      if (blooms >= 6) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: `Only ${blooms} flowers bloomed (needed 6).`,
          suggestion: 'Write "for step in range(6):" to repeat grow_flower() 6 times.',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === 'bridge') {
      if (bridge >= 4) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: Math.max(0, lines.length - 1),
          message: 'Bridge incomplete!',
          suggestion: 'Define build_bridge() with 4 tiles, and remember to call build_bridge() at the end!',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === 'curse') {
      if (runes.includes(1) && runes.includes(2) && runes.includes(3)) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 2,
          message: 'Not all 3 runes were cleansed!',
          suggestion: 'Make sure runes 1, 2, and 3 are all purified.',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === 'stargate') {
      if (ringsAligned && flux >= 200) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: 'Stargate not fully powered!',
          suggestion: 'Align astral rings with align_gate_rings() and charge stargate with charge_stargate(200)!',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === 'chrono') {
      if (crystals[0] === 1 && crystals[1] === 2 && crystals[2] === 3 && crystals[3] === 4 && vortex) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: 'Timeline vortex unstable!',
          suggestion: 'Order the crystals with crystals.sort() and call stabilize_vortex(crystals)!',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === 'boss') {
      if (bossHpVal <= 0 && shieldVal >= 100) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: 'Glitch Chimera is still standing!',
          suggestion: 'Raise mana_shield = 100, barrage with cast_starlight_bolt(), and finish with holy_smite()!',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    }

    if (passed) {
      sound.playVictoryFanfare();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      logs.push(`================================`);
      logs.push(`🎉 QUEST COMPLETE! +150 XP`);
      logs.push(`> Well done wizard! Proceed to next quest.`);
      setTerminalLogs([...logs]);
      setQuestSuccess(true);
      setErrorPointer(null);
      if (!completedLessons.includes(lesson.id)) {
        setCompletedLessons([...completedLessons, lesson.id]);
      }
    }
  };

  const handleNextQuest = () => {
    sound.playClick();
    const currIdx = ALL_CODEDEX_LESSONS.findIndex((l) => l.id === currentLessonId);
    if (currIdx !== -1 && currIdx < ALL_CODEDEX_LESSONS.length - 1) {
      setCurrentLessonId(ALL_CODEDEX_LESSONS[currIdx + 1].id);
    }
  }
  if (questSuccess && !crossing) return <QuestAftermath key={lesson.id} id={lesson.id} code={code} logs={terminalLogs} onContinue={lesson.id < CODEDEX_LESSONS.length ? handleNextQuest : onExit}/>;

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
          </div>

          {/* Track Switcher & Quest Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentLessonId(1);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-pixel transition-all ${
                  currentLessonId <= 8 ? 'bg-magic text-white shadow font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                🐍 Python
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentLessonId(101);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-pixel transition-all ${
                  currentLessonId >= 101 ? 'bg-spellPink text-night-950 shadow font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                🌐 HTML/CSS
              </button>
            </div>

            {(currentLessonId >= 101 ? HTML_CSS_LESSONS : CODEDEX_LESSONS).map((l) => {
              const isCurrent = l.id === currentLessonId;
              const isDone = completedLessons.includes(l.id);

              return (
                <button
                  key={l.id}
                  onClick={() => {
                    sound.playClick();
                    setCurrentLessonId(l.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-fantasy font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-magic to-spellPink text-night-950 shadow-magic scale-105'
                      : isDone
                      ? 'bg-emerald-950/70 border border-manaMint/40 text-manaMint'
                      : 'bg-white/5 hover:bg-white/10 text-moonCream/70'
                  }`}
                >
                  <span>#{l.id >= 101 ? l.id - 100 : l.id}</span>
                  <span className="hidden sm:inline">{l.title}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-manaMint" />}
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Tutorial, Hint, Sound, Home */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                setIsTutorialOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-magic/20 hover:bg-magic/35 border border-magic/40 text-spellPink text-xs font-fantasy font-bold transition-all cursor-pointer shadow-sm"
              title="Open Quest Tutorial & How to Play"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tutorial</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowHint(!showHint);
              }}
              className={`p-2 rounded-xl text-xs font-fantasy font-bold transition-colors cursor-pointer ${
                showHint
                  ? 'bg-amber-400 text-night-950'
                  : 'bg-white/5 hover:bg-white/10 text-runeAmber'
              }`}
              title="Need a Hint?"
            >
              <Lightbulb className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const muted = sound.toggleMute();
                setIsMuted(muted);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-moonCream/70 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setCurrentView('home');
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="# Write your spell here"
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
        </div>
      </div>

      {/* 3. MAIN CENTERED WORKSPACE (STAGE + EDITOR) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: THE MAGICAL STAGE (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#140e24] border border-purple-900/40 p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 text-xs">
              <span className="font-fantasy font-bold text-moonCream flex items-center gap-1.5">
                <span>✨</span> The Magical Stage
              </span>
              <span className="text-[10px] text-magic-light font-code">Live Visual Response</span>
            </div>

            {/* STAGE CANVASES */}
            <div className="flex items-center justify-center py-2">
              {/* Level 1: Dragon 5x5 Grid */}
              {lesson.stageType === 'dragon' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-[#090610] border border-magic/30 max-w-xs w-full aspect-square">
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
                          className={`relative rounded-xl border flex items-center justify-center transition-all ${
                            isErrorTile
                              ? 'bg-red-950/80 border-cursedRed ring-2 ring-cursedRed shadow-[0_0_15px_rgba(255,89,100,0.8)]'
                              : isDragon
                              ? 'bg-magic/35 border-magic shadow-magic scale-105'
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

                          {/* DYNAMIC ERROR ARROW: Points directly to the blocked tile ONLY when error occurs */}
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
                    <span className="text-runeAmber font-bold">
                      {collectedCrystal ? 'Crystal Collected 💎' : '0/1 Crystal'}
                    </span>
                  </div>
                </div>
              )}

              {/* Level 2: Potion Cauldron */}
              {lesson.stageType === 'potion' && (
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="p-3 rounded-xl bg-night-950/80 border border-spellPink/40 text-center">
                      <span className="text-2xl">🍾</span>
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
                    Cauldron: {isBrewed ? 'Elixir Transmuted! 🎉' : 'Awaiting ingredients...'}
                  </div>
                </div>
              )}

              {/* Level 3: Garden */}
              {lesson.stageType === 'garden' && (
                <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                  <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#0a1813] border border-manaMint/40 shadow-inner w-full">
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
                    {bloomedFlowers} / 6 Flowers Bloomed
                  </div>
                </div>
              )}

              {/* Level 4: Bridge */}
              {lesson.stageType === 'bridge' && (
                <div className="flex items-center justify-between gap-1 w-full max-w-sm py-4">
                  <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
                    <span className="text-2xl">🧙‍♂️</span>
                    <span className="text-[9px] text-white/60">Cliff</span>
                  </div>

                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-12 rounded-lg border flex items-center justify-center text-xs transition-all ${
                        i < bridgeTiles
                          ? 'bg-gradient-to-t from-magic to-manaMint border-manaMint shadow-mana text-night-950 font-bold scale-105'
                          : 'bg-white/5 border-dashed border-white/10 opacity-30'
                      }`}
                    >
                      {i < bridgeTiles ? '✨' : ''}
                    </div>
                  ))}

                  <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
                    <span className="text-2xl">🏰</span>
                    <span className="text-[9px] text-white/60">Tower</span>
                  </div>
                </div>
              )}

              {/* Level 5: Curse */}
              {lesson.stageType === 'curse' && (
                <div className="flex flex-col items-center gap-3 w-full max-w-sm py-2">
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

                  <div className="p-2.5 rounded-xl bg-night-950/70 border border-white/10 text-center w-full text-xs">
                    Dungeon Vault:{' '}
                    <strong className={purifiedRunes.length === 3 ? 'text-manaMint' : 'text-cursedRed'}>
                      {purifiedRunes.length === 3 ? '🔓 UNLOCKED!' : '🔒 SEALED BY HEX'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Level 6: Stargate */}
              {lesson.stageType === 'stargate' && (
                <div className="flex flex-col items-center gap-3 w-full max-w-sm py-2">
                  <div className="relative w-44 h-44 rounded-full flex items-center justify-center border-4 border-dashed border-[#8B5CF6]/40 p-2">
                    {/* Ring 1 */}
                    <div
                      className={`absolute inset-2 rounded-full border-2 transition-all duration-1000 ${
                        stargateRingsAligned
                          ? 'border-[#5EEAD4] shadow-[0_0_20px_#5EEAD4] rotate-0'
                          : 'border-white/20 rotate-45'
                      }`}
                    />
                    {/* Ring 2 */}
                    <div
                      className={`absolute inset-5 rounded-full border-2 transition-all duration-1000 ${
                        stargateRingsAligned
                          ? 'border-[#F472B6] shadow-[0_0_20px_#F472B6] rotate-0'
                          : 'border-white/20 -rotate-90'
                      }`}
                    />
                    {/* Ring 3 (Inner Portal) */}
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all duration-700 ${
                        stargateFlux >= 200
                          ? 'bg-gradient-to-tr from-[#5EEAD4] via-[#8B5CF6] to-[#F472B6] shadow-[0_0_35px_rgba(94,234,212,0.9)] scale-110 animate-spin'
                          : 'bg-black/60 border border-white/20'
                      }`}
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
                </div>
              )}

              {/* Level 7: Chrono Matrix */}
              {lesson.stageType === 'chrono' && (
                <div className="flex flex-col items-center gap-3 w-full max-w-sm py-2">
                  <div className="grid grid-cols-4 gap-2 w-full">
                    {chronoCrystals.map((val, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 ${
                          val === idx + 1
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105'
                            : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
                        }`}
                      >
                        <span className="text-2xl animate-bounce" style={{ animationDelay: `${idx * 0.15}s` }}>
                          💎
                        </span>
                        <span className="font-pixel text-lg font-bold">#{val}</span>
                        <span className="text-[9px] font-code opacity-60">idx [{idx}]</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full p-2.5 rounded-xl bg-night-950/70 border border-white/10 text-center text-xs">
                    Timeline Vortex:{' '}
                    <strong className={isVortexStabilized ? 'text-emerald-400' : 'text-amber-400'}>
                      {isVortexStabilized ? '🌀 100% STABILIZED (NO PARADOX)' : '⚠️ CHRONO ANOMALY DETECTED'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Level 8: Boss Battle Arena */}
              {lesson.stageType === 'boss' && (
                <div className="flex flex-col items-center gap-3 w-full max-w-sm py-2">
                  {/* Glitch Chimera Sprite */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`text-6xl transition-all duration-200 ${
                        bossHitFlash ? 'scale-125 filter drop-shadow-[0_0_25px_#EF4444]' : 'animate-bounce'
                      }`}
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
                </div>
              )}

              {/* HTML & CSS Live Scrying Mirror (iframe Preview) */}
              {(lesson.stageType === 'webpage' || lesson.stageType === 'styler' || lesson.stageType === 'layout') && (
                <div className="flex flex-col items-center gap-2.5 w-full h-full min-h-[300px]">
                  <div className="w-full flex items-center justify-between px-3.5 py-2 bg-[#090610] rounded-t-2xl border border-white/10 text-xs shadow-md">
                    <span className="flex items-center gap-2 text-manaMint font-bold font-pixel">
                      <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" /> Scrying Mirror (Live Preview)
                    </span>
                    <span className="text-[10px] text-white/60 font-code font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {lesson.stageType === 'webpage' ? '📜 Structure' : lesson.stageType === 'styler' ? '🎨 Stylesheet' : '🏛️ Layout'}
                    </span>
                  </div>
                  <div className="w-full flex-1 rounded-b-2xl overflow-hidden bg-white border border-t-0 border-white/20 shadow-2xl min-h-[260px] flex flex-col">
                    <iframe
                      srcDoc={code}
                      title="Live HTML/CSS Preview"
                      sandbox="allow-scripts"
                      className="w-full h-full min-h-[260px] flex-1 border-none bg-white text-black"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Victory Next Quest Banner with Pointer Arrow */}
            {questSuccess && (
              <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-900/80 to-emerald-950/90 border-2 border-manaMint flex items-center justify-between animate-fadeIn shadow-mana">
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

                {(() => {
                  const currIdx = ALL_CODEDEX_LESSONS.findIndex((l) => l.id === currentLessonId);
                  return currIdx !== -1 && currIdx < ALL_CODEDEX_LESSONS.length - 1;
                })() && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-fantasy font-bold text-manaMint animate-pulse hidden sm:inline">
                      Next Step 👉
                    </span>
                    <button
                      onClick={handleNextQuest}
                      className="px-4 py-2 rounded-xl bg-manaMint text-night-950 font-fantasy font-black text-xs shadow-md hover:bg-white transition-all flex items-center gap-1 shrink-0 animate-bounce"
                    >
                      <span>Next Quest</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
