import { motion as animated, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Hand, LockKeyhole } from "lucide-react";
import { JOURNEY } from "../../content/journey";
import { canEnterLevel, journeyProgress } from "../learning/journeyProgress";
import { AvatarGraphic } from "./AvatarGraphic";
import { useAppearance } from "./AppearanceContext";
import { usePreferences } from "../settings/PreferencesContext";
import { sound } from "../../utils/sound";
import forest from "../../assets/realms/lanternwood.png";
import moon from "../../assets/realms/moonlit.png";
import amber from "../../assets/realms/amber.png";
import dawn from "../../assets/realms/dawnreach.png";
import arch from "../../assets/trail/arch.png";
import walkway from "../../assets/realms/walkway.png";

const WIDTH = 1280;
const VIEW = 480;
const art = import.meta.glob<string>("../../assets/realms/*.png", {eager:true,query:"?url",import:"default"});
const sprite = (name:string) => art[`../../assets/realms/${name}.png`];
const BACKGROUNDS = [forest, moon, amber, dawn];
const PROPS = ["lantern","resin_bottle","healing_herb","hammer","scroll","gold_key","sun_disc","soul_stone","healing_herb","wood_log","lantern","magic_staff"];
const stops = JOURNEY.flatMap((realm, chapter) => realm.levels.map((id, index) => ({id, chapter, x: chapter * WIDTH + 240 + index * 380, title: realm.stops[index]})));

export function JourneyTrail({completed,onQuest,onLocation}:{completed:number[];onQuest:(id:number)=>void;onLocation:(chapter:number)=>void}) {
  const progress = journeyProgress(completed);
  const mistId = useId().replace(/:/g, "");
  const {preferences} = usePreferences();
  const systemReduced = useReducedMotion();
  const reduced = preferences.reduced_motion || !!systemReduced;
  const {appearance} = useAppearance();
  const [start] = useState(() => {
    try { const saved=Number(sessionStorage.getItem("storicode:journey-position-v2")); if(Number.isFinite(saved)&&saved>=40)return Math.min(saved,(progress.chapter+1)*WIDTH-40); } catch { /* Position persistence is optional. */ }
    return Math.max(80,progress.chapter*WIDTH-80);
  });
  const [position,setPosition] = useState(start);
  const [motion,setMotion] = useState<"idle"|"walk"|"run">("idle");
  const [direction,setDirection] = useState<"left"|"right">("right");
  const [notice,setNotice] = useState("Walk to a landmark to enter its spell.");
  const stage = useRef<HTMLDivElement>(null);
  const x = useRef(start);
  const input = useRef({left:false,right:false,run:false});
  const target = useRef<number|null>(null);
  const pending = useRef<number|null>(null);
  const state = useRef({completed,onQuest,onLocation});
  state.current={completed,onQuest,onLocation};
  const chapter = Math.min(3,Math.floor(position/WIDTH));
  const previousChapter=useRef(chapter);
  const [arrival,setArrival]=useState<number|null>(null);
  useEffect(()=>{if(previousChapter.current===chapter)return;previousChapter.current=chapter;setArrival(chapter);sound.playWandCast();const timer=setTimeout(()=>setArrival(null),1400);return()=>clearTimeout(timer);},[chapter]);
  const [pixelScale,setPixelScale] = useState(1);
  useEffect(()=>{
    const element=stage.current;
    if(!element)return;
    const measure=()=>setPixelScale(element.getBoundingClientRect().width / VIEW * (window.devicePixelRatio || 1));
    measure();const observer=new ResizeObserver(measure);observer.observe(element);
    window.addEventListener("resize",measure);
    return()=>{observer.disconnect();window.removeEventListener("resize",measure);};
  },[]);
  // Align the world to physical display pixels. Keep the avatar in screen space,
  // so the camera and sprite cannot round independently and fight each other.
  const snap=(value:number)=>Math.round(value*pixelScale)/pixelScale;
  const camera = snap(Math.max(0,Math.min(WIDTH*4-VIEW,position-VIEW/2)));
  const nearby = stops.find(stop=>Math.abs(stop.x-position)<55);
  const maxX = Math.min(WIDTH*4-40,(progress.chapter+1)*WIDTH-40);
  useEffect(()=>{onLocation(chapter);},[chapter,onLocation]);
  useEffect(()=>{
    let frame=0,previous=performance.now(),lastStep=0;
    const stop=()=>{input.current={left:false,right:false,run:false};target.current=null;pending.current=null;setMotion("idle");previous=performance.now();};
    const animate=(now:number)=>{
      const dt=Math.min((now-previous)/1000,.04);previous=now;
      const keys=Number(input.current.right)-Number(input.current.left);
      const delta=target.current===null?0:target.current-x.current;
      const dir=keys||Math.sign(delta);
      const running=input.current.run;
      const limit=Math.min(WIDTH*4-40,(journeyProgress(state.current.completed).chapter+1)*WIDTH-40);
      if(!document.hidden && dir){
        const distance=dir*Math.min((running?190:110)*dt,keys?Infinity:Math.abs(delta));
        const next=Math.max(40,Math.min(limit,x.current+distance));
        if(next!==x.current){x.current=next;setPosition(next);setDirection(dir<0?"left":"right");setMotion(running?"run":"walk");if(now-lastStep>340){sound.playDragonStep();lastStep=now;}}
        else {setMotion("idle");target.current=null;pending.current=null;if(dir>0&&limit<WIDTH*4-40)setNotice("The mist lifts when this chapter’s three spells are complete.");}
        if(target.current!==null&&Math.abs(target.current-x.current)<1){target.current=null;setMotion("idle");const id=pending.current;pending.current=null;if(id&&canEnterLevel(id,state.current.completed))state.current.onQuest(id);}
      }else setMotion("idle");
      frame=requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);
    window.addEventListener("blur",stop);document.addEventListener("visibilitychange",stop);
    return()=>{try { sessionStorage.setItem("storicode:journey-position",String(x.current)); } catch { /* Keep the route playable without storage. */ } cancelAnimationFrame(frame);window.removeEventListener("blur",stop);document.removeEventListener("visibilitychange",stop);};
  },[]);
  function enter(id:number){
    if(!canEnterLevel(id,completed)){setNotice("Complete the earlier spell to unlock this landmark.");return;}
    const stop=stops.find(item=>item.id===id)!;
    if(Math.abs(stop.x-x.current)<55){sound.playClick();onQuest(id);return;}
    target.current=stop.x;pending.current=id;stage.current?.focus();
  }
  function key(event:KeyboardEvent<HTMLDivElement>,down:boolean){
    if(event.target!==event.currentTarget||event.ctrlKey||event.metaKey||event.altKey)return;
    const name=event.key.toLowerCase();
    if(["arrowleft","arrowright","a","d","shift"].includes(name)){
      event.preventDefault();if(name==="shift")input.current.run=down;else{input.current[name==="a"||name==="arrowleft"?"left":"right"]=down;if(down){target.current=null;pending.current=null;}}
    }else if(down&&name==="e"&&!event.repeat&&nearby)enter(nearby.id);
  }
  return <section className="sc-walking-world" aria-label="Walk between chapters">
    <div className="sc-trail-label"><h2>{JOURNEY[chapter].place}</h2><small>{JOURNEY[chapter].levels.filter(id=>id<=progress.cleared).length}/3 spells restored</small></div>
    <div className="sc-walking-stage" ref={stage} tabIndex={0} aria-label="Journey path. Left and right to walk, Shift to run, E to enter a spell." onKeyDown={e=>key(e,true)} onKeyUp={e=>key(e,false)} onBlur={()=>{input.current={left:false,right:false,run:false};}} onClick={e=>{if((e.target as Element).closest("button"))return;const rect=e.currentTarget.getBoundingClientRect();target.current=Math.max(40,Math.min(maxX,camera+(e.clientX-rect.left)/rect.width*VIEW));pending.current=null;stage.current?.focus();}}>
      {arrival!==null&&<animated.div className="sc-chapter-arrival" role="status" initial={{opacity:0}} animate={{opacity:[0,1,1,0]}} transition={{duration:1.4}}><small>CHAPTER {arrival+1}</small><strong>{JOURNEY[arrival].place}</strong></animated.div>}
      <svg viewBox="0 52 480 300" aria-hidden="true" className="sc-journey-scene">
        <defs><linearGradient id={mistId}><stop stopColor="#becdc8" stopOpacity="0"/><stop offset=".35" stopColor="#c8d7d1" stopOpacity=".92"/><stop offset=".5" stopColor="#d6dfd6"/><stop offset=".65" stopColor="#c8d7d1" stopOpacity=".92"/><stop offset="1" stopColor="#becdc8" stopOpacity="0"/></linearGradient></defs>
        <g transform={`translate(${-camera} 0)`}>
          {BACKGROUNDS.map((asset,i)=> i<=progress.chapter && <g key={asset}>
            <defs><clipPath id={`${mistId}-realm-${i}`}><rect x={i*WIDTH} y="0" width={WIDTH} height="352"/></clipPath></defs>
            <g clipPath={`url(#${mistId}-realm-${i})`}>
              {[-1,0,1,2].map(tile=><image key={tile} href={asset} x={snap(i*WIDTH+tile*640+(camera-i*WIDTH)*.12)} width="640" height="352"/>)}
            </g>
            <image href={walkway} x={i*WIDTH} y="304" width={WIDTH} height="32"/>
            {Array.from({length:14},(_,j)=><animated.circle key={j} cx={i*WIDTH+70+j*87} cy={140+(j%4)*37} r={j%3===0?2:1} fill={i===1?"#a8dcdf":"#f5da91"} animate={reduced?{opacity:.4}:{y:[0,-12,0],opacity:[.2,.8,.2]}} transition={{duration:4+j%4,repeat:Infinity,delay:j*.3}}/>) }
            {i>0&&<g pointerEvents="none"><image href={arch} x={i*WIDTH-64} y="194" width="128" height="110"/><animated.rect x={i*WIDTH-110} y="0" width="220" height="352" fill={`url(#${mistId})`} animate={reduced?{opacity:.45}:{opacity:[.4,.65,.4],x:[-10,10,-10]}} transition={{duration:9,repeat:Infinity}}/></g>}
          </g>)}
          {stops.filter(stop=>stop.chapter<=progress.chapter).map(stop=><g key={stop.id} opacity={canEnterLevel(stop.id,completed)?1:.65}>
            <ellipse cx={stop.x} cy="302" rx="25" ry="4" fill="#081c16" opacity=".4"/>
            <animated.g animate={reduced?{y:0}:{y:[0,-7,0]}} transition={{duration:3.5,repeat:Infinity,ease:"easeInOut",delay:(stop.id%3)*.5}}>
              <image href={sprite(PROPS[stop.id-1])} x={stop.x-48} y="204" width="96" height="96"/>
            </animated.g>
          </g>)}
          {progress.chapter<3&&<g pointerEvents="none">
            <defs>
              <linearGradient id={`${mistId}-veil`}><stop stopColor="#bbc9c7" stopOpacity="0"/><stop offset=".55" stopColor="#bbc9c7" stopOpacity=".96"/><stop offset="1" stopColor="#bbc9c7"/></linearGradient>
              <filter id={`${mistId}-fog`} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency=".025 .018" numOctaves="3" seed="8" result="noise"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="85" xChannelSelector="R" yChannelSelector="G"/>
                <feGaussianBlur stdDeviation="3"/>
              </filter>
            </defs>
            <rect x={(progress.chapter+1)*WIDTH} y="0" width={WIDTH*3} height="352" fill="#6c8485"/>
            <animated.rect x={(progress.chapter+1)*WIDTH-150} y="-30" width="340" height="412" fill={`url(#${mistId}-veil)`} filter={`url(#${mistId}-fog)`} animate={reduced?{x:0}:{x:[-8,8,-8]}} transition={{duration:14,repeat:Infinity,ease:"easeInOut"}}/>
          </g>}
        </g>
        <AvatarGraphic appearance={appearance} action={motion} directControl={motion!=="idle"} direction={direction} x={snap(position-camera-48)} y={208} size={96}/>
      </svg>
      {stops.filter(stop=>stop.chapter<=progress.chapter&&stop.x-camera>55&&stop.x-camera<VIEW-55).map(stop=><button key={stop.id} className="sc-trail-marker" style={{left:`${(stop.x-camera)/VIEW*100}%`,bottom:"54%"}} onClick={()=>enter(stop.id)} aria-disabled={!canEnterLevel(stop.id,completed)} aria-label={`${canEnterLevel(stop.id,completed)?"Enter":"Locked"}: ${stop.title}`}>{stop.id<=progress.cleared ? "✓ " : !canEnterLevel(stop.id,completed) ? <LockKeyhole size={14}/> : null} {stop.title}</button>)}
    </div>
    <details className="sc-accessible-route"><summary>Browse spells without walking</summary><div>{stops.filter(stop=>stop.chapter===chapter).map(stop=><button key={stop.id} disabled={!canEnterLevel(stop.id,completed)} onClick={()=>onQuest(stop.id)}>{stop.id<=progress.cleared ? "✓ " : !canEnterLevel(stop.id,completed) ? "Locked · " : ""}{stop.title}</button>)}</div></details>
    <p className="sc-clearing-message" role="status" aria-live="polite">{notice}</p>
    <div className="sc-trail-controls"><span>← → walk · Shift run · E interact</span><div>{([-1,1] as const).map(dir=><button key={dir} aria-label={dir<0?"Walk left":"Walk right"} style={{touchAction:"none"}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);input.current[dir<0?"left":"right"]=true;target.current=null;pending.current=null;}} onPointerUp={()=>{input.current.left=false;input.current.right=false;}} onPointerCancel={()=>{input.current.left=false;input.current.right=false;}} onLostPointerCapture={()=>{input.current.left=false;input.current.right=false;}} onClick={e=>{if(e.detail===0)target.current=Math.max(40,Math.min(maxX,x.current+dir*100));}}>{dir<0?<ArrowLeft size={20}/>:<ArrowRight size={20}/>}</button>)}<button disabled={!nearby} onClick={()=>nearby&&enter(nearby.id)}><Hand size={16}/>Enter spell</button></div></div>
  </section>;
}
