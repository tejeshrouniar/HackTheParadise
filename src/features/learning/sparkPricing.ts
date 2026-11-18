export type UnlockKind = "hint" | "solution";

// Display prices mirror spend_sparks. The database decides the charge.
export function sparkPrice(bookId: string, kind: UnlockKind) {
  if (bookId === "harry-potter") return kind === "hint" ? 0 : 10;
  return kind === "hint" ? 10 : 20;
}
