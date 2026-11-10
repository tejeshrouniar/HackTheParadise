import { ArrowLeft, BookOpen } from "lucide-react";
import { STORY_BOOKS } from "../../content/storyBooks";
import { StorybookVolume } from "../story/StorybookVolume";
import { useBookProgress } from "../story/useBookProgress";

interface BookLevelPageProps {
  bookId: string;
  chapterId: string;
  onLevels: () => void;
  onStoryFilm: (bookId: string, chapterId: string) => void;
  onChapterChange: (chapterId: string) => void;
}

/** Keeps each coding book's playable pages separate from its story films. */
export function BookLevelPage({ bookId, chapterId, onLevels, onStoryFilm, onChapterChange }: BookLevelPageProps) {
  const book = STORY_BOOKS.find((item) => item.id === bookId && item.kind === "coding");
  const progress = useBookProgress();

  if (!book || book.kind !== "coding") {
    return <section className="sc-page sc-locked-scene"><h1>Book unavailable</h1><button className="sc-button" onClick={onLevels}>Return to levels</button></section>;
  }

  return (
    <div className={`sc-page sc-coding-book-page sc-book-theme--${book.theme}`}>
      <nav className="sc-coding-book-page__nav" aria-label="Coding level navigation">
        <button type="button" onClick={onLevels}><ArrowLeft size={16} /> Play levels</button>
        <span><BookOpen size={15} /> {book.title}</span>
        <small>{progress.completed.length} / {book.chapters.length} chapters solved</small>
      </nav>
      <StorybookVolume
        key={book.id}
        book={book}
        completed={progress.completed}
        progressStatus={progress.status}
        onLevels={onLevels}
        onComplete={progress.complete}
        initialChapterId={chapterId}
        onChapterChange={onChapterChange}
        onWatchMovie={(id) => onStoryFilm(book.id, id)}
      />
    </div>
  );
}
