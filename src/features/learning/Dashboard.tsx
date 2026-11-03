import { ArrowRight,BookOpen,Check,Code2,Flame,Leaf,MessageCircle,Orbit,Sparkles,Trophy,WandSparkles } from 'lucide-react';
import { useProgress } from './ProgressContext';
import { useProfile } from '../profile/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import { CODEDEX_LESSONS } from '../../data/codedexLessons';
const symbols=['🐉','⚗️','🌿','🌉','💎','🪐','⏳','⚡'];
const tags=['Objects & commands','Variables','Loops','Functions','Debugging','Sequencing','Lists & sorting','Bring it together'];
const tones=['mint','peach','pink','blue','purple','blue','peach','pink'];
export function RealmIllustration(){
  return <svg className="sc-realm-art" viewBox="0 0 430 310" fill="none" role="img" aria-label="A floating island with a glowing code crystal and tiny plants">
    <ellipse cx="225" cy="276" rx="124" ry="17" fill="#10101b" opacity=".4"/>
    <path d="m91 210 119 65 139-68-120-51z" fill="#33304b" stroke="#6a5a89"/>
    <path d="m91 210 20 32 99 49v-16z" fill="#27243b"/><path d="m210 275 139-68-22 34-117 50z" fill="#211e32"/>
    <path d="m102 207 109 58 126-59-109-43z" fill="#464255"/>
    <path d="m126 207 85 45 103-46-86-32z" fill="#69627b"/>
    <path d="m143 205 69 36 84-38-68-26z" fill="#3d384f"/>
    <path d="m174 208 39 20 49-23-39-16z" fill="#8573b1"/>
    <path d="m193 192 22 13 22-13-22-12z" fill="#d1baff"/>
    <path d="m190 131 25-52 29 49-29 63z" fill="#a78bfa"/><path d="m215 79 29 49-29 12z" fill="#e7dcff"/><path d="m190 131 25 9v51z" fill="#8863da"/><path d="m215 140 29-12-29 63z" fill="#bda1ff"/>
    <path d="m178 143-13 3m88-7 12 4m-49-78V51" stroke="#c0a5ff" strokeWidth="3" strokeLinecap="round"/>
    <path d="M119 204v-28m0 12c-17 0-18-13-18-13 17-1 18 13 18 13Zm0-8c0-16 14-21 14-21 5 16-14 21-14 21Z" stroke="#86d9b6" strokeWidth="3" fill="#3c806f"/>
    <path d="M303 217v-24m0 8c-13 0-16-10-16-10 14-3 16 10 16 10Zm0-7c0-13 10-18 10-18 7 12-10 18-10 18Z" stroke="#86d9b6" strokeWidth="3" fill="#3c806f"/>
    <rect x="283" y="79" width="93" height="51" rx="12" fill="#242232" stroke="#5f537b"/><text x="298" y="110" fill="#b1ecd2" fontFamily="monospace" fontSize="18">&lt;/&gt; +1</text>
    <rect x="48" y="102" width="100" height="43" rx="11" fill="#242232" stroke="#5f537b"/><circle cx="64" cy="124" r="4" fill="#a3e5cb"/><text x="76" y="129" fill="#d6d0e7" fontFamily="monospace" fontSize="12">you got this</text>
    <path d="m331 161 3 7 7 3-7 3-3 7-3-7-7-3 7-3zm-176-97 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#e9c595"/>
    <circle cx="281" cy="49" r="3" fill="#a1e2c5"/><circle cx="84" cy="72" r="2" fill="#b8a1e9"/><circle cx="364" cy="218" r="3" fill="#b8a1e9"/>
  </svg>;
}
export default function Dashboard({onQuest,onNavigate,onCompanion,onTerminal,catalog=false}:{onQuest:(id:number)=>void;onNavigate:(route:string)=>void;onCompanion:()=>void;onTerminal:()=>void;catalog?:boolean}){
  const {completed,status,retry}=useProgress();const {profile}=useProfile();const {user}=useAuth();
  const next=CODEDEX_LESSONS.find(l=>!completed.includes(l.id))??CODEDEX_LESSONS[0];
  const displayName=profile?.display_name||user?.user_metadata?.full_name||user?.user_metadata?.display_name;
  return <div className="sc-page sc-dashboard">
    <div className="sc-page-heading"><div><span className="sc-eyebrow">{catalog?'YOUR ADVENTURE':'YOUR LEARNING SPACE'}</span><h1>{catalog?'One quest. One new possibility.':displayName?`Good to see you, ${String(displayName).split(' ')[0]}.`:'Your next chapter awaits.'}</h1><p>{catalog?'Start anywhere. Take your time. Every little step counts.':'Make something happen with a little curiosity and a little code.'}</p></div><span className="sc-pill mint"><Leaf size={14}/>Built for curious minds</span></div>
    {!catalog&&<section className="sc-hero"><div className="sc-hero-copy"><span className="sc-pill"><Sparkles size={14}/>LEARN BY MAKING MAGIC</span><h2>A little code.<br/><em>A little magic.</em></h2><p>Meet a dragon. Wake a sleeping world.<br/>Learn to code, one story at a time.</p><div className="sc-row"><button className="sc-button mint" onClick={()=>onQuest(next.id)}>{completed.length?'Continue your adventure':'Start your first quest'}<ArrowRight size={18}/></button><button className="sc-hero-link" onClick={()=>onNavigate('story')}><BookOpen size={17}/>Read the story</button></div><small>No experience needed. Just bring your curiosity.</small></div><RealmIllustration/></section>}
    <div className="sc-stats"><article><span className="sc-stat-icon purple"><BookOpen size={21}/></span><div><strong>{completed.length}<span> / 8</span></strong><p>Quests completed</p></div></article><article><span className="sc-stat-icon peach"><Flame size={21}/></span><div><strong>{completed.length*150}<span> XP</span></strong><p>Curiosity, rewarded</p></div></article><article><span className="sc-stat-icon mint"><Trophy size={21}/></span><div><strong>{completed.length>=8?3:completed.length>=4?2:completed.length>=1?1:0}<span> / 3</span></strong><p>Milestones earned</p></div></article></div>
    <div className="sc-learning-grid"><section><div className="sc-section-heading"><div><span className="sc-eyebrow">THE FIRST LIGHT</span><h2>{catalog?'Explore the quests':'Your adventure'}</h2></div>{!catalog&&<button className="sc-link" onClick={()=>onNavigate('learn')}>All quests<ArrowRight size={15}/></button>}</div><div className="sc-quest-grid">{CODEDEX_LESSONS.slice(0,catalog?8:4).map(lesson=><button className={`sc-quest-card ${tones[lesson.id-1]}`} key={lesson.id} onClick={()=>onQuest(lesson.id)}><div className="sc-quest-card-top"><span className="sc-quest-symbol" aria-hidden="true">{symbols[lesson.id-1]}</span><span className={`sc-quest-status ${completed.includes(lesson.id)?'done':''}`}>{completed.includes(lesson.id)?<><Check size={13}/>Complete</>:lesson.id===next.id?'Up next':`QUEST ${String(lesson.id).padStart(2,'0')}`}</span></div><span className="sc-quest-topic">{tags[lesson.id-1]}</span><h3>{lesson.title}</h3><p>{lesson.taskObjective}</p><div className="sc-quest-card-foot"><span>{completed.includes(lesson.id)?'Practice again':'Explore quest'}</span><ArrowRight size={17}/></div></button>)}</div></section>
      <aside className="sc-dashboard-rail"><section className="sc-card sc-progress-card"><div className="sc-section-heading"><h3>Your growing skillset</h3><Orbit size={19}/></div><div className="sc-progress-ring" style={{'--progress':`${completed.length/8*360}deg`} as React.CSSProperties}><div><strong>{Math.round(completed.length/8*100)}<small>%</small></strong><span>of your first journey</span></div></div><p>{completed.length===8?'A whole realm, restored. Look how far you’ve come.':completed.length?'Keep going. You’re building something that lasts.':'Your first small step starts a whole new story.'}</p><div className="sc-next-milestone"><Trophy size={20}/><div><strong>{completed.length>=8?'Realm restorer':completed.length>=4?'Next: Realm restorer':completed.length>=1?'Next: Finding your flow':'Next: First spell'}</strong><small>{completed.length>=8?'All 8 quests completed':completed.length>=4?'Complete all 8 quests':completed.length>=1?'Complete 4 quests':'Complete your first quest'}</small></div></div></section>
      <button className="sc-card sc-community-card" onClick={()=>onNavigate('community')}><span className="sc-stat-icon mint"><MessageCircle size={21}/></span><h3>Big ideas start<br/>with a conversation.</h3><p>Ask a question. Share a win.<br/>Find your people in the commons.</p><span className="sc-link">Meet the community<ArrowRight size={16}/></span></button>
      <div className="sc-small-tools"><button onClick={onCompanion}><span aria-hidden="true">🐉</span><div><strong>Say hello to Sparky</strong><small>Your curious coding companion</small></div><ArrowRight size={16}/></button><button onClick={onTerminal}><Code2 size={22}/><div><strong>The playground</strong><small>Try a tiny code experiment</small></div><ArrowRight size={16}/></button></div></aside>
    </div><footer className="sc-page-footer"><span><WandSparkles size={15}/>A little better than yesterday.</span><button onClick={retry} className="sc-link" title="Retry progress sync">{status}</button></footer>
  </div>;
}
