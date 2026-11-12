// Manual browser harness, excluded from the production entry. Uses MDN's CC0
// flower clip, not fictional story footage; never writes real book progress.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '../src/contexts/AuthContext';
import { BOOK_VIDEOS } from '../src/content/bookMedia';
import { BookVideoLibrary } from '../src/features/story/BookVideoLibrary';
import { Grimoire, PageTurnProvider, ChapterNavigation } from '../src/features/library/Grimoire';
import '../src/styles/grimoire.css';

const src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
BOOK_VIDEOS['diagnostic'] = { first: { src, duration: 5.055 }, second: { src, duration: 5.055 }, broken: {src:'/not-a-real-diagnostic-video.mp4'} };
const chapters = [{id:'first',title:'Diagnostic clip one'},{id:'second',title:'Diagnostic clip two'}];
function PageFixture() {
  const [page, setPage] = useState(1);
  return <PageTurnProvider><div className="sc-magical-app">
    <ChapterNavigation title="Page-turn diagnostic" number={page} onPrevious={page > 1 ? () => setPage(p=>p-1) : undefined} onNext={page < 3 ? () => setPage(p=>p+1) : undefined}/>
    <Grimoire label="Diagnostic book" pageKey={page} onPreviousPage={page > 1 ? () => setPage(p=>p-1) : undefined} onNextPage={page < 3 ? () => setPage(p=>p+1) : undefined}
      left={<><h2>Fixture page {page}</h2><textarea aria-label="Fixture editor" defaultValue="Page navigation must not hijack this editor."/></>}
      right={<p>Focus the book and use PageDown or PageUp. No story progress changes.</p>}/>
  </div></PageTurnProvider>;
}
function Harness() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [broken, setBroken] = useState(false);
  return <div style={{maxWidth:800,margin:'30px auto',padding:24,background:'#f1e4c7',fontFamily:'system-ui'}}>
    <h1>Media diagnostic — not story content</h1><p>These controls change only fixture props. No account progress is awarded.</p>
    <button onClick={()=>setCompleted([])}>Lock fixtures</button>{' '}
    <button onClick={()=>setCompleted(['first'])}>Complete first fixture</button>{' '}
    <button onClick={()=>setCompleted(['first','second','broken'])}>Complete all fixtures</button>{' '}
    <button onClick={()=>setBroken(v=>!v)}>Toggle missing clip</button>
    <AuthProvider><BookVideoLibrary key={String(broken)} bookId="diagnostic" chapters={broken ? [{id:'broken',title:'Missing fixture'}] : chapters} completed={completed}/></AuthProvider>
    <PageFixture/>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Harness/>);
