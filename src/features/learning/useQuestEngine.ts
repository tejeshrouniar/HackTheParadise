import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";
import { sound } from "../../utils/sound";
import { useProgress } from "./ProgressContext";
import { usePreferences } from "../settings/PreferencesContext";
import { compileQuestCode, QuestCodeError } from "./questCompiler";
interface ErrorPointer {
  lineIndex: number;
  message: string;
  suggestion: string;
  tileCoords?: { x: number; y: number };
}

const stageInfo: Record<string, { emoji: string; name: string }> = {
  dragon: { emoji: "🐲", name: "Dragon's Lair" },
  potion: { emoji: "⚗️", name: "Alchemist's Cauldron" },
  garden: { emoji: "🌸", name: "Enchanted Garden" },
  bridge: { emoji: "🌉", name: "Crystal Bridge" },
  curse: { emoji: "⚡", name: "Curse Breaker" },
  stargate: { emoji: "🌌", name: "Cosmic Stargate" },
  chrono: { emoji: "⏳", name: "Chrono Matrix" },
  boss: { emoji: "👾", name: "Boss Arena" },
};

export function useQuestEngine(
  initialLessonId: number,
  onLessonChange?: (id: number) => void,
) {
  const { completed: completedLessons, complete } = useProgress();
  const { preferences, update: updatePreferences } = usePreferences();
  const runId = useRef(0);
  const running = useRef(false);
  useEffect(
    () => () => {
      runId.current++;
      running.current = false;
    },
    [],
  );
  // Lesson state
  const [currentLessonId, changeLessonId] = useState<number>(initialLessonId);
  const setCurrentLessonId = (id: number) => {
    runId.current++;
    running.current = false;
    changeLessonId(id);
    onLessonChange?.(id);
  };
  const lesson =
    CODEDEX_LESSONS.find((l) => l.id === currentLessonId) || CODEDEX_LESSONS[0];

  // User Code State (Starts clean with "type code here")
  const [code, setCode] = useState<string>(lesson.initialCode);

  // Hints and solutions toggles
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Execution & Diagnostics states
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [errorPointer, setErrorPointer] = useState<ErrorPointer | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "$ storicode init",
    "> Enchanted environment initialized.",
    '> Follow instructions on the left, type code, and press "Cast Spell".',
  ]);
  const [questSuccess, setQuestSuccess] = useState<boolean>(false);

  // Simulation Worlds
  // 1. Dragon
  const [dragon, setDragon] = useState<{
    x: number;
    y: number;
    direction: "UP" | "RIGHT" | "DOWN" | "LEFT";
  }>({
    x: 0,
    y: 0,
    direction: "RIGHT",
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
  const [stargateRingsAligned, setStargateRingsAligned] =
    useState<boolean>(false);

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

  // New UI state
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] =
    useState<boolean>(false);
  const [showTerminal, setShowTerminal] = useState<boolean>(false);

  // Sync when lesson changes
  useEffect(() => {
    setCode(lesson.initialCode);
    setShowHint(false);
    setShowSolution(false);
    setQuestSuccess(false);
    setErrorPointer(null);
    resetStage();
    setTerminalLogs([
      `$ storicode load "${lesson.title}"`,
      `> Loaded ${lesson.chapter}.`,
      "> Read the instructions on the left and type code in the editor!",
    ]);
  }, [currentLessonId]);

  const resetStage = () => {
    runId.current++;
    running.current = false;
    setIsExecuting(false);
    setActiveLine(null);
    setQuestSuccess(false);
    setErrorPointer(null);

    // Dragon
    setDragon({
      x: lesson.stageConfig?.startX ?? 0,
      y: lesson.stageConfig?.startY ?? 0,
      direction: lesson.stageConfig?.startDir ?? "RIGHT",
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

  const handleRunCode = async () => {
    if (running.current) return;
    resetStage();
    running.current = true;
    setIsExecuting(true);
    sound.playWandCast();
    const token = runId.current;
    const logs: string[] = ["$ storicode run — teaching sandbox"];
    let simDragon = {
      x: lesson.stageConfig?.startX ?? 0,
      y: lesson.stageConfig?.startY ?? 0,
      direction: (lesson.stageConfig?.startDir ?? "RIGHT") as
        "UP" | "RIGHT" | "DOWN" | "LEFT",
    };
    let simCrystal = false,
      simBrewed = false,
      simBlooms = 0,
      simBridge = 0,
      simFlux = 0,
      simRings = false,
      simVortex = false,
      simHp = 100,
      simShield = 0;
    let simCrystals: number[] = [];
    const simPotion: Record<string, number> = {};
    const simRunes: number[] = [];
    let currentLine = 0;
    try {
      const instructions = compileQuestCode(code);
      for (const instruction of instructions) {
        if (token !== runId.current) return;
        currentLine = instruction.line;
        setActiveLine(currentLine);
        const { name, args } = instruction;
        if (name.startsWith("assign:")) {
          const variable = name.slice(7),
            value = args[0];
          if (typeof value === "number") {
            simPotion[variable] = value;
            setPotionVars({ ...simPotion });
            if (variable === "mana_shield") {
              simShield = value;
              setPlayerShield(value);
            }
          } else if (variable === "crystals") {
            simCrystals = [...value];
            setChronoCrystals(simCrystals);
          }
        } else
          switch (name) {
            case "dragon.move_forward":
              simDragon = moveDragon(simDragon, currentLine);
              setDragon({ ...simDragon });
              sound.playDragonStep();
              break;
            case "dragon.turn_right":
              simDragon = turnDragon(simDragon, "RIGHT");
              setDragon({ ...simDragon });
              break;
            case "dragon.turn_left":
              simDragon = turnDragon(simDragon, "LEFT");
              setDragon({ ...simDragon });
              break;
            case "dragon.collect_crystal":
              if (simDragon.x !== 2 || simDragon.y !== 2)
                throw new Error(
                  "Move Sparky to the crystal at (2, 2) before collecting it.",
                );
              simCrystal = true;
              setCollectedCrystal(true);
              sound.playCrystalCollect();
              break;
            case "cauldron.brew_elixir":
              simBrewed = true;
              setIsBrewed(true);
              sound.playPotionBubble();
              break;
            case "grow_flower":
              setBloomedFlowers(++simBlooms);
              sound.playFlowerBloom();
              break;
            case "place_starlight_tile":
              setBridgeTiles(++simBridge);
              sound.playWandCast();
              break;
            case "purify_rune": {
              const id = args[0];
              if (typeof id !== "number" || ![1, 2, 3].includes(id))
                throw new Error(
                  "The altar has runes 1, 2 and 3. Check your rune number.",
                );
              if (!simRunes.includes(id)) simRunes.push(id);
              setPurifiedRunes([...simRunes]);
              sound.playCurseBreak();
              break;
            }
            case "align_gate_rings":
              simRings = true;
              setStargateRingsAligned(true);
              break;
            case "charge_stargate":
              if (typeof args[0] !== "number")
                throw new Error("The gate needs a numeric flux value.");
              simFlux = args[0];
              setStargateFlux(simFlux);
              break;
            case "crystals.sort":
              simCrystals = [...(args[0] as number[])];
              setChronoCrystals(simCrystals);
              break;
            case "stabilize_vortex":
              if (!Array.isArray(args[0]))
                throw new Error("Pass the crystals list to stabilize_vortex.");
              simVortex = true;
              setIsVortexStabilized(true);
              break;
            case "cast_starlight_bolt":
              simHp = Math.max(0, simHp - 20);
              setBossHp(simHp);
              setBossHitFlash(true);
              sound.playBossHit();
              break;
            case "holy_smite":
              simHp = 0;
              setBossHp(0);
              setBossHitFlash(true);
              sound.playBossHit();
              break;
          }
        logs.push(
          "> " +
            name +
            "(" +
            args.map((a) => JSON.stringify(a)).join(", ") +
            ")",
        );
        setTerminalLogs([...logs]);
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            preferences.reduced_motion ||
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? 30
              : 320,
          ),
        );
        if (token !== runId.current) return;
        setBossHitFlash(false);
      }
      if (token === runId.current)
        checkQuestVictory(
          simDragon,
          simCrystal,
          simPotion,
          simBrewed,
          simBlooms,
          simBridge,
          simRunes,
          simRings,
          simFlux,
          simCrystals,
          simVortex,
          simHp,
          simShield,
          logs,
          code.split("\n"),
        );
    } catch (error) {
      if (token !== runId.current) return;
      const message =
        error instanceof Error ? error.message : "This spell could not run.";
      setErrorPointer({
        lineIndex: error instanceof QuestCodeError ? error.line : currentLine,
        message,
        suggestion:
          "Check the highlighted line and compare it with the quest guide.",
      });
      sound.playError();
      logs.push("Error: " + message);
      setTerminalLogs([...logs]);
      setShowTerminal(true);
    } finally {
      if (token === runId.current) {
        running.current = false;
        setIsExecuting(false);
        setActiveLine(null);
      }
    }
  };

  const moveDragon = (
    d: { x: number; y: number; direction: "UP" | "RIGHT" | "DOWN" | "LEFT" },
    lineIdx: number,
  ) => {
    let nx = d.x;
    let ny = d.y;
    if (d.direction === "UP") ny -= 1;
    if (d.direction === "DOWN") ny += 1;
    if (d.direction === "LEFT") nx -= 1;
    if (d.direction === "RIGHT") nx += 1;

    // Bounds check
    if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) {
      const err: ErrorPointer = {
        lineIndex: lineIdx,
        message: `Out of Bounds! Sparky tried to step off the grid at (${nx}, ${ny}).`,
        suggestion:
          "Turn before moving so Sparky stays on the 5x5 stone pathway.",
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
        suggestion:
          "Turn right or left before moving forward to walk around the boulder!",
        tileCoords: { x: 1, y: 1 },
      };
      setErrorPointer(err);
      throw new Error(err.message);
    }

    return { ...d, x: nx, y: ny };
  };

  const turnDragon = (
    d: { x: number; y: number; direction: "UP" | "RIGHT" | "DOWN" | "LEFT" },
    dir: "LEFT" | "RIGHT",
  ) => {
    const list: Array<"UP" | "RIGHT" | "DOWN" | "LEFT"> = [
      "UP",
      "RIGHT",
      "DOWN",
      "LEFT",
    ];
    const idx = list.indexOf(d.direction);
    const nextIdx = dir === "RIGHT" ? (idx + 1) % 4 : (idx + 3) % 4;
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
    lines: string[],
  ) => {
    let passed = false;

    if (lesson.stageType === "dragon") {
      if (d.x === 2 && d.y === 2 && crystal) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: Math.max(0, lines.length - 1),
          message: "Crystal was not collected!",
          suggestion:
            "Sparky must reach (2, 2) and call dragon.collect_crystal() to finish!",
          tileCoords: { x: 2, y: 2 },
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === "potion") {
      if (potion["mana_flask"] === 100 && potion["star_dew"] === 3 && brewed) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: "Potion recipe incomplete!",
          suggestion:
            "Make sure mana_flask = 100, star_dew = 3, and cauldron.brew_elixir() are written.",
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === "garden") {
      if (blooms >= 6) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: `Only ${blooms} flowers bloomed (needed 6).`,
          suggestion:
            'Write "for step in range(6):" to repeat grow_flower() 6 times.',
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === "bridge") {
      if (bridge >= 4) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: Math.max(0, lines.length - 1),
          message: "Bridge incomplete!",
          suggestion:
            "Define build_bridge() with 4 tiles, and remember to call build_bridge() at the end!",
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === "curse") {
      if (runes.includes(1) && runes.includes(2) && runes.includes(3)) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 2,
          message: "Not all 3 runes were cleansed!",
          suggestion: "Make sure runes 1, 2, and 3 are all purified.",
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === "stargate") {
      if (ringsAligned && flux >= 200) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: "Stargate not fully powered!",
          suggestion:
            "Align astral rings with align_gate_rings() and charge stargate with charge_stargate(200)!",
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === "chrono") {
      if (
        crystals[0] === 1 &&
        crystals[1] === 2 &&
        crystals[2] === 3 &&
        crystals[3] === 4 &&
        vortex
      ) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: "Timeline vortex unstable!",
          suggestion:
            "Order the crystals with crystals.sort() and call stabilize_vortex(crystals)!",
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    } else if (lesson.stageType === "boss") {
      if (bossHpVal <= 0 && shieldVal >= 100) {
        passed = true;
      } else {
        const err: ErrorPointer = {
          lineIndex: 0,
          message: "Glitch Chimera is still standing!",
          suggestion:
            "Raise mana_shield = 100, barrage with cast_starlight_bolt(), and finish with holy_smite()!",
        };
        setErrorPointer(err);
        throw new Error(err.message);
      }
    }

    if (passed) {
      sound.playVictoryFanfare();
      if (
        !preferences.reduced_motion &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { y: 0.6 },
          disableForReducedMotion: true,
        });
      logs.push(`================================`);
      logs.push(`🎉 QUEST COMPLETE! +150 XP`);
      logs.push(`> Well done wizard! Proceed to next quest.`);
      setTerminalLogs([...logs]);
      setQuestSuccess(true);
      setErrorPointer(null);
      if (!completedLessons.includes(lesson.id)) {
        complete(lesson.id);
      }
    }
  };

  const handleNextQuest = () => {
    sound.playClick();
    if (currentLessonId < CODEDEX_LESSONS.length) {
      setCurrentLessonId(currentLessonId + 1);
    }
  };

  // Check if a task is typed in code
  const isTaskTyped = (keyword: string) => {
    return code.includes(keyword);
  };

  // Smart Contextual Arrow Conditions
  // 1. Is the editor clean/empty (only comments)?
  const codeLinesWithoutComments = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const isEditorEmpty = codeLinesWithoutComments.length === 0;

  // 2. Which is the first incomplete task?
  const nextIncompleteTaskIndex = lesson.tasks.findIndex(
    (t) => !isTaskTyped(t.codeKeyword),
  );
  const allTasksTyped = nextIncompleteTaskIndex === -1;

  // 3. Is user ready to run code?
  const isReadyToRun =
    allTasksTyped && !questSuccess && !isExecuting && !errorPointer;

  const currentStageInfo = stageInfo[lesson.stageType] ?? {
    emoji: "✨",
    name: "Magic Stage",
  };

  return {
    completedLessons,
    complete,
    preferences,
    updatePreferences,
    runId,
    running,
    currentLessonId,
    changeLessonId,
    setCurrentLessonId,
    lesson,
    code,
    setCode,
    showHint,
    setShowHint,
    showSolution,
    setShowSolution,
    isTutorialOpen,
    setIsTutorialOpen,
    isExecuting,
    setIsExecuting,
    activeLine,
    setActiveLine,
    errorPointer,
    setErrorPointer,
    terminalLogs,
    setTerminalLogs,
    questSuccess,
    setQuestSuccess,
    dragon,
    setDragon,
    collectedCrystal,
    setCollectedCrystal,
    potionVars,
    setPotionVars,
    isBrewed,
    setIsBrewed,
    bloomedFlowers,
    setBloomedFlowers,
    bridgeTiles,
    setBridgeTiles,
    purifiedRunes,
    setPurifiedRunes,
    stargateFlux,
    setStargateFlux,
    stargateRingsAligned,
    setStargateRingsAligned,
    chronoCrystals,
    setChronoCrystals,
    isVortexStabilized,
    setIsVortexStabilized,
    bossHp,
    setBossHp,
    playerShield,
    setPlayerShield,
    bossHitFlash,
    setBossHitFlash,
    isMuted,
    setIsMuted,
    copiedCode,
    setCopiedCode,
    textareaRef,
    isChapterDrawerOpen,
    setIsChapterDrawerOpen,
    showTerminal,
    setShowTerminal,
    resetStage,
    handleRunCode,
    moveDragon,
    turnDragon,
    checkQuestVictory,
    handleNextQuest,
    isTaskTyped,
    codeLinesWithoutComments,
    isEditorEmpty,
    nextIncompleteTaskIndex,
    allTasksTyped,
    isReadyToRun,
    currentStageInfo,
  };
}
