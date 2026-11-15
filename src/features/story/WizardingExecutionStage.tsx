import type { BookPuzzle } from "../../content/codeCampaign";
import { formatPuzzleValue, type PuzzleValue } from "../learning/puzzleRunner";
import { getBookStage, BOOK_SCENE_ART, BOOK_SCENE_CHARACTERS } from "./bookSceneAssets";
import type { CSSProperties } from "react";

import type { SpellPlayback } from "./spellPlayback";
import harrySprite from "../../assets/storybooks/stages/harry-32.webp";

// Labels describe the operation, never claim success before the interpreter checks it.
const operations: Record<string, [string, string, string]> = {
  bathroom: ["Backward ink", "Read the letters from the end", "The diary answers"],
  "gaunt-shack": ["Cursed readings", "Keep the harmless energy", "The ring grows quiet"],
  "seaside-cave": ["The sealed phrase", "Reshape the vowels into a hiss", "The locket hears your words"],
  "lestrange-vault": ["The vault inventory", "Count the matching treasures", "The true count lights the cup"],
  "room-of-requirement": ["The ward's conditions", "Compare the clues", "The diadem judges the answer"],
  courtyard: ["Footprints in the courtyard", "Inspect each trail coordinate", "The serpent's route appears"],
  pensieve: ["Scattered memories", "Put the memories in order", "The timeline settles"],
  "old-classroom": ["Layers of the disguise", "Look inside each collection", "The hidden layer is revealed"],
  "laundry-room": ["The laundry basket", "Subtract the basket total from the full set", "Dobby checks the basket"],
  "quidditch-pitch": ["The flight measurements", "Calculate a safe flight", "The Snitch receives your answer"],
  "wand-chamber": ["Letters of the cipher", "Decode each rune", "The wand reads the message"],
  "great-hall": ["The scattered records", "Bring the records together", "The final spell takes shape"],
};

// One visual signature per location, applied only after every check passes.
const reactions: Record<string, [string, string, string]> = {
  bathroom: ["#8cdaf6", "▤", "unfold"],
  "gaunt-shack": ["#bdabf9", "◈", "clear"],
  "seaside-cave": ["#74e6a6", "≈", "ripple"],
  "lestrange-vault": ["#ffce70", "✦", "rise"],
  "room-of-requirement": ["#bcdaff", "◇", "clear"],
  courtyard: ["#a9e87e", "›", "trail"],
  pensieve: ["#bbd8f8", "◦", "ripple"],
  "old-classroom": ["#e1a4ff", "▰", "unfold"],
  "laundry-room": ["#ffba9a", "✦", "rise"],
  "quidditch-pitch": ["#ffe185", "✧", "trail"],
  "wand-chamber": ["#8aefe6", "ᚱ", "rise"],
  "great-hall": ["#ffcb91", "✷", "clear"],
};

const symbols: Record<string, string> = {
  bathroom: "←", "gaunt-shack": "≥ 0", "seaside-cave": "sss", "lestrange-vault": "×",
  "room-of-requirement": "∧", courtyard: "↗", pensieve: "↑", "old-classroom": "↳",
  "laundry-room": "−", "quidditch-pitch": "÷", "wand-chamber": "−1", "great-hall": "+",
};

function spellTokens(value: PuzzleValue): string[] {
  if (typeof value === "string") return Array.from(value).map(c => c === " " ? "␣" : c);
  if (Array.isArray(value)) return value.map(formatPuzzleValue);
  if (value && typeof value === "object") return Object.entries(value).map(([key, item]) => `${key}: ${formatPuzzleValue(item)}`);
  return [formatPuzzleValue(value)];
}

/** Actual interpreter values drive the scene. Idle/saved progress never starts it. */
export function WizardingExecutionStage({ chapter, playback }: { chapter: BookPuzzle; playback: SpellPlayback | null }) {
  const stage = getBookStage(chapter.scene);
  const labels = operations[chapter.scene] ?? ["Spell input", "Run your instructions", "Goal reached"];
  const [color, glyph, effect] = reactions[chapter.scene] ?? ["#ffce70", "✦", "rise"];
  const guest = BOOK_SCENE_CHARACTERS[chapter.chapterId];
  const output = playback ? spellTokens(playback.result.actual) : [];
  const phase = playback?.phase ?? "idle";
  const input = playback?.result.input ?? [];
  const revealed = phase === "complete" ? output.length : playback?.revealed ?? 0;
  const sources = input.length === 1 ? spellTokens(input[0]) : input.flatMap(spellTokens);
  const showingResult = phase === "output" || phase === "complete";
  const [focusX, focusY] = stage?.focus ?? [128, 85];
  const floor = stage?.floorY ?? 130;
  const actorX = Math.min(focusX - 40, 92);
  const beamX = focusX - actorX - 12;
  const beamY = focusY - floor + 14;
  const sceneStyle = {
    "--spell-floor": `${floor / 144 * 100}%`,
    "--spell-focus-x": `${focusX / 256 * 100}%`,
    "--spell-focus-y": `${focusY / 144 * 100}%`,
    "--spell-actor-x": `${actorX / 256 * 100}%`,
    "--spell-beam-width": `${Math.hypot(beamX, beamY) / 256 * 100}%`,
    "--spell-beam-angle": `${Math.atan2(beamY, beamX)}rad`,
    "--spell-color": color,
    "--harry-sheet": `url(${harrySprite})`,
  } as CSSProperties;

  return <div className="sc-spell-lab" data-scene={chapter.scene} data-phase={phase} data-passed={playback?.result.passed} style={sceneStyle}>
    <div className="sc-spell-lab__viewport">
      <div className="sc-spell-lab__world">
      {stage && <img className="sc-spell-lab__backdrop" src={stage.backdrop} alt={chapter.subtitle.split(" · ")[0]} />}
      <span key={`${chapter.chapterId}-${playback?.test}`} className="sc-spell-lab__actor" aria-hidden="true" />
      <span className="sc-spell-lab__beam" aria-hidden="true" />
      {stage?.showRelic && <img className="sc-spell-lab__relic" src={BOOK_SCENE_ART[chapter.chapterId]} alt="" />}
      {guest && <img className="sc-spell-lab__guest" src={guest} alt="" />}
      <span className="sc-spell-lab__focus" aria-hidden="true" />
      {phase === "payoff" && <div className="sc-spell-lab__reaction" data-effect={effect} aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => <i key={index} style={{ "--spark-index": index } as CSSProperties}>{glyph}</i>)}
      </div>}
      </div>
      {playback && phase !== "payoff" && <div className="sc-spell-lab__workbench" key={`${chapter.chapterId}-${playback.test}`}>
        <small>{phase === "input" ? labels[0] : phase === "complete" && playback.result.passed ? labels[2] : labels[1]}</small>
        <div className="sc-spell-lab__ingredients">
          {sources.slice(0, 24).map((token, i) => <span key={i} data-discarded={showingResult && chapter.scene === "gaunt-shack" && Number(token) < 0}>{token}</span>)}
          {sources.length > 24 && <span>…</span>}
          {!sources.length && <span>Empty input</span>}
        </div>
        <div className="sc-spell-lab__operation" aria-hidden="true">{symbols[chapter.scene]}</div>
        <div className="sc-spell-lab__runes" aria-label="Spell result">
          {output.slice(0, 32).map((token, index) => <span key={index} data-visible={showingResult && index < revealed}>{showingResult && index < revealed ? token : "·"}</span>)}
          {output.length > 32 && <span>…</span>}
          {output.length === 0 && showingResult && <span data-visible="true">Empty result</span>}
        </div>
      </div>}
    </div>
    {phase === "complete" && playback && !playback.result.passed && (
      <p className="sc-spell-lab__expected">Expected <code>{formatPuzzleValue(playback.result.expected)}</code></p>
    )}
  </div>;
}
