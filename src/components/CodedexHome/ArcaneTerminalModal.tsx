import { useEffect, useRef, useState } from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { Modal } from "../ui/Modal";
import {
  compileQuestCode,
  QuestCodeError,
  type QuestInstruction,
} from "../../features/learning/questCompiler";

const examples = [
  {
    name: "Variables",
    code: "mana_flask = 3\nstar_dew = 2\ncauldron.brew_elixir()",
  },
  { name: "Loops", code: "for flower in range(3):\n    grow_flower()" },
  {
    name: "Functions",
    code: "def build_path():\n    for tile in range(4):\n        place_starlight_tile()\n\nbuild_path()",
  },
];
function describe(step: QuestInstruction) {
  if (step.name.startsWith("assign:"))
    return `${step.name.slice(7)} = ${JSON.stringify(step.args[0])}`;
  return `${step.name.replace("dragon.", "aether.").replace("holy_smite", "restore_core")}(${step.args.map((value) => JSON.stringify(value)).join(", ")})`;
}

// Keep the established entry point compatible with older home components.
export function ArcaneTerminalModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuest: (id?: number) => void;
  isDarkMode: boolean;
}) {
  const [example, setExample] = useState(0);
  const [code, setCode] = useState(examples[0].code);
  const [steps, setSteps] = useState<QuestInstruction[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(
    "Choose an example, change a value, then run it.",
  );
  const [running, setRunning] = useState(false);
  const token = useRef(0);
  useEffect(
    () => () => {
      token.current++;
    },
    [],
  );
  function stop() {
    token.current++;
    setRunning(false);
    setStatus("Stopped. Your code is still here.");
  }
  function close() {
    stop();
    onClose();
  }
  async function run() {
    const runToken = ++token.current;
    setSteps([]);
    setError("");
    setRunning(true);
    try {
      const compiled = compileQuestCode(code);
      if (!compiled.length) {
        setStatus("Write a spell first. The examples above can help.");
        return;
      }
      for (const [index, step] of compiled.entries()) {
        if (token.current !== runToken) return;
        setSteps((previous) => [...previous, step]);
        setStatus(`Step ${index + 1} of ${compiled.length}`);
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
      if (token.current === runToken)
        setStatus(
          `Finished — ${compiled.length} spell steps. Nothing saved to your quests.`,
        );
    } catch (err) {
      if (token.current !== runToken) return;
      setError(
        `${err instanceof QuestCodeError ? `Line ${err.line + 1}: ` : ""}${err instanceof Error ? err.message : "This spell could not run."}`,
      );
      setStatus("Check your spell and try again.");
    } finally {
      if (token.current === runToken) setRunning(false);
    }
  }
  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="Spell practice"
      description="A place to experiment with SpellScript. See the steps your code creates, without changing quest progress."
      wide
    >
      <div
        className="sc-practice-tabs"
        role="group"
        aria-label="Practice examples"
      >
        {examples.map((item, index) => (
          <button
            key={item.name}
            disabled={running}
            aria-pressed={example === index}
            onClick={() => {
              setExample(index);
              setCode(item.code);
              setSteps([]);
              setError("");
              setStatus("Change a value, then run your spell.");
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="sc-practice-workspace">
        <div>
          <label htmlFor="practice-code">Your code</label>
          <textarea
            id="practice-code"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            value={code}
            readOnly={running}
            maxLength={20000}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (!running) void run();
              }
            }}
          />
        </div>
        <section aria-label="Spell steps">
          <h3>What happens</h3>
          {steps.length ? (
            <ol>
              {steps.map((step, index) => (
                <li key={index}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <code>{describe(step)}</code>
                  <small>line {step.line + 1}</small>
                </li>
              ))}
            </ol>
          ) : (
            <p className="sc-practice-empty">
              Your spell’s steps will appear here.
            </p>
          )}
        </section>
      </div>
      {error && (
        <p className="sc-code-error" role="alert">
          {error}
        </p>
      )}
      <div className="sc-practice-footer">
        <p role="status">{status}</p>
        <button
          className="sc-icon-button"
          aria-label="Reset practice example"
          disabled={running}
          onClick={() => {
            setCode(examples[example].code);
            setSteps([]);
            setError("");
            setStatus("Example restored.");
          }}
        >
          <RotateCcw size={17} />
        </button>
        {running ? (
          <button className="sc-button secondary" onClick={stop}>
            <Square size={15} />
            Stop
          </button>
        ) : (
          <button className="sc-button mint" onClick={() => void run()}>
            <Play size={16} />
            Run spell
          </button>
        )}
      </div>
      <p className="sc-practice-note">
        Uses the same limited teaching language as the quests: numbers, lists,
        loops and spell functions.
      </p>
    </Modal>
  );
}
