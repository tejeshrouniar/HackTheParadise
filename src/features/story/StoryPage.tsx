import { useState } from "react";
import { ArrowRight, BookOpen, Check, Headphones, LockKeyhole, Pause, Play } from "lucide-react";
import { STORY_BOOKS, type JourneyStoryBook, type StoryBook } from "../../content/storyBooks";
import { soundscapes } from "../../services/music";
import { useMusic } from "../tools/MusicContext";
import { useProgress } from "../learning/ProgressContext";
import { canEnterLevel, journeyProgress } from "../learning/journeyProgress";
import { StoryCinema } from "./JourneyCinema";
import { StorybookVolume } from "./StorybookVolume";
import { useBookProgress } from "./useBookProgress";
import "../../styles/storybooks.css";

function bookProgressLabel(book: StoryBook, codingProgress: string[], cinderCleared: number) {
  if (book.kind === "journey") {
    const chaptersCleared = Math.min(book.chapters.length, Math.floor(cinderCleared / 3) + Number(cinderCleared === 12));
    return `${chaptersCleared}/${book.chapters.length} chapters · ${cinderCleared}/12 spells`;
  }
  const count = book.chapters.filter((chapter) => codingProgress.includes(chapter.chapterId)).length;
  return `${count}/${book.chapters.length} chapters`;
}

function CinderBook({
  book,
  chapter,
  setChapter,
  cleared,
  completed,
  onQuest,
}: {
  book: JourneyStoryBook;
  chapter: number;
  setChapter: (chapter: number) => void;
  cleared: number;
  completed: number[];
  onQuest: (id: number) => void;
}) {
  const realm = book.chapters[chapter];
  const music = useMusic();
  const soundtrack = soundscapes.find((track) => track.id === book.musicTrackId);
  const playingScore = !!soundtrack && music.playing && music.track.id === soundtrack.id;

  return (
    <section className="sc-cinder-book sc-story-volume sc-volume--cinder" aria-labelledby="sc-cinder-title">
      <header className="sc-book-heading">
        <div>
          <span className="sc-volume-kicker">THE CINDER BOOK <span aria-hidden="true">·</span> {chapter + 1} OF {book.chapters.length}</span>
          <h2 id="sc-cinder-title">{realm.place}</h2>
          <p>{realm.title}</p>
        </div>
        <div className="sc-volume-progress" aria-label={`${cleared} of 12 spells complete`}>
          <strong>{cleared}<span> / 12</span></strong>
          <small>spells restored</small>
        </div>
      </header>

      <nav className="sc-book-chapter-index" aria-label="The Last Light chapters">
        {book.chapters.map((item, index) => {
          const unlocked = index <= Math.floor(cleared / 3);
          const isComplete = cleared >= (index + 1) * 3;
          return (
            <button
              key={item.title}
              type="button"
              disabled={!unlocked}
              aria-current={chapter === index ? "page" : undefined}
              onClick={() => setChapter(index)}
            >
              <span className="sc-book-chapter-index__number">{isComplete ? <Check size={15} /> : !unlocked ? <LockKeyhole size={13} /> : String(index + 1).padStart(2, "0")}</span>
              <span><strong>{item.title}</strong><small>{item.place}</small></span>
            </button>
          );
        })}
      </nav>

      <div className="sc-volume-open sc-cinder-spread" key={chapter}>
        <article className="sc-volume-page sc-volume-page--story sc-cinder-page">
          <div className="sc-volume-page__number">CHAPTER {String(chapter + 1).padStart(2, "0")} <span>·</span> THE LAST LIGHT</div>
          <h3>{realm.title}</h3>
          <p className="sc-volume-page__subtitle">{realm.place}</p>
          <p className="sc-volume-story">{realm.summary}</p>
          <div className="sc-cinder-progress-note">
            <span>THE ROAD SO FAR</span>
            <div className="sc-cinder-progress-note__bar" aria-label={`${cleared} of 12 spells complete`}>
              {Array.from({ length: 12 }, (_, index) => <i key={index} className={index < cleared ? "is-lit" : undefined} />)}
            </div>
            <small>{cleared === 12 ? "The village is home again." : `${Math.max(0, 12 - cleared)} spells remain before the road is whole.`}</small>
          </div>
          <button
            className="sc-volume-read"
            type="button"
            disabled={!soundtrack}
            onClick={() => soundtrack && (playingScore ? music.pause() : void music.play(soundtrack, [soundtrack]))}
          >
            {playingScore ? <Pause size={16} /> : <Headphones size={16} />}
            {playingScore ? "Pause Cinder’s score" : "Listen to Cinder’s score"}
          </button>
        </article>
        <div className="sc-volume-spine" aria-hidden="true" />
        <article className="sc-volume-page sc-volume-page--play sc-cinder-scene-page" aria-label={`${realm.place} story scene`}>
          <StoryCinema key={`cinder-scene-${chapter}`} chapter={chapter} musicTrackId={book.musicTrackId} />
        </article>
      </div>

      <section className="sc-book-levels" aria-label={`${realm.place} coding levels`}>
        <div className="sc-book-levels__heading">
          <div><span className="sc-volume-kicker">PLAY THE CHAPTER</span><h3>Three spells move the story forward</h3></div>
          <span>{realm.levels.filter((id) => completed.includes(id)).length}/3 restored</span>
        </div>
        <div className="sc-book-levels__grid">
          {realm.levels.map((id, index) => {
            const canEnter = canEnterLevel(id, completed);
            const isComplete = completed.includes(id);
            return (
              <button className="sc-book-level" type="button" disabled={!canEnter} key={id} onClick={() => onQuest(id)}>
                <span className="sc-book-level__number">{isComplete ? <Check size={15} /> : !canEnter ? <LockKeyhole size={13} /> : String(index + 1).padStart(2, "0")}</span>
                <span><small>{isComplete ? "RESTORED" : `SPELL ${String(index + 1).padStart(2, "0")}`}</small><strong>{realm.stops[index]}</strong></span>
                {canEnter && <ArrowRight size={17} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export default function StoryPage({ onQuest }: { onQuest: (id: number) => void }) {
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const [selectedBookId, setSelectedBookId] = useState("cinder");
  const [chapter, setChapter] = useState(0);
  const progress = journeyProgress(completed);
  const selectedBook = STORY_BOOKS.find((book) => book.id === selectedBookId) ?? STORY_BOOKS[0];

  return (
    <div className={`sc-page sc-story-library sc-book-theme--${selectedBook.theme}`}>
      <header className="sc-library-heading">
        <div className="sc-library-heading__mark" aria-hidden="true"><BookOpen size={23} /></div>
        <div>
          <span className="sc-volume-kicker">THE STORY LIBRARY</span>
          <h1>Choose a story</h1>
          <p>Every adventure has its own pages, progress, and soundtrack.</p>
        </div>
      </header>

      <nav className="sc-story-shelf" aria-label="Storybooks">
        {STORY_BOOKS.map((book) => {
          const active = selectedBook.id === book.id;
          return (
            <button
              key={book.id}
              className={`sc-story-shelf__book sc-story-shelf__book--${book.theme}`}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setSelectedBookId(book.id);
                if (book.kind === "journey") setChapter(progress.chapter);
              }}
            >
              <span className={`sc-story-shelf__cover sc-story-shelf__cover--${book.theme}`} aria-hidden="true">
                <small>STORICODE</small><strong>{book.coverMark}</strong><i />
              </span>
              <span className="sc-story-shelf__details">
                <span className="sc-story-shelf__kind">{book.kind === "journey" ? "COMPANION STORY" : "CODING ADVENTURE"}</span>
                <strong>{book.title}</strong>
                <small>{bookProgressLabel(book, bookProgress.completed, progress.cleared)}</small>
                <span className="sc-story-shelf__open">{active ? "OPEN ON THE DESK" : "OPEN BOOK"} <ArrowRight size={14} /></span>
              </span>
            </button>
          );
        })}
      </nav>

      {selectedBook.kind === "journey" ? (
        <CinderBook
          book={selectedBook}
          chapter={Math.min(chapter, selectedBook.chapters.length - 1)}
          setChapter={setChapter}
          cleared={progress.cleared}
          completed={completed}
          onQuest={onQuest}
        />
      ) : (
        <StorybookVolume
          key={selectedBook.id}
          book={selectedBook}
          completed={bookProgress.completed}
          progressStatus={bookProgress.status}
          onComplete={bookProgress.complete}
        />
      )}
    </div>
  );
}
