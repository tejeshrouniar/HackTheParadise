# Hack The Paradise

Hack The Paradise (formerly Storicode) is a browser based coding adventure presented as a collection of interactive storybooks. The welcome page introduces the experience; the **Bookshelf** contains the storybooks. Open a cover to reach the same book hub for every story, then choose **Play levels** or **Read story**. Level navigation stays inside the selected book; it is not a separate top-level destination. The Harry Potter adventure is the main story; Cinder’s *The Last Light* is a beginner tutorial. Each book keeps its own theme, scenes, soundtrack, and progress.

## What is in the app

- **Play levels:** open this from a book hub, then walk its route with the created pixel avatar. Arrow keys or A/D move, Shift runs, and E opens the nearby level; touch buttons, click-to-walk, and a chapter list are also available. Cinder’s tutorial has four regions with three sequential spells each; Harry Potter has twelve sequential coding chapters. Completing a level opens the next landmark and lifts the fog ahead.
- **Coding levels:** Cinder and Harry Potter use the same editor, run/reset/guide controls, console, and account-backed Spark hint/solution panel. Each story keeps its own interpreter, scenes, objectives, chapter unlocks, and progress. A solved Harry Potter level plays a scene-specific completion animation on its supplied pixel background; the Storybook is reserved for chapter films and full movies when their MP4 files are supplied.
- **Bookshelf, book hub, and story:** the shelf contains only book covers. Every cover opens the same two-page hub layout, with progress, chapter contents, and the **Play levels** and **Read story** actions. The story reader is a separate view inside the selected book; Harry Potter movie files unlock there as their coding chapters are completed. No animated level reward is presented as a movie. Completing one book never unlocks or overwrites another.
- **Coding quests:** a bounded Python inspired teaching language, step by step world feedback, hints, solutions, and completion scenes.
- **Accounts and progress:** Supabase Auth supports email and Google sign in. Guest progress remains on the device; signed in progress syncs to the account.
- **Sparks:** the database keeps balances, unlocks, redemption history, and admin test access. Test/promotion codes are supported. No real money checkout or referral payout is active.
- **Tools:** optional Openverse music search, included synthesized soundscapes, a focus timer, notes, and code references.

## Run locally

Requirements: Node.js 22.18 or newer and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
# Add the Supabase project URL and publishable key to .env.local.
npm run dev
```

Vite starts at `http://localhost:3000` by default. If that port is occupied, use the URL printed in the terminal. The app can render as a guest without Supabase credentials; account, cloud sync, and Sparks require a configured project.

## Verify changes

```bash
npm test
npm run build
```

`npm test` runs the compiler, progression, sprite, content, and disposable PostgreSQL/RLS checks. It does not contact production. The build runs TypeScript and creates the deployable `dist/` folder.

## Configure Supabase

Copy only the project URL and **publishable** key into `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Never place a Supabase secret or `service_role` key in the browser app. Apply schema migrations in filename order and configure Google OAuth using [the Supabase setup guide](SUPABASE_SETUP.md). Migration 009 repairs the Spark wallet tables when migration 008 exists but the earlier wallet foundation is missing; it is safe after 008 and preserves existing rows.

For a project that already applied migration 010, apply `supabase/migrations/202611100011_story_catalog.sql` to combine the earlier six-and-six Harry Potter chapter rows into one twelve-chapter book. It preserves the existing chapter IDs and saved progress. New projects should apply all migrations in filename order. Until the storybook migrations are applied, coding-book progress saves locally in the browser.

Apply `supabase/migrations/202611100012_book_scoped_spark_content.sql` after the existing Sparks migrations to store Harry Potter hints and solutions under its own book ID. Both Harry Potter and Cinder start their lesson numbering at 1; the database uses `(book_id, lesson_id)` so the books never share unlocks. This migration preserves existing balances, Cinder unlocks, and story progress.

## Adding a future storybook

Add each story as its own entry in [`src/content/storyBooks.ts`](src/content/storyBooks.ts). Give it a stable ID, its own theme, background key, soundtrack ID, cover mark, and chapter list. A story gets one book of its own; do not split one story into separate books to represent chapter groups. `StoryPage.tsx` owns the shelf and story-reader views; `BookHubPage.tsx` supplies the shared landing layout and the two book actions. Add the book's walk-map preset to [`src/features/learning/bookWalkPresets.ts`](src/features/learning/bookWalkPresets.ts): group stable level IDs into visual regions and supply a background, optional ground art, chapter label, title, and stop artwork. `WorldMap.tsx` supplies book-specific completion IDs and routes selected stops into the correct level. `WalkableBookMap.tsx` supplies shared movement, keyboard/touch/pointer controls, sequential gates, fog, progress display, and an accessible level directory. Keep progression sequential and let completed groups reveal the route ahead. Do not add another Home, top-level map link, or duplicate level launcher. Book selection is shared between routes by `AppShell`, persists on the device, and sets the app-wide theme. Cinder is the tutorial example: four regions come from `journey.json` and retain the existing quest progress IDs. Harry Potter is the coding-book example: twelve stable chapter slugs come from `codeCampaign.ts` and retain independent `story_progress` rows. The earlier `JourneyTrail.tsx` and `WizardingWalk.tsx` components are legacy implementations, not active map routes.

For a new coding book, add its original chapter copy and sandbox tests to its content module, then add a numbered Supabase migration for the story, chapter rows, and protected Spark hint/solution content. Each book can number its lessons from 1; `sparkLessonId` is paired with the story ID in the database, so it does not collide with another book’s lesson 1. Never reuse chapter slugs or reset progress in an applied migration. The shared `CodingEditorPanel` provides the editor, reset/run/guide controls, Spark unlocks, and console; connect each book’s own safe runner and themed live scene around that panel. Add a theme and per-scene background rules in `src/styles/storybooks.css`, and select a soundtrack already registered in `src/services/music.ts` (or add a new synthesized track there). The page-turn effect is native CSS and respects reduced-motion settings; route changes use a directional tilt and chapter changes turn the Grimoire leaf. The supplied Windows page-turn utility is not a runtime dependency.

## Where to look

- [Codebase guide](docs/CODEBASE_GUIDE.md) — route flow, source-of-truth files, module ownership, and data boundaries.
- [Feature map](src/features/README.md) — what each feature folder owns.
- [Migration guide](docs/MIGRATIONS.md) — migration order, dependencies, and the current hosted-project repair.
- [Accessibility notes](docs/ACCESSIBILITY.md) — keyboard, motion, focus, and known validation gaps.
- [Story authoring](docs/STORY_WRITER.md) — story catalog, chapter progress, themes, backgrounds, and narration sources.
- [Validation record](docs/VALIDATION.md) — what was actually run and what still needs hosted/browser verification.
- [Asset licenses](docs/asset-licenses/) — license notes for included third-party artwork.

The `.github/workflows/deploy.yml` workflow runs tests and builds the static site for GitHub Pages. A successful local build does not publish the app; publishing requires a push to the configured branch or a manual workflow run.

## Library redesign and optional videos

The landing page at `#/entrance` (also the initial route) is `src/features/library/LibraryEntrance.tsx`; it introduces the library, shows both active books, and links into the shelf or a selected book. `MagicalBookshelf.tsx` owns the searchable physical shelf at `#/story` (also `#/home`). `src/content/library.ts` supplies shelf metadata and derives adventures from `storyBooks.ts`. Shared route-cover transitions live in `src/styles/landing.css` and honor reduced-motion settings. Each story declares its own palette; stable progress IDs and database names are unchanged.

Add licensed video metadata to `src/content/bookMedia.ts`, keyed by book ID and stable chapter ID. Each entry accepts an HTTPS or root-relative `src`, optional `poster`, optional `duration`, and subtitle tracks (`src`, `language`, `label`). Harry Potter’s `BookVideoLibrary.tsx` appears in the Story reader, separate from gameplay level results. It gates chapter videos on existing completion and movie playback on completion of every chapter plus availability of every clip. Playback uses one native video element and advances in order. Playback position is device-local and account-scoped; completion still uses the existing progress system. Public media URLs are not DRM or server-protected entitlements.

Chapter video files are still needed. Harry Potter’s solved-level animations play on the coding completion page; the Storybook contains only the video player and an honest “file will appear here” state until an MP4 is configured. The movie offers a single seek bar across chapters when all clip durations are known. Supply `duration` in seconds for each clip to enable it from the first play. Without known durations, the native controls seek within the current clip.

For a deployment under a subpath, use full HTTPS media URLs. When using HTTPS subtitle URLs, the video and WebVTT hosts must allow the site origin via CORS. Completed coding chapters offer a direct **Watch chapter video** action once a clip is configured.

The bookshelf follows the supplied three-shelf sketch: hanging Home/Search/Music/Account controls, Library journals with a welcome spread, Adventure books with the tutorial first, and Guild books on the right. Edit shelf metadata in src/content/library.ts and visual treatment in src/styles/grimoire.css. Decorative stacks and the globe are non-interactive; labeled books and signs connect to existing routes and tools.
