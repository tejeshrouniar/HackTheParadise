import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RotateCcw, SkipForward } from "lucide-react";
import type { BookPuzzle } from "../../content/codeCampaign";
import { usePreferences } from "../settings/PreferencesContext";
import { BOOK_SCENE_ART, BOOK_SCENE_CHARACTERS, getBookStage } from "./bookSceneAssets";

type RevealPhase = "approach" | "action" | "resolve" | "settled";

const revealBeats: Record<string, { action: string; result: string }> = {
  bathroom: { action: "The diary turns open and its backward ink resolves into a clue.", result: "The diary has answered. Its hidden message is ready." },
  "gaunt-shack": { action: "The ring lifts from the broken floorboards as the curse drains away.", result: "The ring is quiet, and the silver path is clear." },
  "seaside-cave": { action: "The locket rises from the basin; ripples uncover the stair below.", result: "The locket is open. A way forward appears beneath the water." },
  "lestrange-vault": { action: "False cups fade from the treasure; the originals ring together.", result: "The true cups reveal the vault’s hidden door." },
  "room-of-requirement": { action: "The diadem’s ward breaks into light and the path ignites.", result: "The diadem is free. Its light points toward the courtyard." },
  courtyard: { action: "A bright serpent trail curls around the statues and stops beside Harry.", result: "Harry has followed Nagini’s trail to its next memory." },
  pensieve: { action: "Silver memories rise from the basin and settle into a clear timeline.", result: "The memories are in order. One leads to an old classroom." },
  "old-classroom": { action: "The turban unwinds in strips, exposing the memory hidden beneath it.", result: "The last layer is gone. The portrait’s secret is visible." },
  "laundry-room": { action: "The missing sock floats from the basket into Dobby’s hands.", result: "The sock is found, and Dobby points toward the pitch." },
  "quidditch-pitch": { action: "The Snitch darts across the pitch, then slows into Harry’s hand.", result: "The Snitch is caught. Its tiny key is yours." },
  "wand-chamber": { action: "Runes ignite one by one as the Elder Wand rises from its seal.", result: "The cipher is clear. The final record can be assembled." },
  "great-hall": { action: "The clues join, the final binding bursts into smoke, and the hall lights up.", result: "The last binding is broken. The Great Hall celebrates." },
};

interface WizardingLevelRevealProps {
  chapter: BookPuzzle;
  sequence: number;
  onStart: () => void;
  onFinish: () => void;
}

/** Gameplay payoff for a solved level. Story films remain in the Storybook reader. */
export function WizardingLevelReveal({ chapter, sequence, onStart, onFinish }: WizardingLevelRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>("approach");
  const [replay, setReplay] = useState(0);
  const finishRef = useRef(onFinish);
  const startRef = useRef(onStart);
  const timers = useRef<number[]>([]);
  const { preferences } = usePreferences();
  const stage = getBookStage(chapter.scene);
  const relic = BOOK_SCENE_ART[chapter.chapterId];
  const guest = BOOK_SCENE_CHARACTERS[chapter.chapterId];
  const beat = revealBeats[chapter.scene] ?? { action: chapter.outcome, result: chapter.outcome };
  const sceneStyle = stage ? {
    "--reveal-floor": `${stage.floorY / 144 * 100}%`,
    "--reveal-focus-x": `${stage.focus[0] / 256 * 100}%`,
    "--reveal-focus-y": `${stage.focus[1] / 144 * 100}%`,
  } as CSSProperties : undefined;

  finishRef.current = onFinish;
  startRef.current = onStart;

  useEffect(() => {
    const quiet = preferences.reduced_motion || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    if (quiet) {
      setPhase("settled");
      finishRef.current();
      return;
    }

    startRef.current();
    setPhase("approach");
    timers.current = [
      window.setTimeout(() => setPhase("action"), 1_700),
      window.setTimeout(() => setPhase("resolve"), 4_900),
      window.setTimeout(() => {
        setPhase("settled");
        finishRef.current();
      }, 7_800),
    ];
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, [chapter.chapterId, preferences.reduced_motion, replay, sequence]);

  function skip() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setPhase("settled");
    finishRef.current();
  }

  function replayReveal() {
    startRef.current();
    setReplay((value) => value + 1);
  }

  const caption = phase === "approach"
    ? `Harry enters ${chapter.subtitle.split(" · ")[0]}. The spell begins to change the scene.`
    : phase === "action"
      ? beat.action
      : beat.result;

  return (
    <figure className="htp-level-reveal" aria-label={`${chapter.chapterTitle} level completion`}>
      <div
        key={`${chapter.chapterId}-${sequence}-${replay}`}
        className="htp-level-reveal__stage"
        data-scene={chapter.scene}
        data-phase={phase}
        style={sceneStyle}
        role="img"
        aria-label={`${chapter.subtitle.split(" · ")[0]} pixel-art level result`}
        aria-live="off"
      >
        {stage && <img className="htp-level-reveal__backdrop" src={stage.backdrop} alt="" width="256" height="144" />}
        <span className="htp-level-reveal__ground" aria-hidden="true" />
        <span className="htp-level-reveal__harry" aria-hidden="true" />
        {guest && <img className={`htp-level-reveal__guest htp-level-reveal__guest--${chapter.scene}`} src={guest} alt="" />}
        {relic && <span className="htp-level-reveal__artifact" aria-hidden="true"><img src={relic} alt="" /></span>}
        <span className="htp-level-reveal__effect" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </span>
        <span className="htp-level-reveal__success" aria-hidden="true">✦</span>
      </div>
      <figcaption className="htp-level-reveal__caption">
        <div>
          <span className="sc-volume-kicker">LEVEL RESULT · {chapter.title}</span>
          <p aria-live="polite" aria-atomic="true">{caption}</p>
        </div>
        <div className="htp-level-reveal__controls">
          <button type="button" onClick={replayReveal} aria-label="Replay level completion animation"><RotateCcw size={14} /> Replay</button>
          {phase !== "settled" && <button type="button" onClick={skip}><SkipForward size={14} /> Skip</button>}
        </div>
      </figcaption>
    </figure>
  );
}
