import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { BookOpen,Code2,Headphones,NotebookPen,Timer,X } from 'lucide-react';
import { MusicTool } from './MusicTool';
import { FocusTimer } from './FocusTimer';
import { StudyItems } from './StudyItems';
import { References } from './References';
const tools=[{id:'music',label:'Music',Icon:Headphones},{id:'timer',label:'Focus',Icon:Timer},{id:'notes',label:'Notes',Icon:NotebookPen},{id:'snippets',label:'Snippets',Icon:Code2},{id:'reference',label:'Guide',Icon:BookOpen}];
export default function ToolsDrawer({open,onClose}:{open:boolean;onClose:()=>void}){
  const [active,setActive]=useState('music');
  return <Dialog.Root open={open} onOpenChange={value=>{if(!value)onClose();}}><Dialog.Portal forceMount><Dialog.Overlay forceMount className="sc-overlay sc-tools-overlay"/><Dialog.Content forceMount className="sc-tools-drawer" aria-describedby="tools-description"><header><div><Dialog.Title>Your little toolkit</Dialog.Title><Dialog.Description id="tools-description">Make this space work for you.</Dialog.Description></div><Dialog.Close className="sc-icon-button" aria-label="Close tools"><X size={20}/></Dialog.Close></header><nav className="sc-tool-tabs" aria-label="Coding utilities">{tools.map(({id,label,Icon})=><button key={id} aria-pressed={active===id} className={active===id?'active':''} onClick={()=>setActive(id)}><Icon size={20}/><span>{label}</span></button>)}</nav><div className="sc-tools-body"><div hidden={active!=='music'}><MusicTool/></div><div hidden={active!=='timer'}><FocusTimer/></div><div hidden={active!=='notes'}><StudyItems kind="note"/></div><div hidden={active!=='snippets'}><StudyItems kind="snippet"/></div><div hidden={active!=='reference'}><References/></div></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
