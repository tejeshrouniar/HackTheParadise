import { Grimoire } from "../library/Grimoire";
import { useMemo } from "react";
import { ArrowLeft, BookOpen, Map } from "lucide-react";
import { STORY_BOOKS } from "../../content/storyBooks";
import { BOOK_WALK_PRESETS } from "./bookWalkPresets";
import { WalkableBookMap } from "./WalkableBookMap";
import type { WalkMapStop } from "./bookWalkPresets";
import { useBookProgress } from "../story/useBookProgress";
import { journeyProgress } from "./journeyProgress";
import { useProgress } from "./ProgressContext";

interface WorldMapProps {
  bookId: string;
  onQuest: (id: number) => void;
  onOpenBookChapter: (bookId: string, chapterId: string) => void;
  onBack: () => void;
}

/** Book-specific progress feeds the shared, preset-driven walking map. */
export function WorldMap({ bookId, onQuest, onOpenBookChapter, onBack }: WorldMapProps) {
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const selectedBook = STORY_BOOKS.find((book) => book.id === bookId) ?? STORY_BOOKS[0];
  const preset = BOOK_WALK_PRESETS[selectedBook.id];
  const isTutorial = selectedBook.kind === "journey";
  const cinderProgress = journeyProgress(completed);
  const completedIds = useMemo(
    () => isTutorial ? completed.map((id) => `quest:${id}`) : bookProgress.completed,
    [isTutorial, completed, bookProgress.completed],
  );
  const completeCount = isTutorial
    ? cinderProgress.cleared
    : bookProgress.completed.filter((id) => selectedBook.chapters.some((chapter) => chapter.chapterId === id)).length;
  const totalLevelCount = preset?.regions.reduce((total, region) => total + region.stops.length, 0) ?? selectedBook.chapters.length;
  const stops = preset?.regions.flatMap(region => region.stops) ?? [];
  const nextStop = stops.find(stop => !completedIds.includes(stop.id));

  function enter(stop: WalkMapStop) {
    if (isTutorial && stop.questId) onQuest(stop.questId);
    else onOpenBookChapter(selectedBook.id, stop.id);
  }

  return (
    <div className={`sc-world-map sc-world-map--${selectedBook.theme}`} data-book-theme={selectedBook.theme}>
      <header className="sc-world-map-heading">
        <div>
          <span><Map size={14} aria-hidden="true" /> {isTutorial ? "THE LAST LIGHT · TUTORIAL" : `${selectedBook.title.toUpperCase()} · MAIN STORY`}</span>
          <h1>Play levels</h1>
          <p>Walk the path, choose a chapter, and write the code that moves the story forward.</p>
        </div>
        <div className="sc-world-map-heading__progress" aria-live="polite">
          <button className="sc-button secondary" type="button" onClick={onBack}><ArrowLeft size={15} /> Book details</button>
          <strong>{completeCount}</strong>
          <span>/ {totalLevelCount} {isTutorial ? "spells" : "chapters"} complete</span>
        </div>
      </header>

      <Grimoire label={`${selectedBook.title} atlas`} className="htp-atlas" coverColor={selectedBook.coverColor} left={<>
      <section className="sc-map-book-context" aria-label={`${selectedBook.title} level route`}>
        <div className="sc-map-book-context__icon" aria-hidden="true"><BookOpen size={24} /></div>
        <div><small>{isTutorial ? "STARTER TUTORIAL" : "FEATURED CODING ADVENTURE"} · {preset?.regions.length ?? 0} AREAS</small><h2>{selectedBook.title}</h2><p>{selectedBook.description}</p></div>
      </section>

      {nextStop && <button className="sc-button htp-atlas-next" onClick={() => enter(nextStop)}>
        <span>Next level</span><strong>{nextStop.title}</strong>
      </button>}
      <details className="htp-atlas-index">
        <summary>Chapter directory</summary>
        <ol className="htp-atlas-directory">{preset?.regions.map(region => <li key={region.id}>
          <h3>{region.title}</h3>
          {region.stops.map(stop => {
            const unlocked = stops.slice(0, stops.indexOf(stop)).every(item => completedIds.includes(item.id));
            return <button key={stop.id} disabled={!unlocked} onClick={() => enter(stop)}>
              {completedIds.includes(stop.id) ? "✓ " : !unlocked ? "Locked · " : ""}{stop.title}
            </button>;
          })}
        </li>)}</ol>
      </details>
      </>} right={preset ? (
        <WalkableBookMap preset={preset} completedIds={completedIds} onEnter={enter} />
      ) : (
        <section className="sc-map-preset-missing" role="status">
          <h2>This book’s level path is being prepared.</h2>
          <p>Its chapter groups, scene art, and level markers need a walk-map preset before the levels can open.</p>
          <button className="sc-button secondary" type="button" onClick={onBack}><ArrowLeft size={15} /> Return to book details</button>
        </section>
      )} />
    </div>
  );
}
