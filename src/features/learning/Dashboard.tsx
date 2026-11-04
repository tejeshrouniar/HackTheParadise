import { useState } from "react";
import { JOURNEY } from "../../content/journey";
import { ArrowRight, BookOpen, Code2, Map, Shirt } from "lucide-react";
import { WorldMap } from "./WorldMap";
import { useProgress } from "./ProgressContext";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";
import { ForestTrail } from "../adventure/ForestTrail";
import { AvatarGraphic } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { sound } from "../../utils/sound";

export default function Dashboard({
  onQuest,
  onCompanion,
  onTerminal,
  onMap,
  onCharacter,
  catalog = false,
}: {
  onQuest: (id: number) => void;
  onCompanion: () => void;
  onTerminal: () => void;
  onMap: () => void;
  onCharacter: () => void;
  catalog?: boolean;
}) {
  const { completed, status, retry } = useProgress();
  const { appearance } = useAppearance();
  const nextOverall =
    CODEDEX_LESSONS.find((lesson) => !completed.includes(lesson.id)) ??
    CODEDEX_LESSONS[0];
  const [chapter, setChapter] = useState(() => Math.min(3, Math.floor((nextOverall.id - 1) / 3)));
  const nextId = JOURNEY[chapter].levels.find(id => !completed.includes(id)) ?? JOURNEY[chapter].levels[0];
  const next = CODEDEX_LESSONS.find(lesson => lesson.id === nextId)!;
  if (catalog)
    return (
      <div className="sc-page">
        <WorldMap onQuest={onQuest} />
      </div>
    );
  return (
    <div className="sc-page sc-trail-home">
      <header className="sc-trail-home-heading">
        <div>
          <span>YOUR JOURNEY</span>
          <h1>{JOURNEY[chapter].title}</h1>
        </div>
        <button className="sc-button secondary" onClick={onMap}>
          <Map size={18} /> World map
        </button>
      </header>
      <nav className="sc-chapter-tabs" aria-label="Explore a chapter">{JOURNEY.map((realm, i) => <button key={realm.title} aria-pressed={chapter === i} onClick={() => setChapter(i)}>{i + 1}. {realm.place}</button>)}</nav>
      <div className="sc-trail-layout">
        <ForestTrail key={chapter} chapter={chapter} onQuest={onQuest} completed={completed} />
        <aside className="sc-trail-sidebar">
          <section className="sc-trail-character-card">
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <AvatarGraphic appearance={appearance} x={0} y={0} size={56} />
            </svg>
            <div>
              <strong>Your adventurer</strong>
              <button onClick={onCharacter}>
                <Shirt size={14} /> Customize character
              </button>
            </div>
          </section>
          <section className="sc-trail-quest-card">
            <span>
              <BookOpen size={15} /> NEXT QUEST ·{" "}
              {String(next.id).padStart(2, "0")}
            </span>
            <h2>{next.title}</h2>
            <p>{next.conceptName}</p>
            <button
              className="sc-world-primary"
              onClick={() => {
                sound.playClick();
                onQuest(next.id);
              }}
            >
              {completed.length ? "Continue adventure" : "Begin your adventure"}
              <ArrowRight size={18} />
            </button>
          </section>
          <section className="sc-trail-progress">
            <strong>
              {completed.length}{" "}
              <small>/ {CODEDEX_LESSONS.length} quests</small>
            </strong>
            <div aria-hidden="true">
              {CODEDEX_LESSONS.map((lesson) => (
                <i
                  key={lesson.id}
                  className={completed.includes(lesson.id) ? "done" : ""}
                />
              ))}
            </div>
          </section>
          <div className="sc-trail-shortcuts">
            <button onClick={onCompanion}>
              <BookOpen size={16} /> Your journal
            </button>
            <button onClick={onTerminal}>
              <Code2 size={16} /> Spell practice
            </button>
          </div>
        </aside>
      </div>
      {status.startsWith("Saved on this device.") && (
        <p className="sc-sync-notice">
          {status}{" "}
          <button className="sc-link" onClick={retry}>
            Retry cloud sync
          </button>
        </p>
      )}
    </div>
  );
}
