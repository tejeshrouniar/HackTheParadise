import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useProgress } from "../learning/ProgressContext";
import { useBookProgress } from "../story/useBookProgress";
import { STORY_BOOKS } from "../../content/storyBooks";
import { readLocal, writeLocal } from "../../lib/validation";
import { BOOKSHELVES, getBookshelf, LIBRARY, type BookshelfId, type LibraryBook } from "../../content/library";
import { usePreferences } from "../settings/PreferencesContext";
import adventureShelfArt from "../../assets/library/bookshelf-adventures.png";
import tutorialShelfArt from "../../assets/library/bookshelf-tutorial.png";
import personalShelfArt from "../../assets/library/bookshelf-personal.png";
import guildShelfArt from "../../assets/library/bookshelf-guild.png";

const bookshelfArt: Record<BookshelfId, string> = {
  adventures: adventureShelfArt,
  tutorial: tutorialShelfArt,
  personal: personalShelfArt,
  guild: guildShelfArt,
};

interface MagicalBookshelfProps {
  bookshelfId?: BookshelfId;
  onOpen: (book: LibraryBook) => void;
  onTools?: () => void;
  onSignIn?: () => void;
  onLibrary?: () => void;
  onChooseBookshelf?: (id: BookshelfId) => void;
}

export function MagicalBookshelf({ bookshelfId = "adventures", onOpen, onTools, onSignIn, onLibrary, onChooseBookshelf }: MagicalBookshelfProps) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const { preferences } = usePreferences();
  const [opening, setOpening] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const collection = getBookshelf(bookshelfId);
  const collectionBooks = LIBRARY.filter((book) => book.shelf === collection.id);
  const recent = readLocal<string>("htp-recent-book", "");
  const recentBook = collectionBooks.find((book) => book.storyId && book.id === recent);
  const visible = collectionBooks.filter((book) => `${book.title} ${book.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  function progress(book: LibraryBook) {
    const story = STORY_BOOKS.find((item) => item.id === book.id);
    if (!story) return book.subtitle;
    const count = story.kind === "journey"
      ? story.chapters.filter((chapter) => chapter.levels.every((id) => completed.includes(id))).length
      : story.chapters.filter((chapter) => bookProgress.completed.includes(chapter.chapterId)).length;
    return `${count} / ${story.chapters.length} chapters${count === story.chapters.length ? " · Complete" : ""}`;
  }

  function open(book: LibraryBook) {
    if (opening) return;
    setOpening(book.id);
    if (book.storyId) writeLocal("htp-recent-book", book.id);
    const quiet = preferences.reduced_motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => onOpen(book), quiet ? 0 : 360);
  }

  function backToLibrary() {
    if (onLibrary) onLibrary();
    else location.hash = "/entrance";
  }

  const spine = (book: LibraryBook, index: number) => {
    const story = STORY_BOOKS.find((item) => item.id === book.id);
    return (
      <button
        key={book.id}
        type="button"
        className={`sc-shelf-spine sc-shelf-spine--${book.id} ${opening === book.id ? "is-opening" : ""}`}
        style={{ "--spine-color": book.coverColor, "--spine-height": `${index % 3 === 1 ? 288 : index % 3 === 2 ? 264 : 276}px`, "--book-number": `"${String(index + 1).padStart(2, "0")}"` } as CSSProperties}
        onClick={() => open(book)}
        disabled={opening !== null}
        aria-label={`Open ${book.title}${book.id === "cinder" ? ", beginner tutorial" : ""}. ${progress(book)}`}
      >
        <span className="sc-shelf-spine__cap" aria-hidden="true">{book.mark}</span>
        <span className="sc-shelf-spine__title">{book.title}</span>
        <span className="sc-shelf-spine__subtitle">{book.id === "cinder" ? "TUTORIAL" : story ? "STORY" : book.subtitle}</span>
        <span className="sc-shelf-spine__foot" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <span className="sc-shelf-spine__tooltip">{book.title} · {progress(book)}</span>
        {book.id === "cinder" && <span className="sc-shelf-spine__ribbon">TUTORIAL</span>}
      </button>
    );
  };

  return (
    <div
      className={`sc-magical-library htp-sketch-library htp-bookshelf-page htp-bookshelf-page--${collection.id}`}
      style={{ "--aisle-accent": collection.accent, "--aisle-wall": collection.wall } as CSSProperties}
      data-bookshelf={collection.id}
    >
      <header className="htp-library-heading">
        <button className="htp-library-back" type="button" onClick={backToLibrary}><span aria-hidden="true">←</span> Library foyer</button>
        <div className="htp-library-heading__copy">
          <p className="htp-pixel-kicker">COLLECTION · {collection.subtitle.toUpperCase()}</p>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
        </div>
        <div className="htp-library-heading__actions">
          {recentBook && <button className="htp-library-resume" type="button" onClick={() => open(recentBook)}>Continue {recentBook.title} <span aria-hidden="true">→</span></button>}
          <button ref={searchToggle} type="button" aria-expanded={searchOpen} aria-controls="bookshelf-search" onClick={() => setSearchOpen((value) => !value)}>{searchOpen ? "Close search" : "Find a title"}</button>
          {onTools && <button type="button" onClick={onTools}>Sound & tools</button>}
          <button type="button" onClick={() => !user && onSignIn ? onSignIn() : open(LIBRARY.find((book) => book.id === "account")!)}>{user ? "Account" : "Sign in"}</button>
        </div>
      </header>

      <div id="bookshelf-search" className="htp-library-catalog" hidden={!searchOpen} onKeyDown={(event) => {
        if (event.key === "Escape") { setQuery(""); setSearchOpen(false); searchToggle.current?.focus(); }
      }}>
        <label>Find a title<input ref={searchInput} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title or subject" /></label>
        <span role="status">{visible.length} {visible.length === 1 ? "title" : "titles"} in this collection</span>
        {query && <button type="button" onClick={() => setQuery("")}>Clear search</button>}
      </div>

      <nav className="htp-aisle-tabs" aria-label="Choose a bookshelf">
        {BOOKSHELVES.map((wing) => (
          <button key={wing.id} type="button" aria-current={wing.id === collection.id ? "page" : undefined} onClick={() => onChooseBookshelf ? onChooseBookshelf(wing.id) : location.hash = `/bookshelf/${wing.id}`} disabled={opening !== null}>
            <span aria-hidden="true">{wing.mark}</span>{wing.title}
          </button>
        ))}
      </nav>

      <section className="sc-library-cabinet htp-active-cabinet" aria-label={`${collection.title} bookshelf`}>
        <div className="sc-cabinet-crown" aria-hidden="true"><span>✦</span><strong>{collection.title.toUpperCase()}</strong><span>✦</span></div>
        <div className={`sc-cabinet-row sc-cabinet-row--${collection.id}`}>
          <div className="sc-cabinet-row__books">
            <img className="htp-collection-shelf-art" src={bookshelfArt[collection.id]} alt="" aria-hidden="true" draggable={false} />
            <div className="htp-shelf-volume-row" role="group" aria-label={`${visible.length} books in ${collection.title}`}>
              {visible.map(spine)}
              {!visible.length && <p className="htp-bookshelf-empty" role="status">No titles match that search.</p>}
              <div className="htp-shelf-stilllife" aria-hidden="true"><i /><i /><i /><span>✦</span></div>
            </div>
          </div>
          <div className="sc-cabinet-ledge"><span>{collection.title.toUpperCase()}</span></div>
        </div>
        <div className="sc-cabinet-base" aria-hidden="true" />
      </section>

      <p className="htp-bookshelf-caption"><span aria-hidden="true">◆</span> Select a spine to open its pages. Progress is saved with its own story.</p>
    </div>
  );
}
