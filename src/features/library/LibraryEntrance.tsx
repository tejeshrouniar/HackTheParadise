import { useEffect, useRef, useState } from "react";
import { BOOKSHELVES, LIBRARY, type BookshelfId } from "../../content/library";
import { usePreferences } from "../settings/PreferencesContext";

interface LibraryEntranceProps {
  onOpenBookshelf: (bookshelfId: BookshelfId) => void;
}

/** The library foyer routes into collections; physical book art lives on shelf pages only. */
export function LibraryEntrance({ onOpenBookshelf }: LibraryEntranceProps) {
  const [opening, setOpening] = useState<BookshelfId | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const { preferences } = usePreferences();

  useEffect(() => () => clearTimeout(timer.current), []);

  function enter(bookshelfId: BookshelfId) {
    if (opening) return;
    setOpening(bookshelfId);
    const reduceMotion = preferences.reduced_motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => onOpenBookshelf(bookshelfId), reduceMotion ? 0 : 320);
  }

  return (
    <section className={`htp-library-foyer ${opening ? "is-entering" : ""}`} aria-labelledby="htp-library-title">
      <header className="htp-foyer-heading">
        <p className="htp-pixel-kicker"><span aria-hidden="true">✦</span> HACK THE PARADISE · GRAND LIBRARY</p>
        <h1 id="htp-library-title">Choose a wing</h1>
        <p>Step through an archway to browse a collection. Every story keeps its own world and progress.</p>
      </header>

      <div className="htp-foyer-hall" aria-label="Four doorways lead to library collections">
        <div className="htp-hall-window htp-hall-window--left" aria-hidden="true"><i /><i /><i /><b /></div>
        <div className="htp-hall-window htp-hall-window--right" aria-hidden="true"><i /><i /><i /><b /></div>
        <div className="htp-hall-lamp htp-hall-lamp--left" aria-hidden="true"><i /></div>
        <div className="htp-hall-lamp htp-hall-lamp--right" aria-hidden="true"><i /></div>

        <nav className="htp-library-wings" aria-label="Library collections">
          {BOOKSHELVES.map((wing, index) => {
            const count = LIBRARY.filter((book) => book.shelf === wing.id).length;
            return (
              <button
                className={`htp-wing htp-wing--${wing.id} ${opening === wing.id ? "is-opening" : ""}`}
                key={wing.id}
                type="button"
                style={{ "--wing-accent": wing.accent, "--wing-wall": wing.wall, "--wing-delay": `${index * 65}ms` } as React.CSSProperties}
                onClick={() => enter(wing.id)}
                disabled={opening !== null}
                aria-label={`Enter ${wing.title}, ${count} ${count === 1 ? "item" : "items"}`}
              >
                <span className="htp-wing__arch" aria-hidden="true">
                  <span className="htp-wing__arch-inner">
                    <span className="htp-wing__crest">{wing.mark}</span>
                    <span className="htp-wing__door"><i /><i /></span>
                    <span className="htp-wing__threshold" />
                  </span>
                </span>
                <span className="htp-wing__copy">
                  <span className="htp-wing__label">{wing.subtitle}</span>
                  <strong>{wing.title}</strong>
                  <span className="htp-wing__description">{wing.description}</span>
                  <span className="htp-wing__enter">ENTER WING <span aria-hidden="true">→</span></span>
                </span>
                <span className="htp-wing__count" aria-hidden="true">{String(count).padStart(2, "0")}</span>
              </button>
            );
          })}
        </nav>
        <div className="htp-hall-floor" aria-hidden="true"><span /></div>
      </div>

      <p className="htp-foyer-note"><span aria-hidden="true">◆</span> Each doorway opens a bookshelf. Your stories stay separate.</p>
      <div className="htp-foyer-exit" aria-hidden="true" />
    </section>
  );
}
