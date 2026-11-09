import chapters from "./journey.json" with { type: "json" };

export type JourneyTheme = string;

export interface JourneyChapter {
  title: string;
  place: string;
  summary: string;
  theme: JourneyTheme;
  levels: readonly number[];
  stops: readonly string[];
  lines: readonly string[];
}

// This JSON file is the single source for chapter copy, quest links, and scene beats.
export const JOURNEY: readonly JourneyChapter[] = chapters;

export function realmForLesson(id: number): JourneyChapter {
  const index = Number.isFinite(id)
    ? Math.min(3, Math.max(0, Math.floor((id - 1) / 3)))
    : 0;
  return JOURNEY[index];
}
