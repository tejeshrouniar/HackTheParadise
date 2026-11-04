# Writing for Storicode

Edit `src/content/stories/first-light.json`. It is text content, not the game engine. Every chapter has a permanent `id`, a numeric `position`, a `title`, a `subtitle`, a `lesson_id`, and a `content` array. Each content section has a permanent `id`, a `type`, and `text`.

- `narration`: ordinary story paragraph.
- `dialogue`: add a `speaker` string. The renderer presents it as dialogue.
- `choice`: add `options`, each with a stable `id`, a `label` and a `response`. The response appears when selected. These choices personalize the scene; they do not secretly change quest difficulty or create unimplemented branches.

Example section:

```json
{
  "id": "a-small-question",
  "type": "dialogue",
  "speaker": "The spellbook",
  "text": "What could we try next?"
}
```

Change text freely. Reorder chapters with `position`; saved progress uses the permanent chapter ID, never its position. Do not rename published chapter, section, or choice IDs: existing saved progress refers to them. Unpublish an old chapter rather than deleting a row with saved progress. New chapters require unique IDs and positions. To link a genuinely new game mechanic, a developer must implement its quest; the current supported `lesson_id` values are 1–8.

`src/data/codedexLessons.ts` holds the separate coding instructions, hints, examples, starter code and solutions. Edit those only with a developer: changes must remain compatible with `src/features/learning/questCompiler.ts` and the quest's win condition. `npm test` verifies the content IDs and every supplied solution.

The current story is **The Fragments of Eldoria**, edition 2, refined from the author’s STORI.pages draft. The filename and database ID remain first-light to preserve existing reading progress. Aether is the playable apprentice, Malachar is the final antagonist, and SpellScript is the in-world language. The five Core fragments are awarded by quests 1, 2, 3, 4 and 7; quests 5 and 6 open the route. The final story outcome checks fragment completion even when a learner plays out of order.

For a fresh database, apply migrations 001 through 004 in order. The historical 003 seed is unchanged. The new 202611030004_eldoria_story.sql explicitly updates the story and all eight chapters by their existing IDs, and adds the edition marker. It does not delete or reset learner progress, choices, profiles or accounts. This upgrade was applied by the project owner and verified against the live public API on 4 November 2026.

The command npm run content:seed now generates the Eldoria 004 migration from the bundled JSON. This is an editorial replacement, not the old insert-only seed. After 004 is deployed, use a NEW numbered migration for subsequent published edits rather than modifying migration history. Keep the database and bundled edition synchronized.

After publication, edit `stories` / `story_chapters` through the Supabase table editor as the trusted project owner, or make a new reviewed migration targeting the specific chapter ID. `content` is the same array of sections as the JSON file. Keep `published=true` on both the story and its chapters. Ordinary learners have read-only access. Do not put an admin key in the website to build a writer interface.

The app prefers valid published Supabase chapters when their story edition is at least as new as the bundled edition. Metadata and chapter content are adopted together. An older database cannot silently bring back the retired story. The bundled JSON is an offline/network-failure edition. Keep it in sync with editorial changes for a consistent fallback; if a remote chapter is malformed, the included edition remains usable. Text is rendered as text, never HTML, so you do not need to write markup or escape tags yourself.
