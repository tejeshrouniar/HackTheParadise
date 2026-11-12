# Codebase guide

This document maps the running app and its sources so developers can make changes without confusing the current player story with retained prototypes or historical database content.

## Runtime flow

`index.html` loads `src/main.tsx`. `main.tsx` installs global styles, auth, error handling, and toast notifications. `src/App.tsx` waits for session discovery and composes profile, preferences, progress, music, and avatar providers. `src/layouts/AppShell.tsx` owns the hash routes, shared navigation, dialogs, and lazy-loaded screens.

| Route or area | Main entry | Owns |
| --- | --- | --- |
| Bookshelf (`#/story`, also `#/home`) | `src/features/library/MagicalBookshelf.tsx`, `LibraryEntrance.tsx`, `src/content/library.ts`, `src/styles/grimoire.css` | Sketch-led Library / Adventure / Guild cabinet, hanging controls, search, welcome spread; selecting a spine opens its route |
| Book hub (`#/book/:bookId`) | `src/features/story/BookHubPage.tsx` | Shared two-page book landing layout, progress, chapter contents, and the two actions to play levels or read the story |
| Play levels (`#/learn`, opened from a book hub) | `src/features/learning/Dashboard.tsx`, `WorldMap.tsx`, `bookWalkPresets.ts`, `WalkableBookMap.tsx` | One shared, book-themed walkable map; the selected book provides grouped stop IDs and scene art, while movement, controls, fog gates, and the level directory stay consistent |
| Story reader (`#/book-story/:bookId`) | `src/features/story/StoryPage.tsx`, `JourneyCinema.tsx`, `BookCutscene.tsx` | Book-specific scenes and completed Harry Potter films; each reader returns to its book hub |
| Coding level (`#/quest/:id`, `#/book-level/:chapterId`) | `src/components/CodedexView/CodedexApp.tsx`, `src/features/learning/CodingEditorPanel.tsx`, `src/features/learning/BookCompletionSpread.tsx`, `src/features/learning/BookLevelPage.tsx`, `src/features/story/StorybookVolume.tsx` | Shared editor and completion spread; each book keeps its own safe runner, live scene, code checks, protected solution unlock, and progress |
| Community | `src/features/chat/` | Message history, realtime updates, suggestions, reporting, and ownership controls |
| Settings and profile | `src/features/settings/`, `src/features/profile/` | Account profile, private preferences, avatar, and accessibility options |
| Tools | `src/features/tools/` | Music, focus timer, private notes, snippets, and references |
| Spark wallet | `src/features/learning/SparkWalletCard.tsx`, `SparkCodeTools.tsx`, `useHintWallet.ts` | Balance display, code redemption, unlocks, and admin testing controls |

## Source-of-truth files

- `src/content/storyBooks.ts`: the story catalog. Every story has its own stable ID, theme, background, music track, and progress model. Harry Potter is the featured twelve-chapter coding book; Cinder’s *The Last Light* is a beginner tutorial. Add every future story as its own book here, then provide a `bookWalkPresets.ts` entry and reader content. `BookHubPage.tsx` and the shelf should pick up new catalog entries without another bespoke landing page.
- `src/content/journey.json`: Cinder's four current regions, their three quests, chapter summaries, scene text, and themes. `journey.ts` adds the typed lookup helper. `src/content/codeCampaign.ts` contains the Harry Potter chapter prose, objectives, sandbox tests, and per-book `sparkLessonId`; its legacy chapter slugs are retained for saved progress.
- `src/content/storySagas.ts`: five archived saga drafts retained for future writing. They are not imported by active routes and must not contain Spark-gated hints or solutions.
- `src/content/quest-narration.json`: the twelve completion outcomes and coding explanations.
- `src/content/bookMedia.ts` supplies optional clips by book and chapter ID. `src/features/story/BookVideoLibrary.tsx` uses existing completion state to unlock clips and builds the movie timeline from clip durations. Playback bookmarks are stored per account and book on the device.
- `src/features/library/Grimoire.tsx` owns the shared book spread and page navigation. The shell shares its page-turn lock across header, keyboard, and corner controls.
- `src/features/learning/LevelStage.tsx` provides the shared level display, playback pace, and status caption. Cinder supplies movement steps and Harry Potter supplies puzzle checks, each driven by its existing runner.
- `scripts/build-wizarding-stages.mjs` imports the supplied Horcrux Code background pack. `bookSceneAssets.ts` matches each plate and its actor placements to the chapter's scene key. See [the source and rebuild notes](asset-licenses/wizarding-stage-art.md).
- `src/styles/pixel-library.css` defines the shared 32px grid, stepped book corners, and control states. `pixel-levels.css` and `pixel-utilities.css` style the editor and journal interactions on their respective routes.
- `src/features/story/JourneyCinema.tsx` and `PixelDragon.tsx`: the active four-chapter Cinder story and its DragonPack poses. `StoryCinema.tsx` and `SagaArchive.tsx` are retained archive UI modules and are not imported by the running app.
- `src/data/codedexLessons.ts`: the 12 playable quest prompts, starter code, examples, and win conditions. `CodingEditorPanel.tsx` is the shared editor and protected-help UI for Cinder and coding books. `SparkUnlock` sends both the book ID and lesson number to the wallet RPCs; hints and solutions stay in `spark_content` and are returned only after an account-owned unlock. Do not copy those bodies into browser lesson or scene data.
- `src/features/learning/questCompiler.ts`: the bounded Python-inspired parser/interpreter. It executes only supported Storicode commands; it does not run arbitrary JavaScript or Python.
- `src/features/adventure/appearance.ts` and `AppearanceContext.tsx`: player avatar configuration and persistence.
- `src/features/learning/bookWalkPresets.ts`: active map data for every book. It groups stable level IDs into regions and binds each group to its own background and landmark art. `WalkableBookMap.tsx` renders those presets with one avatar, camera, movement loop, keyboard/touch/pointer controls, fog gates, progress feedback, and accessible level list. `WorldMap.tsx` connects preset stops to Cinder quest IDs or coding-book chapter slugs. Add future books by adding preset data; do not fork the renderer.
- `src/features/learning/journeyProgress.ts`: sequential unlock rules for Cinder’s quest route and quest navigation. `JourneyTrail.tsx` and `WizardingWalk.tsx` are older standalone map renderers retained for reference; the active `WorldMap.tsx` no longer mounts them.
- `src/features/learning/ProgressContext.tsx`: guest device storage and safe merge with signed-in cloud progress.
- `src/features/story/useBookProgress.ts`: separate local/cloud completion rows for coding books; it writes stable chapter IDs to `story_progress` and does not update Cinder lesson progress. Harry Potter map stops open `#/book-level/:chapterId`; after a successful level, `StorybookVolume.tsx` switches to the shared `BookCompletionSpread.tsx`, placing the submitted code and Spark-protected solution on the left page and the chapter cutscene plus next action on the right. The full film reel remains in the Story reader. Apply migrations 010 and 011 for the book catalog, then 012 for book-scoped Spark hints and solutions.
- `src/features/learning/puzzleRunner.ts`: bounded, Python-like interpreter for optional book puzzles. It does not evaluate JavaScript or run arbitrary Python.
- `src/features/learning/useHintWallet.ts`: authoritative wallet state read from Supabase RPCs.
- `scripts/narration-manifest.mjs`: combines the shared JSON story copy into `scripts/narration.json`; `scripts/build-narration.ps1` produces bundled WAV files on Windows.
- `scripts/build-realm-art.mjs`: rebuilds local pixel-art scene textures from extracted, licensed source packs; archive downloads are not stored in the repository.

## Account and data boundaries

`src/contexts/AuthContext.tsx` wraps Supabase Auth. Public browser configuration is read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `src/lib/supabase.ts`. Never put a secret or service-role key in the Vite environment.

User-specific tables use row-level security. Progress is merged rather than overwritten. Spark balances and unlocks change through database functions; admin code generation and payment credits are not available to ordinary browser roles. A referral code stores attribution only; qualification and payout are not implemented. See [the migration guide](MIGRATIONS.md) for schema dependencies and the current hosted repair.

## Retained older content

The Cinder tutorial’s story reads `src/content/journey.json`; the independent Harry Potter coding book uses `storyBooks.ts` and `codeCampaign.ts`. Both active level routes use `src/features/learning/bookWalkPresets.ts` and `WalkableBookMap.tsx`. Archived saga drafts in `src/content/storySagas.ts` remain unmounted. The old Aether-led `src/content/stories/first-light.json` publication and migrations 001–004 remain for existing database history. Do not regenerate or edit migration 004 after it has been applied.

Older component prototypes under `src/components/MinimalApp/`, `Home/`, `Lab/`, and `Map/` are not imported by the current route shell. `server/index.js` is a retained demo server, not the deployed auth backend. `src/components/GameWorlds/` is used by the current quest renderer; it is not part of that unused prototype list. Remove old modules only after checking the import graph and confirming they have no remaining reference.

## Useful checks

```bash
npm test
npm run build
```

Tests use Node's test runner and PGlite for disposable PostgreSQL behavior. They validate database rules locally, not the live Supabase project, Google OAuth provider, payment webhooks, or Realtime transport. Browser and hosted checks should be recorded separately in [the validation log](VALIDATION.md).
