import { useEffect, useLayoutEffect, useState } from "react";
import type { CSSProperties } from "react";
import { BookOpen, Sparkles, X } from "lucide-react";

const steps = [
  { selector: '[data-guide="bookcase"]', title: "Your adventure starts here", body: "Open the bookshelf to find a story and begin learning Python." },
  { selector: '[data-guide="tutorial-book"]', title: "Pick your first book", body: "Choose The Last Light for a gentle start. Every book keeps its own progress." },
  { selector: '[data-guide="play-levels"]', title: "Step into the story", body: "Choose Play levels to walk the path and solve its coding challenges." },
  { selector: '[data-guide="first-level"]', title: "Enter a level", body: "Click this landmark to enter. You can also walk with the arrow keys." },
  { selector: '[data-guide="run-spell"]', title: "Cast your code", body: "Write your spell on the left page, then Run spell to see what happens." },
] as const;

export function guideIndexForRoute(route: string) {
  if (route === "entrance") return 0;
  if (route === "bookshelf") return 1;
  if (route.startsWith("book/")) return 2;
  if (route === "learn") return 3;
  if (route.startsWith("quest/") || route.startsWith("book-level/")) return 4;
  return -1;
}

type Placement = { target: DOMRect; left: number; top: number; side: "left" | "right" | "above" | "below" | "floating" };

export function FirstVisitGuide({ step, onDismiss, pageTurning }: { step: number; onDismiss: () => void; pageTurning: boolean }) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const current = steps[step];

  useLayoutEffect(() => {
    setPlacement(null);
    if (!current) return;
    let frame = 0;
    let target: HTMLElement | null = null;
    let observer: ResizeObserver | null = null;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = document.querySelector<HTMLElement>(current.selector);
        if (element !== target) {
          observer?.disconnect();
          target = element;
          if (target) {
            observer = new ResizeObserver(update);
            observer.observe(target);
          }
        }
        if (!element) { setPlacement(null); return; }
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) { setPlacement(null); return; }
        const width = Math.min(310, window.innerWidth - 24);
        const height = 174;
        const gap = 18;
        let side: Placement["side"] = "floating";
        let left = Math.max(12, (window.innerWidth - width) / 2);
        let top = window.innerHeight - height - 16;
        if (window.innerWidth - rect.right >= width + gap + 12) {
          side = "right"; left = rect.right + gap; top = rect.top + (rect.height - height) / 2;
        } else if (rect.left >= width + gap + 12) {
          side = "left"; left = rect.left - width - gap; top = rect.top + (rect.height - height) / 2;
        } else if (window.innerHeight - rect.bottom >= height + gap + 12) {
          side = "below"; left = rect.left + (rect.width - width) / 2; top = rect.bottom + gap;
        } else if (rect.top >= height + gap + 12) {
          side = "above"; left = rect.left + (rect.width - width) / 2; top = rect.top - height - gap;
        }
        setPlacement({ target: rect, side, left: Math.max(12, Math.min(window.innerWidth - width - 12, left)), top: Math.max(12, Math.min(window.innerHeight - height - 12, top)) });
      });
    };
    const mutations = new MutationObserver(update);
    mutations.observe(document.getElementById("main-content") ?? document.body, { childList: true, subtree: true });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [current]);

  useEffect(() => {
    if (!current) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, onDismiss]);

  if (!current || !placement) return null;
  const { target, side, left, top } = placement;
  return <div className={`htp-first-guide${pageTurning ? " is-delayed" : ""}`} aria-label="How to play">
    <div className="htp-first-guide__spotlight" aria-hidden="true" style={{ left: target.left - 5, top: target.top - 5, width: target.width + 10, height: target.height + 10 }} />
    <aside className="htp-first-guide__card" data-side={side} style={{ left, top, width: Math.min(310, window.innerWidth - 24) } as CSSProperties} role="status" aria-live="polite">
      <div className="htp-first-guide__eyebrow"><BookOpen size={16} aria-hidden="true" /><span>HOW TO PLAY · {step + 1} / {steps.length}</span></div>
      <h2>{current.title}</h2>
      <p>{current.body}</p>
      <div className="htp-first-guide__actions">
        <button type="button" className="htp-first-guide__skip" onClick={onDismiss}><X size={13} aria-hidden="true" /> Skip tour</button>
        {step === steps.length - 1 && <button type="button" className="htp-first-guide__done" onClick={onDismiss}><Sparkles size={14} aria-hidden="true" /> Got it</button>}
      </div>
    </aside>
  </div>;
}
