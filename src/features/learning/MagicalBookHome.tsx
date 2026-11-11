import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { JOURNEY } from "../../content/journey";
import { STORY_BOOKS } from "../../content/storyBooks";
import "../../styles/magical-book-home.css";

export default function MagicalBookHome({ onQuest }: { onQuest?: (id: number) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const volume = STORY_BOOKS.find((book) => book.id === selected);
  const firstBook = STORY_BOOKS.find((book) => book.id === "book-one")!;
  const bookOneComplete = firstBook.chapters.every((item) => completed.includes(item.chapterId));
  const locked = selected === "book-two" && !bookOneComplete;
  const turn = (direction: number) => setPage((current) => Math.max(0, Math.min(current + direction, selected === "cinder" ? 3 : 5)));

  if (selected) {
    const chapter = volume?.chapters[page];
    const realm = JOURNEY[page];
    return <main className={`magical-home magical-home--reading ${volume ? `magical-home--${volume.theme}` : "magical-home--cinder"}`}>
      <button className="magical-home__back" onClick={() => setSelected(null)}><ArrowLeft size={17}/> Back to the shelf</button>
      {locked ? <section className="magical-book magical-book--sealed"><BookOpen/><p>THE NEXT VOLUME IS SEALED</p><h1>Complete Book I to reveal this story.</h1><button onClick={() => { setSelected("book-one"); setPage(0); }}>Open Book I</button></section> : volume && chapter ? <section className="magical-book" key={`${selected}-${page}`}>
        <div className="magical-book__ribbon">{volume.volume} · CHAPTER {page + 1} OF 6</div><h1>{chapter.chapterTitle}</h1><p className="magical-book__story">{chapter.story}</p>
        <div className="magical-book__lesson"><span>THE SPELL LESSON · {chapter.conceptName}</span><p>{chapter.lesson}</p><strong>YOUR TASK</strong><p>{chapter.taskObjective}</p><code>{chapter.functionName}()</code></div>
        <div className="magical-book__pages"><button disabled={page === 0} onClick={() => turn(-1)}>Previous</button><span>Page {page + 1} / 6</span><button onClick={() => { setCompleted((items) => items.includes(chapter.chapterId) ? items : [...items, chapter.chapterId]); turn(1); }}>Complete page & turn <ArrowRight size={15}/></button></div>
      </section> : realm ? <section className="magical-book" key={`cinder-${page}`}>
        <div className="magical-book__ribbon">CINDER’S JOURNEY · CHAPTER {page + 1} OF 4</div><h1>{realm.place}</h1><h2>{realm.title}</h2><p className="magical-book__story">{realm.lines[2]}</p>
        <div className="magical-book__lesson"><span>YOUR CODING QUESTS</span><ol>{realm.stops.map((stop, index) => <li key={stop}>{stop}{onQuest && <button onClick={() => onQuest(realm.levels[index])}>Play level <ArrowRight size={14}/></button>}</li>)}</ol></div>
        <div className="magical-book__pages"><button disabled={page === 0} onClick={() => turn(-1)}>Previous</button><span>Page {page + 1} / 4</span><button disabled={page === 3} onClick={() => turn(1)}>Turn page <ArrowRight size={15}/></button></div>
      </section> : null}
    </main>;
  }

  return <main className="magical-home"><header className="magical-home__header"><span>YOUR STORYBOOK LIBRARY</span><h1>Choose your next adventure</h1><p>Open a book, discover its world, and learn to code as the story unfolds.</p></header><section className="magical-home__shelf" aria-label="Available storybooks">
    <button className="magical-cover magical-cover--cinder" onClick={() => { setSelected("cinder"); setPage(0); }}><BookOpen/><strong>Cinder’s Journey</strong><small>Four chapters · 12 coding quests</small><span>OPEN BOOK</span></button>
    {STORY_BOOKS.map((book) => <button key={book.id} className={`magical-cover magical-cover--${book.theme}`} onClick={() => { setSelected(book.id); setPage(0); }}><BookOpen/><small>{book.volume}</small><strong>{book.title}</strong><small>Six chapters · Learn through code</small><span>{book.id === "book-two" && !bookOneComplete ? "SEALED" : "OPEN BOOK"}</span></button>)}
  </section></main>;
}
