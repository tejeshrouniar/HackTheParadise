import { useState } from "react";
import { JOURNEY } from "../../content/journey";
import { StoryCinema } from "./StoryCinema";
export default function StoryPage({ onQuest }: { onQuest: (id: number) => void }) {
  const [chapter, setChapter] = useState(0);
  const realm = JOURNEY[chapter];
  return <div className="sc-page sc-journey-reader">
    <header className="sc-page-heading"><div><span className="sc-eyebrow">YOUR STORY</span><h1>The road you restore</h1></div></header>
    <nav className="sc-chapter-tabs" aria-label="Story chapters">{JOURNEY.map((c,i)=><button key={c.title} aria-pressed={chapter===i} onClick={()=>setChapter(i)}>{i+1}. {c.title}</button>)}</nav>
    <h2>{realm.title}</h2>
    <StoryCinema key={chapter} chapter={chapter} onQuest={onQuest}/>
    <div className="sc-chapter-missions">{realm.levels.map((id,i)=><button key={id} onClick={()=>onQuest(id)}><small>LEVEL {i+1}</small><strong>{realm.stops[i]}</strong><span>Enter →</span></button>)}</div>
  </div>;
}
