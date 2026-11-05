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
  const [speaking,setSpeaking]=useState(false);
  const [voiceNotice,setVoiceNotice]=useState("");
  const voiceTimer=useRef<ReturnType<typeof setTimeout>>();
  const supported=typeof window!=="undefined" && "speechSynthesis" in window;
  useEffect(()=>()=>{clearTimeout(voiceTimer.current);if(supported)window.speechSynthesis.cancel();},[supported]);
  function readAloud(){
    if(!supported){setVoiceNotice("Narration is unavailable in this browser. The full text is below.");return;}
    clearTimeout(voiceTimer.current);window.speechSynthesis.cancel();
    if(speaking){setSpeaking(false);return;}
    const speech=new SpeechSynthesisUtterance(outcomes[id-1]+" "+explanations[id-1]);
    speech.lang="en-US";speech.rate=.92;
    const voice=window.speechSynthesis.getVoices().find(item=>item.lang.startsWith("en"));
    if(voice)speech.voice=voice;
    setVoiceNotice("");setSpeaking(true);
    speech.onstart=()=>clearTimeout(voiceTimer.current);
    speech.onend=()=>setSpeaking(false);
    speech.onerror=()=>{clearTimeout(voiceTimer.current);setSpeaking(false);setVoiceNotice("Voice could not play. Try Read aloud again or use the text below.");};
    voiceTimer.current=setTimeout(()=>{window.speechSynthesis.cancel();setSpeaking(false);setVoiceNotice("Your browser did not start a voice. Try Read aloud again.");},6000);
    window.speechSynthesis.resume();window.speechSynthesis.speak(speech);
  }
  const section=useRef<HTMLElement>(null);
  const [snapshot]=useState(()=>({code,logs:[...logs]}));
  const [ready,setReady]=useState(false);
  const chapter=Math.floor((id-1)/3),beat=(id-1)%3;
  useEffect(()=>{section.current?.focus({preventScroll:true});section.current?.scrollIntoView({block:"start",behavior:"auto"});const timer=setTimeout(()=>setReady(true),6000);return()=>clearTimeout(timer);},[]);
  return <section ref={section} tabIndex={-1} className="sc-quest-aftermath sc-completion-page" aria-label="Your spell changed the story">
    <header><span className="sc-eyebrow">SPELL COMPLETE · CHAPTER {chapter+1}</span><h1>{JOURNEY[chapter].stops[beat]}</h1></header>
    <JourneyScene chapter={chapter} beat={beat} playing={!ready}/>
    <button className="sc-button secondary" onClick={readAloud} disabled={!supported}>{speaking?"Stop narration":"Read aloud"}</button>
    <small role="status">{supported?voiceNotice:"Voice unavailable in this browser; read the story below."}</small>
    <p aria-live="polite">{outcomes[id-1]}</p>
    <h3>How your spell worked</h3>
    <p>{explanations[id-1]}</p>
    <div className="sc-completion-code"><section><h3>Your spell</h3><pre><code>{snapshot.code}</code></pre></section><section><h3>Example solution</h3><pre><code>{solution}</code></pre></section></div>
    <details><summary>Execution steps</summary><ol>{snapshot.logs.filter(line=>!line.startsWith('$')).slice(-16).map((line,i)=><li key={i}>{line.split("aether.").join("player.")}</li>)}</ol></details>
    <button className="sc-button" disabled={!ready} onClick={onContinue}>{ready ? id===12?"Return home":"Continue the story →" : "Your story is unfolding…"}</button>
    {!ready&&<button className="sc-link" onClick={()=>setReady(true)}>Skip animation</button>}
  </section>;
}

