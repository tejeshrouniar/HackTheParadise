# Storicode Supabase setup

**For the renovated platform, follow [the upgrade guide](docs/RENOVATION.md).** Existing installations need migrations `202611030002` and `202611030003`, in that order. Do not rerun the older trigger migration below after applying the upgrade.

## 1. Create the project and connect the app

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **Project Settings → API Keys**, copy the **Project URL** and the **publishable** key (the legacy `anon` key also works).
3. Create `.env.local` in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Restart the development server after saving the file. `.env.local` is ignored by Git. Never put a `service_role` or secret key in a browser app.

## 2. Create the profile and progress tables

In Supabase, open **SQL Editor → New query**, paste and run:

`supabase/migrations/202611030001_storicode_auth_and_progress.sql`

The migration creates user profiles and cloud lesson progress with row-level security so each signed-in player can only read or change their own rows.

## 3. Enable email accounts

Email and password sign-up/sign-in are handled by Supabase Auth. Email confirmation follows the project's **Authentication → Providers → Email** setting. Add both local app addresses to **Authentication → URL Configuration → Redirect URLs**: `http://localhost:3000/` and `http://127.0.0.1:3000/`.

## 4. Enable Google sign-in

1. In Google Cloud Console, create an OAuth client with application type **Web application**.
2. Add these app origins under **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `https://tejeshrouniar.github.io`
3. Copy the callback URL shown on Supabase's **Authentication → Providers → Google** page into Google's **Authorized redirect URIs**. For this project it is `https://qlptlxzrnvrahanlordb.supabase.co/auth/v1/callback`. The callback belongs here; the Storicode Pages URL belongs in Supabase's Redirect URLs.
4. Put Google's client ID and client secret into the Supabase Google provider settings and enable the provider. Keep the Google client secret in Supabase only.
5. Add these app URLs to Supabase's **Authentication → URL Configuration → Redirect URLs**:
   - `http://localhost:3000/`
   - `https://tejeshrouniar.github.io/SpellScript/`

Set the **Site URL** to `https://tejeshrouniar.github.io/SpellScript/`. The app sends the current app path as the OAuth redirect, so the Pages `/SpellScript/` path is preserved after Google returns.

## 5. Deploying

Open the GitHub repository's **Settings → Secrets and variables → Actions → Variables** and add:

- `VITE_SUPABASE_URL` = the project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = the publishable key

The Pages workflow reads these variables when set and has the current public project values as fallbacks, so a deploy still connects if the variables are absent. Browser publishable keys are intended to be public; row-level security protects database rows. Do not add Google client secrets or Supabase service-role keys to the frontend or GitHub Pages build.
