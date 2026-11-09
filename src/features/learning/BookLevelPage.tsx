import { ArrowLeft, BookOpen } from "lucide-react";
import { STORY_BOOKS } from "../../content/storyBooks";
import { StorybookVolume } from "../story/StorybookVolume";
import { useBookProgress } from "../story/useBookProgress";

interface BookLevelPageProps {
  chapterId: string;
  onWorldMap: () => void;
  onStoryFilm: (chapterId: string) => void;
  onChapterChange: (chapterId: string) => void;
}

/** Keeps Harry's playable coding pages on the level route, separate from Story films. */
export function BookLevelPage({ chapterId, onWorldMap, onStoryFilm, onChapterChange }: BookLevelPageProps) {
  const book = STORY_BOOKS.find((item) => item.kind === "coding");
  const progress = useBookProgress();

  if (!book || book.kind !== "coding") {
    return <section className="sc-page sc-locked-scene"><h1>Book unavailable</h1><button className="sc-button" onClick={onWorldMap}>Return to the World Map</button></section>;
  }

  return (
    <div className={`sc-page sc-coding-book-page sc-book-theme--${book.theme}`}>
      <nav className="sc-coding-book-page__nav" aria-label="Coding level navigation">
        <button type="button" onClick={onWorldMap}><ArrowLeft size={16} /> World Map</button>
        <span><BookOpen size={15} /> {book.title}</span>
        <small>{progress.completed.length} / {book.chapters.length} chapters solved</small>
      </nav>
      <StorybookVolume
        key={book.id}
        book={book}
        completed={progress.completed}
        progressStatus={progress.status}
        onComplete={progress.complete}
        initialChapterId={chapterId}
        onChapterChange={onChapterChange}
        onWatchMovie={onStoryFilm}
      />
    </div>
  );
}
