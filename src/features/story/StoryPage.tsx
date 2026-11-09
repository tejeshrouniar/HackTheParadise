import { useState } from "react";
import { JOURNEY } from "../../content/journey";
import { STORY_BOOKS } from "../../content/storyBooks";
import { useProgress } from "../learning/ProgressContext";
import { canEnterLevel, journeyProgress } from "../learning/journeyProgress";
import { StoryCinema } from "./JourneyCinema";
import { StorybookVolume } from "./StorybookVolume";
import { useBookProgress } from "./useBookProgress";
import "../../styles/storybooks.css";

export default function StoryPage({ onQuest }: { onQuest: (id: number) => void }) {
  const { completed } = useProgress();
  const bookProgress = useBookProgress();
  const [selectedBook, setSelectedBook] = useState("cinder");
  const [chapter, setChapter] = useState(0);
  const realm = JOURNEY[chapter];
  const progress = journeyProgress(completed);
  const selectedVolume = STORY_BOOKS.find((book) => book.id === selectedBook);
  const firstBook = STORY_BOOKS[0];
  const firstBookComplete = firstBook.chapters.every((item) => bookProgress.completed.includes(item.chapterId));

  return (
      <div className={`sc-page sc-journey-reader ${selectedVolume ? `sc-volume-page-view sc-volume-page-view--${selectedVolume.theme}` : ""}`}>
        <nav className="sc-story-shelf" aria-label="Storybooks">
          <span className="sc-story-shelf__label">YOUR SHELF</span>
          <button type="button" aria-pressed={selectedBook === "cinder"} onClick={() => setSelectedBook("cinder")}>
            <span className="sc-story-shelf__cover sc-story-shelf__cover--cinder" aria-hidden="true">C</span>
            <span><strong>Cinder’s Journey</strong><small>Current campaign · {progress.cleared}/12 quests</small></span>
          </button>
          {STORY_BOOKS.map((book) => {
            const count = book.chapters.filter((item) => bookProgress.completed.includes(item.chapterId)).length;
            const isLocked = book.id === "book-two" && !firstBookComplete;
            return (
              <button key={book.id} type="button" aria-pressed={selectedBook === book.id} aria-label={`${book.volume}: ${book.title}${isLocked ? ", sealed until Book I is complete" : ""}`} onClick={() => setSelectedBook(book.id)}>
                <span className={`sc-story-shelf__cover sc-story-shelf__cover--${book.theme}`} aria-hidden="true">{book.volume === "Book I" ? "I" : "II"}</span>
                <span><strong>{book.volume}: {book.title}</strong><small>{isLocked ? "Sealed · finish Book I to open" : `${count}/6 chapters complete`}</small></span>
              </button>
            );
          })}
        </nav>

      {selectedVolume ? (
        <StorybookVolume
          key={selectedVolume.id}
          book={selectedVolume}
          completed={bookProgress.completed}
          progressStatus={bookProgress.status}
          locked={selectedVolume.id === "book-two" && !firstBookComplete}
          onComplete={bookProgress.complete}
          onChooseBook={setSelectedBook}
        />
      ) : (
      <div className="sc-cinder-story">
        <header className="sc-page-heading">
          <div>
            <span className="sc-eyebrow">YOUR STORY</span>
            <h1>The road you restore</h1>
            <p>Follow Cinder’s trail. Each spell reveals the next scene.</p>
          </div>
        </header>

        <nav className="sc-chapter-tabs" aria-label="Story chapters">
          {JOURNEY.map((item, index) => (
            <button
              key={item.title}
              type="button"
              disabled={index > progress.chapter}
              aria-pressed={chapter === index}
              onClick={() => setChapter(index)}
            >
              {index + 1}. {item.title}
            </button>
          ))}
        </nav>

        <h2>{realm.place}</h2>
        <StoryCinema key={chapter} chapter={chapter} />

        <section className="sc-chapter-missions" aria-label={`${realm.title} levels`}>
          {realm.levels.map((id, index) => (
            <button
              type="button"
              disabled={!canEnterLevel(id, completed)}
              key={id}
              onClick={() => onQuest(id)}
            >
              <small>LEVEL {index + 1}</small>
              <strong>{realm.stops[index]}</strong>
              <span>{completed.includes(id) ? "Replay level →" : "Enter level →"}</span>
            </button>
          ))}
        </section>
      </div>
      )}
    </div>
  );
}
