import { useState } from "react";
import { JOURNEY } from "../../content/journey";
import { JourneyTrail } from "../adventure/JourneyTrail";
import { journeyProgress } from "./journeyProgress";
import { ArrowRight, BookOpen, Code2, Shirt } from "lucide-react";
import { WorldMap } from "./WorldMap";
import { useProgress } from "./ProgressContext";
import { CODEDEX_LESSONS } from "../../data/codedexLessons";
import { AvatarGraphic } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { sound } from "../../utils/sound";

export default function Dashboard({
  onQuest,
  onJournal,
  onTerminal,
  onCharacter,
  catalog = false,
}: {
  onQuest: (id: number) => void;
  onJournal: () => void;
  onTerminal: () => void;
  onMap: () => void;
  onCharacter: () => void;
  catalog?: boolean;
}) {
  const { completed, status, retry } = useProgress();
  const { appearance } = useAppearance();
  const progress = journeyProgress(completed);
  const [chapter, setChapter] = useState(progress.chapter);
  const realm = JOURNEY[chapter];
  const chapterDone = progress.cleared >= realm.levels[2];
  const next = CODEDEX_LESSONS.find(lesson => lesson.id === progress.next)!;
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
          <span>CHAPTER {chapter + 1} · YOUR JOURNEY</span>
          <h1>{realm.place}</h1>
        </div>
      </header>
      <p className="sc-home-intro">{progress.finished ? "The road is restored. Revisit any part of your adventure." : chapterDone ? "This place is restored. Your next chapter is waiting." : realm.title + ". Complete each spell to open the road ahead."}</p>
      <div className="sc-trail-layout">
        <JourneyTrail completed={completed} onQuest={onQuest} onLocation={setChapter} />
        <aside className="sc-trail-sidebar">
          <section className="sc-trail-character-card">
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <AvatarGraphic appearance={appearance} x={0} y={0} size={56} />
            </svg>
            <div>
              <strong>Make it yours</strong>
              <button onClick={onCharacter}>
                <Shirt size={14} /> Customize character
              </button>
            </div>
          </section>
          <section className="sc-trail-quest-card">
            <span>
              <BookOpen size={15} /> MAIN STORY ·{" "}
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
              {progress.cleared}{" "}
              <small>/ {CODEDEX_LESSONS.length} quests</small>
            </strong>
            <div aria-hidden="true">
              {CODEDEX_LESSONS.map((lesson) => (
                <i
                  key={lesson.id}
                  className={lesson.id <= progress.cleared ? "done" : ""}
                />
              ))}
            </div>
          </section>
          <div className="sc-trail-shortcuts">
            <button onClick={onJournal}>
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
