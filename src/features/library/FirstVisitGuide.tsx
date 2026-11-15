import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { BookOpen, Sparkles, X } from "lucide-react";

const steps = [
  { selector: '[data-guide="bookcase"]', title: "Your adventure starts here", body: "Open the bookshelf to find a story and begin learning Python." },
  { selector: '[data-guide="tutorial-book"]', title: "Pick your first book", body: "Choose The Last Light for a gentle start. Every book keeps its own progress." },
  { selector: '[data-guide="play-levels"]', title: "Step into the story", body: "Choose Play levels to walk the path and solve its coding challenges." },
  { selector: '[data-guide="level-entry"]', title: "Enter a level", body: "Open the highlighted level. You can also walk the map and choose a landmark." },
  { selector: '[data-guide="run-spell"]', title: "Cast your code", body: "Write your spell in the editor, then select Run spell to see what happens." },
] as const;

export function guideIndexForRoute(route: string) {
  if (route === "entrance") return 0;
  if (route === "bookshelf") return 1;
  if (route.startsWith("book/")) return 2;
  if (route === "learn") return 3;
  if (route.startsWith("quest/") || route.startsWith("book-level/")) return 4;
  return -1;
}

type Placement = { target: DOMRect | null; left: number; top: number; side: "left" | "right" | "above" | "below" | "floating"; arrow: number };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function targetBounds(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const extension = target.querySelector('[data-guide-extension]')?.getBoundingClientRect();
  if (!extension) return rect;
  const left = Math.min(rect.left, extension.left);
  const right = Math.max(rect.right, extension.right);
  const top = Math.min(rect.top, extension.top);
  const bottom = Math.max(rect.bottom, extension.bottom);
  return new DOMRect(left, top, right - left, bottom - top);
}

export function FirstVisitGuide({ step, onDismiss, pageTurning }: { step: number; onDismiss: () => void; pageTurning: boolean }) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const card = useRef<HTMLElement>(null);
  const current = steps[step];
  const lastStep = step === steps.length - 1;

  useLayoutEffect(() => {
    setPlacement(null);
    if (!current) return;
    let frame = 0;
    let target: HTMLElement | null = null;
    let revealed = false;
    const main = document.getElementById("main-content");
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const element = main?.querySelector<HTMLElement>(current.selector) ?? null;
        if (element !== target) {
          if (target) observer.unobserve(target);
          target = element;
          if (target) observer.observe(target);
        }
        if (!element || !card.current) { setPlacement(null); return; }
        let rect = targetBounds(element);
        if (!rect.width || !rect.height) { setPlacement(null); return; }
        const viewWidth = document.documentElement.clientWidth;
        const viewHeight = window.innerHeight;
        if (!revealed) {
          revealed = true;
          if (rect.top < 0 || rect.bottom > viewHeight) {
            element.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
            rect = targetBounds(element);
          }
        }
        const width = card.current.offsetWidth;
        const height = card.current.offsetHeight;
        const gap = 18;
        const margin = 12;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const visible = rect.bottom > 0 && rect.top < viewHeight;
        let side: Placement["side"] = "floating";
        let left = (viewWidth - width) / 2;
        let top = centerY > viewHeight / 2 ? margin : viewHeight - height - margin;
        if (visible && viewWidth - rect.right >= width + gap + margin) {
          side = "right"; left = rect.right + gap; top = centerY - height / 2;
        } else if (visible && rect.left >= width + gap + margin) {
          side = "left"; left = rect.left - width - gap; top = centerY - height / 2;
        } else if (visible && viewHeight - rect.bottom >= height + gap + margin) {
          side = "below"; left = centerX - width / 2; top = rect.bottom + gap;
        } else if (visible && rect.top >= height + gap + margin) {
          side = "above"; left = centerX - width / 2; top = rect.top - height - gap;
        }
        left = clamp(left, margin, viewWidth - width - margin);
        top = clamp(top, margin, viewHeight - height - margin);
        const arrow = side === "left" || side === "right"
          ? clamp(centerY - top, gap, height - gap)
          : clamp(centerX - left, gap, width - gap);
        setPlacement({ target: visible ? rect : null, side, left, top, arrow });
      });
    };
    const observer = new ResizeObserver(update);
    if (card.current) observer.observe(card.current);
    if (main) observer.observe(main);
    const mutations = new MutationObserver(update);
    if (main) mutations.observe(main, { childList: true, subtree: true });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [current]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && card.current && getComputedStyle(card.current).visibility === "visible") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  if (!current) return null;
  const { target, side, left, top, arrow } = placement ?? {};
  return <div className={`htp-first-guide${pageTurning ? " is-delayed" : ""}`} aria-label="How to play">
    {target && <div className="htp-first-guide__spotlight" aria-hidden="true" style={{ left: target.left - 5, top: target.top - 5, width: target.width + 10, height: target.height + 10 }} />}
    <aside ref={card} className="htp-first-guide__card" data-side={side} style={{ left, top, "--guide-arrow": `${arrow ?? 0}px`, visibility: placement ? undefined : "hidden" } as CSSProperties} aria-labelledby="htp-guide-title">
      <div className="htp-first-guide__eyebrow"><BookOpen size={16} aria-hidden="true" /><span>HOW TO PLAY · {step + 1} / {steps.length}</span></div>
      <div role="status"><h2 id="htp-guide-title">{current.title}</h2><p>{current.body}</p></div>
      <div className="htp-first-guide__actions">
        {lastStep ? <button type="button" className="htp-first-guide__done" onClick={() => {
          onDismiss();
          document.querySelector<HTMLTextAreaElement>('main .sc-spell-editor textarea')?.focus();
        }}><Sparkles size={14} aria-hidden="true" /> Start coding</button> : (
          <button type="button" className="htp-first-guide__skip" onClick={onDismiss}><X size={13} aria-hidden="true" /> Skip tour</button>
        )}
      </div>
    </aside>
  </div>;
}
