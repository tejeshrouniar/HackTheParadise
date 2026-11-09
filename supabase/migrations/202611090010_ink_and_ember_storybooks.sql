-- Add two optional, sequential storybook volumes. Chapter progress uses the
-- existing story_progress table and never writes to Cinder's player_progress.
begin;

insert into public.stories(id, title, description, published, edition) values
  ('ink-and-ember-book-one', 'The Hidden Relics', 'Book I of the Ink and Ember Cycle: six strange relics, one sealed academy, and a mystery written in code.', true, 1),
  ('ink-and-ember-book-two', 'The Last Ward', 'Book II of the Ink and Ember Cycle: recover the memories and restore a ward meant to be shared.', true, 1)
on conflict(id) do update set
  title = excluded.title,
  description = excluded.description,
  published = excluded.published,
  edition = excluded.edition;

-- lesson_id remains a concept link required by the existing schema. Book
-- unlocks and completions are keyed only by these distinct story chapter IDs.
insert into public.story_chapters(id, story_id, position, title, subtitle, lesson_id, content, published) values
  ('relics-book-one-01', 'ink-and-ember-book-one', 1, 'The Inkbound Journal', 'The west archive · A message written backward', 1, '[]'::jsonb, true),
  ('relics-book-one-02', 'ink-and-ember-book-one', 2, 'The Thorn Ring', 'The old glasshouse · A curse in the readings', 2, '[]'::jsonb, true),
  ('relics-book-one-03', 'ink-and-ember-book-one', 3, 'The Serpent Locket', 'The flooded cloister · A lock that answers in hisses', 3, '[]'::jsonb, true),
  ('relics-book-one-04', 'ink-and-ember-book-one', 4, 'The Echo Chalice', 'The mirror vault · Find the original among copies', 4, '[]'::jsonb, true),
  ('relics-book-one-05', 'ink-and-ember-book-one', 5, 'The Glass Diadem', 'The moon room · A test of judgment', 5, '[]'::jsonb, true),
  ('relics-book-one-06', 'ink-and-ember-book-one', 6, 'The Ashcoil Serpent', 'The academy court · Follow the trail', 6, '[]'::jsonb, true),
  ('relics-book-two-01', 'ink-and-ember-book-two', 1, 'The Memory Mark', 'The sealed observatory · Rebuild a lost timeline', 1, '[]'::jsonb, true),
  ('relics-book-two-02', 'ink-and-ember-book-two', 2, 'The Veiled Mask', 'The portrait gallery · Unfold the hidden design', 2, '[]'::jsonb, true),
  ('relics-book-two-03', 'ink-and-ember-book-two', 3, 'The Missing Charm', 'The familiars’ room · Find the gap', 3, '[]'::jsonb, true),
  ('relics-book-two-04', 'ink-and-ember-book-two', 4, 'The Silver Comet', 'Above the old roofs · Measure its flight', 4, '[]'::jsonb, true),
  ('relics-book-two-05', 'ink-and-ember-book-two', 5, 'The Founder’s Wand', 'The rune chamber · Read the shifted inscription', 5, '[]'::jsonb, true),
  ('relics-book-two-06', 'ink-and-ember-book-two', 6, 'The Hollow Regent', 'The central archive · Bind the keys together', 6, '[]'::jsonb, true)
on conflict(id) do update set
  story_id = excluded.story_id,
  position = excluded.position,
  title = excluded.title,
  subtitle = excluded.subtitle,
  lesson_id = excluded.lesson_id,
  content = excluded.content,
  published = excluded.published;

commit;
