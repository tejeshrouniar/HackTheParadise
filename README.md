# Storicode

Storicode is a browser based coding adventure. Learners create an avatar, walk through four connected regions, and solve twelve small coding quests. Their instructions change the game world; each completed quest advances the story of the player and Cinder, a young copper dragon.

## What is in the app

- **Home:** a keyboard and pointer controlled trail. Each region becomes reachable after the previous three quests are complete.
- **Storybook:** animated pixel scenes for the four chapters. A scene and its next level unlock with quest progress.
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

## Where to look

- [Codebase guide](docs/CODEBASE_GUIDE.md) — route flow, source-of-truth files, module ownership, and data boundaries.
- [Feature map](src/features/README.md) — what each feature folder owns.
- [Migration guide](docs/MIGRATIONS.md) — migration order, dependencies, and the current hosted-project repair.
- [Accessibility notes](docs/ACCESSIBILITY.md) — keyboard, motion, focus, and known validation gaps.
- [Story authoring](docs/STORY_WRITER.md) — current chapter and narration sources.
- [Validation record](docs/VALIDATION.md) — what was actually run and what still needs hosted/browser verification.
- [Asset licenses](docs/asset-licenses/) — license notes for included third-party artwork.

The `.github/workflows/deploy.yml` workflow runs tests and builds the static site for GitHub Pages. A successful local build does not publish the app; publishing requires a push to the configured branch or a manual workflow run.
