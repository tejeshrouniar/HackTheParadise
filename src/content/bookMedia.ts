/** Supply licensed video URLs here. An absent entry is unavailable, never a fake clip.
 * Keys are stable chapter IDs (Cinder uses its chapter title). */
export interface ChapterVideo {
  src: string;
  poster?: string;
  duration?: number;
  captions?: { src: string; language: string; label: string }[];
}
export const BOOK_VIDEOS: Record<string, Record<string, ChapterVideo>> = {};

export function playableVideo(value: ChapterVideo | undefined): value is ChapterVideo {
  return !!value && (/^https:\/\//.test(value.src) || /^\/(?!\/)/.test(value.src));
}

/** Unknown durations never become invented timeline positions. Supply durations
 * in seconds to enable cross-chapter seeking before clips have been watched. */
export function movieTimeline(durations: readonly (number | undefined)[]) {
  if (!durations.length || durations.some(d => typeof d !== "number" || !Number.isFinite(d) || d <= 0)) return null;
  let total = 0;
  const offsets = durations.map(duration => { const start = total; total += duration!; return start; });
  return { offsets, total };
}

export function locateMovieTime(durations: readonly (number | undefined)[], time: number) {
  const timeline = movieTimeline(durations);
  if (!timeline || !Number.isFinite(time)) return null;
  const clamped = Math.max(0, Math.min(time, timeline.total));
  let index = timeline.offsets.length - 1;
  while (index > 0 && clamped < timeline.offsets[index]) index--;
  return { index, time: clamped - timeline.offsets[index] };
}

export function canWatchMovie(chapters: readonly { id: string }[], completed: readonly string[], media: Record<string, ChapterVideo>) {
  return chapters.length > 0 && chapters.every(chapter => completed.includes(chapter.id) && playableVideo(media[chapter.id]));
}

export function validResume(value: unknown, ids: readonly string[]) {
  if (!value || typeof value !== "object") return null;
  const saved = value as { chapter?: unknown; time?: unknown };
  if (typeof saved.chapter !== "string" || !ids.includes(saved.chapter)) return null;
  return { chapter: saved.chapter, time: typeof saved.time === "number" && Number.isFinite(saved.time) ? Math.max(0, saved.time) : 0 };
}
