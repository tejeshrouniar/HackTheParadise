import { Check, ArrowRight, Compass } from "lucide-react";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";
import { useProgress } from "./ProgressContext";
import forestWorld from "../../assets/eldoria/forest-world.webp";
import { sound } from "../../utils/sound";

export function WorldMap({ onQuest }: { onQuest: (id: number) => void }) {
  const { completed } = useProgress();
  const next =
    CODEDEX_LESSONS.find((lesson) => !completed.includes(lesson.id)) ??
    CODEDEX_LESSONS[0];
  return (
    <div className="sc-world-map">
      <header className="sc-world-map-heading">
        <div>
          <span>THE FRAGMENTS OF ELDORIA</span>
          <h2>Choose your path</h2>
          <p>Every place holds a spell to discover.</p>
        </div>
        <span className="sc-map-count">
          {completed.length} / {CODEDEX_LESSONS.length} completed
        </span>
      </header>
      <div className="sc-map-scene">
        <img src={forestWorld} alt="" className="sc-map-art" />
        <div className="sc-map-shade" />
        <svg
          className="sc-map-route"
          viewBox="0 0 1000 360"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M80 284 C160 290 177 188 283 229 S385 340 465 240 S590 92 680 156 S790 290 918 122" />
        </svg>
        <ol className="sc-map-nodes">
          {CODEDEX_LESSONS.slice(0, 8).map((lesson, index) => (
            <li
              key={lesson.id}
              className={`sc-map-node sc-map-node-${index + 1}`}
            >
              <button
                onClick={() => {
                  sound.playClick();
                  onQuest(lesson.id);
                }}
                aria-label={`${lesson.chapter}: ${lesson.title}${completed.includes(lesson.id) ? ", complete" : lesson.id === next.id ? ", up next" : ""}`}
              >
                <span>
                  {completed.includes(lesson.id) ? (
                    <Check size={16} />
                  ) : (
                    String(lesson.id).padStart(2, "0")
                  )}
                </span>
                <strong>{lesson.chapter}</strong>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="sc-map-next">
        <div>
          <Compass size={20} />
          <span>
            <small>YOUR NEXT QUEST</small>
            <strong>{next.title}</strong>
            <em>{next.conceptName}</em>
          </span>
        </div>
        <button
          className="sc-button mint"
          onClick={() => {
            sound.playClick();
            onQuest(next.id);
          }}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
      <section className="sc-forest-campaign">
        <div>
          <small>A NEW STORY</small>
          <h3>Beyond the academy</h3>
          <p>Four discoveries await in the Ancient Forest.</p>
        </div>
        <div className="sc-forest-chapters">
          {CODEDEX_LESSONS.slice(8).map((lesson) => (
            <button key={lesson.id} onClick={() => onQuest(lesson.id)}>
              <span>
                {completed.includes(lesson.id) ? (
                  <Check size={15} />
                ) : (
                  lesson.id
                )}
              </span>
              <strong>{lesson.title}</strong>
              <small>{lesson.conceptName}</small>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>
      <details className="sc-map-list">
        <summary>All quests</summary>
        <ol>
          {CODEDEX_LESSONS.map((lesson) => (
            <li key={lesson.id}>
              <button onClick={() => onQuest(lesson.id)}>
                <span>{String(lesson.id).padStart(2, "0")}</span>
                <strong>{lesson.title}</strong>
                <small>
                  {completed.includes(lesson.id)
                    ? "Complete"
                    : lesson.conceptName}
                </small>
                <ArrowRight size={16} />
              </button>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
