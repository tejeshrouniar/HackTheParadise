import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePreferences } from "../settings/PreferencesContext";
import { sound } from "../../utils/sound";

export const GrimoireHeaderSlot = createContext<HTMLElement | null>(null);

type TurnState = { until: number; direction: "next" | "previous" };
const PageTurnContext = createContext<{ current: TurnState } | null>(null);
const RouteTurnDirection = createContext<TurnState["direction"] | undefined>(undefined);
export function PageTurnProvider({ children, routeDirection }: { children: ReactNode; routeDirection?: TurnState["direction"] }) {
  const turn = useRef<TurnState>({ until: 0, direction: "next" });
  return <PageTurnContext.Provider value={turn}><RouteTurnDirection.Provider value={routeDirection}>{children}</RouteTurnDirection.Provider></PageTurnContext.Provider>;
}

/** Header, corner and touch controls share a short animation lock. This survives
 * route remounts, so double presses cannot skip a chapter during a page turn. */
export function usePageTurn() {
  const shared = useContext(PageTurnContext);
  const local = useRef<TurnState>({ until: 0, direction: "next" });
  const state = shared ?? local;
  const { preferences } = usePreferences();
  return {
    state,
    turn: (callback: (() => void) | undefined, direction: "next" | "previous" = "next") => {
      if (!callback || performance.now() < state.current.until) return;
      const quiet = preferences.reduced_motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
      state.current = { until: performance.now() + (quiet ? 100 : 700), direction };
      callback();
    },
  };
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
  const { preferences } = usePreferences();
  const navigation = usePageTurn();
  const routeDirection = useContext(RouteTurnDirection);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const mountedRef = useRef(false);
  const prevPageKeyRef = useRef(pageKey);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (pageKey !== undefined && pageKey !== prevPageKeyRef.current) {
      prevPageKeyRef.current = pageKey;
      const quiet = preferences.reduced_motion || (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      if (!quiet && preferences.sound_effects) {
        sound.playPageTurn();
      }
    }
  }, [pageKey, preferences.reduced_motion, preferences.sound_effects]);

  return (
    <section
      className={`sc-grimoire ${className}`}
      aria-label={label}
      tabIndex={onPreviousPage || onNextPage ? 0 : undefined}
      aria-keyshortcuts={onPreviousPage || onNextPage ? "PageUp PageDown" : undefined}
      data-turn-direction={routeDirection ?? navigation.state.current.direction}
      onKeyDown={event => {
        if (navigationDisabled || event.repeat || event.ctrlKey || event.altKey || event.metaKey || interactive(event.target)) return;
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
      <div className="sc-grimoire__leaf sc-grimoire__leaf--left">
        {left}
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

      <div className="sc-grimoire__leaf sc-grimoire__leaf--right">
        {right}
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

      {pageKey !== undefined && (
        <div key={pageKey} className="sc-grimoire__turn-container" aria-hidden="true">
          <div className="sc-grimoire__turn-shadow" />
          <div className="sc-grimoire__turn-leaf">
            <div className="sc-grimoire__turn-face sc-grimoire__turn-front">
              <div className="sc-grimoire__turn-texture" />
              <div className="sc-grimoire__turn-border" />
            </div>
            <div className="sc-grimoire__turn-face sc-grimoire__turn-back">
              <div className="sc-grimoire__turn-texture" />
              <div className="sc-grimoire__turn-border" />
            </div>
          </div>
        </div>
      )}

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
  const controls = (
    <nav className="sc-chapter-pill" aria-label="Chapter navigation">
      <button aria-label="Previous chapter" disabled={disabled || !onPrevious} onClick={() => navigation.turn(onPrevious, "previous")}>
        <ChevronLeft size={18} />
      </button>
      <span title={`Chapter ${number} — ${title}`}>
        <small>Chapter {String(number).padStart(2, "0")}</small>
        <strong>{title}</strong>
      </span>
      <button aria-label="Next chapter" disabled={disabled || !onNext} onClick={() => navigation.turn(onNext)}>
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
