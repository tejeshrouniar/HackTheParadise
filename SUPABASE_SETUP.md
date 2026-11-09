# Storicode Supabase setup

Use this guide for setup and [the migration guide](docs/MIGRATIONS.md) for schema dependencies and the verified state of the current project. Existing installations should run only migrations they have not already applied.

## 1. Create the project and connect the app

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Project Settings → API Keys**, copy the **Project URL** and the **publishable** key (the legacy `anon` key also works).
3. Create `.env.local` in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Restart the development server after saving the file. `.env.local` is ignored by Git. Never put a `service_role` or secret key in a browser app.

## 2. Run the database migrations

In Supabase, open **SQL Editor → New query**, paste and run:

Run each un-applied migration listed in [the migration guide](docs/MIGRATIONS.md) through **SQL Editor → New query**, one file at a time in filename order. Do not rerun migrations already applied to an existing project.

The migrations create user profiles, cloud lesson progress, the account Spark wallet, the immutable ledger, protected hint/solution unlocks, hashed reward codes, code redemption history, and audited unlimited test access. Row-level security keeps each signed-in player inside their own account. Migration 009 is safe after 008; it creates only missing wallet tables and restores their owner-only policies while preserving existing rows.

**Recovery for the currently configured project:** the user applied migration 009, then 007. A follow-up read-only check confirmed the wallet/content tables and `get_spark_content` RPC now resolve; the public browser key receives PostgreSQL `42501` permission denials, as intended for these protected objects. No rows were read. Do not rerun 006, 007, or 008. A signed-in app check of balance, code redemption, and hint/solution retrieval remains. The verification and local test coverage are recorded in [docs/MIGRATIONS.md](docs/MIGRATIONS.md).

After the recovery migrations or a full ordered setup, make your own account a Spark admin from **SQL Editor**. Replace the email below with the email you use to sign in to Storicode:

```sql
insert into public.spark_admins(user_id)
select id from auth.users where lower(email) = lower('YOUR_SIGN_IN_EMAIL')
on conflict (user_id) do nothing;
```

Sign out and back in, then open **Settings → Sparks → Developer Sparks tools**. Admins can mint 100 or 200 Spark codes, choose their use limit/expiry, copy them once, revoke them, and grant or remove unlimited hint/solution access for a testing account. Redeemed codes are credited through the immutable ledger; unlimited test access does not alter a numeric balance. Promotion/referral campaign labels and referrer attribution are recorded for later referral work, but referral qualification and referral payouts are not active yet.

The browser can redeem a code or spend sparks through authenticated RPCs, but it cannot mint codes or credit itself. Real-money credits must later be issued by a trusted server or Supabase Edge Function after the payment provider webhook verifies the payment. The frontend never receives a service-role key.

## 3. Enable email accounts

Email and password sign-up/sign-in are handled by Supabase Auth. Email confirmation follows the project's **Authentication → Providers → Email** setting. Add the local origin shown by Vite to **Authentication → URL Configuration → Redirect URLs**. The default is `http://localhost:3000/`; add `http://127.0.0.1:3000/` and the `:3010` variants only if you use those local URLs.

## 4. Enable Google sign-in

1. In Google Cloud Console, create an OAuth client with application type **Web application**.
2. Add these app origins under **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - The `http://localhost:3010` and `http://127.0.0.1:3010` origins if Vite is using its fallback port
   - `https://tejeshrouniar.github.io`
3. Copy the callback URL shown on Supabase's **Authentication → Providers → Google** page into Google's **Authorized redirect URIs**. For this project it is `https://qlptlxzrnvrahanlordb.supabase.co/auth/v1/callback`. The callback belongs here; the Storicode Pages URL belongs in Supabase's Redirect URLs.
4. Put Google's client ID and client secret into the Supabase Google provider settings and enable the provider. Keep the Google client secret in Supabase only.
5. Add the local app URLs you use and the deployed app URL to Supabase's **Authentication → URL Configuration → Redirect URLs**:
   - `http://localhost:3000/`
   - `http://127.0.0.1:3000/`
   - `http://localhost:3010/` and `http://127.0.0.1:3010/` if you use the fallback port
   - `https://tejeshrouniar.github.io/SpellScript/`

Set the **Site URL** to `https://tejeshrouniar.github.io/SpellScript/`. The app sends the current app path as the OAuth redirect, so the Pages `/SpellScript/` path is preserved after Google returns.

## 5. Deploying

Open the GitHub repository's **Settings → Secrets and variables → Actions → Variables** and add:

- `VITE_SUPABASE_URL` = the project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the publishable key

The Pages workflow reads these variables when set and has the current public project values as fallbacks, so a deploy still connects if the variables are absent. Browser publishable keys are intended to be public; row-level security protects database rows. Do not add Google client secrets or Supabase service-role keys to the frontend or GitHub Pages build.
