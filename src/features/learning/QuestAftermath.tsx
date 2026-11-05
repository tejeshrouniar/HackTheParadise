import { useEffect, useRef, useState } from "react";
import { JourneyScene } from "../story/StoryCinema";
import { JOURNEY } from "../../content/journey";
const explanations = [
"Movement follows the direction you face. Turning changes that direction; collecting works after you reach the fragment.",
"Assignments store values under names. The brewing action reads those values to make the mixture.",
"A loop repeats its indented instructions. Each repetition grows another part of the garden.",
"A function names a reusable sequence. Calling it runs the building instructions inside it.",
"A list index selects one item. Correcting the invalid index lets the ward spell reach its target.",
"Parameters pass values into a function. Its return value supplies the result used by the passage.",
"Sorting changes the order of list values. Indexes then refer to positions in that new order.",
"Your variables, repeated actions, and function calls work together to remove the binding.",
"The loop repeats your growing instruction for each sleeping seed.",
"Calling your bridge function reuses its building instructions for the crossing.",
"Arguments tell the lighting function which values to use for each marker.",
"The calculation combines stored values. The final instruction uses the result to restore the road."
];
const outcomes = [
"You follow the path and catch the lost spark. Your lantern flickers awake.",
"Your mixture feeds the spark. The lantern burns brightly enough to reveal the sleeping roots.",
"Your repeated spell wakes the roots. They part, opening the road to Moonlit Crossing.",
"Your reusable spell builds the crossing. You walk safely across the hollow.",
"You repair the broken ward. Its runes shine again, revealing the passage beyond.",
"Your spell aligns the passage. You step through toward the Amber Ruins.",
"You put the scattered hours in order. The ancient clock begins to stir.",
"Your instructions break the binding around the clock’s heart. Time starts moving again.",
"Your repeated spell wakes the seeds. New leaves point toward Dawnreach.",
"Your bridge reaches the far bank. The road home is open to everyone.",
"Your instructions light the trail markers. Their glow guides the waiting travellers.",
"You send the last light home. The mist lifts, and your village returns."
];
export function QuestAftermath({id,code,solution,logs,onContinue}:{id:number;code:string;solution:string;logs:string[];onContinue:()=>void}) {
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
    <header><span className="sc-eyebrow">SPELL COMPLETE · CHAPTER {chapter+1}</span><h1>{JOURNEY[chapter].stops[beat]}</h1></header>
    <JourneyScene chapter={chapter} beat={beat} playing={!ready}/>
    <button className="sc-button secondary" onClick={readAloud}>{speaking?"Pause narration":"Read aloud"}</button>
    <audio ref={audio} controls preload="metadata" aria-label="Completion narration" style={{width:"100%",maxWidth:480}} src={import.meta.env.BASE_URL+"narration/quest-"+id+".wav"} onPlay={()=>{setSpeaking(true);setVoiceNotice("");}} onPause={()=>setSpeaking(false)} onEnded={()=>setSpeaking(false)} onError={()=>{setSpeaking(false);setVoiceNotice("Narration could not load. Check your connection and reload; the full text is below.");}} />
    {voiceNotice&&<small role="status">{voiceNotice}</small>}
    <p aria-live="polite">{outcomes[id-1]}</p>
    <h3>How your spell worked</h3>
    <p>{explanations[id-1]}</p>
    <div className="sc-completion-code"><section><h3>Your spell</h3><pre><code>{snapshot.code}</code></pre></section><section><h3>Example solution</h3><pre><code>{solution}</code></pre></section></div>
    <details><summary>Execution steps</summary><ol>{snapshot.logs.filter(line=>!line.startsWith('$')).slice(-16).map((line,i)=><li key={i}>{line.split("aether.").join("player.")}</li>)}</ol></details>
    <button className="sc-button" disabled={!ready} onClick={onContinue}>{ready ? id===12?"Return home":"Continue the story →" : "Your story is unfolding…"}</button>
    {!ready&&<button className="sc-link" onClick={()=>setReady(true)}>Skip animation</button>}
  </section>;
}

