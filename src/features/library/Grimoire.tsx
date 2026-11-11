import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const GrimoireHeaderSlot = createContext<HTMLElement | null>(null);

/** All opened books share these leaves. Content owns behavior; the frame owns
 * proportions, parchment, the binding, and the reduced-motion-safe page turn. */
export function Grimoire({ left, right, label, coverColor, className = "", pageKey }: {
  left: ReactNode; right: ReactNode; label: string; coverColor?: string; className?: string; pageKey?: string | number;
}) {
  return <section className={`sc-grimoire ${className}`} aria-label={label} style={coverColor ? { "--book-cover": coverColor } as CSSProperties : undefined}>
    <div className="sc-grimoire__leaf sc-grimoire__leaf--left">{left}</div>
    <div className="sc-grimoire__binding" aria-hidden="true" />
    <div className="sc-grimoire__leaf sc-grimoire__leaf--right">{right}</div>
    <div key={pageKey} className="sc-grimoire__turn" aria-hidden="true" />
    <i className="sc-grimoire__corner sc-grimoire__corner--left" aria-hidden="true" />
    <i className="sc-grimoire__corner sc-grimoire__corner--right" aria-hidden="true" />
  </section>;
}

/** Render chapter controls into the shell header without duplicating navigation. */
export function ChapterNavigation({ title, number, onPrevious, onNext, disabled = false }: {
  title: string; number: number; onPrevious?: () => void; onNext?: () => void; disabled?: boolean;
}) {
  const slot = useContext(GrimoireHeaderSlot);
  const controls = <nav className="sc-chapter-pill" aria-label="Chapter navigation">
    <button aria-label="Previous chapter" disabled={disabled || !onPrevious} onClick={onPrevious}><ChevronLeft size={18} /></button>
    <span title={`Chapter ${number} — ${title}`}><small>Chapter {String(number).padStart(2, "0")}</small><strong>{title}</strong></span>
    <button aria-label="Next chapter" disabled={disabled || !onNext} onClick={onNext}><ChevronRight size={18} /></button>
  </nav>;
  return slot ? createPortal(controls, slot) : controls;
}

export function ExecutionTrace({ logs, running, children }: { logs: readonly string[]; running?: boolean; children?: ReactNode }) {
  return <section className="sc-execution-trace" aria-label="Execution trace">
    <header><h2>How your spell works</h2><span>{running ? "RUNNING" : "EXECUTION TRACE"}</span></header>
    <div className="sc-execution-trace__body" role="log" aria-live="polite" aria-relevant="additions text">
      {logs.length ? logs.map((line, index) => <p key={`${index}-${line}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><code>{line}</code></p>) : <p className="sc-execution-trace__empty">Cast a spell to follow its steps here.</p>}
    </div>
    {children}
  </section>;
}
