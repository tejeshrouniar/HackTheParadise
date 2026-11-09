# Platform operations

This file replaces the original renovation checklist, which described an earlier app and migration state. Use the linked guides below as the current source of instructions.

## Current product and code map

The active app is a four-chapter, twelve-quest coding adventure. The player is the protagonist; Cinder is the dragon companion. `src/content/journey.json` supplies the current chapter copy. Routes and module ownership are documented in [the codebase guide](CODEBASE_GUIDE.md), and story edits are documented in [the story guide](STORY_WRITER.md).

## Data and trust boundaries

- **Auth and profile:** Supabase Auth manages email and Google sessions. Public profile fields and private preferences are kept separately.
- **Progress:** guests use device storage; signed-in progress merges with Supabase so a failed sync cannot wipe local completions.
- **Story:** current chapter scenes ship with the frontend. The older Aether-led database story remains as historical content and is not the current Storybook source.
- **Sparks:** wallet, ledger, unlocks, code hashes, redemptions, and test-access records live in Supabase. Browser users call constrained RPCs; RLS prevents direct balance writes.
- **Purchases:** there is no live checkout. A future paid balance must be issued by a trusted server/Edge Function after provider webhook verification. Never expose a service-role or secret key to the browser.
- **Referral:** codes can store campaign/referrer attribution. Referral qualification and payouts are not implemented.
- **Community:** signed-in members use the chat policies; reports and moderation state require trusted dashboard/admin handling.

## Setup, schema, and release

- Follow [Supabase setup](../SUPABASE_SETUP.md) for project keys, OAuth, and deployment configuration.
- Follow [migration guide](MIGRATIONS.md) for dependencies and the current missing Spark tables/content repair.
- The local app uses `npm run dev`; `npm test` and `npm run build` run before release. GitHub Pages deploys through `.github/workflows/deploy.yml`.
- `server/index.js` and several old screen prototypes are retained for reference. They are not the deployed authentication backend; do not expose that demo server publicly.

## Music and access

The music tool searches Openverse CC0/CC BY tracks and displays the source/license link. Three included synthesized soundscapes remain available if the external catalog fails. Audio never starts automatically. Keyboard focus, reduced motion, dialog behavior, and accessibility validation limits are in [Accessibility notes](ACCESSIBILITY.md).

## Validation record

See [the validation log](VALIDATION.md) for actual local test/build results and separately recorded hosted checks. A local PostgreSQL test is not a live Supabase test, and a successful build is not a deployment.
