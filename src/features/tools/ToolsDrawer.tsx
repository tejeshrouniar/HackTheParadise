import { useEffect, useId, useRef, useState } from "react";
import {
  BookOpen,
  Code2,
  Headphones,
  NotebookPen,
  Settings2,
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
  { id: "settings", label: "Settings", Icon: Settings2 },
];
export default function ToolsDrawer({
  open,
  onClose,
  onSettings,
}: {
  open: boolean;
  onClose: () => void;
  onSettings: () => void;
}) {
  const [active, setActive] = useState("music");
  const idPrefix = useId();
  const panel = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]",
        ) ?? [],
      ).filter((el) => el.tabIndex >= 0 && el.getClientRects().length);
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
    };
  }, [open]);
  useEffect(() => {
    body.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);
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
        className="sc-tools-drawer htp-bookmark-drawer"
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-labelledby="tools-title"
        aria-describedby="tools-description"
      >
        <header>
          <div>
            <h2 id="tools-title">Tools bookmark</h2>
            <p id="tools-description" className="sr-only">
              Music, focus timer, notes, coding references and settings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="sc-icon-button"
            aria-label="Close tools"
          >
            <X size={20} />
          </button>
        </header>
        <div className="sc-tool-tabs" role="tablist" aria-label="Coding utilities">
          {tools.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              id={`${idPrefix}-${id}-tab`}
              role="tab"
              aria-selected={active === id}
              aria-controls={`${idPrefix}-${id}-panel`}
              tabIndex={active === id ? 0 : -1}
              className={active === id ? "active" : ""}
              onClick={() => setActive(id)}
              onKeyDown={(event) => {
                const index = tools.findIndex((tool) => tool.id === id);
                const next = event.key === "ArrowRight" ? (index + 1) % tools.length
                  : event.key === "ArrowLeft" ? (index + tools.length - 1) % tools.length
                    : event.key === "Home" ? 0 : event.key === "End" ? tools.length - 1 : -1;
                if (next < 0) return;
                event.preventDefault();
                setActive(tools[next].id);
                document.getElementById(`${idPrefix}-${tools[next].id}-tab`)?.focus();
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="sc-tools-body" ref={body}>
          <div id={`${idPrefix}-music-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-music-tab`} hidden={active !== "music"}>
            <MusicTool />
          </div>
          <div id={`${idPrefix}-timer-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-timer-tab`} hidden={active !== "timer"}>
            <FocusTimer />
          </div>
          <div id={`${idPrefix}-notes-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-notes-tab`} hidden={active !== "notes"}>
            <StudyItems kind="note" />
          </div>
          <div id={`${idPrefix}-snippets-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-snippets-tab`} hidden={active !== "snippets"}>
            <StudyItems kind="snippet" />
          </div>
          <div id={`${idPrefix}-reference-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-reference-tab`} hidden={active !== "reference"}>
            <References />
          </div>
          <section className="sc-tool-content" id={`${idPrefix}-settings-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-settings-tab`} hidden={active !== "settings"}>
            <h3>Settings</h3>
            <button type="button" className="sc-button secondary" onClick={onSettings}>All settings</button>
          </section>
        </div>
      </aside>
    </>
  );
}
