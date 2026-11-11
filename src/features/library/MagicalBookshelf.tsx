import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LIBRARY, type LibraryBook } from "../../content/library";
import { usePreferences } from "../settings/PreferencesContext";

export function MagicalBookshelf({ onOpen }: { onOpen: (book: LibraryBook) => void }) {
  const { preferences } = usePreferences();
  const [opening, setOpening] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  function open(book: LibraryBook) {
    if (opening) return;
    setOpening(book.id);
    const quiet = preferences.reduced_motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => onOpen(book), quiet ? 0 : 390);
  }
  const spine = (book: LibraryBook, index: number) => <button key={book.id} type="button"
    className={`sc-shelf-spine ${opening === book.id ? "is-opening" : ""}`}
    style={{ "--spine-color": book.coverColor, "--spine-height": `${book.shelf === "adventures" ? 275 : 192 + (index % 3) * 18}px` } as CSSProperties}
    onClick={() => open(book)} disabled={opening !== null} aria-label={`Open ${book.title}${book.id === "cinder" ? ", beginner tutorial" : ""}`}>
    <span className="sc-shelf-spine__cap" aria-hidden="true">{book.mark}</span>
    <span className="sc-shelf-spine__title">{book.title}</span>
    <span className="sc-shelf-spine__foot" aria-hidden="true">{book.id === "cinder" ? "I" : book.storyId ? "II" : "✦"}</span>
    <span className="sc-shelf-spine__tooltip">{book.subtitle}</span>
    {book.id === "cinder" && <span className="sc-shelf-spine__ribbon">TUTORIAL</span>}
  </button>;
  return <div className="sc-magical-library">
    <h1 className="sr-only">Storicode magical library</h1>
    <div className="sc-library-cabinet">
      <div className="sc-cabinet-crown"><span>EST. 2026</span><strong>STORICODE</strong><span>THE MAGICAL LIBRARY</span></div>
      <nav aria-label="Library books">
        {(["personal", "adventures", "guild"] as const).map((shelf) => <section className={`sc-cabinet-row sc-cabinet-row--${shelf}`} key={shelf} aria-label={shelf === "personal" ? "Your library" : shelf === "adventures" ? "Coding adventures" : "The guild"}>
          <div className="sc-cabinet-row__books">{LIBRARY.filter((book) => book.shelf === shelf).map(spine)}
            {shelf === "adventures" && <div className="sc-shelf-bookend" aria-hidden="true"><span>✧</span><small>One page.<br />A new possibility.</small></div>}
          </div>
          <div className="sc-cabinet-ledge"><span>{shelf === "personal" ? "YOUR LIBRARY" : shelf === "adventures" ? "CHOOSE YOUR ADVENTURE" : "THE GUILD"}</span></div>
        </section>)}
      </nav>
      <div className="sc-cabinet-base" aria-hidden="true" />
    </div>
  </div>;
}
