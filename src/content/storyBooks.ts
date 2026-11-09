import { JOURNEY, type JourneyChapter } from "./journey";
import { BOOK_PUZZLES, type BookPuzzle, type StorybookId } from "./codeCampaign";

interface StoryBookBase {
  /** Stable catalog key used by the shelf and future book-specific settings. */
  id: string;
  title: string;
  subtitle: string;
  description: string;
  theme: string;
  background: string;
  musicTrackId: string;
  coverMark: string;
}

/** The main Cinder campaign remains backed by quest IDs and player_progress. */
export interface JourneyStoryBook extends StoryBookBase {
  id: "cinder";
  kind: "journey";
  chapters: readonly JourneyChapter[];
}

/** Optional coding adventures use stable chapter slugs and story_progress. */
export interface CodingStoryBook extends StoryBookBase {
  id: StorybookId;
  kind: "coding";
  storyId: string;
  chapters: readonly BookPuzzle[];
}

export type StoryBook = JourneyStoryBook | CodingStoryBook;

/**
 * The Storybook shelf is the single catalog for every playable story. A new
 * story gets its own entry, palette, scene backdrop, score, and progress scope;
 * it is never presented as a second volume of another story by default.
 */
export const STORY_BOOKS: readonly StoryBook[] = [
  {
    id: "harry-potter",
    kind: "coding",
    storyId: "harry-potter-horcrux-code",
    title: "Harry Potter: The Horcrux Code",
    subtitle: "Harry Potter · The featured coding adventure",
    description: "Follow Harry’s trail through twelve magical puzzles, from the diary to one final spell.",
    theme: "wizarding",
    background: "wizarding-library",
    musicTrackId: "volume-one-score",
    coverMark: "HP",
    chapters: BOOK_PUZZLES.filter((chapter) => chapter.bookId === "harry-potter"),
  },
  {
    id: "cinder",
    kind: "journey",
    title: "The Last Light",
    subtitle: "Cinder’s road home",
    description: "A gentle starter adventure that teaches the controls and first coding ideas.",
    theme: "cinder",
    background: "lanternwood",
    musicTrackId: "meadow",
    coverMark: "C",
    chapters: JOURNEY,
  },
];

export function isCodingStoryBook(book: StoryBook): book is CodingStoryBook {
  return book.kind === "coding";
}

export function isStorybookId(value: string): value is StorybookId {
  return STORY_BOOKS.some((book) => book.kind === "coding" && book.id === value);
}
