# Supabase migration guide

Apply migrations in filename order on a clean project. Existing projects should apply only migrations they have not already run; never edit or replay an already-applied historical migration to change live content.

| Migration | Purpose | Depends on |
| --- | --- | --- |
| `202611030001` | Auth/profile and player progress foundation | Supabase Auth |
| `202611030002` | Profiles, preferences, story/chat/study tables, avatar storage rules | 001 |
| `202611030003` | Initial published story and chapter records | 002 |
| `202611030004` | Historical Eldoria story edition update; preserves existing chapter IDs/progress | 003 |
| `202611040005` | Twelve-quest forest campaign and progress support | 002 |
| `202611050006` | Spark wallets, immutable ledger, unlocks, owner read policies, trusted credit RPC | Auth users |
| `202611050007` | Protected hint/solution content and entitlement check | 006 |
| `202611090008` | Hashed redemption codes, campaign attribution, admin tools, unlimited test access | 006–007 |
| `202611090009` | Idempotent repair for wallet/ledger/unlock tables and trusted credit RPC | Auth users; safe after 008 |
| `202611090010` | Seeds the early split Harry Potter adventure chapters | 002–004 |
| `202611100011` | Consolidates those chapters into one Harry Potter book while preserving chapter IDs and progress | 010 |

## Current hosted project check

The initial read-only check on 9 November 2026 found migration 008's protected code/admin objects, but got `PGRST205` (table missing from the `public` schema cache) for `spark_wallets`, `spark_ledger`, `spark_unlocks`, and `spark_content`, and `PGRST202` (function missing) for `get_spark_content`. This showed the wallet foundation and protected lesson content were absent at that time.

The user then applied migration 009 followed by migration 007. A second read-only check returned PostgreSQL `42501` permission-denied responses for the three wallet tables, the protected content table, and `get_spark_content`. These objects now resolve; the publishable role is correctly blocked by the configured grants. The probes used `limit=0` and an unauthenticated RPC call, so no account or lesson rows were read. This confirms the schema objects exist, but a signed-in hint/solution purchase and retrieval still need an app-level smoke check. Do not run 006 after 008, because 006 attempts to create wallet functions that 008 already replaced. The local PostgreSQL test reproduces the missing-table state, applies 009 twice, then exercises wallet, content, and code flows.

## Manual SQL Editor workflow for unapplied migrations

1. Open the desired Supabase project's SQL Editor.
2. Open the migration file in this repository and paste its full contents into a new query.
3. Confirm you are applying only a migration not already present; run one file at a time and in the order above.
4. If repairing the same partial schema as this project had, run `supabase/migrations/202611090009_spark_wallet_foundation_repair.sql` first. It is idempotent and keeps existing account balances/ledger rows.
5. Then run `supabase/migrations/202611050007_spark_content.sql` exactly once. It depends on the `spark_unlocks` table created by 009 and is not safe to replay after it succeeds.
6. In a signed-in app session, refresh Settings → Sparks. Confirm a numeric balance loads, then test a code redemption and a purchased hint/solution.
7. If migration 010 has already been applied, also run `supabase/migrations/202611100011_story_catalog.sql` to show the Harry Potter adventure as one twelve-chapter book. It moves the existing chapter rows without changing their IDs, so saved progress remains attached.

Future storybook migrations should add one story row and its chapter rows under that story’s own stable ID. Keep chapter IDs unique across books, preserve old IDs once released, and do not edit or rerun an applied historical migration to change story content. See [the story authoring guide](STORY_WRITER.md) for the matching frontend catalog workflow.

Add the project owner to `public.spark_admins` through SQL Editor. Use the email on the Supabase Auth account:

```sql
insert into public.spark_admins(user_id)
select id from auth.users
where lower(email) = lower('YOUR_SIGN_IN_EMAIL')
on conflict (user_id) do nothing;
```

This admin allowlist does not grant the browser direct table access. Only authenticated database functions check membership. Never place a database-admin key in the browser. Real purchases must wait for a trusted server/Edge Function that validates the payment provider's signed webhook before calling `credit_sparks`.

## What the tests prove

`tests/database.test.mjs`, `tests/wallet.test.mjs`, and `tests/spark-codes.test.mjs` exercise PostgreSQL schema rules, member isolation, retry-safe accounting, code redemption limits, referral attribution storage, unlimited test access, and the missing-foundation repair using PGlite. They do not connect to hosted Supabase or exercise OAuth provider configuration and payment webhooks.
