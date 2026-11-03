import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Flag, Hash, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../profile/ProfileContext';
import { supabase } from '../../lib/supabase';
import { errorMessage, messageError } from '../../lib/validation';
import { Avatar } from '../../components/ui/Avatar';
import { ErrorNotice, Loading } from '../../components/ui/Status';
import { Modal } from '../../components/ui/Modal';
interface Member {display_name:string;username:string;avatar_url:string|null;}
interface Message {id:string;room_id:string;user_id:string;body:string;created_at:string;profiles:Member|null;}
const fields='id,room_id,user_id,body,created_at,profiles(display_name,username,avatar_url)';
const rooms=[{id:'commons',name:'The commons',description:'A good place to learn together.'},{id:'code-help',name:'Code help',description:'Share your approach. Help someone take their next step.'}];
function mergeMessages(previous:Message[], incoming:Message[]) {
  return [...new Map([...previous,...incoming].map(m=>[m.id,m])).values()].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));
}
export default function ChatPage({onSignIn}:{onSignIn:()=>void}) {
  const {user}=useAuth(); const {profile}=useProfile();
  const [room,setRoom]=useState('commons');const [messages,setMessages]=useState<Message[]>([]);const [body,setBody]=useState('');
  const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [connection,setConnection]=useState('Connecting…');
  const [hasOlder,setHasOlder]=useState(false);const [olderBusy,setOlderBusy]=useState(false);const [attempt,setAttempt]=useState(0);
  const [report,setReport]=useState<Message|null>(null);const [reason,setReason]=useState('');const [reportError,setReportError]=useState('');const [reportBusy,setReportBusy]=useState(false);
  const [deleteTarget,setDeleteTarget]=useState<Message|null>(null);const [deleteBusy,setDeleteBusy]=useState(false);
  const scrollRef=useRef<HTMLDivElement>(null); const nearBottom=useRef(true); const deleted=useRef(new Set<string>());
  const add=useCallback((incoming:Message[])=>setMessages(previous=>mergeMessages(previous,incoming).filter(m=>!deleted.current.has(m.id))),[]);
  useEffect(()=>{
    if(!user||!supabase){setLoading(false);return;}
    let active=true;setLoading(true);setMessages([]);setError('');setConnection('Connecting…');deleted.current.clear();nearBottom.current=true;
    const fetchRecent=async()=>{
      const {data,error}=await supabase!.from('chat_messages').select(fields).eq('room_id',room).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(40);
      if(!active)return;
      if(error)setError(errorMessage(error));else{add((data??[]) as unknown as Message[]);setHasOlder((data?.length??0)===40);setError('');}
      setLoading(false);
    };
    // Subscribe first, then refresh history on every reconnect to close the reconnect gap.
    const channel=supabase.channel(`room-${room}-${user.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:`room_id=eq.${room}`},payload=>{
      void supabase!.from('chat_messages').select(fields).eq('id',payload.new.id).maybeSingle().then(({data,error})=>{
        if(!active)return;if(error)setError(errorMessage(error));else if(data)add([data as unknown as Message]);
      });
    }).on('postgres_changes',{event:'DELETE',schema:'public',table:'chat_messages'},payload=>{
      if(!active)return;deleted.current.add(payload.old.id);setMessages(previous=>previous.filter(m=>m.id!==payload.old.id));
    }).subscribe(status=>{
      if(!active)return;
      setConnection(status==='SUBSCRIBED'?'Live':status==='CHANNEL_ERROR'||status==='TIMED_OUT'?'Reconnecting…':'Connecting…');
      if(status==='SUBSCRIBED')void fetchRecent();
    });
    void fetchRecent();
    const refresh=()=>{if(document.visibilityState==='visible')void fetchRecent();};document.addEventListener('visibilitychange',refresh);
    return()=>{active=false;document.removeEventListener('visibilitychange',refresh);void supabase!.removeChannel(channel);};
  },[room,user?.id,attempt,add]);
  useEffect(()=>{if(nearBottom.current&&scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[messages,loading]);
  async function older(){
    if(!supabase||!messages.length)return;setOlderBusy(true);const first=messages[0];
    const {data,error}=await supabase.from('chat_messages').select(fields).eq('room_id',room).or(`created_at.lt.${first.created_at},and(created_at.eq.${first.created_at},id.lt.${first.id})`).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(40);
    if(error)setError(errorMessage(error));else{nearBottom.current=false;add((data??[]) as unknown as Message[]);setHasOlder((data?.length??0)===40);}setOlderBusy(false);
  }
  async function send(e:FormEvent){
    e.preventDefault();if(!user||!supabase||busy)return;const invalid=messageError(body);if(invalid){setError(invalid);return;}
    setBusy(true);setError('');const draft=body.trim();
    const {data,error}=await supabase.from('chat_messages').insert({room_id:room,user_id:user.id,body:draft}).select(fields).single();
    if(error)setError(errorMessage(error));else if(data){nearBottom.current=true;add([data as unknown as Message]);setBody('');}setBusy(false);
  }
  async function sendReport(e:FormEvent){
    e.preventDefault();if(!report||!user||!supabase)return;setReportBusy(true);setReportError('');
    const {error}=await supabase.from('chat_reports').insert({message_id:report.id,reporter_id:user.id,reason:reason.trim()});
    if(error)setReportError(error.code==='23505'?'You already reported this message.':errorMessage(error));else{setReport(null);setReason('');}setReportBusy(false);
  }
  async function remove(){
    if(!deleteTarget||!supabase)return;setDeleteBusy(true);
    const {error}=await supabase.from('chat_messages').delete().eq('id',deleteTarget.id);
    if(error)setError(errorMessage(error));else{deleted.current.add(deleteTarget.id);setMessages(m=>m.filter(i=>i.id!==deleteTarget.id));setDeleteTarget(null);}setDeleteBusy(false);
  }
  if(!user)return <div className="sc-page"><div className="sc-empty sc-card"><MessageCircle size={42}/><h1>Good questions belong here.</h1><p>Join the commons to ask for help, celebrate a small win, or help another learner.</p><button className="sc-button" onClick={onSignIn}>Sign in to join</button><small>Messages are visible to signed-in learners. Keep personal information private.</small></div></div>;
  return <div className="sc-page"><div className="sc-page-heading"><div><span className="sc-eyebrow">BETTER TOGETHER</span><h1>The commons</h1><p>A little help can go a long way.</p></div><span className={`sc-pill ${connection==='Live'?'mint':''}`}><span className="sc-dot"/>{connection}</span></div>
    <div className="sc-chat-layout"><aside className="sc-card sc-chat-rooms"><span className="sc-eyebrow">YOUR SPACES</span>{rooms.map(r=><button className={room===r.id?'active':''} key={r.id} onClick={()=>{setRoom(r.id);setBody('');}}><Hash size={18}/>{r.name}</button>)}<div className="sc-community-guide"><strong>Be someone’s good moment.</strong><p>Share ideas, explain your thinking, and be kind. Never share passwords or personal contact details. Use Report when something feels wrong.</p></div></aside>
    <section className="sc-card sc-chat"><header><Hash size={22}/><div><h2>{rooms.find(r=>r.id===room)?.name}</h2><p>{rooms.find(r=>r.id===room)?.description}</p></div><button className="sc-link" onClick={()=>setAttempt(n=>n+1)}>Reconnect</button></header>
      <div className="sc-messages" ref={scrollRef} role="log" aria-label="Messages" aria-live="polite" onScroll={()=>{const e=scrollRef.current;nearBottom.current=!!e&&e.scrollHeight-e.scrollTop-e.clientHeight<100;}}>
        {hasOlder&&<button className="sc-button secondary sc-load-older" disabled={olderBusy} onClick={()=>void older()}>{olderBusy?'Loading…':'Load older messages'}</button>}
        {loading?<Loading label="Loading the conversation…"/>:!messages.length?<div className="sc-empty"><MessageCircle size={32}/><h3>Every conversation starts somewhere.</h3><p>Introduce yourself or ask your first coding question.</p></div>:messages.map(message=><article className="sc-message" key={message.id}><Avatar name={message.profiles?.display_name??'Learner'} url={message.profiles?.avatar_url}/><div><div className="sc-message-meta"><strong>{message.profiles?.display_name??'Learner'}</strong><time dateTime={message.created_at} title={new Date(message.created_at).toLocaleString()}>{new Date(message.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time><button className="sc-icon-button" title={message.user_id===user.id?'Delete message':'Report message'} aria-label={message.user_id===user.id?'Delete message':'Report message'} onClick={()=>{if(message.user_id===user.id)setDeleteTarget(message);else{setReport(message);setReason('');setReportError('');}}}>{message.user_id===user.id?<Trash2 size={14}/>:<Flag size={14}/>}</button></div><p>{message.body}</p></div></article>)}
      </div>
      {error&&<ErrorNotice message={error}/>}
      <form className="sc-message-form" onSubmit={send}><Avatar name={profile?.display_name??'You'} url={profile?.avatar_url}/><label className="sr-only" htmlFor="message-body">Your message</label><textarea id="message-body" value={body} onChange={e=>setBody(e.target.value)} maxLength={2000} rows={2} placeholder="Ask a question. Share a small win…" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send(e);}}}/><button className="sc-button" disabled={busy||!body.trim()} aria-label="Send message"><Send size={18}/></button></form><small className="sc-chat-footnote">Enter to send · Shift + Enter for a new line · {body.length}/2000</small>
    </section></div>
    <Modal open={!!report} onClose={()=>setReport(null)} title="Report a message" description="Reports go to the site moderators. The sender will not see who reported it." required={reportBusy}><form className="sc-form" onSubmit={sendReport}><label>What happened?<textarea value={reason} onChange={e=>setReason(e.target.value)} minLength={5} maxLength={500} required rows={4}/></label>{reportError&&<ErrorNotice message={reportError}/>}<button disabled={reportBusy} className="sc-button">{reportBusy?'Sending…':'Send report'}</button></form></Modal>
    <Modal open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} title="Delete this message?" description="This removes your message from the conversation." required={deleteBusy}><button className="sc-button danger" disabled={deleteBusy} onClick={()=>void remove()}>{deleteBusy?'Deleting…':'Delete message'}</button></Modal>
  </div>;
}
