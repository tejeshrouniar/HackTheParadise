/** Lesson IDs remain stable so existing quest and reading progress survives the new edition. */
export const CORE_FRAGMENTS = [
  { lesson: 1, name: "Awakening", place: "Arcane Academy" },
  { lesson: 2, name: "Restoration", place: "Alchemical Storage" },
  { lesson: 3, name: "Growth", place: "Repeating Grove" },
  { lesson: 4, name: "Connection", place: "Sky Citadel" },
  { lesson: 7, name: "Memory", place: "Chrono Vault" },
];
export const CHAPTER_OUTCOMES: Record<number, string> = {
  1: "The first fragment slips into an empty shape in the book. A lantern wakes above the academy door. You have written his first spell—and the world has answered.",
  2: "The glass clears. The second fragment rises from the bottle, and the book grows warmer in your hands. Beyond the window, the grove is waiting.",
  3: "Six flowers open. Light runs along their roots, and the ancient tree releases the third fragment. The grove answers with its first birdsong in years.",
  4: "Four tiles settle into place. You cross to the citadel and retrieves the fourth fragment. Its bell rings once, clear enough to reach the valley below.",
  5: "All three runes shine. The crypt unlocks with a soft click. You leave the corrected spell where the next traveller can find it.",
  6: "The rings align. Two hundred units of flux steady the doorway, and You step through into the strange stillness of the Chrono Vault.",
  7: "The crystals fall into order. Rain drops toward the floor again, and the vault opens. The fifth fragment joins the others in the book. The way to the Core is clear.",
  8: "The last binding breaks. The five fragments return to the Core, and light moves through Eldoria like a held breath finally released. Malachar’s staff falls silent. You close the book, then opens the academy doors. The legendary SpellScript was never meant to belong to one wizard.",
};
export function chapterOutcome(lesson: number, completed: number[]) {
  if (
    lesson === 8 &&
    !CORE_FRAGMENTS.every((f) => completed.includes(f.lesson))
  ) {
    return "Malachar’s binding is broken. The Core is free—but its missing fragments still need you. Visit the remaining fragment quests in your field guide to bring Eldoria’s light home.";
  }
  return CHAPTER_OUTCOMES[lesson];
}
