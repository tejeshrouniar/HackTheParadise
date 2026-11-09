import { Modal } from "../../components/ui/Modal";
import { JOURNEY } from "../../content/journey";
import { useProgress } from "../learning/ProgressContext";
import { AvatarGraphic } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";

/** A compact, player-centered summary of the four regions and their quest progress. */
export default function PlayerJournal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { completed } = useProgress();
  const { appearance } = useAppearance();

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Your journal"
      description="The road changes with every spell you learn."
    >
      <svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true">
        <AvatarGraphic appearance={appearance} x={32} size={96} />
      </svg>
      <p>
        You carry the last lantern. Restore the road through four regions and
        bring your village back from the mist.
      </p>
      <div className="sc-fragment-list">
        {JOURNEY.map((chapter) => (
          <div className="sc-fragment-item" key={chapter.title}>
            <strong>{chapter.place}</strong>
            <span>
              {chapter.levels.filter((id) => completed.includes(id)).length} / 3
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
