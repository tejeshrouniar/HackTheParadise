# Codebase guide

This document maps the running app and its sources so developers can make changes without confusing the current player story with retained prototypes or historical database content.

## Runtime flow

`index.html` loads `src/main.tsx`. `main.tsx` installs global styles, auth, error handling, and toast notifications. `src/App.tsx` waits for session discovery and composes profile, preferences, progress, music, and avatar providers. `src/layouts/AppShell.tsx` owns the hash routes, shared navigation, dialogs, and lazy-loaded screens.

| Route or area | Main entry | Owns |
| --- | --- | --- |
| Home | `src/features/learning/Dashboard.tsx`, `src/features/adventure/JourneyTrail.tsx` | Current region, player movement, quest landmarks, and chapter access |
| Storybook | `src/features/story/StoryPage.tsx`, `JourneyCinema.tsx`, `StorybookVolume.tsx` | Standalone story catalog, book-specific page themes, Cinder scenes, independent coding-book progress, and playable levels |
| Quest | `src/components/CodedexView/CodedexApp.tsx`, `src/features/learning/useQuestEngine.ts` | Quest editor, interpreter state, animated world, completion, and rewards |
| Community | `src/features/chat/` | Message history, realtime updates, suggestions, reporting, and ownership controls |
| Settings and profile | `src/features/settings/`, `src/features/profile/` | Account profile, private preferences, avatar, and accessibility options |
| Tools | `src/features/tools/` | Music, focus timer, private notes, snippets, and references |
| Spark wallet | `src/features/learning/SparkWalletCard.tsx`, `SparkCodeTools.tsx`, `useHintWallet.ts` | Balance display, code redemption, unlocks, and admin testing controls |

## Source-of-truth files

- `src/content/storyBooks.ts`: the Storybook catalog. Every story has its own stable ID, theme, background, music track, and progress model. Cinder is a quest-backed journey book; Harry Potter is a single twelve-chapter coding book. Add future stories here rather than treating unrelated stories as sequel volumes.
- `src/content/journey.json`: Cinder's four current regions, their three quests, chapter summaries, scene text, and themes. `journey.ts` adds the typed lookup helper. `src/content/codeCampaign.ts` contains the Harry Potter chapter prose, objectives, and test cases; its legacy chapter IDs are retained for saved progress.
- `src/content/storySagas.ts`: five archived saga drafts retained for future writing. They are not imported by active routes and must not contain Spark-gated hints or solutions.
- `src/content/quest-narration.json`: the twelve completion outcomes and coding explanations.
- `src/features/story/JourneyCinema.tsx` and `PixelDragon.tsx`: the active four-chapter Cinder story and its authored animated dragon. `StoryCinema.tsx` and `SagaArchive.tsx` are retained archive UI modules and are not imported by the running app.
- `src/data/codedexLessons.ts`: the 12 playable quest prompts, starter code, examples, and win conditions. Protected hint and solution text is served through `SparkUnlock` from the `get_spark_content` RPC; do not copy those bodies into browser lesson or scene data.
- `src/features/learning/questCompiler.ts`: the bounded Python-inspired parser/interpreter. It executes only supported Storicode commands; it does not run arbitrary JavaScript or Python.
- `src/features/adventure/appearance.ts` and `AppearanceContext.tsx`: player avatar configuration and persistence.
- `src/features/learning/journeyProgress.ts`: sequential unlock rules shared by Home, Storybook, and quest navigation.
- `src/features/learning/ProgressContext.tsx`: guest device storage and safe merge with signed-in cloud progress.
- `src/features/story/useBookProgress.ts`: separate local/cloud completion rows for coding books; it writes stable chapter IDs to `story_progress` and does not update Cinder lesson progress. Apply migration 010 and, for projects that seeded the old split version, migration 011.
- `src/features/learning/puzzleRunner.ts`: bounded, Python-like interpreter for optional book puzzles. It does not evaluate JavaScript or run arbitrary Python.
- `src/features/learning/useHintWallet.ts`: authoritative wallet state read from Supabase RPCs.
- `scripts/narration-manifest.mjs`: combines the shared JSON story copy into `scripts/narration.json`; `scripts/build-narration.ps1` produces bundled WAV files on Windows.
- `scripts/build-realm-art.mjs`: rebuilds local pixel-art scene textures from extracted, licensed source packs; archive downloads are not stored in the repository.

## Account and data boundaries

`src/contexts/AuthContext.tsx` wraps Supabase Auth. Public browser configuration is read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `src/lib/supabase.ts`. Never put a secret or service-role key in the Vite environment.

User-specific tables use row-level security. Progress is merged rather than overwritten. Spark balances and unlocks change through database functions; admin code generation and payment credits are not available to ordinary browser roles. A referral code stores attribution only; qualification and payout are not implemented. See [the migration guide](MIGRATIONS.md) for schema dependencies and the current hosted repair.

## Retained older content

The active Home trail and Cinder book read `src/content/journey.json`; the independent Harry Potter coding book uses `storyBooks.ts` and `codeCampaign.ts`. Archived saga drafts in `src/content/storySagas.ts` remain unmounted. The old Aether-led `src/content/stories/first-light.json` publication and migrations 001–004 remain for existing database history. Do not regenerate or edit migration 004 after it has been applied.

Older component prototypes under `src/components/MinimalApp/`, `Home/`, `Lab/`, and `Map/` are not imported by the current route shell. `server/index.js` is a retained demo server, not the deployed auth backend. `src/components/GameWorlds/` is used by the current quest renderer; it is not part of that unused prototype list. Remove old modules only after checking the import graph and confirming they have no remaining reference.

## Useful checks

```bash
npm test
npm run build
```

Tests use Node's test runner and PGlite for disposable PostgreSQL behavior. They validate database rules locally, not the live Supabase project, Google OAuth provider, payment webhooks, or Realtime transport. Browser and hosted checks should be recorded separately in [the validation log](VALIDATION.md).
