-- Turn the two six-chapter rows from migration 010 into one independent
-- twelve-chapter Harry Potter coding book. Stable chapter IDs keep progress.
-- Cinder remains its own quest-backed story and is not touched here.
begin;

insert into public.stories(id, title, description, published, edition)
values (
  'harry-potter-horcrux-code',
  'The Horcrux Code',
  'Harry follows a twelve-chapter coding adventure from the backwards diary to one final spell.',
  true,
  1
)
on conflict(id) do update set
  title = excluded.title,
  description = excluded.description,
  published = excluded.published,
  edition = excluded.edition;

-- Move positions out of the destination range before joining the two old
-- groups. The existing primary-key chapter IDs and story_progress rows remain.
update public.story_chapters
set position = position + 100
where id in (
  'relics-book-one-01', 'relics-book-one-02', 'relics-book-one-03',
  'relics-book-one-04', 'relics-book-one-05', 'relics-book-one-06',
  'relics-book-two-01', 'relics-book-two-02', 'relics-book-two-03',
  'relics-book-two-04', 'relics-book-two-05', 'relics-book-two-06'
);

with chapters(id, position, title, subtitle, lesson_id) as (
  values
    ('relics-book-one-01', 1, 'The Diary in the Bathroom', 'Moaning Myrtle’s bathroom · A message written backward', 1),
    ('relics-book-one-02', 2, 'The Ring of Gaunt', 'The old shack · Filter the curse', 2),
    ('relics-book-one-03', 3, 'The Locket’s Hiss', 'The seaside cave · Speak the lock’s language', 3),
    ('relics-book-one-04', 4, 'The Cup in the Vault', 'The Lestrange vault · Find the originals', 4),
    ('relics-book-one-05', 5, 'The Diadem’s Test', 'The Room of Requirement · Prove your intent', 5),
    ('relics-book-one-06', 6, 'Nagini’s Trail', 'The castle courtyard · Follow each turn', 6),
    ('relics-book-two-01', 7, 'The Scar’s Memories', 'The Pensieve · Put the years in order', 7),
    ('relics-book-two-02', 8, 'The Unwrapped Turban', 'The old classroom · Unfold each layer', 8),
    ('relics-book-two-03', 9, 'Dobby’s Missing Sock', 'The laundry room · Find the missing number', 1),
    ('relics-book-two-04', 10, 'The Golden Snitch Key', 'The Quidditch pitch · Measure its flight', 2),
    ('relics-book-two-05', 11, 'The Elder Wand Cipher', 'The wand chamber · Read the shifted inscription', 3),
    ('relics-book-two-06', 12, 'The Final Merge', 'The Great Hall · Join every key', 4)
)
update public.story_chapters as target
set story_id = 'harry-potter-horcrux-code',
    position = chapters.position,
    title = chapters.title,
    subtitle = chapters.subtitle,
    lesson_id = chapters.lesson_id,
    content = '[]'::jsonb,
    published = true,
    updated_at = now()
from chapters
where target.id = chapters.id;

-- Remove the obsolete two-volume catalog entries after all known chapters have
-- moved. A stray row keeps its parent story rather than causing data loss.
delete from public.stories as old_story
where old_story.id in ('ink-and-ember-book-one', 'ink-and-ember-book-two')
  and not exists (
    select 1 from public.story_chapters chapter where chapter.story_id = old_story.id
  );

commit;
