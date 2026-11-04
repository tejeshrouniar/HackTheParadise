import { readFileSync, writeFileSync } from "node:fs";
const story = JSON.parse(
  readFileSync(
    new URL("../src/content/stories/first-light.json", import.meta.url),
    "utf8",
  ),
);
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
let sql =
  "-- Eldoria edition: explicitly replaces the retired story, preserving all chapter IDs and learner progress.\n-- Generated from src/content/stories/first-light.json. Run after migrations 001-003.\nbegin;\nalter table public.stories add column if not exists edition integer not null default 1 check (edition > 0);\n";
sql += `insert into public.stories(id,title,description,published,edition) values (${quote(story.id)},${quote(story.title)},${quote(story.description)},true,${story.edition}) on conflict(id) do update set title=excluded.title,description=excluded.description,published=excluded.published,edition=excluded.edition;\n`;
for (const c of story.chapters)
  sql += `insert into public.story_chapters(id,story_id,position,title,subtitle,lesson_id,content,published) values (${quote(c.id)},${quote(story.id)},${c.position},${quote(c.title)},${quote(c.subtitle)},${c.lesson_id},${quote(JSON.stringify(c.content))}::jsonb,true) on conflict(id) do update set title=excluded.title,subtitle=excluded.subtitle,position=excluded.position,lesson_id=excluded.lesson_id,content=excluded.content,published=excluded.published;\n`;
sql += "commit;\n";
writeFileSync(
  new URL(
    "../supabase/migrations/202611030004_eldoria_story.sql",
    import.meta.url,
  ),
  sql,
);
console.log(
  "Eldoria story migration generated. This edition replaces story text while preserving learner progress.",
);
