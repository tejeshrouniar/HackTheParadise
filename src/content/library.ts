import { STORY_BOOKS } from "./storyBooks";

export interface LibraryBook {
  id: string;
  title: string;
  coverColor: string;
  shelf: "personal" | "adventures" | "guild";
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
    id: book.id, title: book.title, coverColor: book.coverColor, shelf: "adventures",
    subtitle: book.kind === "journey" ? "START HERE · TUTORIAL" : "THE CODING ADVENTURE",
    mark: book.coverMark, route: `book/${book.id}`, storyId: book.id,
    chapters: book.kind === "journey"
      ? book.chapters.map((chapter) => ({ id: chapter.title, title: chapter.title }))
      : book.chapters.map((chapter) => ({ id: chapter.chapterId, title: chapter.chapterTitle })),
  })),
  { id: "contact", title: "Contact Guild", coverColor: "#394038", shelf: "guild", subtitle: "Get in touch", mark: "✉", route: "library/contact", chapters: [] },
  { id: "community", title: "Suggest Spells", coverColor: "#6b3a30", shelf: "guild", subtitle: "Community & ideas", mark: "✦", route: "community", chapters: [] },
];
