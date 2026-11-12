const marks = {
  theme: ["00010000", "00010010", "01111100", "00111000", "00010000", "00100000", "01000000", "10000000"],
  lore: ["00000000", "11101110", "10101010", "10101010", "10101010", "11111110", "00010000", "00000000"],
  profile: ["00111000", "01111100", "01111100", "00111000", "00010000", "00111000", "01111100", "11111110"],
  account: ["00111000", "01000100", "01000100", "11111110", "11101110", "11101110", "11111110", "00000000"],
  contact: ["00000000", "11111111", "11000011", "10100101", "10011001", "10000001", "11111111", "00000000"],
  settings: ["01000010", "01000010", "11100111", "11100010", "01000010", "01000111", "11100010", "01000010"],
  community: ["00000000", "01111110", "11111111", "11010111", "11111111", "01111110", "00110000", "00100000"],
} as const;

export type PixelJournalKind = keyof typeof marks;

/** Each stamp is drawn on an eight-cell grid at four pixels per cell. */
export function PixelJournalMark({ kind }: { kind: PixelJournalKind }) {
  return <span className="htp-journal-mark" aria-hidden="true">
    {marks[kind].flatMap((row, y) => Array.from(row, (pixel, x) =>
      pixel === "1" ? <i key={y * 8 + x} style={{ gridColumn: x + 1, gridRow: y + 1 }} /> : null,
    ))}
  </span>;
}
