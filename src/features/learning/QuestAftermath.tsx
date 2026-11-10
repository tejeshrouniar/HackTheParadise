import { useEffect, useRef, useState } from "react";
import { JourneyScene } from "../story/JourneyCinema";
import { JOURNEY } from "../../content/journey";
import narration from "../../content/quest-narration.json";
import { SparkUnlock } from "./SparkUnlock";
// Completion copy is shared with the offline narration manifest in quest-narration.json.
const { explanations, outcomes } = narration;
export function QuestAftermath({id,code,logs,onContinue}:{id:number;code:string;logs:string[];onContinue:()=>void}) {
  const audio=useRef<HTMLAudioElement>(null);
  const [speaking,setSpeaking]=useState(false);
  const [voiceNotice,setVoiceNotice]=useState("");
  function readAloud(){
    const player=audio.current;
    if(!player)return;
    if(!player.paused){player.pause();return;}
    if(player.ended)player.currentTime=0;
    setVoiceNotice("");
    // Invoke directly from the click: mobile browsers require a user gesture.
    void player.play().catch(()=>setVoiceNotice("Press play in the audio controls to hear the narration. Captions remain below."));
  }
  const section=useRef<HTMLElement>(null);
  const [snapshot]=useState(()=>({code,logs:[...logs]}));
  const [ready,setReady]=useState(false);
  const chapter=Math.floor((id-1)/3),beat=(id-1)%3;
  useEffect(()=>{section.current?.focus({preventScroll:true});section.current?.scrollIntoView({block:"start",behavior:"auto"});const timer=setTimeout(()=>setReady(true),6000);return()=>clearTimeout(timer);},[]);
  return <section ref={section} tabIndex={-1} className="sc-quest-aftermath sc-completion-page" aria-label="Your spell changed the story">
    <div className="sc-completion-spread">
      <article className="sc-completion-page__leaf sc-completion-page__leaf--story">
        <header className="sc-completion-page__heading"><span className="sc-eyebrow">SPELL COMPLETE · CHAPTER {chapter+1}</span><h1>{JOURNEY[chapter].stops[beat]}</h1></header>
        <p className="sc-completion-page__outcome" aria-live="polite">{outcomes[id-1]}</p>
        <h2>How your spell worked</h2>
        <p>{explanations[id-1]}</p>
        <div className="sc-completion-page__narration">
          <button className="sc-button secondary" onClick={readAloud}>{speaking?"Pause narration":"Read aloud"}</button>
          <audio ref={audio} controls preload="metadata" aria-label="Completion narration" src={import.meta.env.BASE_URL+"narration/quest-"+id+".wav"} onPlay={()=>{setSpeaking(true);setVoiceNotice("");}} onPause={()=>setSpeaking(false)} onEnded={()=>setSpeaking(false)} onError={()=>{setSpeaking(false);setVoiceNotice("Narration could not load. Check your connection and reload; the full text is below.");}} />
          {voiceNotice&&<small role="status">{voiceNotice}</small>}
        </div>
      </article>
      <div className="sc-completion-page__spine" aria-hidden="true" />
      <article className="sc-completion-page__leaf sc-completion-page__leaf--play">
        <figure className="sc-completion-page__scene"><JourneyScene chapter={chapter} beat={beat} playing={!ready}/></figure>
        <div className="sc-completion-code">
          <section><h2>Your spell</h2><pre><code>{snapshot.code}</code></pre></section>
          <section><h2>Example solution <small>· 20 sparks</small></h2><SparkUnlock id={id} kind="solution" onUse={code=>{navigator.clipboard?.writeText(code).catch(()=>{});}} /></section>
        </div>
        <details className="sc-completion-page__steps"><summary>Execution steps</summary><ol>{snapshot.logs.filter(line=>!line.startsWith('$')).slice(-16).map((line,i)=><li key={i}>{line.split("aether.").join("player.")}</li>)}</ol></details>
        <div className="sc-completion-page__actions">
          <button className="sc-button" disabled={!ready} onClick={onContinue}>{ready ? id===12?"Return home":"Continue the story →" : "Your story is unfolding…"}</button>
          {!ready&&<button className="sc-link" onClick={()=>setReady(true)}>Skip animation</button>}
        </div>
      </article>
    </div>
  </section>;
}

