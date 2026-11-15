import type { PuzzleTestResult } from "../learning/puzzleRunner";

export type SpellPlayback = {
  test: number;
  phase: "input" | "work" | "output" | "complete" | "payoff";
  line: string;
  result: PuzzleTestResult;
  revealed: number;
  duration: number;
  trace: string[];
};

/** Bounded playback of real interpreter traces; animation does not skip reading time. */
export function planSpellPlayback(results: PuzzleTestResult[], pace: number): SpellPlayback[] {
  const unit = Number.isFinite(pace) ? Math.max(450, Math.min(1100, pace)) : 750;
  const frames: SpellPlayback[] = [];
  results.forEach((result, test) => {
    const add = (phase: SpellPlayback["phase"], line: string, duration: number, revealed = 0, trace: string[] = []) =>
      frames.push({ test, phase, line, duration, revealed, result, trace });
    add("input", `Check ${test + 1}: ${result.label}`, unit * 2);
    // Long loops remain readable without making a large trace take several minutes.
    const groupSize = Math.max(1, Math.ceil(result.trace.length / 6));
    for (let offset = 0; offset < result.trace.length; offset += groupSize) {
      const group = result.trace.slice(offset, offset + groupSize);
      add("work", group.at(-1)!, unit * 1.5, 0, group);
    }
    const value = result.actual;
    const count = typeof value === "string" ? Array.from(value).length
      : Array.isArray(value) ? value.length
      : value && typeof value === "object" ? Object.keys(value).length : 1;
    const visibleCount = Math.min(32, count);
    const stride = Math.max(1, Math.ceil(visibleCount / 8));
    for (let shown = stride; shown < visibleCount; shown += stride) {
      add("output", "Your function returns…", Math.max(220, unit * .45), shown);
    }
    add("output", "Your function returns…", unit * 1.5, visibleCount);
    add("complete", result.passed ? "Goal reached" : "Result differs from the goal", unit * 2.4, visibleCount);
    if (test === results.length - 1 && results.every(check => check.passed)) {
      add("payoff", "Spell complete", Math.max(2600, unit * 3.5));
    }
  });
  return frames;
}
