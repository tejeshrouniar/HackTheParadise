import type { ReactNode, Ref } from "react";

export const LEVEL_PACES = [
  { value: 1100, label: "Relaxed" },
  { value: 750, label: "Steady" },
  { value: 450, label: "Quick" },
] as const;

/** The live work area is the same for movement spells and chapter puzzles. */
export function LevelStage({ title, status, state, stepLabel, pace, onPaceChange, caption, stageRef, children }: {
  title: string;
  status: "Ready" | "Running" | "Complete";
  state: "ready" | "casting" | "failed";
  stepLabel: string;
  pace: number;
  onPaceChange: (pace: number) => void;
  caption: string;
  stageRef?: Ref<HTMLElement>;
  children: ReactNode;
}) {
  return <section className="sc-card sc-live-world" ref={stageRef} data-cast={state} aria-label={`${title} live scene`}>
    <header><h2>{title}</h2><span className={status === "Complete" ? "complete" : ""}>{status}</span></header>
    <div className="sc-playback-bar">
      <span>{stepLabel}</span>
      <label>Pace{" "}<select aria-label="Animation pace" value={pace} disabled={state === "casting"} onChange={event => onPaceChange(Number(event.target.value))}>
        {LEVEL_PACES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>
    </div>
    <div className="sc-stage-canvas"><div className="sc-stage-content">{children}</div></div>
    <p className="sc-action-caption" role="status">{caption}</p>
  </section>;
}

export function showLevelStage(stage: HTMLElement | null, reducedMotion: boolean) {
  if (!window.matchMedia("(max-width: 1100px)").matches) return;
  const quiet = reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  stage?.scrollIntoView({ block: "start", behavior: quiet ? "auto" : "smooth" });
}
