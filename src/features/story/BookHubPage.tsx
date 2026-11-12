import { BookVideoLibrary } from "./BookVideoLibrary";
import { Grimoire } from "../library/Grimoire";
import { ArrowLeft, ArrowRight, BookOpen, Check, Film, LockKeyhole, Map } from "lucide-react";
import { STORY_BOOKS } from "../../content/storyBooks";
import { useProgress } from "../learning/ProgressContext";
import { journeyProgress } from "../learning/journeyProgress";
import { useBookProgress } from "./useBookProgress";
import greatHall from "../../assets/storybooks/relics/great-hall.webp";
import lanternwood from "../../assets/realms/lanternwood.png";

interface BookHubPageProps {
  bookId: string;
  onShelf: () => void;
  onPlayLevels: () => void;
  onReadStory: (chapterId?: string) => void;
}

/** A shared landing spread keeps every storybook's entry points in one place. */
export function BookHubPage({ bookId, onShelf, onPlayLevels, onReadStory }: BookHubPageProps) {
  const book = STORY_BOOKS.find((item) => item.id === bookId) ?? STORY_BOOKS[0];
  const { completed: questIds } = useProgress();
  const bookProgress = useBookProgress();
  const tutorialProgress = journeyProgress(questIds);
  const cleared = book.kind === "journey"
    ? tutorialProgress.cleared
    : book.chapters.filter((chapter) => bookProgress.completed.includes(chapter.chapterId)).length;
  const chapterCount = book.kind === "journey" ? Math.floor(cleared / 3) : cleared;
  const image = book.kind === "journey" ? lanternwood : greatHall;
  const chapters = book.kind === "journey"
    ? book.chapters.map((chapter) => ({ id: chapter.title, title: chapter.title, subtitle: chapter.place }))
    : book.chapters.map((chapter) => ({ id: chapter.chapterId, title: chapter.chapterTitle, subtitle: chapter.conceptName }));
  const finishedIds = book.kind === "journey"
    ? book.chapters.filter(c => c.levels.every(id => questIds.includes(id))).map(c => c.title)
    : bookProgress.completed;

  return (
    <div className={`sc-page sc-book-hub sc-book-theme--${book.theme}`} data-book-theme={book.theme}>
      <button className="sc-book-hub__back" type="button" onClick={onShelf}>
        <ArrowLeft size={16} /> Bookshelf
      </button>

      <Grimoire label={`${book.title} book`} coverColor={book.coverColor} pageKey={book.id} left={
        <article className="sc-book-hub__page sc-book-hub__page--intro">
          <div className="sc-volume-page__number">YOUR ADVENTURE <span>·</span> {book.kind === "journey" ? "TUTORIAL" : "MAIN STORY"}</div>
          <h1>{book.title}</h1>
          <p className="sc-book-hub__subtitle">{book.subtitle}</p>
          <div className="sc-book-hub__road" aria-label={`${chapterCount} of ${book.chapters.length} chapters complete`}>
            <div><span>YOUR PROGRESS</span><strong>{chapterCount} / {book.chapters.length} chapters</strong></div>
            <div className="sc-book-hub__progress-bar" aria-hidden="true">
              {chapters.map(chapter => <i key={chapter.id} className={finishedIds.includes(chapter.id) ? "is-complete" : undefined} />)}
            </div>
          </div>

          <div className="sc-book-hub__actions" aria-label="Choose how to explore this book">
            <button className="sc-book-hub__action sc-book-hub__action--primary" type="button" onClick={onPlayLevels}>
              <Map size={19} />
              <span><strong>Play levels</strong><small>Walk the path and write code</small></span>
              <ArrowRight size={17} />
            </button>
            <button className="sc-book-hub__action" type="button" onClick={() => onReadStory()}>
              <Film size={19} />
              <span><strong>Read story</strong><small>Watch the scenes you have unlocked</small></span>
              <ArrowRight size={17} />
            </button>
          </div>
        </article>

        } right={

        <article className="sc-book-hub__page sc-book-hub__page--contents">
          <figure className="sc-book-hub__scene">
            <img src={image} alt="" />
            <figcaption><span>{book.theme === "cinder" ? "LANTERNWOOD" : "HOGWARTS"}</span><strong>{book.title}</strong></figcaption>
          </figure>
          <div className="sc-book-hub__contents-heading">
            <div><span>INSIDE THIS BOOK</span><strong>Chapters</strong></div>
            <small>{chapterCount} of {book.chapters.length} complete</small>
          </div>
          <ol className="sc-book-hub__contents">
            {chapters.map((chapter, index) => {
              const complete = finishedIds.includes(chapter.id);
              const readable = book.kind === "journey"
                ? index <= tutorialProgress.chapter
                : complete;
              const readerId = book.kind === "journey" ? `cinder-${index}` : chapter.id;
              return (
                <li key={chapter.id} data-complete={complete} data-locked={!readable}>
                  <span aria-hidden="true">{complete ? <Check size={13} /> : !readable ? <LockKeyhole size={12} /> : String(index + 1).padStart(2, "0")}</span>
                  {readable ? <button type="button" className="htp-chapter-link" onClick={() => onReadStory(readerId)} aria-label={`Read ${chapter.title}`}>
                    <strong>{chapter.title}</strong><small>{chapter.subtitle}</small>
                  </button> : <div className="htp-chapter-label"><strong>{chapter.title}</strong><small>Locked · {chapter.subtitle}</small></div>}
                </li>
              );
            })}
          </ol>
          <BookVideoLibrary bookId={book.id} chapters={chapters} completed={finishedIds} />
          <p className="sc-book-hub__footnote"><BookOpen size={14} /> Each book keeps its own story and progress.</p>
        </article>
      } />
    </div>
  );
}
