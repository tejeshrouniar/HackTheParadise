import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, BookOpen, Code2, Sparkles } from "lucide-react";
import { STORY_BOOKS } from "../../content/storyBooks";
import bathroom from "../../assets/storybooks/stages/bathroom.webp";
import lanternwood from "../../assets/realms/lanternwood.png";
import harry from "../../assets/storybooks/characters/harry-walk.svg";
import { usePreferences } from "../settings/PreferencesContext";

interface LibraryEntranceProps {
  onEnter: () => void;
  onOpenBook: (bookId: string) => void;
}

/** The public-facing cover of the library; gameplay and book progress remain in their own routes. */
export function LibraryEntrance({ onEnter, onOpenBook }: LibraryEntranceProps) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const { preferences } = usePreferences();
  const mainBook = STORY_BOOKS.find((book) => book.id === "harry-potter")!;
  const tutorialBook = STORY_BOOKS.find((book) => book.id === "cinder")!;

  useEffect(() => () => clearTimeout(timer.current), []);

  function openBook(action: () => void) {
    if (opening) return;
    setOpening(true);
    const reduceMotion = preferences.reduced_motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(action, reduceMotion ? 0 : 760);
  }

  return (
    <section className={`htp-landing ${opening ? "is-opening" : ""}`} aria-label="Hack The Paradise introduction">
      <div className="htp-landing__grain" aria-hidden="true" />
      <section className="htp-landing__hero">
        <div className="htp-landing__copy">
          <p className="htp-eyebrow"><Sparkles size={14} aria-hidden="true" /> A coding adventure library</p>
          <h1>Stories you can <em>step inside.</em></h1>
          <p className="htp-landing__lede">Choose a book, write the spell that moves its world, and watch each solved level become part of the story.</p>
          <div className="htp-landing__actions">
            <button className="htp-landing__primary" onClick={() => openBook(onEnter)} disabled={opening}>
              <BookOpen size={18} aria-hidden="true" /> Browse the bookshelf <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button className="htp-landing__text-action" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: preferences.reduced_motion ? "instant" : "smooth" })}>
              How it works <ArrowDown size={15} aria-hidden="true" />
            </button>
          </div>
          <p className="htp-landing__note">No setup needed to explore. Your stories stay separate, and you can learn at your own pace.</p>
        </div>

        <div className="htp-landing__stage" aria-label="An open storybook showing a coding adventure">
          <div className="htp-landing__shelf htp-landing__shelf--back" aria-hidden="true"><i /><i /><i /><i /><b /></div>
          <div className="htp-landing__open-book" aria-hidden="true">
            <div className="htp-landing__page htp-landing__page--left">
              <span className="htp-landing__folio">FIELD NOTES · 01</span>
              <div className="htp-landing__rune-lines"><i /><i /><i /><i /><i /></div>
              <div className="htp-landing__code-seal"><Code2 size={18} /><span>write a spell</span></div>
              <small>Every line changes the world.</small>
            </div>
            <div className="htp-landing__binding" />
            <div className="htp-landing__page htp-landing__page--right">
              <img className="htp-landing__scene" src={bathroom} alt="" />
              <span className="htp-landing__scene-label">MOANING MYRTLE’S BATHROOM</span>
              <img className="htp-landing__hero-sprite" src={harry} alt="" />
              <span className="htp-landing__relic">✦</span>
            </div>
            <i className="htp-landing__turning-leaf" />
          </div>
          <div className="htp-landing__shelf htp-landing__shelf--front" aria-hidden="true">
            <span>THE LIBRARY OF LIVING STORIES</span>
            <b>✦</b>
          </div>
          <span className="htp-landing__floating-mark htp-landing__floating-mark--one" aria-hidden="true">✧</span>
          <span className="htp-landing__floating-mark htp-landing__floating-mark--two" aria-hidden="true">✦</span>
        </div>
      </section>

      <section className="htp-landing__books" aria-labelledby="htp-landing-books-title">
        <div className="htp-landing__section-heading">
          <div><p className="htp-eyebrow">Two worlds to begin</p><h2 id="htp-landing-books-title">Pick up a story</h2></div>
          <button className="htp-landing__text-action" onClick={() => openBook(onEnter)}>See the full bookshelf <ArrowRight size={15} aria-hidden="true" /></button>
        </div>
        <div className="htp-landing__book-list">
          <article className="htp-landing-card htp-landing-card--featured" style={{ "--landing-cover": mainBook.coverColor, "--landing-scene": `url(${bathroom})` } as CSSProperties}>
            <div className="htp-landing-card__art" aria-hidden="true"><span>MAIN STORY</span><b>HP</b><i>✦</i></div>
            <div className="htp-landing-card__copy"><p className="htp-eyebrow">12 coding chapters</p><h3>{mainBook.title}</h3><p>{mainBook.description}</p><button onClick={() => openBook(() => onOpenBook(mainBook.id))} disabled={opening}>Open this book <ArrowRight size={15} aria-hidden="true" /></button></div>
          </article>
          <article className="htp-landing-card htp-landing-card--tutorial" style={{ "--landing-cover": tutorialBook.coverColor, "--landing-scene": `url(${lanternwood})` } as CSSProperties}>
            <div className="htp-landing-card__art" aria-hidden="true"><span>BEGINNER TUTORIAL</span><b>C</b><i>✧</i></div>
            <div className="htp-landing-card__copy"><p className="htp-eyebrow">4 gentle chapters</p><h3>{tutorialBook.title}</h3><p>{tutorialBook.description}</p><button onClick={() => openBook(() => onOpenBook(tutorialBook.id))} disabled={opening}>Start with this book <ArrowRight size={15} aria-hidden="true" /></button></div>
          </article>
        </div>
      </section>

      <section className="htp-landing__how" id="how-it-works" aria-labelledby="htp-landing-how-title">
        <div><p className="htp-eyebrow">A small loop with a big payoff</p><h2 id="htp-landing-how-title">Read a page. Cast a spell. See what changes.</h2></div>
        <ol>
          <li><span>01</span><div><strong>Choose a book</strong><p>Each adventure has its own world, chapters, music, and saved progress.</p></div></li>
          <li><span>02</span><div><strong>Write the code</strong><p>Use the chapter’s idea to guide your character through a playable level.</p></div></li>
          <li><span>03</span><div><strong>Watch the page change</strong><p>Solving a level reveals its result and opens the next part of the adventure.</p></div></li>
        </ol>
      </section>
      <div className="htp-landing__exit" aria-hidden="true"><div /></div>
    </section>
  );
}
