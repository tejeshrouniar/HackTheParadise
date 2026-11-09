import { journeyProgress } from "../learning/journeyProgress";
import { useEffect, useRef, useState } from "react";
import { AvatarGraphic } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { JOURNEY } from "../../content/journey";
import { sound } from "../../utils/sound";
import { usePreferences } from "../settings/PreferencesContext";
import { useProgress } from "../learning/ProgressContext";
import lanternwood from "../../assets/realms/lanternwood.png";
import moonlit from "../../assets/realms/moonlit.png";
import amber from "../../assets/realms/amber.png";
import dawnreach from "../../assets/realms/dawnreach.png";
const realmAssets = import.meta.glob<string>("../../assets/realms/*.png", { eager: true, query: "?url", import: "default" });
const prop = (name: string) => realmAssets[`../../assets/realms/${name}.png`];
import { useMusic } from "../tools/MusicContext";

export function JourneyScene({ chapter, beat = 0, playing = false }: { chapter: number; beat?: number; playing?: boolean }) {
  const { appearance } = useAppearance();
  const { preferences } = usePreferences();
  const progress = preferences.reduced_motion
    ? Number(rawProgress >= 0.55)
    : rawProgress;
  const floor = chapter === 0 ? 312 : 288;
  const crossing = chapter === 1 || chapter === 3;
  const left = chapter === 1 ? 224 : 256;
  const count = chapter === 1 ? 6 : 4;
  const item = (name: string, x: number, y: number, size = 32) => <image href={prop(name)} x={x} y={y} width={size} height={size} />;
  return <svg className={`sc-journey-scene realm-${JOURNEY[chapter].theme}`} viewBox="0 0 640 352" role="img" aria-label={JOURNEY[chapter].place}>
    <image href={[lanternwood, moonlit, amber, dawnreach][chapter]} width="640" height="352" />
    {crossing && <g>
      {Array.from({length:count},(_,i)=><g key={i}>
        {item("oasis_fill",left+i*32,320)}
        {item("oasis_top_a",left+i*32,288)}
        <g className={moving ? "sc-water-frame" : "sc-water-still"}>{item("oasis_top_b",left+i*32,288)}</g>
        {item("bridge",left+i*32,280)}
      </g>)}
      {item("obelisk",480,224,64)}
      {beat === 2 && <g className={moving ? "sc-realm-glimmer" : ""}>{item("soul_stone",496,208)}</g>}
    </g>}
    {chapter === 0 && <g>
      {item("lantern",288,floor-32)}
      {beat > 0 && item("resin_bottle",352,floor-32)}
      {beat === 2 && [400,448,496].map(x=><g key={x}>{item("healing_herb",x,floor-32)}</g>)}
    </g>}
    {chapter === 2 && <g>
      {item("obelisk",288,224,64)}
      <g className={moving && beat > 0 ? "sc-realm-glimmer" : ""}>{item("sun_disc",288,192,64)}</g>
      {[256,352,448].map(x=><g key={x}>{item("clay_pot",x,256)}{beat===2 && item("healing_herb",x,240)}</g>)}
    </g>}
    {chapter === 3 && [160,416,544].map(x=><g key={x}>{item("wooden_sign",x,256)}{beat>0 && item("lantern",x,224)}</g>)}
    <g transform={`translate(${beat * 140} 0)`} key={beat}><g className={moving ? "sc-cutscene-travel" : ""}>
      <AvatarGraphic appearance={appearance} action={moving ? "walk" : "idle"} directControl={moving} x={80} y={floor-64} size={64} />
    </g></g>
    {beat > 0 && <g className={moving ? "sc-realm-glimmer" : ""} fill="#ffe3a0" shapeRendering="crispEdges">{[0,1,2,3,4].map(i=><rect key={i} x={210+i*70} y={floor-48-(i%2)*12} width="2" height="2"/>)}</g>}
  </svg>;
}
export function StoryCinema({ chapter, onQuest }: { chapter: number; onQuest: (id: number) => void }) {
  const { completed } = useProgress();
  const realm = JOURNEY[chapter];
  const [beat, setBeat] = useState(0);
  const unlocked = realm.levels[beat] <= journeyProgress(completed).cleared;
  const nextUnlocked = beat < 2 && realm.levels[beat + 1] <= journeyProgress(completed).cleared;
  const [playing, setPlaying] = useState(false);
  const [narrate, setNarrate] = useState(true);
  const [notice, setNotice] = useState("");
  const music = useMusic();
  const { preferences, update } = usePreferences();
  const audio = useRef<HTMLAudioElement>(null);
  const advance = useRef(false);
  const source = import.meta.env.BASE_URL+"narration/story-"+chapter+"-"+beat+".wav";
  function playAudio() {
    const player=audio.current;
    if(!player)return;
    setNotice("");
    if(player.ended)player.currentTime=0;
    void player.play().catch(()=>{
      setPlaying(false);
      setNotice("Press Play scene or use the audio controls to start narration.");
    });
  }
  function nextScene() {
    if(beat===2 || !nextUnlocked){setPlaying(false);return;}
    advance.current=true;
    setBeat(value=>value+1);
  }
  function selectScene(value:number) {
    advance.current=false;
    audio.current?.pause();
    setPlaying(false);setNotice("");setBeat(value);
  }
  // Keep the same audio element across scenes, so an unlocked playback session
  // can continue. A rejected play still leaves a visible manual control.
  useEffect(()=>{
    if(advance.current){
      advance.current=false;
      if(narrate)playAudio();else setPlaying(true);
    }
  },[source]);
  useEffect(() => {
    if (!playing || !unlocked) return;
    sound.playWandCast();
    if(narrate)return; // Narrated scenes advance on the actual audio's end.
    const timer=setTimeout(nextScene,Math.max(5500,realm.lines[beat].length*55));
    return()=>clearTimeout(timer);
  }, [playing, beat, narrate, chapter, unlocked, nextUnlocked]);
  if (!unlocked) return <section className="sc-cinema sc-locked-scene"><h3>Scene {beat + 1} is locked</h3><p>Complete “{realm.stops[beat]}” to reveal this part of your story.</p><button className="sc-button mint" onClick={() => onQuest(realm.levels[beat])}>Play level {realm.levels[beat]}</button>{beat > 0 && <button className="sc-button secondary" onClick={() => setBeat(beat - 1)}>Previous scene</button>}{beat < 2 && <button className="sc-button secondary" onClick={() => setBeat(beat + 1)}>Next scene</button>}</section>;
  return <section className="sc-cinema" aria-label="Story cutscene">
    <JourneyScene chapter={chapter} beat={beat} playing={playing} />
    <p className="sc-cinema-caption" aria-live="polite">{realm.lines[beat]}</p>
    <audio ref={audio} controls={narrate} preload="metadata" aria-label="Story narration" style={{width:"100%",maxWidth:480,display:narrate?"block":"none"}} src={source} onPlay={()=>{setPlaying(true);setNotice("");}} onPause={()=>setPlaying(false)} onEnded={nextScene} onError={()=>{setPlaying(false);setNotice("Narration could not load. You can turn narration off to play with captions.");}} />
    <div className="sc-cinema-controls">
      <button className="sc-button mint" onClick={() => {if(playing){audio.current?.pause();setPlaying(false);}else if(narrate)playAudio();else setPlaying(true);}}>{playing ? "Pause" : "Play scene"}</button>
      <button className="sc-button secondary" disabled={beat === 0} onClick={() => selectScene(beat - 1)}>Previous</button>
      <span>{beat + 1} / 3</span>
      <button className="sc-button secondary" disabled={beat === 2} onClick={() => selectScene(beat + 1)}>{nextUnlocked ? "Next" : "Next · locked"}</button>
      <label><input type="checkbox" checked={preferences.sound_effects} onChange={e=>void update({sound_effects:e.target.checked}).catch(()=>setNotice("Sound preference could not be saved."))}/> Effects</label>
      <label><input type="checkbox" checked={narrate} onChange={e=>{audio.current?.pause();setPlaying(false);setNarrate(e.target.checked);setNotice("");}} /> Narration</label>
      <button className="sc-button secondary" onClick={()=>music.playing ? music.pause() : void music.play()}>{music.playing ? "Music off" : "Music on"}</button>
    </div>
    {notice && <small role="status">{notice}</small>}
  </section>;
}
