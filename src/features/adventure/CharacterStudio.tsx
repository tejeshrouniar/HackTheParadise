import { useState } from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useAuth } from "../../contexts/AuthContext";
import { errorMessage } from "../../lib/validation";
import { useAppearance } from "./AppearanceContext";
import {
  appearanceOptions,
  defaultAppearance,
  type Appearance,
} from "./appearance";
import { AvatarGraphic, type SpriteAction } from "./AvatarGraphic";

const labels: Record<keyof Appearance, string> = {
  skin: "Skin tone",
  hair: "Hair color",
  cut: "Hair style",
  outfit: "Outfit",
  accessory: "Accessory",
};
const previewActions: SpriteAction[] = ["idle", "walk", "run", "interact"];

export function CharacterStudio({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { appearance, save } = useAppearance();
  const [draft, setDraft] = useState(appearance);
  const [action, setAction] = useState<SpriteAction>("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    setSaving(true);
    setError("");
    try {
      await save(draft);
      onClose();
    } catch (error) {
      setError(errorMessage(error));
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={saving ? () => {} : onClose}
      title="Create your adventurer"
      description={
        user
          ? "Your character is saved to your Storicode account."
          : "Try your character on this device. Sign in to save a character to your account."
      }
      wide
    >
      <div className="sc-character-studio">
        <div className="sc-character-preview">
          <Sparkles size={17} aria-hidden="true" />
          <svg
            viewBox="0 0 140 140"
            role="img"
            aria-label={`Preview of your ${draft.outfit.toLowerCase()} adventurer`}
          >
            <ellipse cx="70" cy="124" rx="46" ry="9" fill="#0b1a1499" />
            <AvatarGraphic
              appearance={draft}
              action={action}
              directControl={action !== "idle"}
              loop
              direction={action === "idle" ? "down" : "right"}
              x={6}
              y={0}
              size={128}
            />
          </svg>
          <label>
            Preview animation{" "}
            <select
              value={action}
              onChange={(event) =>
                setAction(event.target.value as SpriteAction)
              }
            >
              {previewActions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="sc-character-fields">
          {(Object.keys(labels) as (keyof Appearance)[]).map((key) => (
            <label key={key}>
              {labels[key]}
              <select
                value={draft[key]}
                disabled={saving}
                onChange={(event) =>
                  setDraft({ ...draft, [key]: event.target.value })
                }
              >
                {appearanceOptions[key].map((choice) => (
                  <option key={choice}>{choice}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      {error && (
        <p role="alert" className="sc-character-error">
          {error}
        </p>
      )}
      <div className="sc-character-actions">
        <button
          type="button"
          className="sc-button secondary"
          disabled={saving}
          onClick={() => setDraft(defaultAppearance)}
        >
          <RotateCcw size={15} /> Reset look
        </button>
        <button
          type="button"
          className="sc-button mint"
          disabled={saving}
          onClick={() => void apply()}
        >
          <Check size={16} />
          {saving ? "Saving…" : "Save character"}
        </button>
      </div>

    </Modal>
  );
}
