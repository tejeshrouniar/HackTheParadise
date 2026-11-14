# Storybook authoring guide

## The catalog rule

**One story is one book.** Every story on the shelf has its own title, cover, colour theme, backgrounds, soundtrack, chapter order, and progress. A new story is a new book entry; it is not automatically labeled Book I or Book II of an existing story. Only use multiple volumes when the story itself is intentionally a sequel.

The active catalog is `src/content/storyBooks.ts`. `StoryPage.tsx` renders only the shelf or the story reader, depending on route. Every book opens `BookHubPage.tsx`, the shared entry spread with **Play levels** and **Read story** actions. The page surfaces and page-turn effect are in `src/styles/storybooks.css` and `src/styles/library-ui.css`; the Windows book-page-turn utility is not required by the website and must not be shipped as a runtime executable.

| Book | Content source | Progress owner | Reader |
| --- | --- | --- | --- |
| *The Last Light* (Cinder) | `src/content/journey.json` | Existing quest IDs in `ProgressContext` / `player_progress` | `CinderBook` in the Story reader with `JourneyCinema.tsx` |
| *The Horcrux Code* (Harry Potter) | `src/content/codeCampaign.ts` | Stable chapter IDs in `useBookProgress.ts` / Supabase `story_progress` | `BookLevelPage.tsx` for coding; level payoff in `WizardingLevelReveal.tsx`; MP4 films in the Story reader when supplied |

The two books do not share chapter unlocks or completion state. Cinder’s twelve quests do not mark Harry Potter chapters complete; Harry Potter chapters do not advance Cinder’s journey. The book hub’s **Play levels** action opens the selected book’s walkable level route. **Read story** opens that book’s reader, so a chapter’s code task is not duplicated in the story reader.

Both active routes use `src/features/learning/WalkableBookMap.tsx`. Add region groups, stable stop IDs, and per-region background/landmark art in `src/features/learning/bookWalkPresets.ts`; the renderer owns avatar movement, chapter group navigation, sequential fog gates, keyboard/touch/pointer controls, and the non-walking level directory. A region is a navigation area and may contain several code levels. Do not implement a separate map component for a new book unless its interaction model truly differs.

## Add another story

1. **Choose the progress model.** Reuse the quest-backed journey model only when the story is composed of existing playable quest IDs. For an independent coding story, use the coding-book model so its chapter slugs and completions live in `story_progress`.
2. **Write the story as one book.** Add a unique catalog entry in `storyBooks.ts` with an ID, title, short description, `theme`, `background`, `musicTrackId`, and cover mark. Add the chapter content in the matching source. Do not duplicate one story into unrelated shelf entries.
3. **Give it a visual identity.** Add a cover treatment and theme variables in `storybooks.css`. Add a background key and scene-specific treatment for each distinct setting; don’t reuse the same scene colours and props for every chapter. Pixel assets must have a recorded commercial-use license in `docs/asset-licenses/` before they are added.
4. **Give it a soundtrack.** Select an existing track ID from `src/services/music.ts`, or register a new synthesized/free track there. Keep music optional and user-controlled; don’t autoplay audio without a user action.
5. **Make progress stable.** Coding-book chapters need unique, permanent slugs. Add a new numbered migration for its story/chapter rows if cloud progress is needed. Never edit an applied migration or reuse a chapter ID. Use a new migration to rename/reorder/move existing rows, and preserve their IDs so saved progress follows.
6. **Keep access sequential inside that book.** Readers may reopen completed pages; the next page unlocks after the previous chapter. A book’s completion must not gate a different book.
7. **Verify accessibility and behavior.** Check keyboard chapter navigation, visible focus, mobile layout, reduced motion, locked/unlocked progression, and story/music controls. Keep expected interpreter outputs in test fixtures; do not add reference solutions to browser content.

## Coding chapter content

`BookPuzzle` in `codeCampaign.ts` contains short story copy, one lesson, a clear objective, a function name, a per-book `sparkLessonId`, and `PuzzleTestCase` values. `puzzleRunner.ts` is a bounded Python-inspired interpreter, not CPython. Write objectives and examples using constructs it supports; never execute arbitrary Python or JavaScript. A passing solution completes the chapter. Keep expected outputs in tests, not completed code examples in the app. Seed paid hints and solutions in a new migration with `(book_id, lesson_id, kind)` keys; every book may start at lesson 1, and its wallet unlocks stay separate from other books.

The earlier merge stored Harry Potter’s twelve existing chapters as `relics-book-one-01` through `relics-book-one-06` and `relics-book-two-01` through `relics-book-two-06`. Keep those IDs: migration 011 moves them into one book without resetting learners’ progress.

## Cinder story content

`journey.json` is the source for Cinder’s four chapters, chapter summary, place, theme, three quest IDs, stop labels, and three cutscene lines. The chapter level IDs and stops must remain the same length and order. `JourneyCinema.tsx` maps each cutscene beat to movement and Cinder animation; after a quest succeeds, `QuestAftermath.tsx` advances that same scene timeline on the completion spread and attempts the matching `quest-N.wav` narration. If the browser blocks automatic audio, its labeled play control remains available. `quest-narration.json` owns the separate post-quest spoken explanations. Cinder remains the player’s companion; the learner is the protagonist.

## Narration and archival content

Harry Potter coding levels use their supplied 12 pixel-art backgrounds for a short interactive completion payoff. These are gameplay results, not story movies. The Story reader plays the supplied chapter MP4s and continuous movie from `public/media/harry-potter/`, mapped by stable chapter ID in `src/content/bookMedia.ts` and rendered by `BookVideoLibrary.tsx`. For future books, add media there without changing the level completion scene. Do not substitute a looping level animation for a film.

The narration manifest is built from `src/content/journey.json` and `src/content/quest-narration.json`; it does not parse TypeScript. After changing spoken copy, rebuild with:

```powershell
powershell -NoProfile -File scripts/build-narration.ps1
```

Old saga drafts in `src/content/storySagas.ts` are archival and are not displayed as books. Keep archived concepts out of the shelf until they are authored as a complete, independent story entry.
