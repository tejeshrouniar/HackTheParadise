# Renovation validation — 3 November 2026

## Executed

- `npm test`: **21 passing tests**, including all eight quest solutions, function/loop semantics, parameter calculations, invalid code limits, stable story IDs, username normalization and progress merging.
- Database tests execute all three migrations in disposable PostgreSQL (PGlite). They cover migration preservation, old-account/new-account onboarding flags, actual unique/check constraints, Supabase-style default grants, cross-user RLS, private notes/preferences/progress, server-derived achievements, chat author/report/delete permissions, rate limits, avatar folder ownership, and guest restrictions. These tests use local auth/storage schema fixtures; they are not hosted-service tests.
- `npm run build`: TypeScript and production build pass. Features are split into lazy chunks; the largest JavaScript chunk is approximately 272 kB before compression. No oversized-chunk warning remains.
- Compatible Vite security update: 6.4.4 → 6.4.5. `npm audit fix` reported **0 vulnerabilities** afterward.
- Browser: ran **all eight quest solutions**, observed each completion and the count reaching 8/8. The boss shield correctly reached 100. Invalid `dragon.fly()` produced a line-specific error instead of completing the run.
- Browser: saved a guest note, closed the toolkit, navigated, reopened it, and verified the note remained. Started the focus timer, closed the drawer, and observed it continuing when reopened. Reset it after testing.
- Browser: selected a story choice, marked the chapter read, and verified both persisted across the development reload.
- Browser: phone viewport 390×844 and desktop layout inspected; no horizontal document overflow on the phone. Mobile navigation opened/closed correctly and reached the commons. Registration name field, sign-in layout, and Escape-to-close checked.
- Fixed a browser-discovered accessibility issue where a force-mounted modal drawer left the whole page hidden from assistive technology after closing. The drawer now retains its tool state with explicit focus management and background isolation.
- Included synthesized music successfully reached the playing state and paused through its controls. No click-anywhere autoplay remains.
- Captured console showed the expected OS reduced-motion warning; no application exception was observed in those flows.

## External checks and limits

- After the user applied the migrations, live checks returned all eight story chapters, the published story, and three achievements. Google and email providers are enabled. Anonymous requests to profiles, private preferences, and chat returned permission-denied responses, as intended.
- Google and email auth code preserves the existing redirect flow. The Google account chooser was reached with the correct Supabase callback and local return URL. No new live account was created, no real password was reset, and no user's Google account was selected by the agent. The user reported signing in. Further signed-in browser inspection stopped when the computer-use tool could not reliably determine the active Windows browser URL. Actual new/returning user onboarding, avatar uploads and two-user Realtime chat still require authenticated checks.
- The Openverse catalog returned HTTP 200 and `Access-Control-Allow-Origin: *` from the network probe. The embedded browser timed out both on search and on direct navigation to that API. Remote recording playback therefore remains **unverified** here. The application displays the failure and retains the working included soundscapes.
- Storage SQL policies and configured MIME/size limits were tested locally; Supabase Storage's HTTP upload enforcement was not exercised.
- No claim is made that the test account data, avatar uploads, Realtime service or production RLS were verified live. Follow the staging matrix in `RENOVATION.md` after applying migrations.
- Renovation follow-up changes are in the local workspace. No new deployment was initiated by this validation run.
