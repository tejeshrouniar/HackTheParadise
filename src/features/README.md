# Feature folder map

Feature folders contain cohesive user-facing areas. Keep route wiring in `src/layouts/AppShell.tsx`; shared UI primitives belong under `src/components/ui/`; current quest and story data belongs under `src/content/` or `src/data/` as identified in [the codebase guide](../../docs/CODEBASE_GUIDE.md).

| Folder | Responsibility | Entry points |
| --- | --- | --- |
| `adventure/` | The Cinder walking route, avatar selection, pixel character rendering, and shared scene landmarks | `JourneyTrail.tsx`, `CharacterStudio.tsx`, `AvatarGraphic.tsx` |
| `chat/` | Community rooms, realtime messages, reporting, suggestions | `ChatPage.tsx`, `Suggestions.tsx` |
| `learning/` | The single playable World Map for Cinder and Harry Potter, sequential level entry, quest progression, book-level route, interpreter hook, post-quest scene, Spark wallet | `Dashboard.tsx`, `WorldMap.tsx`, `WizardingWalk.tsx`, `BookLevelPage.tsx`, `useQuestEngine.ts`, `QuestAftermath.tsx`, `useHintWallet.ts` |
| `profile/` | Public player profile and onboarding | `ProfileContext.tsx`, `ProfileForm.tsx` |
| `settings/` | Private preferences and account settings | `SettingsPage.tsx`, `PreferencesContext.tsx` |
| `story/` | Cinder’s chapter scenes and Harry Potter’s completed-level film reel; the Harry Potter coding spread is mounted on the book-level route | `StoryPage.tsx`, `JourneyCinema.tsx`, `BookCutscene.tsx`, `StorybookVolume.tsx`, `useBookProgress.ts` |
| `tools/` | Soundtrack, timer, notes, snippets, and references | `ToolsDrawer.tsx`, `MusicContext.tsx`, `StudyItems.tsx` |

Prefer adding a feature to its existing owner over creating parallel implementations in `src/components/`. Keep server authority and data ownership in Supabase migrations/RPCs, not in UI state.
