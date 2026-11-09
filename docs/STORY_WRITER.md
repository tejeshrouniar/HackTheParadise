# Story and narration authoring

## Current player story

The active story follows the learner as the main character. Cinder, a young copper dragon, is the companion. Do not reintroduce Aether as the protagonist in the active Home or Storybook experience.

| Content | Source | Used by |
| --- | --- | --- |
| Chapter names, region names, quest stops, and 12 scene lines | `src/content/journey.json` | Home, Storybook, map, cutscenes, completion scene, narration |
| Quest outcome and coding explanation copy | `src/content/quest-narration.json` | Quest completion page and generated voice manifest |
| Scene composition, props, character and dragon movement | `src/features/story/StoryCinema.tsx`, `PixelDragon.tsx` | Storybook and quest aftermath |
| Quest instructions, starter code, examples, win conditions | `src/data/codedexLessons.ts` | Coding screen, guides, and quest interpreter |

Keep the three entries in each chapter aligned: level IDs, stop names, and scene lines all use the same order. The sequential unlock policy lives in `src/features/learning/journeyProgress.ts`, not in story copy. Each chapter's third quest should lead naturally into the next region.

## Regenerating narration

`scripts/narration-manifest.mjs` reads the two JSON sources and writes `scripts/narration.json`. It does not parse TypeScript source. To regenerate the bundled WAV files on Windows, run:

```powershell
powershell -NoProfile -File scripts/build-narration.ps1
```

The script uses the installed Windows `System.Speech` voice and writes files into `public/narration/`. The app plays bundled audio with native browser controls; the visible caption remains the transcript. Rebuild narration only when the spoken copy changes, and review WAV diffs before committing.

## Historical Supabase story data

`src/content/stories/first-light.json`, `src/content/eldoria.ts`, `docs/ELDORIA_STORY.md`, and migrations 001–004 describe the former Aether-led database story. They are retained for database history; the current Storybook is not sourced from them. Do not regenerate or edit migration 004 after it has been applied. New current chapter copy belongs in `journey.json`, not that old publication seed.

Quest IDs are persistent learner data. If a quest is added, update its lesson definition, win condition, progression rules, chapter link, post-quest narration, protected Spark content, tests, and numbered database migrations together. A text-only scene edit does not require a Supabase migration because the active story bundle ships with the site.
