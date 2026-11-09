import { BOOK_PUZZLES, type StorybookId } from "./codeCampaign";

/** Adding a volume here gives it an independent cover, palette, backdrop,
 * soundtrack, and chapter sequence without coupling it to Cinder's campaign. */
export interface StoryBook {
  id: StorybookId;
  storyId: string;
  volume: string;
  title: string;
  subtitle: string;
  description: string;
  theme: "vellum" | "eclipse";
  background: string;
  musicTrackId: string;
  chapters: typeof BOOK_PUZZLES;
}

export const STORY_BOOKS: StoryBook[] = [
  {
    id: "book-one",
    storyId: "ink-and-ember-book-one",
    volume: "Book I",
    title: "The Hidden Relics",
    subtitle: "The Ink and Ember Cycle · Volume One",
    description: "Six strange relics. One sealed academy. A mystery written in code.",
    theme: "vellum",
    background: "candlelit-archive",
    musicTrackId: "volume-one-score",
    chapters: BOOK_PUZZLES.filter((chapter) => chapter.bookId === "book-one"),
  },
  {
    id: "book-two",
    storyId: "ink-and-ember-book-two",
    volume: "Book II",
    title: "The Last Ward",
    subtitle: "The Ink and Ember Cycle · Volume Two",
    description: "The memories return. The final ward needs every key you found.",
    theme: "eclipse",
    background: "moonlit-observatory",
    musicTrackId: "volume-two-score",
    chapters: BOOK_PUZZLES.filter((chapter) => chapter.bookId === "book-two"),
  },
];

export function isStorybookId(value: string): value is StorybookId {
  return STORY_BOOKS.some((book) => book.id === value);
}
