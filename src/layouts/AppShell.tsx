import { lazy,Suspense,useEffect,useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { BookOpen,ChevronRight,Compass,Headphones,Home,LogIn,Menu,MessageCircle,Pause,Play,Search,Settings2,Sparkles,WandSparkles,X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../features/profile/ProfileContext';
import { usePreferences } from '../features/settings/PreferencesContext';
import { useMusic } from '../features/tools/MusicContext';
import { useProgress } from '../features/learning/ProgressContext';
import Dashboard from '../features/learning/Dashboard';
import { AuthModal } from '../components/Auth/AuthModal';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { Loading } from '../components/ui/Status';
import { ProfileForm } from '../features/profile/ProfileForm';
import { CODEDEX_LESSONS } from '../data/codedexLessons';
import toast from 'react-hot-toast';
import { errorMessage } from '../lib/validation';
const Quest=lazy(()=>import('../components/CodedexView/CodedexApp').then(m=>({default:m.CodedexApp})));
const Story=lazy(()=>import('../features/story/StoryPage'));
const Chat=lazy(()=>import('../features/chat/ChatPage'));
const Settings=lazy(()=>import('../features/settings/SettingsPage'));
const Tools=lazy(()=>import('../features/tools/ToolsDrawer'));
const Companion=lazy(()=>import('../components/CodedexHome/SparkyCompanionModal').then(m=>({default:m.SparkyCompanionModal})));
const Playground=lazy(()=>import('../components/CodedexHome/ArcaneTerminalModal').then(m=>({default:m.ArcaneTerminalModal})));
const links=[{id:'home',label:'Overview',Icon:Home},{id:'learn',label:'My adventure',Icon:Compass},{id:'story',label:'Storybook',Icon:BookOpen},{id:'community',label:'The commons',Icon:MessageCircle}];
const routeFromHash=()=>/^#\/(home|learn|story|community|settings|quest\/[1-8])$/.test(location.hash)?location.hash.slice(2):'home';
export function AppShell(){
  const {user,isPasswordRecovery,signOut}=useAuth();const {profile}=useProfile();const {preferences}=usePreferences();const music=useMusic();const {completed}=useProgress();
  const [route,setRoute]=useState(routeFromHash);const [mobile,setMobile]=useState(false);const [auth,setAuth]=useState(false);const [tools,setTools]=useState(false);const [toolsMounted,setToolsMounted]=useState(false);
  const [search,setSearch]=useState(false);const [query,setQuery]=useState('');const [companion,setCompanion]=useState(false);const [playground,setPlayground]=useState(false);
  const name=profile?.display_name||user?.user_metadata?.full_name||user?.user_metadata?.display_name||'Curious learner';
  const avatar=profile?.avatar_url??user?.user_metadata?.avatar_url;
  function navigate(next:string){if(location.hash!==`#/${next}`)location.hash=`/${next}`;setRoute(next);setMobile(false);window.scrollTo({top:0,behavior:'instant'});}
  const openQuest=(id:number)=>navigate(`quest/${id}`);
  useEffect(()=>{const listener=()=>{setRoute(routeFromHash());window.scrollTo(0,0);};window.addEventListener('hashchange',listener);return()=>window.removeEventListener('hashchange',listener);},[]);
  useEffect(()=>{if(isPasswordRecovery)setAuth(true);},[isPasswordRecovery]);
  useEffect(()=>{const keys=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();setSearch(true);}if(e.key==='Escape')setMobile(false);};window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);},[]);
  const openTools=()=>{setToolsMounted(true);setTools(true);};
  const results=CODEDEX_LESSONS.filter(l=>`${l.title} ${l.conceptName}`.toLowerCase().includes(query.toLowerCase()));
  return <MotionConfig reducedMotion={preferences.reduced_motion?'always':'user'}><div className="sc-app"><a className="sc-skip" href="#main-content">Skip to content</a>
    {mobile&&<button className="sc-mobile-scrim" aria-label="Close navigation" onClick={()=>setMobile(false)}/>}
    <aside className={`sc-sidebar ${mobile?'open':''}`} aria-label="Main navigation"><button className="sc-brand" onClick={()=>navigate('home')}><span><WandSparkles size={23}/></span><strong>storicode<span>.</span></strong></button><button className="sc-mobile-close sc-icon-button" aria-label="Close navigation" onClick={()=>setMobile(false)}><X size={20}/></button><div className="sc-nav-label">YOUR WORKSPACE</div><nav>{links.map(({id,label,Icon})=><button key={id} aria-current={route===id||(id==='learn'&&route.startsWith('quest/'))?'page':undefined} className={route===id||(id==='learn'&&route.startsWith('quest/'))?'active':''} onClick={()=>navigate(id)}><Icon size={20}/><span>{label}</span>{id==='learn'&&<small>{completed.length}/8</small>}</button>)}</nav><div className="sc-sidebar-note"><span className="sc-tiny-stars">✦</span><strong>Small steps.<br/>Real superpowers.</strong><p>You don’t need to know it all.<br/>You just need to begin.</p></div><div className="sc-sidebar-bottom"><button className="sc-sidebar-settings" onClick={()=>navigate('settings')}><Settings2 size={19}/>Settings & profile</button><div className="sc-mini-player"><button className="sc-mini-cover" onClick={openTools} aria-label="Open music library"><Headphones size={18}/></button><button className="sc-mini-track" onClick={openTools}><strong>{music.track.title}</strong><small>{music.playing?'A little focus music':'Find your focus'}</small></button><button className="sc-icon-button" aria-label={music.playing?'Pause music':'Play music'} onClick={()=>music.playing?music.pause():void music.play()}>{music.playing?<Pause size={17}/>:<Play size={17}/>}</button></div><button className="sc-sidebar-profile" onClick={()=>user?navigate('settings'):setAuth(true)}><Avatar name={String(name)} url={avatar}/><span><strong>{user?name:'Your adventure, saved'}</strong><small>{user?'Your profile & preferences':'Sign in to sync your progress'}</small></span><ChevronRight size={16}/></button></div></aside>
    <div className="sc-workspace"><header className="sc-topbar"><div className="sc-topbar-location"><button className="sc-mobile-menu sc-icon-button" aria-label="Open navigation" aria-expanded={mobile} onClick={()=>setMobile(!mobile)}><Menu size={22}/></button><span className="sc-breadcrumb">Workspace<ChevronRight size={14}/><strong>{route.startsWith('quest/')?'Coding quest':route==='settings'?'Settings':links.find(l=>l.id===route)?.label}</strong></span></div><div className="sc-topbar-actions"><button className="sc-search-trigger" aria-label="Search quests" onClick={()=>setSearch(true)}><Search size={17}/><span>Find your next discovery</span><kbd>⌘ K</kbd></button><button className="sc-tools-trigger" onClick={openTools}><Headphones size={18}/><span>My toolkit</span></button>{user?<button className="sc-icon-button sc-profile-trigger" onClick={()=>navigate('settings')} aria-label="Open your profile"><Avatar name={String(name)} url={avatar} size={34}/></button>:<button className="sc-button sc-signin" onClick={()=>setAuth(true)}><LogIn size={16}/><span>Sign in</span></button>}</div></header>
    <main id="main-content" tabIndex={-1}><Suspense fallback={<Loading label="Opening your workspace…"/>}>
      {route.startsWith('quest/')?<Quest key={route} initialLessonId={Number(route.split('/')[1])} onExit={()=>navigate('learn')} onLessonChange={openQuest}/>:route==='story'?<Story onQuest={openQuest}/>:route==='community'?<Chat onSignIn={()=>setAuth(true)}/>:route==='settings'?<Settings onSignIn={()=>setAuth(true)}/>:<Dashboard catalog={route==='learn'} onQuest={openQuest} onNavigate={navigate} onCompanion={()=>setCompanion(true)} onTerminal={()=>setPlayground(true)}/>}
    </Suspense></main></div>
    <AuthModal isOpen={auth} onClose={()=>setAuth(false)} onGuest={()=>{}} onAuthenticated={()=>setAuth(false)}/>
    <Modal open={!!profile&&!profile.onboarding_completed&&!isPasswordRecovery} onClose={()=>{}} title="Make your first introduction." description="Choose how fellow learners will know you. You can change this later in your profile." required><ProfileForm key={profile?.id} onboarding/><button className="sc-link sc-onboarding-signout" onClick={()=>void signOut().catch(error=>toast.error(errorMessage(error)))}>Sign out instead</button></Modal>
    <Modal open={search} onClose={()=>setSearch(false)} title="Find your next discovery" description="Search quests by topic or title."><label className="sc-search-form"><Search size={19}/><input autoFocus aria-label="Search quests" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try loops, dragon, functions…"/></label><div className="sc-search-results">{results.map(l=><button key={l.id} onClick={()=>{setSearch(false);openQuest(l.id);}}><span className="sc-search-number">{l.id}</span><span><strong>{l.title}</strong><small>{l.conceptName}</small></span><ArrowIcon/></button>)}{!results.length&&<p>No quests match that search. Try another topic.</p>}</div></Modal>
    <Suspense fallback={null}>{toolsMounted&&<Tools open={tools} onClose={()=>setTools(false)}/>} {companion&&<Companion isOpen={companion} onClose={()=>setCompanion(false)} onOpenQuest={(id)=>openQuest(id??1)} isDarkMode/>}{playground&&<Playground isOpen={playground} onClose={()=>setPlayground(false)} onOpenQuest={(id)=>openQuest(id??1)} isDarkMode/>}</Suspense>
  </div></MotionConfig>;
}
function ArrowIcon(){return <ChevronRight size={17}/>;}
