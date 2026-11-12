import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useProgress } from "../learning/ProgressContext";
import { useBookProgress } from "../story/useBookProgress";
import { STORY_BOOKS } from "../../content/storyBooks";
import { readLocal, writeLocal } from "../../lib/validation";
import { LIBRARY, type LibraryBook } from "../../content/library";
import { usePreferences } from "../settings/PreferencesContext";

export function MagicalBookshelf({ onOpen, onTools, onSignIn }: { onOpen: (book: LibraryBook) => void; onTools?: () => void; onSignIn?: () => void }) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const recent = readLocal<string>("htp-recent-book", "");
  const recentBook = LIBRARY.find(book => book.storyId && book.id === recent);
  const visible = LIBRARY.filter(book => `${book.title} ${book.subtitle}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "tutorial" ? book.id === "cinder" : filter === "fantasy" ? !!book.storyId && book.id !== "cinder" : !book.storyId)));
  function progress(book: LibraryBook) {
    const story = STORY_BOOKS.find(s=>s.id===book.id);
    if (!story) return book.subtitle;
    const count = story.kind === "journey" ? story.chapters.filter(c=>c.levels.every(id=>completed.includes(id))).length : story.chapters.filter(c=>bookProgress.completed.includes(c.chapterId)).length;
    return `${count} / ${story.chapters.length} chapters${count === story.chapters.length ? " · Complete" : ""}`;
  }
  const { preferences } = usePreferences();
  const [opening, setOpening] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);
  function clearSearch() {
    setQuery("");
    setFilter("all");
    setSearchOpen(false);
  }
  function open(book: LibraryBook) {
    if (opening) return;
    setOpening(book.id);
    if(book.storyId) writeLocal("htp-recent-book",book.id);
    const quiet = preferences.reduced_motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => onOpen(book), quiet ? 0 : 390);
  }
  const spine = (book: LibraryBook, index: number) => <button key={book.id} type="button"
    className={`sc-shelf-spine sc-shelf-spine--${book.id} ${opening === book.id ? "is-opening" : ""}`}
    style={{ "--spine-color": book.coverColor, "--spine-height": `${book.shelf === "adventures" ? 252 + (index % 2) * 14 : 178 + (index % 3) * 12}px` } as CSSProperties}
    onClick={() => open(book)} disabled={opening !== null} aria-label={`Open ${book.title}${book.id === "cinder" ? ", beginner tutorial" : ""}`}>
    <span className="sc-shelf-spine__cap" aria-hidden="true">{book.mark}</span>
    <span className="sc-shelf-spine__title">{book.title}</span>
    <span className="sc-shelf-spine__subtitle">{book.id === "cinder" ? "TUTORIAL" : book.storyId ? "STORY" : book.subtitle}</span>
    <span className="sc-shelf-spine__foot" aria-hidden="true">{book.id === "cinder" ? "01" : book.storyId ? "✦" : "✧"}</span>
    <span className="sc-shelf-spine__tooltip">{book.title} · {progress(book)}</span>
    {book.id === "cinder" && <span className="sc-shelf-spine__ribbon">TUTORIAL</span>}
  </button>;
  return <div className="sc-magical-library htp-sketch-library">
    <header className="htp-library-heading">
      <div><p className="htp-eyebrow">THE ARCHIVE OF POSSIBILITIES</p><h1>Choose a book</h1><p>Every cover opens a different world. Progress stays with that story.</p></div>
      <div className="htp-library-heading__actions">
        {recentBook && <button className="htp-library-resume" onClick={() => open(recentBook)}>Continue {recentBook.title} <span aria-hidden="true">→</span></button>}
        <button ref={searchToggle} aria-expanded={searchOpen} aria-controls="bookshelf-search" onClick={() => searchOpen ? clearSearch() : setSearchOpen(true)}>Search books</button>
        {onTools && <button onClick={onTools}>Sound & tools</button>}
        <button onClick={() => !user && onSignIn ? onSignIn() : open(LIBRARY.find(b => b.id === "account")!)}>{user ? "Account" : "Sign in"}</button>
      </div>
    </header>
    <div id="bookshelf-search" className="htp-library-catalog" hidden={!searchOpen} onKeyDown={event => {
      if (event.key === "Escape") { clearSearch(); searchToggle.current?.focus(); }
    }}>
      <label>Find a book<input ref={searchInput} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title or subject" /></label>
      <label>Collection<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All shelves</option><option value="tutorial">Tutorial</option><option value="fantasy">Fantasy adventures</option><option value="journals">Library journals</option></select></label>
      <span role="status">{visible.length} {visible.length === 1 ? "book" : "books"} found</span>
      {recentBook && <button onClick={() => open(recentBook)}>Resume {recentBook.title} →</button>}
    </div>
    {!visible.length && <p role="status">No books match. Try another title or collection.</p>}
    <div className="sc-library-cabinet">
      <div className="sc-cabinet-crown" aria-hidden="true"><span>✦</span><strong>THE ARCHIVE OF POSSIBILITIES</strong><span>✦</span></div>
      <nav aria-label="Library books">
        {(["personal", "adventures", "guild"] as const).filter(shelf=>visible.some(b=>b.shelf===shelf)).map((shelf) => <section className={`sc-cabinet-row sc-cabinet-row--${shelf}`} key={shelf} aria-label={shelf === "personal" ? "Your library" : shelf === "adventures" ? "Coding adventures" : "The guild"}>
          <div className="sc-cabinet-row__books">{visible.filter((book) => book.shelf === shelf).map(spine)}
            {shelf === "personal" && <div className="htp-shelf-stilllife" aria-hidden="true"><i/><i/><i/><span>✦</span></div>}
            {shelf === "adventures" && <div className="htp-shelf-stilllife" aria-hidden="true"><i/><i/><i/><span>✦</span></div>}
            {shelf === "guild" && <div className="htp-library-globe" aria-hidden="true">✧</div>}
          </div>
          <div className="sc-cabinet-ledge"><span>{shelf === "personal" ? "LIBRARY" : shelf === "adventures" ? "ADVENTURE" : "GUILD"}</span></div>
        </section>)}
      </nav>
      <div className="sc-cabinet-base" aria-hidden="true" />
    </div>
  </div>;
}
