import {readFileSync,writeFileSync} from 'node:fs';
const story=JSON.parse(readFileSync(new URL('../src/content/stories/first-light.json',import.meta.url),'utf8'));
const quote=value=>`'${String(value).replaceAll("'","''")}'`;
let sql='-- Generated from src/content/stories/first-light.json. Existing published text is preserved.\nbegin;\n';
sql+=`insert into public.stories(id,title,description,published) values (${quote(story.id)},${quote(story.title)},${quote(story.description)},true) on conflict(id) do nothing;\n`;
for(const c of story.chapters)sql+=`insert into public.story_chapters(id,story_id,position,title,subtitle,lesson_id,content,published) values (${quote(c.id)},${quote(story.id)},${c.position},${quote(c.title)},${quote(c.subtitle)},${c.lesson_id},${quote(JSON.stringify(c.content))}::jsonb,true) on conflict(id) do nothing;\n`;
sql+='commit;\n';writeFileSync(new URL('../supabase/migrations/202611030003_first_light_content.sql',import.meta.url),sql);
console.log('Story seed generated without replacing existing published content.');
