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
  "speaker": "Sparky",
  "text": "What could we try next?"
}
```

Change text freely. Reorder chapters with `position`; saved progress uses the permanent chapter ID, never its position. Do not rename published chapter, section, or choice IDs: existing saved progress refers to them. Unpublish an old chapter rather than deleting a row with saved progress. New chapters require unique IDs and positions. To link a genuinely new game mechanic, a developer must implement its quest; the current supported `lesson_id` values are 1–8.

`src/data/codedexLessons.ts` holds the separate coding instructions, hints, examples, starter code and solutions. Edit those only with a developer: changes must remain compatible with `src/features/learning/questCompiler.ts` and the quest's win condition. `npm test` verifies the content IDs and every supplied solution.

For a fresh database, run `npm run content:seed` and apply the generated `202611030003_first_light_content.sql` after the platform migration. That seed intentionally uses `ON CONFLICT DO NOTHING` to protect a writer's existing production edits. Regenerating it does not update already-published chapters.

After publication, edit `stories` / `story_chapters` through the Supabase table editor as the trusted project owner, or make a new reviewed migration targeting the specific chapter ID. `content` is the same array of sections as the JSON file. Keep `published=true` on both the story and its chapters. Ordinary learners have read-only access. Do not put an admin key in the website to build a writer interface.

The app prefers valid published Supabase chapters. The bundled JSON is an offline/network-failure edition. Keep it in sync with editorial changes for a consistent fallback; if a remote chapter is malformed, the included edition remains usable. Text is rendered as text, never HTML, so you do not need to write markup or escape tags yourself.
