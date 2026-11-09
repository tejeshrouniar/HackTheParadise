import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, Compass, Film, Headphones, LockKeyhole, Pause, Play } from "lucide-react";
import { STORY_BOOKS, type CodingStoryBook, type JourneyStoryBook, type StoryBook } from "../../content/storyBooks";
import { JOURNEY } from "../../content/journey";
import { soundscapes } from "../../services/music";
import { useMusic } from "../tools/MusicContext";
import { useProgress } from "../learning/ProgressContext";
import { journeyProgress } from "../learning/journeyProgress";
import { StoryCinema } from "./JourneyCinema";
import { useBookProgress } from "./useBookProgress";
import { BookCutscene } from "./BookCutscene";
import { BOOK_SCENE_ART, BOOK_SCENE_CHARACTERS, DEFAULT_BOOK_SCENE_ART } from "./bookSceneAssets";
import greatHall from "../../assets/storybooks/relics/great-hall.webp";
import lanternwood from "../../assets/realms/lanternwood.png";

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
  onOpenMap,
}: {
  book: JourneyStoryBook;
  chapter: number;
  setChapter: (chapter: number) => void;
  cleared: number;
  onOpenMap: () => void;
}) {
  const realm = book.chapters[chapter];
  const music = useMusic();
  const soundtrack = soundscapes.find((track) => track.id === book.musicTrackId);
  const playingScore = !!soundtrack && music.playing && music.track.id === soundtrack.id;

  return (
    <section className="sc-cinder-book sc-story-volume sc-volume--cinder" aria-labelledby="sc-cinder-title">
      <header className="sc-book-heading">
        <div>
          <span className="sc-volume-kicker">BEGINNER TUTORIAL <span aria-hidden="true">·</span> {chapter + 1} OF {book.chapters.length}</span>
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
          <StoryCinema key={`cinder-scene-${chapter}`} chapter={chapter} musicTrackId={book.musicTrackId} onOpenMap={onOpenMap} />
        </article>
      </div>

    </section>
  );
}

function HarryStoryFilms({
  book,
  completed,
  status,
  chapterId,
  onChapterChange,
  onWorldMap,
  onCodeLevel,
}: {
  book: CodingStoryBook;
  completed: string[];
  status: string;
  chapterId: string | null;
  onChapterChange: (id: string) => void;
  onWorldMap: () => void;
  onCodeLevel: (id: string) => void;
}) {
  const music = useMusic();
  const soundtrack = soundscapes.find((track) => track.id === book.musicTrackId);
  const playingScore = !!soundtrack && music.playing && music.track.id === soundtrack.id;
  const unlocked = book.chapters.filter((chapter) => completed.includes(chapter.chapterId));
  const latest = unlocked.at(-1);
  const chapter = unlocked.find((item) => item.chapterId === chapterId) ?? latest;
  const [speaking, setSpeaking] = useState(false);
  const [playSequence, setPlaySequence] = useState(0);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (chapter) setPlaySequence((sequence) => sequence + 1);
    setSpeaking(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [chapter?.chapterId]);

  function narrate() {
    if (!chapter || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const narration = new SpeechSynthesisUtterance(`${chapter.chapterTitle}. ${chapter.story} ${chapter.outcome}`);
    narration.lang = "en-US";
    narration.rate = 0.92;
    narration.onend = () => setSpeaking(false);
    narration.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(narration);
  }

  return (
    <section className="sc-harry-movie" aria-labelledby="sc-harry-movie-title">
      <header className="sc-harry-movie__heading">
        <div>
          <span className="sc-volume-kicker"><Film size={13} /> STORY FILMS · {unlocked.length} UNLOCKED</span>
          <h2 id="sc-harry-movie-title">{chapter?.chapterTitle ?? "The Horcrux Code"}</h2>
          <p>Completed coding levels become scenes in the story reel.</p>
        </div>
        <button className="sc-button secondary" type="button" onClick={onWorldMap}><Compass size={15} /> World Map</button>
      </header>

      <nav className="sc-harry-movie__reel" aria-label="Completed chapter films">
        {book.chapters.map((item, index) => {
          const isUnlocked = completed.includes(item.chapterId);
          return (
            <button
              key={item.chapterId}
              type="button"
              disabled={!isUnlocked}
              aria-current={chapter?.chapterId === item.chapterId ? "page" : undefined}
              onClick={() => onChapterChange(item.chapterId)}
            >
              <span>{isUnlocked ? <Play size={12} /> : <LockKeyhole size={12} />}</span>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <small>{item.chapterTitle}</small>
            </button>
          );
        })}
      </nav>

      {chapter ? (
        <>
          <div className="sc-harry-movie__screen">
            <BookCutscene
              chapter={chapter}
              relicImage={BOOK_SCENE_ART[chapter.chapterId] ?? DEFAULT_BOOK_SCENE_ART}
              characterImage={BOOK_SCENE_CHARACTERS[chapter.chapterId]}
              completed
              sequence={playSequence}
              onNarrate={narrate}
              narrating={speaking}
            />
          </div>
          <div className="sc-harry-movie__details">
            <article>
              <span>THE CHAPTER</span>
              <h3>{chapter.chapterTitle}</h3>
              <p>{chapter.story}</p>
              <p className="sc-harry-movie__outcome">{chapter.outcome}</p>
            </article>
            <aside>
              <span>CODE LESSON</span>
              <strong>{chapter.conceptName}</strong>
              <p>{chapter.lesson}</p>
              <button type="button" onClick={() => onCodeLevel(chapter.chapterId)}>Revisit this level <ArrowRight size={14} /></button>
            </aside>
          </div>
          <div className="sc-harry-movie__score">
            <button type="button" disabled={!soundtrack} onClick={() => soundtrack && (playingScore ? music.pause() : void music.play(soundtrack, [soundtrack]))}>
              {playingScore ? <Pause size={15} /> : <Headphones size={15} />}
              {playingScore ? "Pause this book’s score" : "Play this book’s score"}
            </button>
            <span>{status}</span>
          </div>
        </>
      ) : (
        <div className="sc-harry-movie__empty">
          <Film size={30} aria-hidden="true" />
          <h3>Your first story film is waiting</h3>
          <p>Complete a code level to unlock its scene here. Story films follow your progress through the book.</p>
          <button className="sc-button" type="button" onClick={onWorldMap}>Choose a code level <ArrowRight size={15} /></button>
        </div>
      )}
    </section>
  );
}

interface StoryPageProps {
  selectedBookId: string;
  chapterId: string | null;
  onBookChange: (id: string) => void;
  onChapterChange: (id: string | null) => void;
  onWorldMap: () => void;
  onCodeLevel: (chapterId: string) => void;
}

export default function StoryPage({ selectedBookId, chapterId, onBookChange, onChapterChange, onWorldMap, onCodeLevel }: StoryPageProps) {
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const progress = journeyProgress(completed);
  const selectedBook = STORY_BOOKS.find((book) => book.id === selectedBookId) ?? STORY_BOOKS[0];
  const requestedCinderChapter = chapterId?.startsWith("cinder-") ? Number(chapterId.slice("cinder-".length)) : progress.chapter;
  const cinderChapter = Number.isInteger(requestedCinderChapter) && requestedCinderChapter >= 0 && requestedCinderChapter < JOURNEY.length
    ? requestedCinderChapter
    : progress.chapter;

  function chooseBook(book: StoryBook) {
    onBookChange(book.id);
    onChapterChange(book.kind === "journey" ? `cinder-${progress.chapter}` : null);
  }

  return (
    <div className={`sc-page sc-story-library sc-book-theme--${selectedBook.theme}`}>
      <header className="sc-library-heading">
        <div className="sc-library-heading__mark" aria-hidden="true"><BookOpen size={23} /></div>
        <div>
          <span className="sc-volume-kicker">THE STORY DESK</span>
          <h1>Open a book</h1>
          <p>Each story keeps its own world, music, and saved progress.</p>
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
              onClick={() => chooseBook(book)}
            >
              <span className={`sc-story-shelf__cover sc-story-shelf__cover--${book.theme}`} aria-hidden="true">
                <img src={book.kind === "journey" ? lanternwood : greatHall} alt="" />
                <small>{book.kind === "journey" ? "TUTORIAL" : "FEATURED STORY"}</small><strong>{book.coverMark}</strong><i />
              </span>
              <span className="sc-story-shelf__details">
                <span className="sc-story-shelf__kind">{book.kind === "journey" ? "BEGINNER TUTORIAL" : "MAIN STORY"}</span>
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
          chapter={Math.min(cinderChapter, selectedBook.chapters.length - 1)}
          setChapter={(index) => onChapterChange(`cinder-${index}`)}
          cleared={progress.cleared}
          onOpenMap={onWorldMap}
        />
      ) : (
        <HarryStoryFilms
          key={selectedBook.id}
          book={selectedBook}
          completed={bookProgress.completed}
          status={bookProgress.status}
          chapterId={chapterId}
          onChapterChange={onChapterChange}
          onWorldMap={onWorldMap}
          onCodeLevel={onCodeLevel}
        />
      )}
    </div>
  );
}
