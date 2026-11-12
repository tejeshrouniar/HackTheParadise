import { STORY_BOOKS } from "./storyBooks";

/**
 * A bookshelf is a themed room in the library foyer. New collections are data:
 * add one definition here, then assign books to its stable `id` below. The ID
 * type is derived from this catalog so new shelves need no second type edit.
 */
export interface BookshelfDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mark: string;
  accent: string;
  wall: string;
}

export const BOOKSHELVES = [
  { id: "adventures", title: "Adventure stacks", subtitle: "Coding storybooks", description: "Walk into a story, solve its levels, and watch the world respond.", mark: "A", accent: "#e7bd61", wall: "#172634" },
  { id: "tutorial", title: "Beginner wing", subtitle: "Learn by playing", description: "A friendly first path through coding, one small spell at a time.", mark: "T", accent: "#83c99c", wall: "#183329" },
  { id: "personal", title: "Personal archive", subtitle: "Your library tools", description: "Shape your avatar, account, and the way your library feels.", mark: "P", accent: "#90b7e5", wall: "#202a3b" },
  { id: "guild", title: "Guild hall", subtitle: "People and ideas", description: "Share suggestions, ask questions, and find your way to the team.", mark: "G", accent: "#e2a276", wall: "#362322" },
] as const satisfies readonly BookshelfDefinition[];

export type BookshelfId = (typeof BOOKSHELVES)[number]["id"];

export function getBookshelf(id: string): BookshelfDefinition {
  return BOOKSHELVES.find((bookshelf) => bookshelf.id === id) ?? BOOKSHELVES[0];
}

export interface LibraryBook {
  id: string;
  title: string;
  coverColor: string;
  shelf: BookshelfId;
  subtitle: string;
  mark: string;
  route: string;
  storyId?: string;
  chapters: readonly { id: string; title: string }[];
}

/** Shelf metadata only. Runners, progress IDs and protected Spark content stay
 * with the story catalog and database; adding a cover never grants progress. */
export const LIBRARY: readonly LibraryBook[] = [
  { id: "theme", title: "Theme Magic", coverColor: "#263d6b", shelf: "personal", subtitle: "Make it yours", mark: "✧", route: "library/theme", chapters: [] },
  { id: "lore", title: "Story Lore", coverColor: "#50345d", shelf: "personal", subtitle: "The story archive", mark: "☾", route: "library/lore", chapters: [] },
  { id: "profile", title: "Wizard Profile", coverColor: "#2e4e4c", shelf: "personal", subtitle: "Your adventurer", mark: "◇", route: "library/profile", chapters: [] },
  { id: "account", title: "Account & Sparks", coverColor: "#51402c", shelf: "personal", subtitle: "Your saved magic", mark: "ϟ", route: "library/account", chapters: [] },
  ...[...STORY_BOOKS].sort((a, b) => Number(a.kind !== "journey") - Number(b.kind !== "journey")).map((book): LibraryBook => ({
    id: book.id,
    title: book.title,
    coverColor: book.coverColor,
    shelf: book.kind === "journey" ? "tutorial" : "adventures",
    subtitle: book.kind === "journey" ? "START HERE · TUTORIAL" : "THE CODING ADVENTURE",
    mark: book.coverMark,
    route: `book/${book.id}`,
    storyId: book.id,
    chapters: book.kind === "journey"
      ? book.chapters.map((chapter) => ({ id: chapter.title, title: chapter.title }))
      : book.chapters.map((chapter) => ({ id: chapter.chapterId, title: chapter.chapterTitle })),
  })),
  { id: "contact", title: "Contact Guild", coverColor: "#394038", shelf: "guild", subtitle: "Get in touch", mark: "✉", route: "library/contact", chapters: [] },
  { id: "community", title: "Suggest Spells", coverColor: "#6b3a30", shelf: "guild", subtitle: "Community & ideas", mark: "✦", route: "community", chapters: [] },
];
