import { WorldMap } from "./WorldMap";

/** The World Map is the only progression hub; the old Home trail duplicated it. */
export default function Dashboard({
  bookId,
  onBookChange,
  onQuest,
  onOpenBookChapter,
}: {
  bookId: string;
  onBookChange: (id: string) => void;
  onQuest: (id: number) => void;
  onOpenBookChapter: (bookId: string, chapterId: string) => void;
}) {
  return (
    <div className="sc-page sc-world-map-page">
      <WorldMap
        bookId={bookId}
        onBookChange={onBookChange}
        onQuest={onQuest}
        onOpenBookChapter={onOpenBookChapter}
      />
    </div>
  );
}
