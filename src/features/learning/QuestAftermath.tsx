import { useEffect, useRef, useState } from "react";
import { JourneyScene } from "../story/JourneyCinema";
import { JOURNEY } from "../../content/journey";
import narration from "../../content/quest-narration.json";
import { BookCompletionSpread } from "./BookCompletionSpread";
import { usePreferences } from "../settings/PreferencesContext";

// Completion copy is shared with the offline narration manifest in quest-narration.json.
const { explanations, outcomes } = narration;
const REVEAL_DURATION_MS = 10_000;

export function QuestAftermath({ id, code, logs, onContinue }: { id: number; code: string; logs: string[]; onContinue: () => void }) {
  const [snapshot] = useState(() => ({ code, logs: [...logs] }));
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sequence, setSequence] = useState(0);
  const frame = useRef<number | null>(null);
  const { preferences } = usePreferences();
  const chapter = Math.floor((id - 1) / 3);
  const beat = (id - 1) % 3;

  useEffect(() => {
    const reducedMotion = preferences.reduced_motion || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setProgress(1);
      setReady(true);
      return;
    }

    setProgress(0);
    setReady(false);
    const startedAt = performance.now();
    let lastPaintAt = startedAt - 40;
    const advance = (now: number) => {
      const nextProgress = Math.min(1, (now - startedAt) / REVEAL_DURATION_MS);
      if (now - lastPaintAt >= 40 || nextProgress >= 1) {
        lastPaintAt = now;
        setProgress(nextProgress);
      }
      if (nextProgress >= 1) {
        frame.current = null;
        setReady(true);
        return;
      }
      frame.current = window.requestAnimationFrame(advance);
    };
    frame.current = window.requestAnimationFrame(advance);
    return () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [preferences.reduced_motion, sequence]);

  function finishReveal() {
    if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    frame.current = null;
    setProgress(1);
    setReady(true);
  }

  function replayReveal() {
    setProgress(0);
    setReady(false);
    setSequence((current) => current + 1);
  }

  return (
    <BookCompletionSpread
      theme="cinder"
      bookId="cinder"
      bookTitle="The Last Light"
      chapterLabel={`SPELL COMPLETE · CHAPTER ${chapter + 1}`}
      title={JOURNEY[chapter].stops[beat]}
      outcome={outcomes[id - 1]}
      explanation={explanations[id - 1]}
      code={snapshot.code}
      lessonId={id}
      executionSteps={snapshot.logs.filter((line) => !line.startsWith("$")).map((line) => line.split("aether.").join("player."))}
      scene={<JourneyScene chapter={chapter} beat={beat} progress={progress} playing={!ready} />}
      audioSrc={`${import.meta.env.BASE_URL}narration/quest-${id}.wav`}
      autoPlayNarration
      continueLabel={ready ? (id === 12 ? "Return home" : "Continue the story →") : "Your story is unfolding…"}
      canContinue={ready}
      onSkipAnimation={finishReveal}
      onReplayAnimation={replayReveal}
      onContinue={onContinue}
    />
  );
}
