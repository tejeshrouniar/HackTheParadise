import { useEffect, useState } from "react";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { BookPuzzle } from "../../content/codeCampaign";
import { AvatarGraphic, type SpriteAction } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { usePreferences } from "../settings/PreferencesContext";
import { BOOK_STAGE_BACKDROPS } from "./bookSceneAssets";

type ScenePhase = "still" | "approach" | "inspect" | "reveal" | "settle";

interface BookCutsceneProps {
  chapter: BookPuzzle;
  relicImage: string;
  characterImage?: string;
  completed: boolean;
  sequence: number;
  mode?: "level" | "film";
  onNarrate?: () => void;
  narrating?: boolean;
  embedded?: boolean;
  playing?: boolean;
}

const phaseAction: Record<ScenePhase, SpriteAction> = {
  still: "idle",
  approach: "walk",
  inspect: "interact",
  reveal: "interact",
  settle: "idle",
};

/** Reusable story beat for coding chapters; book-specific cast stays separate from the map avatar. */
export function BookCutscene({
  chapter,
  relicImage,
  characterImage,
  completed,
  sequence,
  mode = "film",
  onNarrate,
  narrating = false,
  embedded = false,
  playing = true,
}: BookCutsceneProps) {
  const { appearance } = useAppearance();
  const { preferences } = usePreferences();
  const [phase, setPhase] = useState<ScenePhase>("still");
  const [replay, setReplay] = useState(0);
  const sceneLead = chapter.bookId === "harry-potter" ? "Harry" : "Your avatar";
  const backdrop = embedded ? BOOK_STAGE_BACKDROPS[chapter.scene] : undefined;

  useEffect(() => {
    if (!playing) {
      setPhase("still");
      return;
    }
    if (preferences.reduced_motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("settle");
      return;
    }

    setPhase("approach");
    const inspect = window.setTimeout(() => setPhase("inspect"), 900);
    const reveal = window.setTimeout(() => setPhase("reveal"), 1_620);
    const settle = window.setTimeout(() => setPhase("settle"), 2_650);
    return () => {
      window.clearTimeout(inspect);
      window.clearTimeout(reveal);
      window.clearTimeout(settle);
    };
  }, [chapter.chapterId, completed, sequence, replay, preferences.reduced_motion, playing]);

  const caption = mode === "level"
    ? completed
      ? chapter.outcome
      : phase === "approach"
        ? `You reach ${chapter.subtitle.split(" · ")[0]}. Write the spell to reveal the clue.`
        : phase === "inspect" || phase === "reveal"
          ? `The clue answers the technique: ${chapter.conceptName}.`
          : "The scene changes when your code passes every check."
    : phase === "approach"
      ? `You arrive at ${chapter.subtitle.split(" · ")[0]}. The clue leads toward the relic.`
      : phase === "inspect"
        ? `${sceneLead} tests the seal. ${chapter.lesson}`
        : completed
          ? chapter.outcome
          : chapter.story;

  return (
    <figure className="sc-book-cutscene" aria-label={`${chapter.chapterTitle} story scene`}>
      <div
        className="sc-volume-scene"
        data-background="wizarding-library"
        data-scene={chapter.scene}
        data-phase={phase}
        data-playing={playing}
        data-stage-art={!!backdrop}
      >
        {backdrop ? <img className="htp-stage-backdrop" src={backdrop} alt="" /> : <><div className="sc-volume-scene__stars" aria-hidden="true" />
        <div className="sc-volume-scene__moon" aria-hidden="true" />
        <div className="sc-volume-scene__tower sc-volume-scene__tower--left" aria-hidden="true" />
        <div className="sc-volume-scene__tower sc-volume-scene__tower--right" aria-hidden="true" />
        <div className="sc-volume-scene__ridge" aria-hidden="true" /></>}
        <img className="sc-volume-scene__relic-art" src={relicImage} alt="" aria-hidden="true" />
        {characterImage && <img
          className="sc-volume-scene__character"
          src={characterImage}
          alt={chapter.chapterId === "relics-book-two-03" ? "Dobby" : "Lord Voldemort"}
        />}
        <span className="sc-book-cutscene__magic" aria-hidden="true" />
        {chapter.bookId === "harry-potter" ? (
          <span
            className="sc-volume-scene__harry"
            data-phase={phase}
            role="img"
            aria-label="Harry Potter"
          />
        ) : (
          <div className="sc-volume-scene__player" aria-hidden="true">
            <AvatarGraphic
              appearance={appearance}
              action={phaseAction[phase]}
              direction="right"
              size={80}
              playId={sequence + replay}
              directControl={phaseAction[phase] !== "idle"}
            />
          </div>
        )}
        <div className="sc-volume-scene__caption" aria-hidden="true">
          <span>{chapter.subtitle.split(" · ")[0]}</span>
          <strong>{chapter.chapterTitle}</strong>
        </div>
      </div>
      {!embedded && <><figcaption className="sc-book-cutscene__caption" aria-live="polite" aria-atomic="true">
        <span>{phase === "approach" ? "THE CLUE" : phase === "inspect" ? "YOUR SPELL" : completed ? "STORY UNFOLDS" : "THE STORY"}</span>
        <p>{caption}</p>
      </figcaption>
      <div className="sc-book-cutscene__controls">
        <button type="button" onClick={() => setReplay((value) => value + 1)}>
          <RotateCcw size={14} /> Replay scene
        </button>
        {onNarrate && <button type="button" onClick={onNarrate}>{narrating ? <VolumeX size={14} /> : <Volume2 size={14} />}{narrating ? "Stop narration" : "Read scene"}</button>}
      </div></>}
    </figure>
  );
}
