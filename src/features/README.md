# Feature folder map

Feature folders contain cohesive user-facing areas. Keep route wiring in `src/layouts/AppShell.tsx`; shared UI primitives belong under `src/components/ui/`; current quest and story data belongs under `src/content/` or `src/data/` as identified in [the codebase guide](../../docs/CODEBASE_GUIDE.md).

| Folder | Responsibility | Entry points |
| --- | --- | --- |
| `adventure/` | The Cinder walking route, avatar selection, pixel character rendering, and shared scene landmarks | `JourneyTrail.tsx`, `CharacterStudio.tsx`, `AvatarGraphic.tsx` |
| `chat/` | Community rooms, realtime messages, reporting, suggestions | `ChatPage.tsx`, `Suggestions.tsx` |
| `learning/` | Book-launched level routes using one preset-driven walking map, sequential level entry, shared coding editor and completion spread, book-specific interpreters, and book-scoped Spark wallet | `Dashboard.tsx`, `WorldMap.tsx`, `bookWalkPresets.ts`, `WalkableBookMap.tsx`, `BookLevelPage.tsx`, `CodingEditorPanel.tsx`, `BookCompletionSpread.tsx`, `useQuestEngine.ts`, `QuestAftermath.tsx`, `useHintWallet.ts` |
| `library/` | Library room, unified bookshelf, first visit play guide, navigation bookmarks, shared page turns and utility journals. Book metadata lives in `src/content/library.ts`. | `LibraryEntrance.tsx`, `FirstVisitGuide.tsx`, `LibraryBookmarks.tsx`, `Grimoire.tsx`, `LibraryUtilityPage.tsx` |
| `profile/` | Public player profile and onboarding | `ProfileContext.tsx`, `ProfileForm.tsx` |
| `settings/` | Private preferences and account settings | `SettingsPage.tsx`, `PreferencesContext.tsx` |
| `story/` | Shared book hub, story readers, and Harry Potter spell playback and chapter films | `StoryPage.tsx`, `BookHubPage.tsx`, `JourneyCinema.tsx`, `BookVideoLibrary.tsx`, `WizardingExecutionStage.tsx`, `ChapterCompletionFilm.tsx`, `StorybookVolume.tsx`, `useBookProgress.ts` |
| `tools/` | Soundtrack, timer, notes, snippets, and references | `ToolsDrawer.tsx`, `MusicContext.tsx`, `StudyItems.tsx` |

Prefer adding a feature to its existing owner over creating parallel implementations in `src/components/`. Keep server authority and data ownership in Supabase migrations/RPCs, not in UI state.
