import { WorldMap } from "./WorldMap";

/** The book hub opens this shared, book-scoped level selection. */
export default function Dashboard({
  bookId,
  onQuest,
  onOpenBookChapter,
  onBack,
}: {
  bookId: string;
  onQuest: (id: number) => void;
  onOpenBookChapter: (bookId: string, chapterId: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="sc-page sc-world-map-page">
      <WorldMap
        bookId={bookId}
        onQuest={onQuest}
        onOpenBookChapter={onOpenBookChapter}
        onBack={onBack}
      />
    </div>
  );
}
