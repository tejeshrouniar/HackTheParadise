import story from './stories/first-light.json';
export interface StorySection { id: string; type: 'narration'|'dialogue'|'choice'; text: string; speaker?: string; options?: {id:string;label:string;response:string}[]; }
export interface StoryChapter { id:string; title:string; subtitle:string; lesson_id:number; position:number; content:StorySection[]; }
export interface Story { id:string; title:string; description:string; chapters:StoryChapter[]; }
export const FIRST_LIGHT = story as Story;
export function isStoryChapter(value: unknown): value is StoryChapter {
  if (!value || typeof value !== 'object') return false;
  const c = value as StoryChapter;
  return typeof c.id==='string' && typeof c.title==='string' && typeof c.subtitle==='string' && Number.isInteger(c.position) && c.lesson_id>=1 && c.lesson_id<=8 && Array.isArray(c.content) && c.content.every(s => typeof s.id==='string' && typeof s.text==='string' && ['narration','dialogue','choice'].includes(s.type) && (s.type!=='choice' || (Array.isArray(s.options) && s.options.length>0 && s.options.every(o=>typeof o.id==='string' && typeof o.label==='string' && typeof o.response==='string'))));
}
