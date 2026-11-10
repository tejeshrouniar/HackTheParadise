import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Map, Sparkles } from "lucide-react";
import { JOURNEY } from "../../content/journey";
import { STORY_BOOKS } from "../../content/storyBooks";
import greatHall from "../../assets/storybooks/relics/great-hall.webp";
import dobby from "../../assets/storybooks/relics/dobby-idle.webp";
import { JourneyTrail } from "../adventure/JourneyTrail";
import { useBookProgress } from "../story/useBookProgress";
import { WizardingWalk } from "./WizardingWalk";
import { journeyProgress } from "./journeyProgress";
import { useProgress } from "./ProgressContext";

interface WorldMapProps {
  bookId: string;
  onQuest: (id: number) => void;
  onOpenBookChapter: (bookId: string, chapterId: string) => void;
  onBack: () => void;
}

export function WorldMap({ bookId, onQuest, onOpenBookChapter, onBack }: WorldMapProps) {
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const [cinderChapter, setCinderChapter] = useState(0);
  const selectedBook = STORY_BOOKS.find((book) => book.id === bookId) ?? STORY_BOOKS[0];
  const cinderProgress = journeyProgress(completed);
  const harryCompleted = selectedBook.kind === "coding"
    ? selectedBook.chapters.filter((chapter) => bookProgress.completed.includes(chapter.chapterId)).length
    : 0;

  return (
    <div className={`sc-world-map sc-world-map--${selectedBook.theme}`} data-book-theme={selectedBook.theme}>
      <header className="sc-world-map-heading">
        <div>
          <span><Map size={14} /> {selectedBook.kind === "journey" ? "THE LAST LIGHT · TUTORIAL" : "THE HORCRUX CODE · MAIN STORY"}</span>
          <h1>Play levels</h1>
          <p>Walk the path, open each chapter, and write the code that moves the story forward.</p>
        </div>
        <div className="sc-world-map-heading__progress" aria-live="polite">
          <button className="sc-button secondary" type="button" onClick={onBack}><ArrowLeft size={15} /> Book details</button>
          <strong>{selectedBook.kind === "journey" ? cinderProgress.cleared : harryCompleted}</strong>
          <span>/ 12 {selectedBook.kind === "journey" ? "spells" : "chapters"} complete</span>
        </div>
      </header>

      {selectedBook.kind === "journey" ? (
        <section className="sc-map-journey" aria-label="The Last Light walking map">
          <div className="sc-map-world-intro">
            <div>
              <span className="sc-map-kicker">STARTER TUTORIAL · 4 CHAPTERS</span>
              <h2>The Last Light</h2>
              <p>Learn the first coding spells as you help Cinder find the road home.</p>
            </div>
            <BookOpen size={24} aria-hidden="true" />
          </div>
          <JourneyTrail completed={completed} onQuest={onQuest} onLocation={setCinderChapter} />
          <div className="sc-map-read-chapter">
            <div><small>THE STORY PAGE</small><strong>{JOURNEY[cinderChapter].place}</strong></div>
            <button type="button" onClick={() => onOpenBookChapter("cinder", `cinder-${cinderChapter}`)}>Read this chapter <ArrowRight size={16} /></button>
          </div>
        </section>
      ) : (
        <section className="sc-hp-map" aria-label="The Horcrux Code level map">
          <div className="sc-hp-map__banner">
            <img className="sc-hp-map__hall" src={greatHall} alt="Pixel art of a candlelit stone hall" />
            <div className="sc-hp-map__copy">
              <span className="sc-map-kicker"><Sparkles size={13} /> FEATURED STORY · 12 CHAPTERS</span>
              <h2>The Horcrux Code</h2>
              <p>Follow Harry’s clues from the diary to the final confrontation. Each solved level opens the next page.</p>
            </div>
            <img className="sc-hp-map__dobby" src={dobby} alt="Dobby, the house-elf companion" />
          </div>
          <WizardingWalk completed={bookProgress.completed} onOpenChapter={(chapterId) => onOpenBookChapter(selectedBook.id, chapterId)} />
        </section>
      )}
    </div>
  );
}
