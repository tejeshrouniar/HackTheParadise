import { ExternalLink } from "lucide-react";
export function References() {
  return (
    <div className="sc-tool-content">
      <h3>A little help, close by.</h3>
      <p className="sc-muted">Python-inspired patterns used in the quests.</p>
      {[
        [
          "Give an instruction",
          "player.move_forward()",
          "An object, a dot, and an action. Parentheses call the action.",
        ],
        [
          "Remember a value",
          "mana = 50",
          "A variable gives a name to a value.",
        ],
        [
          "Repeat an action",
          "for step in range(2):\n    grow_flower()",
          "Indent the action inside the loop by four spaces.",
        ],
        [
          "Make a reusable spell",
          "def build_bridge():\n    place_starlight_tile()\n\nbuild_bridge()",
          "Define what the function does, then call it.",
        ],
        [
          "Sort a collection",
          "crystals.sort()",
          "Lists hold multiple values. Sorting puts them in order.",
        ],
      ].map(([title, code, description]) => (
        <article className="sc-reference" key={title}>
          <h4>{title}</h4>
          <pre>
            <code>{code}</code>
          </pre>
          <p>{description}</p>
        </article>
      ))}
      <a
        className="sc-button secondary"
        href="https://docs.python.org/3/tutorial/"
        target="_blank"
        rel="noreferrer"
      >
        Official Python tutorial
        <ExternalLink size={16} />
      </a>
      <small>
        The quest sandbox supports a small teaching subset. It is not a general
        Python interpreter.
      </small>
    </div>
  );
}
