import { canEnterLevel, journeyProgress } from "./journeyProgress";
import { JOURNEY } from "../../content/journey";
import { useProgress } from "./ProgressContext";
import { JourneyScene } from "../story/StoryCinema";
export function WorldMap({onQuest}:{onQuest:(id:number)=>void}) {
  const {completed}=useProgress();
  return <div className="sc-world-map"><header className="sc-world-map-heading"><div><span>FOUR CHAPTERS · TWELVE SPELLS</span><h2>The road you restore</h2></div><span>{journeyProgress(completed).cleared} / 12 complete</span></header>
    <div className="sc-realm-grid">{JOURNEY.map((realm,chapter)=><section className="sc-realm-card" key={realm.title}>
      <JourneyScene chapter={chapter}/><div><small>CHAPTER {chapter+1}</small><h3>{realm.place}</h3><p>{realm.title}</p>
      <ol>{realm.levels.map((id,i)=><li key={id}><button disabled={!canEnterLevel(id,completed)} onClick={()=>onQuest(id)}><span>{!canEnterLevel(id,completed)?"🔒":completed.includes(id)?"✓":i+1}</span>{realm.stops[i]}<span>→</span></button></li>)}</ol></div>
    </section>)}</div></div>;
}
