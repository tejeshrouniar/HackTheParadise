import { useState } from "react";
import { ArrowRight, BookOpen, Check, Map, Sparkles } from "lucide-react";
import { JOURNEY } from "../../content/journey";
import { STORY_BOOKS, type StoryBook } from "../../content/storyBooks";
import greatHall from "../../assets/storybooks/relics/great-hall.webp";
import dobby from "../../assets/storybooks/relics/dobby-idle.webp";
import lantern from "../../assets/realms/lantern.png";
import { JourneyTrail } from "../adventure/JourneyTrail";
import { useBookProgress } from "../story/useBookProgress";
import { WizardingWalk } from "./WizardingWalk";
import { journeyProgress } from "./journeyProgress";
import { useProgress } from "./ProgressContext";

interface WorldMapProps {
  bookId: string;
  onBookChange: (id: string) => void;
  onQuest: (id: number) => void;
  onOpenBookChapter: (bookId: string, chapterId: string) => void;
}

export function WorldMap({ bookId, onBookChange, onQuest, onOpenBookChapter }: WorldMapProps) {
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
          <span><Map size={14} /> THE WORLDS INSIDE YOUR BOOKS</span>
          <h1>World map</h1>
          <p>Choose a book, then follow its path to the next chapter.</p>
        </div>
        <div className="sc-world-map-heading__progress" aria-live="polite">
          <strong>{selectedBook.kind === "journey" ? cinderProgress.cleared : harryCompleted}</strong>
          <span>/ 12 {selectedBook.kind === "journey" ? "spells" : "chapters"} complete</span>
        </div>
      </header>

      <nav className="sc-map-books" aria-label="Choose a story world">
        {STORY_BOOKS.map((book) => (
          <BookChoice
            key={book.id}
            book={book}
            active={book.id === selectedBook.id}
            progress={book.kind === "journey" ? cinderProgress.cleared : bookProgress.completed.length}
            onSelect={() => onBookChange(book.id)}
          />
        ))}
      </nav>

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

function BookChoice({ book, active, progress, onSelect }: { book: StoryBook; active: boolean; progress: number; onSelect: () => void }) {
  const image = book.id === "harry-potter" ? greatHall : lantern;
  const total = book.kind === "journey" ? 12 : book.chapters.length;
  return (
    <button type="button" className={`sc-map-book ${active ? "is-selected" : ""} sc-map-book--${book.theme}`} aria-pressed={active} onClick={onSelect}>
      <span className="sc-map-book__art"><img src={image} alt="" /></span>
      <span className="sc-map-book__details">
        <small>{book.kind === "journey" ? "BEGINNER TUTORIAL" : "FEATURED STORY"}</small>
        <strong>{book.title}</strong>
        <span>{Math.min(progress, total)} / {total} {book.kind === "journey" ? "spells" : "chapters"}</span>
      </span>
      <span className="sc-map-book__mark" aria-hidden="true">{active ? <Check size={17} /> : <ArrowRight size={17} />}</span>
    </button>
  );
}
