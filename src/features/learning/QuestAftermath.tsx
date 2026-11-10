import { useEffect, useState } from "react";
import { JourneyScene } from "../story/JourneyCinema";
import { JOURNEY } from "../../content/journey";
import narration from "../../content/quest-narration.json";
import { BookCompletionSpread } from "./BookCompletionSpread";

// Completion copy is shared with the offline narration manifest in quest-narration.json.
const { explanations, outcomes } = narration;

export function QuestAftermath({ id, code, logs, onContinue }: { id: number; code: string; logs: string[]; onContinue: () => void }) {
  const [snapshot] = useState(() => ({ code, logs: [...logs] }));
  const [ready, setReady] = useState(false);
  const chapter = Math.floor((id - 1) / 3);
  const beat = (id - 1) % 3;

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 6000);
    return () => clearTimeout(timer);
  }, []);

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
      scene={<JourneyScene chapter={chapter} beat={beat} playing={!ready} />}
      audioSrc={`${import.meta.env.BASE_URL}narration/quest-${id}.wav`}
      continueLabel={ready ? (id === 12 ? "Return home" : "Continue the story →") : "Your story is unfolding…"}
      canContinue={ready}
      onSkipAnimation={() => setReady(true)}
      onContinue={onContinue}
    />
  );
}
