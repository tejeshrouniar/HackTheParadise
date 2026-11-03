import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Code2,
  Headphones,
  NotebookPen,
  Timer,
  X,
} from "lucide-react";
import { MusicTool } from "./MusicTool";
import { FocusTimer } from "./FocusTimer";
import { StudyItems } from "./StudyItems";
import { References } from "./References";
const tools = [
  { id: "music", label: "Music", Icon: Headphones },
  { id: "timer", label: "Focus", Icon: Timer },
  { id: "notes", label: "Notes", Icon: NotebookPen },
  { id: "snippets", label: "Snippets", Icon: Code2 },
  { id: "reference", label: "Guide", Icon: BookOpen },
];
export default function ToolsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState("music");
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,textarea,select,a[href]",
        ) ?? [],
      ).filter((el) => el.getClientRects().length);
    controls()[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !panel.current?.contains(document.activeElement)
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        close.current();
      }
      if (event.key === "Tab") {
        const elements = controls(),
          first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return (
    <>
      {open && (
        <div
          className="sc-overlay sc-tools-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        ref={panel}
        hidden={!open}
        className="sc-tools-drawer"
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-labelledby="tools-title"
        aria-describedby="tools-description"
      >
        <header>
          <div>
            <h2 id="tools-title">Your little toolkit</h2>
            <p id="tools-description">Make this space work for you.</p>
          </div>
          <button
            onClick={onClose}
            className="sc-icon-button"
            aria-label="Close tools"
          >
            <X size={20} />
          </button>
        </header>
        <nav className="sc-tool-tabs" aria-label="Coding utilities">
          {tools.map(({ id, label, Icon }) => (
            <button
              key={id}
              aria-pressed={active === id}
              className={active === id ? "active" : ""}
              onClick={() => setActive(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sc-tools-body">
          <div hidden={active !== "music"}>
            <MusicTool />
          </div>
          <div hidden={active !== "timer"}>
            <FocusTimer />
          </div>
          <div hidden={active !== "notes"}>
            <StudyItems kind="note" />
          </div>
          <div hidden={active !== "snippets"}>
            <StudyItems kind="snippet" />
          </div>
          <div hidden={active !== "reference"}>
            <References />
          </div>
        </div>
      </aside>
    </>
  );
}
