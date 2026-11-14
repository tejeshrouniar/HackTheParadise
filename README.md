
# 🏝️ Hack The Paradise

### Turn Coding Into an Adventure. Explore Magical Worlds. Cast Your First Spell.

**Hack The Paradise** (formerly **Storicode**) is a browser-based coding adventure that transforms programming education into an immersive collection of interactive storybooks.

Step into a world where code becomes magic, programming concepts become quests, and every successfully solved challenge takes you one step further into an unfolding adventure.

Explore magical landscapes, follow captivating stories, solve coding puzzles, unlock new chapters, and build your programming skills through interactive gameplay.

Whether you're taking your first steps into programming or exploring more advanced coding challenges, there's a story waiting for you.

**Explore. Code. Conquer.**

---

## ✨ Features

- 📚 **Interactive Storybooks:** Explore a growing library of themed coding adventures.
- 🪄 **Learn Through Magic:** Solve programming challenges using a Python-inspired teaching language.
- 🎮 **Adventure-Based Learning:** Explore pixel-art worlds, discover landmarks, and unlock new levels.
- 📖 **Stories That Progress With You:** Unlock chapters, cinematic experiences, and story content as you complete coding quests.
- 🏆 **Track Your Progress:** Earn Sparks, unlock content, and continue your journey across devices.
- 🌍 **Learn at Your Own Pace:** Start as a guest or sign in to synchronize your progress.

---

## 📸 Screenshots

<!-- Add screenshots of the application here -->

<!--
<p align="center">
  <img src="screenshots/entrance.png" width="48%" alt="Library Entrance"/>
  <img src="screenshots/bookshelf.png" width="48%" alt="Storybook Shelf"/>
</p>
<p align="center">
  <img src="screenshots/gameplay.png" width="48%" alt="Adventure Gameplay"/>
  <img src="screenshots/editor.png" width="48%" alt="Coding Editor"/>
</p>
-->

---

## 📚 Explore the Storybooks

Hack The Paradise presents its adventures as a collection of interactive storybooks.

The welcome page introduces the experience, while the **Bookshelf** contains the available storybooks. Open any cover to enter its book hub, where you can choose between **Play Levels** and **Read Story**.

Each book maintains its own theme, scenes, soundtrack, objectives, and progression.

### 🧙 Harry Potter – The Main Adventure

The main coding adventure features twelve sequential coding chapters. Explore a magical world, solve programming challenges, and progress through an unfolding story.

### 🐉 Cinder – The Last Light

A beginner-friendly coding tutorial featuring four regions, each containing three sequential spells. Learn programming fundamentals through guided quests and interactive challenges.

---

## 🎮 What Is Inside the App?

### 1. Play Levels

Enter a book's adventure map and explore its world using your created pixel avatar.

- Arrow keys or A/D to move.
- Shift to run.
- E to interact with nearby levels.
- Touch controls for mobile devices.
- Click-to-walk navigation.
- Chapter list for direct level selection.

Cinder's tutorial contains four regions with three sequential spells each. Harry Potter contains twelve sequential coding chapters.

Completing a level unlocks the next landmark and gradually reveals the fog ahead.

### 2. Interactive Coding Levels

Both Cinder and Harry Potter use the same coding editor interface, including:

- Code editor.
- Run and reset controls.
- Step-by-step guidance.
- Interactive console.
- Spark hint and solution panel.
- Book-specific interpreters and objectives.
- Independent chapter unlocks and progress.

A successfully completed Harry Potter level triggers a scene-specific completion animation on its supplied pixel-art background.

### 3. Bookshelf, Book Hub & Story Reader

The Bookshelf provides a unified experience for discovering and accessing storybooks.

Every book opens the same shared hub layout containing:

- Book information and progress.
- Chapter contents.
- Play Levels.
- Read Story.

The Story Reader is a separate view within each selected book. Harry Potter chapter videos become available as their corresponding coding chapters are completed, subject to video availability.

Completing one book never unlocks or overwrites another book's progress.

### 4. Coding Quests

The learning experience includes:

- A Python-inspired teaching language.
- Interactive programming challenges.
- Step-by-step world feedback.
- Hints and solutions.
- Completion scenes.
- Progressive learning objectives.

### 5. Accounts & Progress

Supabase Authentication supports:

- Email sign-in.
- Google sign-in.
- Guest access.
- Device-local guest progress.
- Account-based progress synchronization.

### 6. Sparks

The Sparks system manages:

- Spark balances.
- Content unlocks.
- Redemption history.
- Administrative testing access.
- Test and promotional codes.

No real-money checkout or referral payout is currently active.

### 7. Tools & Utilities

The Tools bookmark provides access to:

- Music player.
- Focus timer.
- Notes.
- Code references.
- Application settings.

Book transitions support two visual styles:

- Full page flips.
- Gentle fades.

The default transition follows device and in-app motion preferences.

---

## 🛠️ Technology Stack

The project uses a modern web development stack.

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| Vite | Development and build tooling |
| Supabase | Authentication, database and cloud synchronization |
| PostgreSQL | Persistent application data |
| CSS | Styling, animations and transitions |
| GitHub Actions | Automated testing and deployment |
| GitHub Pages | Static application hosting |

---

## 🚀 Getting Started

Follow these steps to run Hack The Paradise locally.

### Prerequisites

- Node.js 22.18 or newer.
- npm.
- Git.

### Installation

Clone the repository:

```bash
git clone https://github.com/tejeshrouniar/HackTheParadise.git
```

Navigate to the project directory:

```bash
cd HackTheParadise
```

Install dependencies:

```bash
npm ci
```

Create your environment file:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**

```bash
cp .env.example .env.local
```

Configure the Supabase credentials in `.env.local` as described below.

Start the development server:

```bash
npm run dev
```

Vite starts at:

```text
http://localhost:3000
```

If the default port is occupied, use the URL printed in your terminal.

The application can run as a guest without Supabase credentials. Account authentication, cloud synchronization, and Sparks require a configured Supabase project.

---

## 🗄️ Configure Supabase

Hack The Paradise uses Supabase for authentication, persistent data, progress synchronization, and Sparks.

Add the following environment variables to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Replace the placeholder values with your actual Supabase project URL and publishable key.

**Security Notice:**

Never expose a Supabase secret key or `service_role` key in the browser application.

### Database Migrations

Apply the schema migrations in filename order.

Important migration notes:

- Migration `009` repairs Spark wallet tables when migration `008` exists but the earlier wallet foundation is missing. It is safe after `008` and preserves existing rows.
- Projects that have already applied migration `010` should apply `supabase/migrations/202611100011_story_catalog.sql` to combine the earlier six-and-six Harry Potter chapter rows into one twelve-chapter book.
- New projects should apply all migrations in filename order.
- Apply `supabase/migrations/202611100012_book_scoped_spark_content.sql` after the existing Sparks migrations to store Harry Potter hints and solutions under its own book ID.

Both Harry Potter and Cinder start their lesson numbering at 1. The database uses `(book_id, lesson_id)` to ensure that the two books maintain independent unlocks.

The migration preserves existing balances, Cinder unlocks, and story progress.

Until the storybook migrations are applied, coding-book progress is saved locally in the browser.

For Google OAuth configuration, refer to:

[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)

---

## 🧪 Verify Changes

Before submitting changes, run the following commands:

```bash
npm test
npm run build
```

### Testing

`npm test` runs:

- Compiler checks.
- Progression tests.
- Sprite tests.
- Content validation.
- Disposable PostgreSQL/RLS checks.

These tests do not contact production.

### Production Build

`npm run build` runs TypeScript checks and generates the deployable `dist/` directory.

---

## 📖 Adding a Future Storybook

Hack The Paradise is designed to support additional coding storybooks.

Each new story should be registered as an independent entry in:

[`src/content/storyBooks.ts`](src/content/storyBooks.ts)

Provide every story with:

- A stable book ID.
- Its own visual theme.
- Background key.
- Soundtrack ID.
- Cover artwork.
- Chapter list.

A story should have one book of its own. Do not split a single story into multiple books simply to represent chapter groups.

### Important Source Files

| File | Responsibility |
|---|---|
| `src/content/storyBooks.ts` | Storybook catalog |
| `StoryPage.tsx` | Bookshelf and story-reader views |
| `BookHubPage.tsx` | Shared book landing page |
| `src/features/learning/bookWalkPresets.ts` | Adventure map configurations |
| `WorldMap.tsx` | Book-specific completion IDs and level routing |
| `WalkableBookMap.tsx` | Movement, navigation, progression and fog |
| `CodingEditorPanel` | Shared coding editor interface |
| `src/styles/storybooks.css` | Storybook themes and scene styling |
| `src/services/music.ts` | Synthesized soundtrack registration |

### Adding a New Adventure Map

Add the book's walk-map preset to:

`src/features/learning/bookWalkPresets.ts`

Group stable level IDs into visual regions and configure:

- Background.
- Optional ground artwork.
- Chapter label.
- Region title.
- Stop artwork.

`WalkableBookMap.tsx` handles shared movement, keyboard, touch and pointer controls, sequential gates, fog, progress display, and the accessible level directory.

Keep progression sequential and let completed groups reveal the route ahead.

Do not introduce another Home page, top-level map link, or duplicate level launcher.

### Adding a New Coding Book

For a new coding storybook:

1. Add original chapter content and sandbox tests to its content module.
2. Create a numbered Supabase migration for the story and chapter records.
3. Add protected Spark hint and solution content.
4. Assign a unique story ID and stable chapter slugs.
5. Connect the book's safe interpreter and themed live scenes to the shared `CodingEditorPanel`.
6. Configure the theme and scene backgrounds in `src/styles/storybooks.css`.
7. Select an existing soundtrack or register a new synthesized track in `src/services/music.ts`.

Each book can number lessons from 1 because `sparkLessonId` is paired with the story ID in the database.

Never reuse chapter slugs or reset progress in an already-applied migration.

### Progression & Architecture Notes

- Book selection is shared across routes through `AppShell`.
- Book selection persists on the device and controls the application-wide theme.
- Cinder is the tutorial example, with four regions defined through `journey.json`.
- Harry Potter is the coding-book example, with twelve stable chapter slugs defined through `codeCampaign.ts`.
- The earlier `JourneyTrail.tsx` and `WizardingWalk.tsx` components are legacy implementations, not active map routes.
- The page-turn effect uses native CSS and respects reduced-motion settings.
- The supplied Windows page-turn utility is not a runtime dependency.

---

## 🎬 Story Videos & Media

Optional video metadata can be registered in:

`src/content/bookMedia.ts`

Each entry is keyed by book ID and stable chapter ID.

Supported metadata includes:

- HTTPS or root-relative video source.
- Optional poster image.
- Optional duration.
- Subtitle tracks with source, language, and label.

Harry Potter's `BookVideoLibrary.tsx` appears in the Story Reader, separate from gameplay level results.

### Video Availability

- Chapter videos unlock when the corresponding coding chapter is completed and a video is configured.
- Movie playback requires every chapter to be completed and every required clip to be available.
- Playback uses a single native video element and advances sequentially.
- Playback position is device-local and account-scoped.
- Completion continues to use the existing progress system.

Chapter video files still need to be supplied.

Until an MP4 is configured, the Story Reader displays an appropriate unavailable-media state rather than presenting gameplay animations as movies.

When all clip durations are supplied in seconds, the movie player supports a single seek bar across chapters.

For deployment under a subpath, use full HTTPS media URLs. HTTPS video and WebVTT subtitle hosts must allow the application origin through CORS.

Public media URLs are not DRM-protected or server-protected entitlements.

---

## 🏛️ Library Foyer & Collection Shelves

The initial route `#/entrance` displays the library room.

Select the bookcase to open `#/bookshelf`, which presents:

1. Your Shelf.
2. Storybooks.
3. Community.

Add volumes to the catalog in:

`src/content/library.ts`

Optional artwork can be placed in:

`src/assets/library/cover-<book-id>.webp`

The Storybooks row automatically picks up new entries from the story catalog.

Older collection URLs open the unified bookshelf, while `#/story` and `#/home` open the library room.

### Library Artwork

The wall, bookcase, covers and bookmark use the supplied artwork.

Regenerate artwork crops using:

```bash
node scripts/build-library-art.mjs
```

See the artwork and font documentation:

[`docs/asset-licenses/library-spritesheet.md`](docs/asset-licenses/library-spritesheet.md)

---

## 📂 Project Documentation

Explore the following documents for additional technical information.

| Document | Description |
|---|---|
| [Codebase Guide](docs/CODEBASE_GUIDE.md) | Route flow, source-of-truth files, module ownership and data boundaries |
| [Feature Map](src/features/README.md) | Responsibilities of individual feature folders |
| [Migration Guide](docs/MIGRATIONS.md) | Database migration order, dependencies and hosted-project repairs |
| [Accessibility Notes](docs/ACCESSIBILITY.md) | Keyboard navigation, motion, focus and known validation gaps |
| [Story Authoring](docs/STORY_WRITER.md) | Story catalog, chapter progression, themes, backgrounds and narration sources |
| [Validation Record](docs/VALIDATION.md) | Tests performed and outstanding hosted/browser verification |
| [Asset Licenses](docs/asset-licenses/) | Licensing information for included third-party artwork |

---

## 🚢 Deployment

The project includes a GitHub Actions workflow:

`.github/workflows/deploy.yml`

The workflow runs tests, builds the static site, and prepares it for GitHub Pages deployment.

A successful local build does not automatically publish the application.

Publishing requires either:

- A push to the configured deployment branch.
- A manual GitHub Actions workflow run.

Ensure that deployment environment variables and GitHub Pages settings are configured correctly.

---

## 🤝 Contributing

Hack The Paradise is a collaborative project, and contributions are welcome!

Whether you're a developer, designer, educator, storyteller, or someone passionate about making programming education more engaging, there are many ways to contribute.

### How to Contribute

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the test suite and production build.
5. Commit your changes with a meaningful message.
6. Submit a Pull Request describing your contribution.

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

Please ensure that your contributions:

- Follow the existing project architecture.
- Preserve independent storybook progression.
- Include appropriate tests where applicable.
- Respect accessibility and reduced-motion preferences.
- Use properly licensed assets.
- Never expose secret keys or sensitive credentials.

---


## 👥 Meet the Contributors

Hack The Paradise is built through collaboration, creativity, and a shared passion for making programming education engaging and accessible.

<p align="center">
  <a href="https://github.com/tejeshrouniar">
    <img src="https://avatars.githubusercontent.com/u/263394438?v=4" width="100" height="100" alt="Tejesh Rouniar"/>
  </a>
  <br/>
  <strong><a href="https://github.com/tejeshrouniar">Tejesh Rouniar</a></strong>
  <br/>
  <sub>@tejeshrouniar</sub>
</p>

<p align="center">
  <a href="https://github.com/pratyusha230607-afk">
    <img src="https://avatars.githubusercontent.com/u/341763350?v=4" width="100" height="100" alt="Pratyusha Purohit"/>
  </a>
  <br/>
  <strong><a href="https://github.com/pratyusha230607-afk">Pratyusha Purohit</a></strong>
  <br/>
  <sub>@pratyusha230607-afk</sub>
</p>

<p align="center">
  <a href="https://github.com/aloksingh2007k">
    <img src="https://avatars.githubusercontent.com/u/244542450?v=4" width="100" height="100" alt="Alok Singh"/>
  </a>
  <br/>
  <strong><a href="https://github.com/aloksingh2007k">Alok Singh</a></strong>
  <br/>
  <sub>@aloksingh2007k</sub>
</p>

<p align="center">
  <a href="https://github.com/amarcrj">
    <img src="https://github.com/amarcrj.png" width="100" height="100" alt="Amar Sinha"/>
  </a>
  <br/>
  <strong><a href="https://github.com/amarcrj">Amar Sinha</a></strong>
  <br/>
  <sub>@amarcrj</sub>
</p>

<p align="center">
  <a href="https://github.com/tejeshrouniar/HackTheParadise/graphs/contributors">
    <strong>View all contributors →</strong>
  </a>
</p>

*Every adventure is built through collaboration, creativity, and a shared passion for learning.*

---

## 📜 Credits & Acknowledgements

We acknowledge the creators of third-party artwork, fonts, libraries, and other resources used in this project.

Please refer to [`docs/asset-licenses/`](docs/asset-licenses/) for detailed licensing information.

The project also supports optional social and community links at build time.

Configure the following environment variables with HTTPS profile URLs:

```env
VITE_PROJECT_PATREON_URL=
VITE_PROJECT_INSTAGRAM_URL=
```

---

## 🔐 Security

If you discover a security vulnerability, please avoid publishing sensitive exploit details in a public issue.

Report the issue privately to the project maintainers so it can be investigated and addressed responsibly.

Never commit:

- Supabase secret keys.
- `service_role` credentials.
- Private access tokens.
- Production database credentials.
- Other sensitive environment variables.

---

## 📄 License

Please refer to the repository's license file for the applicable terms of use and distribution.

---

<p align="center">
  <strong>🏝️ Hack The Paradise</strong>
  <br/>
  <em>Where every line of code opens a new adventure.</em>
  <br/><br/>
  ⭐ If you like the project, consider giving the repository a star!
  <br/>
  <a href="https://github.com/tejeshrouniar/HackTheParadise">
    Explore Hack The Paradise on GitHub
  </a>
</p>
