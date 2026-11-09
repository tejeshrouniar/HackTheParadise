# Storicode

Storicode is a browser based coding adventure presented as a collection of interactive storybooks. The main navigation has one **World Map** for level entry and one **Story** desk for reading and playing a book. The Harry Potter adventure is featured by default; Cinder’s *The Last Light* is a beginner tutorial. Book selection changes the app’s palette and scene styling, while every book keeps its own progress and soundtrack.

## What is in the app

- **World Map:** choose a story world, then walk its route with the created pixel avatar. Arrow keys or A/D move, Shift runs, and E opens the nearby level; touch buttons, click-to-walk, and a chapter list are also available. Cinder’s tutorial has four regions with three sequential spells each; Harry Potter has twelve sequential coding chapters. Completing a level opens the next landmark and lifts the fog ahead.
- **Coding levels:** Cinder levels use the interactive movement interpreter. Harry Potter levels open a themed book spread with the lesson, code editor, animated relic scene, test results, and goal state. Both keep coding on the level route instead of hiding it inside Story.
- **Story:** Cinder’s book plays its chapter scenes; Harry Potter’s Story desk is a reel of films for completed coding chapters. Each story has its own cover, colors, scenes, soundtrack, chapter unlocks, and progress. Completing one book never unlocks or overwrites another. The former Home trail is no longer a separate destination.
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

## Adding a future storybook

Add each story as its own entry in [`src/content/storyBooks.ts`](src/content/storyBooks.ts). Give it a stable ID, its own theme, background key, soundtrack ID, cover mark, and chapter list. A story gets one book of its own; do not split one story into separate books to represent chapter groups. Add its walkable level route to `src/features/learning/WorldMap.tsx` and its reading experience to the shared Story screen. Reuse the created avatar and provide keyboard, touch, click-to-walk, and a direct chapter list. Keep progression sequential and let the next completed level reveal the route ahead. Do not add another Home or duplicate level launcher. Book selection is shared between routes by `AppShell`, persists on the device, and sets the app-wide theme. Cinder is the tutorial example: `JourneyTrail.tsx` reads its four regions from `journey.json` and uses the existing quest progress. Harry Potter is the coding-book example: `WizardingWalk.tsx` reads its twelve stops from `codeCampaign.ts` and uses stable slugs with independent `story_progress` rows.

For a new coding book, add its original chapter copy and sandbox tests to `src/content/codeCampaign.ts`, then add a numbered Supabase migration that creates the story row and chapter rows. Never reuse chapter IDs across books or reset progress in an already-applied migration. Add a theme and per-scene background rules in `src/styles/storybooks.css`, and select a soundtrack already registered in `src/services/music.ts` (or add a new synthesized track there). Keep `StorybookVolume` generic so future books inherit the same accessible page reader, sequential unlocks, and responsive layout. The page-turn effect is native CSS and respects reduced-motion settings; the supplied Windows page-turn utility is not a runtime dependency.

## Where to look

- [Codebase guide](docs/CODEBASE_GUIDE.md) — route flow, source-of-truth files, module ownership, and data boundaries.
- [Feature map](src/features/README.md) — what each feature folder owns.
- [Migration guide](docs/MIGRATIONS.md) — migration order, dependencies, and the current hosted-project repair.
- [Accessibility notes](docs/ACCESSIBILITY.md) — keyboard, motion, focus, and known validation gaps.
- [Story authoring](docs/STORY_WRITER.md) — story catalog, chapter progress, themes, backgrounds, and narration sources.
- [Validation record](docs/VALIDATION.md) — what was actually run and what still needs hosted/browser verification.
- [Asset licenses](docs/asset-licenses/) — license notes for included third-party artwork.

The `.github/workflows/deploy.yml` workflow runs tests and builds the static site for GitHub Pages. A successful local build does not publish the app; publishing requires a push to the configured branch or a manual workflow run.
