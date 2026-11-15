import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePreferences } from "../settings/PreferencesContext";
import { sound } from "../../utils/sound";

export const GrimoireHeaderSlot = createContext<HTMLElement | null>(null);

type Direction = "next" | "previous";
type TurnPhase = { direction: Direction; stage: "lift" | "land"; restoreChapterFocus: boolean };
const LIFT_MS = 275;
const LAND_MS = 345;
const PageTurnContext = createContext<{
  phase: TurnPhase | null;
  turn: (callback: (() => void) | undefined, direction?: Direction) => void;
} | null>(null);

/** Header, corner and touch controls share a short animation lock. This survives
 * route remounts, so double presses cannot skip a chapter during a page turn. */
export function PageTurnProvider({ children, routeKey }: {
  children: ReactNode; routeKey?: string;
}) {
  const { preferences, gentleBookMotion } = usePreferences();
  const [phase, setPhase] = useState<TurnPhase | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const pending = useRef(false);
  const previousRoute = useRef(routeKey);
  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;
    if (phase?.stage !== "lift") return;
    clearTimeout(timer.current);
    pending.current = false;
    setPhase(null);
  }, [routeKey, phase]);

  function turn(callback: (() => void) | undefined, direction: Direction = "next") {
    if (!callback || pending.current) return;
    const restoreChapterFocus = document.activeElement?.matches(".sc-chapter-pill button:focus-visible") ?? false;
    pending.current = true;
    if (preferences.sound_effects) sound.playPageTurn();
    if (!gentleBookMotion) setPhase({ direction, stage: "lift", restoreChapterFocus });
    function land() {
      setPhase({ direction, stage: "land", restoreChapterFocus });
      timer.current = setTimeout(() => {
        pending.current = false;
        setPhase(null);
      }, LAND_MS);
      callback?.();
    }
    if (gentleBookMotion) land();
    else timer.current = setTimeout(land, LIFT_MS);
  }

  return <PageTurnContext.Provider value={{ phase, turn }}>{children}</PageTurnContext.Provider>;
}

export function usePageTurn() {
  const shared = useContext(PageTurnContext);
  return shared ?? { phase: null, turn: (callback: (() => void) | undefined, _direction?: Direction) => callback?.() };
}

/** A chapter turn already has a landing leaf. Other routes turn a single full-screen sheet. */
export function RoutePageTurn({ direction, chapterToChapter }: { direction: Direction; chapterToChapter: boolean }) {
  const { phase } = usePageTurn();
  const [hasChapterTurn] = useState(chapterToChapter && phase?.stage === "land");
  const [finished, setFinished] = useState(false);
  useLayoutEffect(() => {
    if (!hasChapterTurn && document.activeElement === document.body) {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
  }, [hasChapterTurn]);
  if (hasChapterTurn || finished) return null;
  return <div className="sc-route-page" data-direction={direction} aria-hidden="true">
    <i className="sc-route-page__leaf" data-book-transition="" onAnimationEnd={() => setFinished(true)} />
  </div>;
}

const interactive = (target: EventTarget | null) => target instanceof Element && !!target.closest("input,textarea,select,button,a,video,audio,[contenteditable=true],[role=slider],.sc-walking-stage");

/** All opened books share these leaves. Content owns behavior; the frame owns
 * proportions, parchment, the binding, and the reduced-motion-safe 3D page turn. */
export function Grimoire({
  left,
  right,
  label,
  coverColor,
  className = "",
  pageKey,
  onPreviousPage,
  onNextPage,
  navigationDisabled = false,
}: {
  left: ReactNode;
  right: ReactNode;
  label: string;
  coverColor?: string;
  className?: string;
  pageKey?: string | number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  navigationDisabled?: boolean;
}) {
  const navigation = usePageTurn();
  const touch = useRef<{ x: number; y: number } | null>(null);
  const phase = pageKey === undefined ? null : navigation.phase;

  return (
    <section
      className={`sc-grimoire ${className}`}
      aria-label={label}
      tabIndex={onPreviousPage || onNextPage ? 0 : undefined}
      aria-keyshortcuts={onPreviousPage || onNextPage ? "PageUp PageDown" : undefined}
      data-turn-direction={phase?.direction}
      data-turn-stage={phase?.stage}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || navigationDisabled || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        const action = event.key === "PageDown" ? onNextPage : event.key === "PageUp" ? onPreviousPage : undefined;
        if (action) { event.preventDefault(); navigation.turn(action, event.key === "PageUp" ? "previous" : "next"); }
      }}
      onTouchStart={event => {
        touch.current = !navigationDisabled && !interactive(event.target) && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={event => {
        const start = touch.current; touch.current = null;
        if (!start || navigationDisabled || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) navigation.turn(dx < 0 ? onNextPage : onPreviousPage, dx < 0 ? "next" : "previous");
      }}
      style={coverColor ? ({ "--book-cover": coverColor } as CSSProperties) : undefined}
    >
      <div className="sc-grimoire__pages">
        <div className="sc-grimoire__leaf sc-grimoire__leaf--left" data-book-transition="">
          <div className="sc-grimoire__content" key={pageKey} tabIndex={0} role="group" aria-label="Left page">{left}</div>
          {onPreviousPage && (
            <button
              type="button"
              className="sc-grimoire__edge-turn sc-grimoire__edge-turn--prev"
              disabled={navigationDisabled}
              onClick={() => navigation.turn(onPreviousPage, "previous")}
              aria-label="Turn to previous page"
              title="Previous page"
            >
              <span className="sc-grimoire__dogear" aria-hidden="true">
                <ChevronLeft size={16} />
              </span>
            </button>
          )}
        </div>

        <div className="sc-grimoire__binding" aria-hidden="true" />

        <div className="sc-grimoire__leaf sc-grimoire__leaf--right" data-book-transition="">
          <div className="sc-grimoire__content" key={pageKey} tabIndex={0} role="group" aria-label="Right page">{right}</div>
          {onNextPage && (
            <button
              type="button"
              className="sc-grimoire__edge-turn sc-grimoire__edge-turn--next"
              disabled={navigationDisabled}
              onClick={() => navigation.turn(onNextPage)}
              aria-label="Turn to next page"
              title="Next page"
            >
              <span className="sc-grimoire__dogear" aria-hidden="true">
                <ChevronRight size={16} />
              </span>
            </button>
          )}
        </div>

        {phase?.stage === "land" && (
          <div key={pageKey} className="sc-grimoire__turn-container" aria-hidden="true">
            <div className="sc-grimoire__turn-leaf" data-book-transition="" />
          </div>
        )}
      </div>

      <i className="sc-grimoire__corner sc-grimoire__corner--left" aria-hidden="true" />
      <i className="sc-grimoire__corner sc-grimoire__corner--right" aria-hidden="true" />
    </section>
  );
}

/** Render chapter controls into the shell header without duplicating navigation. */
export function ChapterNavigation({
  title,
  number,
  onPrevious,
  onNext,
  disabled = false,
}: {
  title: string;
  number: number;
  onPrevious?: () => void;
  onNext?: () => void;
  disabled?: boolean;
}) {
  const slot = useContext(GrimoireHeaderSlot);
  const navigation = usePageTurn();
  const controlsRef = useRef<HTMLElement>(null);
  const landed = navigation.phase?.stage === "land" && navigation.phase.restoreChapterFocus;
  const direction = navigation.phase?.direction;
  useLayoutEffect(() => {
    if (!landed || !controlsRef.current) return;
    const button = controlsRef.current.querySelector<HTMLButtonElement>(`button[data-direction="${direction}"]:enabled`);
    (button ?? controlsRef.current).focus({ preventScroll: true });
  }, [landed, direction, number, slot]);
  const controls = (
    <nav className="sc-chapter-pill" aria-label="Chapter navigation" tabIndex={-1} ref={controlsRef}>
      <button data-direction="previous" aria-label="Previous chapter" disabled={disabled || !onPrevious} onClick={() => navigation.turn(onPrevious, "previous")}>
        <ChevronLeft size={18} />
      </button>
      <span title={`Chapter ${number} — ${title}`}>
        <small>Chapter {String(number).padStart(2, "0")}</small>
        <strong>{title}</strong>
      </span>
      <button data-direction="next" aria-label="Next chapter" disabled={disabled || !onNext} onClick={() => navigation.turn(onNext)}>
        <ChevronRight size={18} />
      </button>
    </nav>
  );
  return slot ? createPortal(controls, slot) : controls;
}

export function ExecutionTrace({
  logs,
  running,
  children,
}: {
  logs: readonly string[];
  running?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="sc-execution-trace" aria-label="Execution trace">
      <header>
        <h2>How your spell works</h2>
        <span>{running ? "RUNNING" : "EXECUTION TRACE"}</span>
      </header>
      <div className="sc-execution-trace__body" role="log" aria-live="polite" aria-relevant="additions text">
        {logs.length ? (
          logs.map((line, index) => (
            <p key={`${index}-${line}`}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <code>{line}</code>
            </p>
          ))
        ) : (
          <p className="sc-execution-trace__empty">Cast a spell to follow its steps here.</p>
        )}
      </div>
      {children}
    </section>
  );
}
