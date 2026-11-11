import { Grimoire } from "../library/Grimoire";
import { MagicalBookshelf } from "../library/MagicalBookshelf";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Film, Headphones, LockKeyhole, Pause, Play } from "lucide-react";
import { STORY_BOOKS, type CodingStoryBook, type JourneyStoryBook } from "../../content/storyBooks";
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

function CinderBook({
  book,
  chapter,
  setChapter,
  cleared,
  onPlayLevels,
}: {
  book: JourneyStoryBook;
  chapter: number;
  setChapter: (chapter: number) => void;
  cleared: number;
  onPlayLevels: () => void;
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

      <Grimoire className="sc-grimoire--reader" label="The Last Light storybook" coverColor={book.coverColor} pageKey={chapter} left={
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
        } right={
        <article className="sc-volume-page sc-volume-page--play sc-cinder-scene-page" aria-label={`${realm.place} story scene`}>
          <StoryCinema key={`cinder-scene-${chapter}`} chapter={chapter} musicTrackId={book.musicTrackId} onOpenMap={onPlayLevels} />
        </article>
      } />

    </section>
  );
}

function HarryStoryFilms({
  book,
  completed,
  status,
  chapterId,
  onChapterChange,
  onPlayLevels,
  onCodeLevel,
}: {
  book: CodingStoryBook;
  completed: string[];
  status: string;
  chapterId: string | null;
  onChapterChange: (id: string) => void;
  onPlayLevels: () => void;
  onCodeLevel: (bookId: string, id: string) => void;
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
        <button className="sc-button secondary" type="button" onClick={onPlayLevels}><ArrowLeft size={15} /> Play levels</button>
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
        <Grimoire label={book.title + " story film"} coverColor={book.coverColor} pageKey={chapter.chapterId}
          left={<><span className="sc-volume-kicker">THE CHAPTER</span><h1>{chapter.chapterTitle}</h1><p>{chapter.story}</p><p>{chapter.outcome}</p><hr /><h2>{chapter.conceptName}</h2><p>{chapter.lesson}</p><button className="sc-button" onClick={() => onCodeLevel(book.id, chapter.chapterId)}>Revisit this level <ArrowRight size={14} /></button><small>{status}</small></>}
          right={<><BookCutscene chapter={chapter} relicImage={BOOK_SCENE_ART[chapter.chapterId] ?? DEFAULT_BOOK_SCENE_ART} characterImage={BOOK_SCENE_CHARACTERS[chapter.chapterId]} completed sequence={playSequence} onNarrate={narrate} narrating={speaking} /><button className="sc-button secondary" disabled={!soundtrack} onClick={() => soundtrack && (playingScore ? music.pause() : void music.play(soundtrack, [soundtrack]))}>{playingScore ? "Pause score" : "Play this book’s score"}</button></>}
        />
      ) : (
        <div className="sc-harry-movie__empty">
          <Film size={30} aria-hidden="true" />
          <h3>Your first story film is waiting</h3>
          <p>Complete a code level to unlock its scene here. Story films follow your progress through the book.</p>
          <button className="sc-button" type="button" onClick={onPlayLevels}>Choose a level <ArrowRight size={15} /></button>
        </div>
      )}
    </section>
  );
}

interface StoryPageProps {
  mode: "shelf" | "reader";
  selectedBookId: string;
  chapterId: string | null;
  onBookOpen: (id: string) => void;
  onBookHome: () => void;
  onChapterChange: (id: string | null) => void;
  onPlayLevels: () => void;
  onCodeLevel: (bookId: string, chapterId: string) => void;
}

export default function StoryPage({ mode, selectedBookId, chapterId, onBookOpen, onBookHome, onChapterChange, onPlayLevels, onCodeLevel }: StoryPageProps) {
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const progress = journeyProgress(completed);
  const selectedBook = STORY_BOOKS.find((book) => book.id === selectedBookId) ?? STORY_BOOKS[0];
  const requestedCinderChapter = chapterId?.startsWith("cinder-") ? Number(chapterId.slice("cinder-".length)) : progress.chapter;
  const cinderChapter = Number.isInteger(requestedCinderChapter) && requestedCinderChapter >= 0 && requestedCinderChapter < JOURNEY.length
    ? requestedCinderChapter
    : progress.chapter;

  if (mode === "shelf") return <MagicalBookshelf onOpen={(book) => book.storyId ? onBookOpen(book.storyId) : location.hash = '/' + book.route} />;

  return (
    <div className={`sc-page sc-story-reader sc-book-theme--${selectedBook.theme}`} data-book-theme={selectedBook.theme}>
      <button className="sc-book-hub__back" type="button" onClick={onBookHome}><ArrowLeft size={16} /> Back to book</button>
      {selectedBook.kind === "journey" ? (
        <CinderBook
          book={selectedBook}
          chapter={Math.min(cinderChapter, selectedBook.chapters.length - 1)}
          setChapter={(index) => onChapterChange(`cinder-${index}`)}
          cleared={progress.cleared}
          onPlayLevels={onPlayLevels}
        />
      ) : (
        <div className="sc-harry-book-pages" key={selectedBook.id}>
          <HarryStoryFilms
            book={selectedBook}
            completed={bookProgress.completed}
            status={bookProgress.status}
            chapterId={chapterId}
            onChapterChange={onChapterChange}
            onPlayLevels={onPlayLevels}
            onCodeLevel={onCodeLevel}
          />
        </div>
      )}
    </div>
  );
}
