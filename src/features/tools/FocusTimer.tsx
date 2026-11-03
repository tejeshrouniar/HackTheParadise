import { useEffect,useRef,useState } from 'react';
import { Pause,Play,RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { usePreferences } from '../settings/PreferencesContext';
import { readLocal,writeLocal } from '../../lib/validation';
import { sound } from '../../utils/sound';
export function FocusTimer(){
  const {user}=useAuth();const {preferences}=usePreferences();const key=`storicode_timer_${user?.id??'guest'}`;
  const [duration,setDuration]=useState(preferences.focus_minutes);const [remaining,setRemaining]=useState(preferences.focus_minutes*60);
  const [deadline,setDeadline]=useState<number|null>(()=>readLocal(key,null));const notified=useRef(false);
  useEffect(()=>{if(!deadline){setDuration(preferences.focus_minutes);setRemaining(preferences.focus_minutes*60);}},[preferences.focus_minutes]);
  useEffect(()=>{
    writeLocal(key,deadline);if(!deadline)return;
    const tick=()=>{const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));setRemaining(seconds);if(seconds===0){setDeadline(null);if(!notified.current){notified.current=true;sound.playSuccessChime();toast.success('Focus session complete. Stretch, breathe, and take a little break.',{duration:6000});}}};
    tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer);
  },[deadline,key]);
  const toggle=()=>{if(deadline){setRemaining(Math.max(0,Math.ceil((deadline-Date.now())/1000)));setDeadline(null);}else{notified.current=false;setDeadline(Date.now()+(remaining||duration*60)*1000);}};
  const reset=()=>{setDeadline(null);setRemaining(duration*60);notified.current=false;};
  return <div className="sc-tool-content"><span className="sc-eyebrow">ONE THING AT A TIME</span><h3>A little room to focus.</h3><p className="sc-muted">Pick one small task. Give it your attention. The rest can wait.</p><div className="sc-timer" role="timer" aria-label={`${Math.floor(remaining/60)} minutes and ${remaining%60} seconds remaining`} style={{'--progress':`${(1-remaining/(duration*60))*360}deg`} as React.CSSProperties}><div><strong>{String(Math.floor(remaining/60)).padStart(2,'0')}<span>:</span>{String(remaining%60).padStart(2,'0')}</strong><small>{deadline?'You’ve got this.':remaining===0?'Nice work. Take a breath.':'Ready when you are.'}</small></div></div><div className="sc-timer-presets">{[5,15,25,50].map(minutes=><button key={minutes} className={minutes===duration?'selected':''} disabled={!!deadline} onClick={()=>{setDuration(minutes);setRemaining(minutes*60);}}>{minutes} min</button>)}</div><div className="sc-row sc-center"><button className="sc-button" onClick={toggle}>{deadline?<Pause size={18}/>:<Play size={18}/>} {deadline?'Pause':'Start focus'}</button><button className="sc-icon-button" onClick={reset} aria-label="Reset timer"><RotateCcw size={20}/></button></div><p className="sc-caption sc-muted">The timer keeps running when you switch pages or close this drawer. Sounds follow your sound-effects setting.</p></div>;
}
