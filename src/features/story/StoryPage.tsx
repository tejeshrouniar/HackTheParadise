import { useState } from "react";
import { JOURNEY } from "../../content/journey";
import { useProgress } from "../learning/ProgressContext";
import { canEnterLevel, journeyProgress } from "../learning/journeyProgress";
import { StoryCinema } from "./JourneyCinema";

export default function StoryPage({ onQuest }: { onQuest: (id: number) => void }) {
  const { completed } = useProgress();
  const [chapter, setChapter] = useState(0);
  const realm = JOURNEY[chapter];
  const progress = journeyProgress(completed);

  return (
    <>
      <div className="sc-page sc-journey-reader">
        <header className="sc-page-heading">
          <div>
            <span className="sc-eyebrow">YOUR STORY</span>
            <h1>The road you restore</h1>
            <p>Follow Cinder’s trail. Each spell reveals the next scene.</p>
          </div>
        </header>

        <nav className="sc-chapter-tabs" aria-label="Story chapters">
          {JOURNEY.map((item, index) => (
            <button
              key={item.title}
              type="button"
              disabled={index > progress.chapter}
              aria-pressed={chapter === index}
              onClick={() => setChapter(index)}
            >
              {index + 1}. {item.title}
            </button>
          ))}
        </nav>

        <h2>{realm.place}</h2>
        <StoryCinema key={chapter} chapter={chapter} />

        <section className="sc-chapter-missions" aria-label={`${realm.title} levels`}>
          {realm.levels.map((id, index) => (
            <button
              type="button"
              disabled={!canEnterLevel(id, completed)}
              key={id}
              onClick={() => onQuest(id)}
            >
              <small>LEVEL {index + 1}</small>
              <strong>{realm.stops[index]}</strong>
              <span>{completed.includes(id) ? "Replay level →" : "Enter level →"}</span>
            </button>
          ))}
        </section>
      </div>

    </>
  );
}
