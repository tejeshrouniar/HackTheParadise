# Repository notes for contributors and coding agents

Read [README.md](README.md), [the codebase guide](docs/CODEBASE_GUIDE.md), and the closest feature notes before editing. Treat `src/content/journey.json` and `src/content/quest-narration.json` as the current story source of truth.

- Keep browser trust boundaries: no service-role/secret keys in `VITE_*`, no client-side currency authority, and no `eval` for learner code.
- Add database changes as a new numbered migration. Do not rewrite migrations already applied to a hosted project. Review dependencies in [docs/MIGRATIONS.md](docs/MIGRATIONS.md).
- Preserve account progress and existing IDs. Keep third-party asset/license notes in `docs/asset-licenses/`.
- Prefer focused module comments and update the source map when ownership or data flow changes; avoid comments that merely repeat a line of code.
- Run `npm test` and `npm run build` after implementation. Describe browser/hosted checks separately from local tests.
- Check keyboard access, visible focus, reduced motion, labels, and responsive layout for UI changes. See [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md).

The `server/` folder and several older screen prototypes are retained for reference. The deployed site is the Vite app; do not expose the old demo server as an authentication backend.
