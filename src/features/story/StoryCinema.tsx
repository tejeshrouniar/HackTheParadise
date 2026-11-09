// Archived saga renderer; the live four-chapter journey uses JourneyCinema.tsx.
import React, { useEffect, useRef, useState, useMemo } from "react";
import { AvatarGraphic } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { JOURNEY } from "../../content/journey";
import { sound } from "../../utils/sound";
import { usePreferences } from "../settings/PreferencesContext";
import { useProgress } from "../learning/ProgressContext";
import { canEnterLevel } from "../learning/journeyProgress";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";
import { useMusic } from "../tools/MusicContext";
import {
  StoryChapterData,
  StoryBeat,
  ALL_SAGAS,
  getSagaById,
} from "../../content/storySagas";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sparkles,
  Swords,
  Compass,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import lanternwood from "../../assets/realms/lanternwood.png";
import moonlit from "../../assets/realms/moonlit.png";
import amber from "../../assets/realms/amber.png";
import dawnreach from "../../assets/realms/dawnreach.png";

// New Pixel Art Environments & Props
import eldoriaCastle from "../../assets/environments/eldoria_castle.png";
import chronosCastle from "../../assets/environments/chronos_winter_castle.png";
import forgeCastle from "../../assets/environments/forge_autumn_castle.png";
import sylvaSky from "../../assets/environments/sylva_sky.png";
import sylvaMountainsRock from "../../assets/environments/sylva_mountains_rock.png";
import sylvaMountainsGrass from "../../assets/environments/sylva_mountains_grass.png";
import sylvaClouds from "../../assets/environments/sylva_clouds.png";
import atlantisWater from "../../assets/environments/atlantis_water_animated.png";

import alchemyDecor from "../../assets/props/alchemy_decor.png";
import furnaceProp from "../../assets/props/furnace.png";
import oresProp from "../../assets/props/ores.png";
import bonsaiProp from "../../assets/props/bonsai.png";
import willowProp from "../../assets/props/weeping_willow.png";
import portalProp from "../../assets/props/portal_sheet.png";

const realmAssets = import.meta.glob<string>("../../assets/realms/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const prop = (name: string) => realmAssets[`../../assets/realms/${name}.png`];

function SagaEnvironmentBackdrop({
  sagaId,
  isPlaying,
}: {
  sagaId: string;
  isPlaying: boolean;
}) {
  if (sagaId === "sylva") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={sylvaSky}
          alt="Sky"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <img
          src={sylvaMountainsRock}
          alt="Rock Mountains"
          className="absolute bottom-0 w-full object-cover opacity-80"
        />
        <img
          src={sylvaMountainsGrass}
          alt="Grass Mountains"
          className="absolute bottom-0 w-full object-cover"
        />
        <img
          src={sylvaClouds}
          alt="Clouds"
          className={`absolute top-0 w-full object-contain opacity-60 ${
            isPlaying ? "animate-pulse" : ""
          }`}
        />
        <img
          src={willowProp}
          alt="Willow"
          className="absolute bottom-2 left-6 w-28 h-auto object-contain filter drop-shadow-lg"
        />
        <img
          src={bonsaiProp}
          alt="Bonsai"
          className="absolute bottom-2 right-8 w-20 h-auto object-contain"
        />
      </div>
    );
  }
  if (sagaId === "chronos") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={chronosCastle}
          alt="Clockwork Citadel"
          className="absolute inset-0 w-full h-full object-cover filter contrast-125"
        />
        <div className="absolute inset-0 bg-amber-950/20 mix-blend-color" />
        <img
          src={portalProp}
          alt="Temporal Portal"
          className={`absolute bottom-6 right-10 w-24 h-auto object-contain ${
            isPlaying ? "animate-spin" : ""
          }`}
          style={{ animationDuration: "20s" }}
        />
      </div>
    );
  }
  if (sagaId === "forge") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={forgeCastle}
          alt="Volcanic Citadel"
          className="absolute inset-0 w-full h-full object-cover filter hue-rotate-[-20deg] saturate-150"
        />
        <img
          src={furnaceProp}
          alt="Furnace"
          className="absolute bottom-2 left-8 w-24 h-auto object-contain"
        />
        <img
          src={oresProp}
          alt="Ores"
          className="absolute bottom-2 right-12 w-20 h-auto object-contain"
        />
      </div>
    );
  }
  if (sagaId === "atlantis") {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-gradient-to-b from-sky-950 via-blue-900 to-indigo-950">
        <img
          src={atlantisWater}
          alt="Water"
          className="absolute bottom-0 w-full h-48 object-cover opacity-75 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
      </div>
    );
  }
  // Default: Eldoria Academy
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img
        src={eldoriaCastle}
        alt="Eldoria Castle"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <img
        src={alchemyDecor}
        alt="Alchemy"
        className="absolute bottom-2 right-6 w-28 h-auto object-contain filter drop-shadow-md"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED CANVAS PARTICLE OVERLAY (Starlight, Fireflies, Embers, Bubbles, Cogs)
// ─────────────────────────────────────────────────────────────────────────────
export const CutsceneParticleCanvas: React.FC<{
  effect: "starlight" | "fireflies" | "snow" | "rain" | "embers" | "bubbles" | "cogs" | "fog";
  active?: boolean;
}> = ({ effect, active = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || 640);
    let height = (canvas.height = canvas.offsetHeight || 360);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 640;
      height = canvas.height = canvas.offsetHeight || 360;
    };
    window.addEventListener("resize", handleResize);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      maxOpacity: number;
      decay: number;
      color: string;
      angle?: number;
      spinSpeed?: number;
    }

    const particleCount = effect === "fog" ? 25 : effect === "cogs" ? 18 : 55;
    const particles: Particle[] = [];

    const getColors = () => {
      switch (effect) {
        case "embers":
          return ["#f97316", "#ef4444", "#fbbf24", "#fdba74"];
        case "fireflies":
          return ["#a3e635", "#4ade80", "#22c55e", "#fef08a"];
        case "bubbles":
          return ["#38bdf8", "#7dd3fc", "#06b6d4", "#a5f3fc"];
        case "cogs":
          return ["#eab308", "#ca8a04", "#fbbf24", "#d97706"];
        case "rain":
          return ["#60a5fa", "#93c5fd", "#38bdf8"];
        case "snow":
          return ["#f8fafc", "#e2e8f0", "#c7d2fe"];
        case "starlight":
        default:
          return ["#c084fc", "#e879f9", "#38bdf8", "#fde047", "#ffffff"];
      }
    };

    const colors = getColors();

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size:
          effect === "cogs"
            ? Math.random() * 8 + 6
            : effect === "fog"
            ? Math.random() * 40 + 20
            : Math.random() * 3 + 1,
        speedX:
          effect === "rain"
            ? (Math.random() - 0.5) * 1.5
            : (Math.random() - 0.5) * 1.2,
        speedY:
          effect === "rain"
            ? Math.random() * 4 + 3
            : effect === "embers" || effect === "bubbles"
            ? -(Math.random() * 1.5 + 0.5)
            : (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.8 + 0.2,
        maxOpacity: Math.random() * 0.7 + 0.3,
        decay: Math.random() * 0.01 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.05,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.decay;

        if (p.opacity > p.maxOpacity || p.opacity < 0.1) {
          p.decay = -p.decay;
        }

        // Screen wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));

        if (effect === "cogs") {
          // Draw small spinning gear
          p.angle = (p.angle || 0) + (p.spinSpeed || 0.02);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.stroke();
          for (let g = 0; g < 4; g++) {
            ctx.rotate(Math.PI / 4);
            ctx.strokeRect(-p.size - 2, -1.5, (p.size + 2) * 2, 3);
          }
        } else if (effect === "rain") {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 3);
          ctx.stroke();
        } else if (effect === "fog") {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, "rgba(226, 232, 240, 0.15)");
          grad.addColorStop(1, "rgba(226, 232, 240, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Glowing particle dot
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [effect, active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ mixBlendMode: effect === "fog" ? "screen" : "lighten" }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY & ENHANCED JOURNEY SCENE (Keeps existing props for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────
export function JourneyScene({
  chapter,
  beat = 0,
  playing = false,
}: {
  chapter: number;
  beat?: number;
  playing?: boolean;
}) {
  const { appearance } = useAppearance();
  const { preferences } = usePreferences();
  const moving = playing && !preferences.reduced_motion;
  const floor = chapter === 0 ? 312 : 288;
  const crossing = chapter === 1 || chapter === 3;
  const left = chapter === 1 ? 224 : 256;
  const count = chapter === 1 ? 6 : 4;
  const item = (name: string, x: number, y: number, size = 32) => (
    <image href={prop(name)} x={x} y={y} width={size} height={size} />
  );

  const safeChapter = Math.max(0, Math.min(3, chapter));
  const realm = JOURNEY[safeChapter];

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800 shadow-2xl">
      <svg
        className={`sc-journey-scene realm-${realm.theme}`}
        viewBox="0 0 640 352"
        role="img"
        aria-label={realm.place}
      >
        <image
          href={[lanternwood, moonlit, amber, dawnreach][safeChapter]}
          width="640"
          height="352"
        />
        {crossing && (
          <g>
            {Array.from({ length: count }, (_, i) => (
              <g key={i}>
                {item("oasis_fill", left + i * 32, 320)}
                {item("oasis_top_a", left + i * 32, 288)}
                <g className={moving ? "sc-water-frame" : "sc-water-still"}>
                  {item("oasis_top_b", left + i * 32, 288)}
                </g>
                {item("bridge", left + i * 32, 280)}
              </g>
            ))}
            {item("obelisk", 480, 224, 64)}
            {beat === 2 && (
              <g className={moving ? "sc-realm-glimmer" : ""}>
                {item("soul_stone", 496, 208)}
              </g>
            )}
          </g>
        )}
        {safeChapter === 0 && (
          <g>
            {item("lantern", 288, floor - 32)}
            {beat > 0 && item("resin_bottle", 352, floor - 32)}
            {beat === 2 &&
              [400, 448, 496].map((x) => (
                <g key={x}>{item("healing_herb", x, floor - 32)}</g>
              ))}
          </g>
        )}
        {safeChapter === 2 && (
          <g>
            {item("obelisk", 288, 224, 64)}
            <g className={moving && beat > 0 ? "sc-realm-glimmer" : ""}>
              {item("sun_disc", 288, 192, 64)}
            </g>
            {[256, 352, 448].map((x) => (
              <g key={x}>
                {item("clay_pot", x, 256)}
                {beat === 2 && item("healing_herb", x, 240)}
              </g>
            ))}
          </g>
        )}
        {safeChapter === 3 &&
          [160, 416, 544].map((x) => (
            <g key={x}>
              {item("wooden_sign", x, 256)}
              {beat > 0 && item("lantern", x, 224)}
            </g>
          ))}
        <g transform={`translate(${beat * 140} 0)`} key={beat}>
          <g className={moving ? "sc-cutscene-travel" : ""}>
            <AvatarGraphic
              appearance={appearance}
              action={moving ? "walk" : "idle"}
              directControl={moving}
              x={80}
              y={floor - 64}
              size={64}
            />
          </g>
        </g>
        {beat > 0 && (
          <g
            className={moving ? "sc-realm-glimmer" : ""}
            fill="#ffe3a0"
            shapeRendering="crispEdges"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={210 + i * 70}
                y={floor - 48 - (i % 2) * 12}
                width="2"
                height="2"
              />
            ))}
          </g>
        )}
      </svg>
      <CutsceneParticleCanvas
        effect={
          safeChapter === 0
            ? "fireflies"
            : safeChapter === 1
            ? "starlight"
            : safeChapter === 2
            ? "embers"
            : "starlight"
        }
        active={playing}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GRAND DYNAMIC CUTSCENE VIEWER (Supports all 5 Sagas & 50 Chapters)
// ─────────────────────────────────────────────────────────────────────────────
export interface StoryCinemaProps {
  chapter?: number; // legacy fallback
  sagaId?: string;
  chapterIndex?: number;
  sagaChapter?: StoryChapterData;
  onNextChapter?: () => void;
}

export function StoryCinema({
  chapter = 0,
  sagaId = "eldoria",
  chapterIndex = 0,
  sagaChapter,
  onNextChapter,
}: StoryCinemaProps) {
  const { preferences, update } = usePreferences();
  const { appearance } = useAppearance();
  const { completed } = useProgress();
  const music = useMusic();

  // Determine active saga & chapter
  const currentSaga = useMemo(
    () => getSagaById(sagaId) || ALL_SAGAS[0],
    [sagaId]
  );
  const activeChapter: StoryChapterData = useMemo(() => {
    if (sagaChapter) return sagaChapter;
    if (currentSaga && currentSaga.chapters[chapterIndex]) {
      return currentSaga.chapters[chapterIndex];
    }
    return currentSaga.chapters[0];
  }, [sagaChapter, currentSaga, chapterIndex]);
  const linkedLesson = CODEDEX_LESSONS.find(
    (lesson) => lesson.id === activeChapter.questLevelId,
  );
  const storyUnlocked = completed.includes(activeChapter.questLevelId);
  const canStartLesson =
    linkedLesson !== undefined &&
    canEnterLevel(activeChapter.questLevelId, completed);

  const [beatIndex, setBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chosenResponse, setChosenResponse] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [narrationNotice, setNarrationNotice] = useState("");

  const activeBeat: StoryBeat = useMemo(() => {
    return (
      activeChapter.beats[beatIndex] ||
      activeChapter.beats[0] || {
        id: "default",
        text: activeChapter.loreIntro,
        mood: "wonder",
      }
    );
  }, [activeChapter, beatIndex]);

  // Stop speech when the dialogue changes or this cutscene unmounts.
  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setNarrating(false);
    setNarrationNotice("");
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [activeChapter.id, activeBeat.id]);

  function toggleNarration() {
    if (!("speechSynthesis" in window)) {
      setNarrationNotice("Narration is unavailable in this browser. The dialogue is shown above.");
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setNarrating(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(activeBeat.text);
    utterance.rate = 0.95;
    utterance.onstart = () => setNarrating(true);
    utterance.onend = () => setNarrating(false);
    utterance.onerror = () => {
      setNarrating(false);
      setNarrationNotice("Narration stopped. You can read the dialogue above.");
    };
    setNarrationNotice("");
    window.speechSynthesis.speak(utterance);
  }

  // Sound & FX trigger on beat change
  useEffect(() => {
    setChosenResponse(null);
    if (!storyUnlocked || !preferences.sound_effects) return;

    if (activeBeat.soundEffect === "wand") sound.playWandCast();
    else if (activeBeat.soundEffect === "ping") sound.playCrystalCollect();
    else if (activeBeat.soundEffect === "rumble") {
      sound.playDragonStep();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);
    } else if (activeBeat.soundEffect === "curse") {
      sound.playCurseBreak();
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    } else if (activeBeat.soundEffect === "bubble") {
      sound.playPotionBubble();
    }
  }, [beatIndex, activeBeat, preferences.sound_effects, storyUnlocked]);

  // Auto-play timer
  useEffect(() => {
    if (!storyUnlocked || !isPlaying) return;
    const duration = Math.max(4500, activeBeat.text.length * 45);
    const timer = setTimeout(() => {
      if (beatIndex < activeChapter.beats.length - 1) {
        setBeatIndex((b) => b + 1);
      } else {
        setIsPlaying(false);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [storyUnlocked, isPlaying, beatIndex, activeBeat, activeChapter.beats.length]);

  const handleNextBeat = () => {
    if (beatIndex < activeChapter.beats.length - 1) {
      setBeatIndex((b) => b + 1);
    }
  };

  const handlePrevBeat = () => {
    if (beatIndex > 0) {
      setBeatIndex((b) => b - 1);
    }
  };

  const handleSelectChoice = (choice: { response: string; effect?: string }) => {
    setChosenResponse(choice.response);
    sound.playWandCast();
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
  };

  // Avatar portrait icon/badge
  const getAvatarBadge = () => {
    switch (activeBeat.avatarType) {
      case "mentor":
        return "🧙‍♂️";
      case "companion":
        return "✨";
      case "golem":
        return "🗿";
      case "boss":
        return "👹";
      default:
        return "🪄";
    }
  };

  if (!linkedLesson || !storyUnlocked) {
    return (
      <section className="sc-cinema sc-locked-scene" aria-label="Locked story scene">
        <span className="sc-eyebrow">{currentSaga.title} · CHAPTER {activeChapter.chapterNumber}</span>
        <h2>{activeChapter.title}</h2>
        {!linkedLesson ? (
          <p>
            This scene is in the saga archive, but its playable quest level has not been added yet.
            The current quest library contains levels 1–{CODEDEX_LESSONS.length}.
          </p>
        ) : (
          <>
            <p>Complete “{linkedLesson.title}” to unlock this story scene.</p>
            {!canStartLesson && <p>Finish the earlier levels first.</p>}
            {canStartLesson && <p>The level is ready in the quest card below.</p>}
          </>
        )}
      </section>
    );
  }

  return (
    <section
      className={`sc-cinema relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-6 shadow-2xl transition-all duration-300 ${
        screenShake ? "animate-shake" : ""
      }`}
      aria-label="Story cutscene"
    >
      {/* Visual Flash effect */}
      {flash && (
        <div className="absolute inset-0 bg-white/20 z-30 pointer-events-none transition-opacity duration-300" />
      )}

      {/* Chapter Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentSaga.bannerIcon}</span>
          <div>
            <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">
              {currentSaga.title} · Chapter {activeChapter.chapterNumber}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2">
              {activeChapter.title}
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300">
                {activeChapter.conceptName}
              </span>
            </h2>
          </div>
        </div>

      </div>

      {/* Visual Scene Stage */}
      <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[16/9] max-h-[360px] flex items-center justify-center shadow-inner">
        {/* Render base illustration or procedural backdrop */}
        {chapter < 4 && !sagaChapter ? (
          <JourneyScene
            chapter={chapter}
            beat={beatIndex}
            playing={isPlaying}
          />
        ) : (
          <div
            className={`relative w-full h-full bg-gradient-to-b ${currentSaga.gradient} flex items-center justify-center overflow-hidden`}
          >
            {/* Real Pixel Art Environment Backdrop */}
            <SagaEnvironmentBackdrop sagaId={currentSaga.id} isPlaying={isPlaying} />

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Stage Character Avatars */}
            <div className="relative z-20 flex items-end justify-center gap-12 w-full px-8 pb-8 h-full">
              {/* Player Avatar */}
              <div className="flex flex-col items-center">
                <AvatarGraphic
                  appearance={appearance}
                  action={isPlaying ? "walk" : "idle"}
                  directControl={isPlaying}
                  size={80}
                />
                <span className="text-xs font-medium text-slate-300 mt-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                  You
                </span>
              </div>

              {/* Dialogue Partner Avatar */}
              {activeBeat.speaker && (
                <div className="flex flex-col items-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-800 to-pink-600 border border-purple-400/50 flex items-center justify-center text-3xl shadow-xl shadow-purple-950/60 transform hover:scale-105 transition-transform">
                    {getAvatarBadge()}
                  </div>
                  <span className="text-xs font-semibold text-purple-300 mt-1 px-2 py-0.5 rounded bg-slate-900/80 border border-purple-800/60">
                    {activeBeat.speaker}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Canvas Particles Overlay */}
        <CutsceneParticleCanvas
          effect={activeChapter.weatherEffect}
          active={true}
        />
      </div>

      {/* Dialogue Box */}
      <div className="mt-4 p-4 md:p-5 rounded-xl bg-slate-950/90 border border-slate-800/80 shadow-lg relative min-h-[110px]">
        {activeBeat.speaker && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-bold text-purple-400">
              {activeBeat.speaker}
            </span>
            {activeBeat.speakerTitle && (
              <span className="text-xs text-slate-400">
                · {activeBeat.speakerTitle}
              </span>
            )}
          </div>
        )}

        <p className="text-slate-200 text-sm md:text-base leading-relaxed tracking-wide font-sans">
          {activeBeat.text}
        </p>

        {/* Branching choices (if any) */}
        {activeBeat.choices && activeBeat.choices.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-800/60">
            {activeBeat.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleSelectChoice(choice)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/70 hover:bg-purple-800/80 border border-purple-500/50 text-purple-200 transition-all hover:scale-[1.02]"
              >
                🪄 {choice.label}
              </button>
            ))}
          </div>
        )}

        {/* Response to chosen option */}
        {chosenResponse && (
          <div className="mt-2 text-xs italic text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-500/30">
            {chosenResponse}
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="sc-button secondary"
            aria-pressed={narrating}
            onClick={toggleNarration}
          >
            {narrating ? "Stop narration" : "Read dialogue aloud"}
          </button>
          {narrationNotice && <small role="status">{narrationNotice}</small>}
        </div>
      </div>

      {/* Cinematic Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 border-t border-slate-800 pt-3">
        {/* Play/Pause & Step Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? "Pause" : "Play Scene"}
          </button>

          <button
            disabled={beatIndex === 0}
            onClick={handlePrevBeat}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            Previous
          </button>

          <span className="font-mono px-2 text-slate-400">
            {beatIndex + 1} / {activeChapter.beats.length}
          </span>

          <button
            disabled={beatIndex >= activeChapter.beats.length - 1}
            onClick={handleNextBeat}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            Next
          </button>
        </div>

        {/* Audio & Preferences Toggles */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.sound_effects}
              onChange={(e) =>
                void update({ sound_effects: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
            />
            <span>SFX</span>
          </label>

          <button
            onClick={() =>
              music.playing ? music.pause() : void music.play()
            }
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {music.playing ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{music.playing ? "Music On" : "Music Off"}</span>
          </button>

          {onNextChapter && chapterIndex < currentSaga.chapters.length - 1 && (
            <button
              disabled={!completed.includes(currentSaga.chapters[chapterIndex + 1].questLevelId)}
              onClick={onNextChapter}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Continue to the next unlocked story chapter"
            >
              Next chapter <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
