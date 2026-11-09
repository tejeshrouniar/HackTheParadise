# Story and narration authoring

## Current player story

The active story follows the learner as the main character. Cinder, a young copper dragon, is the companion. Do not reintroduce Aether as the protagonist in the active Home or Storybook experience.

| Content | Source | Used by |
| --- | --- | --- |
| Four Home regions, quest stops, and 12 scene lines | `src/content/journey.json` | Home trail, quest progression, cutscenes, completion scene, narration |
| Two optional six-chapter volumes and their code puzzles | `src/content/storyBooks.ts`, `src/content/codeCampaign.ts` | Storybook shelf, volume page layout, theme, background, soundtrack, and independent unlock sequence |
| Five older saga outlines and archived scene scripts | `src/content/storySagas.ts` | Source archive only; not loaded into the player interface |
| Quest outcome and coding explanation copy | `src/content/quest-narration.json` | Quest completion page and generated voice manifest |
| Main story scene composition, props, character and Cinder movement | `src/features/story/JourneyCinema.tsx`, `PixelDragon.tsx` | Four-chapter Storybook and quest aftermath |
| Archived saga UI prototype | `src/features/story/StoryCinema.tsx`, `SagaArchive.tsx` | Retained but not imported by active routes |
| Quest instructions, starter code, examples, win conditions | `src/data/codedexLessons.ts` | Coding screen, guides, and quest interpreter |

Keep the three entries in each chapter aligned: level IDs, stop names, and scene lines all use the same order. The sequential unlock policy lives in `src/features/learning/journeyProgress.ts`, not in story copy. Each chapter's third quest should lead naturally into the next region.

## Optional storybook volumes

The original wizard-school mystery lives beside Cinder's main campaign. `storyBooks.ts` declares each volume's independent story ID, theme, backdrop, music track, and chapter list. `codeCampaign.ts` holds its story text, objectives, and sandbox test cases. The Storybook UI reads the learner's chosen volume without sharing `ProgressContext` lesson IDs. `useBookProgress.ts` stores chapter completion locally and in Supabase `story_progress`; migration 010 seeds the distinct chapter IDs. Keep each book's chapters sequential, and gate a sequel behind completion of its previous volume.

Artwork is authored in CSS per book theme and the scores use the included Web Audio synthesizer. A new volume should provide its own theme, background key, and soundscape preset, then add chapter IDs in a new migration. Keep answer code out of browser content; test fixtures may hold expected outputs but should not include reference solutions.

## Spark-gated content

Do not add hint or solution bodies to browser modules, Storybook archive entries, quest guide examples, or generated front-end assets. `src/features/learning/SparkUnlock.tsx` fetches those bodies through the entitlement-checked `get_spark_content` RPC. Keep test answers in test-only fixtures and keep shipped teaching examples partial so they demonstrate syntax without completing the active objective.

## Regenerating narration

`scripts/narration-manifest.mjs` reads the two JSON sources and writes `scripts/narration.json`. It does not parse TypeScript source. To regenerate the bundled WAV files on Windows, run:

```powershell
powershell -NoProfile -File scripts/build-narration.ps1
```

The script uses the installed Windows `System.Speech` voice and writes files into `public/narration/`. The app plays bundled audio with native browser controls; the visible caption remains the transcript. Rebuild narration only when the spoken copy changes, and review WAV diffs before committing.

## Historical Supabase story data

`src/content/stories/first-light.json`, `src/content/eldoria.ts`, `docs/ELDORIA_STORY.md`, and migrations 001–004 describe the former Aether-led database story. They are retained for database history; the current Storybook is not sourced from them. Do not regenerate or edit migration 004 after it has been applied. New current chapter copy belongs in `journey.json`, not that old publication seed.

Quest IDs are persistent learner data. If a quest is added, update its lesson definition, win condition, progression rules, chapter link, post-quest narration, protected Spark content, tests, and numbered database migrations together. A text-only scene edit does not require a Supabase migration because the active story bundle ships with the site.
