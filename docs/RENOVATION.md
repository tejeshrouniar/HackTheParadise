# Storicode platform upgrade

## Apply the database upgrade

Your existing project is `qlptlxzrnvrahanlordb`. Its `profiles` and `player_progress` tables are already present. The publishable key can read permitted data, but cannot execute administrator SQL. No live migration has been executed by this renovation.

1. Open [your Supabase SQL Editor](https://supabase.com/dashboard/project/qlptlxzrnvrahanlordb/sql/new).
2. Open `supabase/migrations/202611030002_storicode_platform.sql` in VS Code. Copy the entire file into a new query and click **Run** once. This adds the platform tables, policies and avatar bucket. It keeps existing profiles and lesson progress.
3. In another query, run `supabase/migrations/202611030003_first_light_content.sql`. This adds the story and its eight chapters; it does not overwrite existing story records.
4. In Authentication → URL Configuration, keep your existing site URL and allow `http://localhost:3000/`, `http://127.0.0.1:3000/`, and `https://tejeshrouniar.github.io/SpellScript/`. Add your own domain when you have it.
5. Refresh the local app. Sign in with your existing account and open **Settings & profile**. It should show the editor without forcing onboarding. A newly created email or Google account should see the mandatory profile setup.
6. Use two accounts in separate browser profiles to verify chat, private notes, progress, and profile images before publishing. The test matrix below lists the expected checks.

Run migration 002 only once. If it fails, its transaction rolls back; copy the full error before trying again. Do not rerun migration 001 on top of the new platform: it contains the old signup trigger. With the Supabase CLI, use the migration history instead of pasting SQL manually; if 001 was already applied manually, mark it applied before using `db push`.

The earlier published app stays usable while you review this upgrade. Do not deploy the new frontend until 002 and 003 succeed. `npm run build` then creates `dist`; pushing reviewed changes to `main` triggers the existing GitHub Pages workflow. No paid hosting is necessary for this static frontend.

## Architecture and editing map

| Location | Responsibility |
| --- | --- |
| `src/layouts/AppShell.tsx` | Navigation, account entry, search and toolkit access |
| `src/styles/` | Shared tokens, responsive shell, feature styles |
| `src/contexts/AuthContext.tsx` | Supabase email, Google, recovery and session handling |
| `src/features/profile/` | Public profile, uniqueness checks, avatar processing, onboarding |
| `src/features/settings/` | Private preferences, independent SFX and reduced motion |
| `src/features/learning/` | Dashboard, safe progress sync, bounded quest interpreter and state |
| `src/components/CodedexView/` | Existing quest editor and animated worlds |
| `src/content/stories/first-light.json` | Writer-owned story text, dialogue and choices |
| `src/features/story/` | Story rendering and account reading progress |
| `src/features/chat/` | History, Realtime subscriptions, sending, reports and deletion |
| `src/features/tools/` | Persistent music, focus timer, private notes, snippets and references |
| `src/services/music.ts` | Openverse adapter and included soundscape catalog |
| `supabase/migrations/` | Versioned schema and seed changes |
| `tests/` | Interpreter/content validation and real PostgreSQL RLS tests |

The old inactive `MinimalApp`, standalone game-world prototypes, and demo Express server remain for reference; the production app does not import or run them. `npm run dev` now starts just the active Vite app. `npm run dev:legacy` explicitly starts the older demo server as well. Never deploy its demo email-only auth endpoints. No runtime dependency was added. PGlite is a development-only PostgreSQL test dependency and is excluded from the browser bundle.

## Backend design

| Data | Access |
| --- | --- |
| `profiles` | Signed-in members read public name/username/avatar/bio; a user edits only their own allowed fields. No email or gender is stored here. |
| `user_preferences` | Owner only. Gender, SFX, motion, volume and default focus duration. |
| `player_progress` | Existing IDs preserved. New client uses `merge_player_progress` to merge completions atomically rather than replacing them. |
| `achievements`, `user_achievements` | Public catalog; private earned rows, written by the progress trigger. Completion is a learning aid, not a tamper-proof assessment. |
| `stories`, `story_chapters` | Published content readable; only the trusted dashboard/database administrator edits content. |
| `story_progress` | Owner-only chapter completion and selected choice IDs. |
| `study_items` | Owner-only notes/snippets, maximum 20,000 characters each. |
| `chat_rooms`, `chat_messages` | Signed-in members read; users insert as themselves and delete only their own messages. Plain text only. |
| `chat_reports` | Members submit a reason and see their own reports. Moderators review all reports in the dashboard. |
| `chat_restrictions`, `chat_rate_limits` | No client access. Private server moderation/rate-limit state. |
| Storage `avatars` | Public display images; uploads/updates/deletes restricted to the owner's folder. 2 MB and JPG/PNG/WebP bucket limits. Browser decodes, resizes to 512px and re-encodes WebP before upload. |

Existing accounts get a unique generated username and `onboarding_completed=true`. The replacement auth trigger creates new users (email and Google alike) with `onboarding_completed=false`; completing the profile sets it to true. This is a persistent database flag, not a guess based on sign-in time or local storage. Generated usernames remain editable. Usernames are lowercase ASCII, 3–36 characters, unique in the database. Private preferences are created with the profile.

The public avatar URL is intentionally public. Choose pictures accordingly. PostgreSQL tests cover path ownership and bucket configuration; actual Storage MIME handling must also be checked against Supabase. No service-role key or Google client secret belongs in a `VITE_*` variable.

The existing Pages workflow retains the project's already-public publishable configuration so current deployments are not silently broken. Override it with GitHub **Settings → Secrets and variables → Actions → Variables** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Once both variables exist, the public fallbacks can be removed. `.env.local` remains ignored. Changing a publishable key is not a substitute for RLS.

## Chat operations

There are two rooms: The commons and Code help. History loads in pages of 40 with stable timestamp/ID ordering. Subscriptions are attached before history loads; IDs are deduplicated and history refreshes on reconnection. The composer keeps its draft after a failed send. Enter sends; Shift+Enter adds a line.

Posting is limited to one message per two seconds and fifteen per minute per account. A private counter survives message deletion. This is basic abuse protection, not a complete moderation service. Before inviting a classroom, assign a human moderator and explain that all signed-in members can read both rooms.

Moderators use the Supabase dashboard to review `chat_reports`, look up `message_id`, remove a violating message, or add a row to `chat_restrictions` with a future `muted_until` and a reason. Mark a report resolved with `resolved_at`. Never distribute a database-admin key to a frontend moderator. Report records remain after a message is deleted, with a null message reference. Add a retention policy suited to the classroom before a large launch.

## Music, tools and accessibility

Openverse searches are explicitly limited to non-mature music under CC0 or CC BY, with source/creator/license links shown while playing. The recording lives on the original provider; catalog metadata is not a guarantee that every remote file remains playable. Network errors show a useful message and leave the three original browser-synthesized soundscapes available. There is no music autoplay. Previous/next work within the selected catalog or soundscape list. Playback persists across in-app navigation, not page reloads. SFX preferences do not mute music.

Sources: [Openverse API guide](https://docs.openverse.org/api/guides/quickstart.html), [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes), [Storage policies](https://supabase.com/docs/guides/storage/security/access-control), [PGlite test engine](https://pglite.dev/docs/).

Notes and snippets save explicitly. Guests use device storage; signed-in users save to Supabase. Guest notes/progress are not silently copied into a different person's account. The timer stores an absolute finish time so background tabs do not lose elapsed time; it does not automatically start another session. Unsaved notes warn before closing the browser or switching the note being edited.

Radix dialogs provide focus management. Visible focus indicators, semantic labels, keyboard controls and both OS/app reduced-motion settings are supported. The quest interpreter has strict code/loop/recursion/action limits and never evaluates arbitrary JavaScript. It is a small Python-inspired teaching subset; the interface says so.

## Google branding in your screenshot

The header now prefers the saved profile name and picture. The separate Google chooser's `qlptlxzrnvrahanlordb.supabase.co` text comes from Google's OAuth flow and your Supabase callback host; a CSS or React change cannot rename it. Keep the registered callback `https://qlptlxzrnvrahanlordb.supabase.co/auth/v1/callback`. Set the application name/logo under Google Auth Platform → Branding and follow Google's publishing/verification requirements. Buying a website domain does not by itself change the Supabase callback host.

## Validation and remaining live checks

Use Node 22.18+ (CI uses Node 24). Run `npm ci`, `npm test`, then `npm run build`. Database tests execute all three migrations in disposable embedded PostgreSQL, with Supabase-style roles/default grants and minimal auth/storage schemas. They do not connect to production.

Before release, use disposable **staging** accounts for these checks:

- Email signup, confirmation, login, recovery; Google first signup and returning login; old accounts retain progress and bypass onboarding.
- Two users race to claim a username; only one succeeds. Uppercase/invalid usernames fail. Profile save and edit survive reload.
- Valid avatar upload displays; unsupported type/oversized file fails; another user cannot overwrite/delete it.
- Two accounts see a message in Realtime, reconnect after disconnect, page older history, report another user's message, and delete only their own. Verify moderator suspension.
- One user's notes, snippets, settings, story progress and achievements are not readable as another user or guest.
- All eight quests complete from their documented solutions; malformed code yields a helpful error; leaving during execution never awards a different lesson.
- Music starts only from a playback action, stops when paused, continues across navigation, and handles unavailable hosts. Verify one remote track in the deployed browser.
- Phone/tablet/desktop navigation, focus order, Escape, reduced motion, form labels, console/network and layout checks.

See `docs/VALIDATION.md` for the checks actually executed in this workspace. Do not describe the above live checks as complete until they are performed.
