import { BookOpen, Check, Gem } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useProgress } from "../learning/ProgressContext";
import { CORE_FRAGMENTS } from "../../content/eldoria";
import { AETHER_PORTRAIT } from "./StoryArtwork";

export default function AetherGuide({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { completed } = useProgress();
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Aether’s field guide"
      description="Meet the apprentice and follow the five Core fragments."
    >
      <div className="sc-aether-intro">
        <img
          src={AETHER_PORTRAIT}
          width={335}
          height={640}
          alt="Aether, an apprentice in an indigo cloak, holding his spellbook."
        />
        <div>
          <span className="sc-eyebrow">THE APPRENTICE</span>
          <h3>Aether</h3>
          <p>
            He can read the lost language of magic. Learning what to do with it
            is where your adventure begins.
          </p>
          <blockquote>
            “I don’t need to know everything. Just the next instruction.”
          </blockquote>
        </div>
      </div>
      <div className="sc-fragment-heading">
        <BookOpen size={18} />
        <strong>Five pieces of a broken world</strong>
        <span>
          {CORE_FRAGMENTS.filter((f) => completed.includes(f.lesson)).length}/5
        </span>
      </div>
      <div className="sc-fragment-list">
        {CORE_FRAGMENTS.map((fragment) => (
          <div className="sc-fragment-item" key={fragment.lesson}>
            {completed.includes(fragment.lesson) ? (
              <Check size={19} />
            ) : (
              <Gem size={19} />
            )}
            <span>
              <strong>{fragment.name}</strong>
              <small>{fragment.place}</small>
            </span>
            <span className="sc-fragment-status">
              {completed.includes(fragment.lesson)
                ? "Recovered"
                : `Quest ${fragment.lesson}`}
            </span>
          </div>
        ))}
      </div>
      <p className="sc-field-note">
        Fragments are earned by completing their quests. The crypt and stargate
        open the route; the final spell restores the Core.
      </p>
    </Modal>
  );
}
