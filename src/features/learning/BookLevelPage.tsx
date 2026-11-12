import { ArrowLeft, BookOpen } from "lucide-react";
import { STORY_BOOKS } from "../../content/storyBooks";
import { StorybookVolume } from "../story/StorybookVolume";
import { useBookProgress } from "../story/useBookProgress";
import { BookNotice } from "../../components/ui/Status";

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
    return <BookNotice title="Book unavailable"><button className="sc-button" onClick={onLevels}>Return to levels</button></BookNotice>;
  }

  const chapterIndex = book.chapters.findIndex(chapter => chapter.chapterId === chapterId);
  if (chapterIndex < 0) {
    return <BookNotice title="Chapter unavailable"><button className="sc-button" onClick={onLevels}>Return to levels</button></BookNotice>;
  }
  const finished = new Set(progress.completed);
  const nextChapter = book.chapters.find(chapter => !finished.has(chapter.chapterId));
  if (!finished.has(chapterId) && book.chapters.slice(0, chapterIndex).some(chapter => !finished.has(chapter.chapterId))) {
    return <BookNotice title="This chapter is still locked">
      <p>{book.chapters[chapterIndex].chapterTitle}</p>
      <p>{progress.status.startsWith("Syncing") ? progress.status : "Complete the earlier chapters to unlock this page."}</p>
      {nextChapter && <button className="sc-button" onClick={() => onChapterChange(nextChapter.chapterId)}>Play {nextChapter.chapterTitle}</button>}
      <button className="sc-button secondary" onClick={onLevels}>Return to levels</button>
    </BookNotice>;
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
