import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { BookOpen, ChevronLeft } from "lucide-react";
import { LIBRARY, PROJECT_REPOSITORY, type LibraryBook } from "../../content/library";
import { STORY_BOOKS } from "../../content/storyBooks";
import libraryRoom from "../../assets/library/library-room.webp";
import largeLibraryRoom from "../../assets/library/library-room-large.webp";
import adventureShelf from "../../assets/library/bookshelf-detailed.webp";
import rightIvy from "../../assets/library/room-ivy.webp";
import leftIvy from "../../assets/library/room-ivy-left.webp";
import openBook from "../../assets/library/room-open-book.webp";
import bookStack from "../../assets/library/room-book-stack.webp";
import { useProgress } from "../learning/ProgressContext";
import { journeyProgress } from "../learning/journeyProgress";
import { useBookProgress } from "../story/useBookProgress";
import { usePreferences } from "../settings/PreferencesContext";

interface LibraryEntranceProps {
  inside: boolean;
  focusRoom: boolean;
  onEnter: () => void;
  onExit: () => void;
  onOpenBook: (book: LibraryBook) => void;
  bookmark: ReactNode;
}

const covers = import.meta.glob<string>("../../assets/library/cover-*.webp", { eager: true, import: "default" });
const shelves = [
  { id: "personal", title: "Your shelf", books: LIBRARY.filter((book) => book.shelf === "personal") },
  { id: "stories", title: "Storybooks", books: LIBRARY.filter((book) => book.storyId) },
  { id: "guild", title: "Community", books: LIBRARY.filter((book) => book.shelf === "guild") },
];
const shelfCovers = LIBRARY.map(({ id }) => covers[`../../assets/library/cover-${id}.webp`]).filter(Boolean);
const loreBook = LIBRARY.find(({ id }) => id === "lore");

/** The library starts as one illustrated bookcase; opening it reveals its shelves. */
export function LibraryEntrance({ inside, focusRoom, onEnter, onExit, onOpenBook, bookmark }: LibraryEntranceProps) {
  const roomButton = useRef<HTMLButtonElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const selectionTimer = useRef<number | null>(null);
  const [selectingShelf, setSelectingShelf] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const { gentleBookMotion } = usePreferences();
  const { completed: questProgress } = useProgress();
  const bookProgress = useBookProgress();

  useEffect(() => {
    if (inside) return;
    // Let the room image load first while the browser fetches covers at low priority.
    for (const src of shelfCovers) {
      const cover = new Image();
      cover.fetchPriority = "low";
      cover.src = src;
    }
  }, [inside]);
  useLayoutEffect(() => {
    if (inside) heading.current?.focus({ preventScroll: true });
    else {
      if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current);
      selectionTimer.current = null;
      setSelectingShelf(false);
      setSelectedBook(null);
      if (focusRoom) roomButton.current?.focus({ preventScroll: true });
    }
  }, [inside, focusRoom]);

  useEffect(() => () => {
    if (selectionTimer.current !== null) window.clearTimeout(selectionTimer.current);
  }, []);

  function enterShelf() {
    if (selectionTimer.current !== null) return;
    resetParallax();
    setSelectingShelf(true);
    // Let the selection highlight register before revealing the open shelf.
    selectionTimer.current = window.setTimeout(() => {
      selectionTimer.current = null;
      onEnter();
    }, 125);
  }

  function openShelfBook(book: LibraryBook) {
    if (selectionTimer.current !== null) return;
    if (gentleBookMotion) {
      onOpenBook(book);
      return;
    }
    setSelectedBook(book.id);
    selectionTimer.current = window.setTimeout(() => {
      selectionTimer.current = null;
      onOpenBook(book);
    }, 140);
  }

  function setParallax(event: PointerEvent<HTMLElement>) {
    if (inside || selectingShelf || event.pointerType !== "mouse" || gentleBookMotion || !room.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    room.current.style.setProperty("--room-x", `${x * 26}px`);
    room.current.style.setProperty("--room-y", `${y * 16}px`);
  }

  function resetParallax() {
    room.current?.style.removeProperty("--room-x");
    room.current?.style.removeProperty("--room-y");
  }

  function completion(book: LibraryBook) {
    const story = STORY_BOOKS.find((item) => item.id === book.id);
    if (!story) return book.subtitle;
    const count = story.kind === "journey"
      ? Math.min(story.chapters.length, Math.floor(journeyProgress(questProgress).cleared / 3))
      : story.chapters.filter((chapter) => bookProgress.completed.includes(chapter.chapterId)).length;
    return `${count} / ${story.chapters.length} chapters`;
  }

  return (
    <section
      className={`htp-library-foyer ${inside ? "is-inside" : ""}`}
      aria-labelledby="htp-library-title"
      onPointerMove={setParallax}
      onPointerLeave={resetParallax}
    >
      <div className="htp-foyer-room" ref={room}>
        <div className="htp-room-scene">
          <div className="htp-room-backdrop" aria-hidden="true">
            <img className="htp-library-room-art" src={libraryRoom}
              srcSet={`${libraryRoom} 2752w, ${largeLibraryRoom} 5504w`}
              sizes="(min-aspect-ratio: 43/24) 100vw, 179.167vh"
              alt="" fetchPriority="high" draggable={false} />
            <span className="htp-room-candle htp-room-candle--left" />
          </div>
          {!inside && (
            <button className="htp-foyer-bookcase" type="button" ref={roomButton}
              data-selected={selectingShelf || undefined} data-returning={focusRoom || undefined} data-book-transition="" onClick={enterShelf}>
              <img src={adventureShelf} alt="" draggable={false} />
              <span className="htp-foyer-bookcase__plaque"><BookOpen size={17} aria-hidden="true" /> Browse the bookshelf <span aria-hidden="true">→</span></span>
            </button>
          )}
        </div>
        {!inside && <div className="htp-room-foreground">
          <img className="htp-room-ivy htp-room-ivy--left" src={leftIvy} alt="" draggable={false} />
          <img className="htp-room-ivy htp-room-ivy--right" src={rightIvy} alt="" draggable={false} />
          {loreBook && (
            <button className="htp-room-floor-prop htp-room-floor-prop--book" type="button"
              aria-label="Open Story Lore" onClick={() => onOpenBook(loreBook)}>
              <img src={openBook} alt="" draggable={false} />
            </button>
          )}
          <div className="htp-room-floor-prop htp-room-floor-prop--stack" aria-hidden="true"><img src={bookStack} alt="" draggable={false} /></div>
        </div>}
      </div>
      {!inside ? (
        <h1 className="htp-foyer-heading" id="htp-library-title">The ITM Magic Library</h1>
      ) : (
        <div className="htp-library-interior" aria-label="Books on the grand bookshelf" data-book-transition="">
          <header className="htp-interior-heading">
            <button type="button" className="htp-interior-back" onClick={onExit}><ChevronLeft size={16} aria-hidden="true" /> Library room</button>
            <h1 id="htp-library-title" tabIndex={-1} ref={heading}>The Bookshelf</h1>
          </header>

          <div className="htp-open-bookcase" data-from-room={selectingShelf || undefined} data-book-transition="">
            {shelves.map((shelf) => (
              <section className={`htp-book-row htp-book-row--${shelf.id}`} key={shelf.id} aria-labelledby={`htp-row-${shelf.id}`}>
                <div className="htp-book-row__heading">
                  <h2 id={`htp-row-${shelf.id}`}>{shelf.title}</h2>
                </div>
                <div className="htp-book-row__books" role="group" aria-label={`${shelf.title} books`}>
                  {shelf.books.map((book) => {
                    const cover = covers[`../../assets/library/cover-${book.id}.webp`];
                    const progress = book.storyId ? completion(book) : undefined;
                    return (
                      <button
                        className={`htp-library-book ${cover ? "has-art" : ""}`}
                        key={book.id}
                        type="button"
                        style={{ "--book-cover": book.coverColor } as CSSProperties}
                        data-selected={selectedBook === book.id || undefined}
                        data-book-transition=""
                        onClick={() => openShelfBook(book)}
                        aria-label={`Open ${book.title}${progress ? `. ${progress}` : ""}`}
                      >
                        {cover && <img src={cover} alt="" draggable={false} />}
                        <strong aria-hidden="true">{book.title}</strong>
                        {book.id === "credits" && <span className="htp-library-book__credit-caption" aria-hidden="true">Project links</span>}
                        {progress && <span className="htp-library-book__progress" aria-hidden="true">{progress}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="htp-book-row__ledge" aria-hidden="true" />
              </section>
            ))}
            <div className="htp-open-bookcase__base" aria-hidden="true" />
          </div>
        </div>
      )}
      {bookmark}
      <footer className="htp-library-colophon">
        <small>© 2026 Hack The Paradise</small>
        <a href={PROJECT_REPOSITORY} target="_blank" rel="noreferrer">Repository</a>
        <a href="#/library/contact">Contact / feedback</a>
      </footer>
    </section>
  );
}
