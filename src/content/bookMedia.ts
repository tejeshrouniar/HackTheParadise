/** Film media is separate from the coding-level completion scenes. Keys are
 * stable chapter IDs so existing progress unlocks the matching chapter film. */
export interface ChapterVideo {
  src: string;
  poster?: string;
  duration?: number;
  captions?: { src: string; language: string; label: string }[];
}
const harryMedia = "media/harry-potter/";
export const BOOK_VIDEOS: Record<string, Record<string, ChapterVideo>> = {
  "harry-potter": {
    "relics-book-one-01": { src: `${harryMedia}01-the-diary-in-the-bathroom.mp4` },
    "relics-book-one-02": { src: `${harryMedia}02-the-ring-of-gaunt.mp4` },
    "relics-book-one-03": { src: `${harryMedia}03-the-lockets-hiss.mp4` },
    "relics-book-one-04": { src: `${harryMedia}04-the-cup-in-the-vault.mp4` },
    "relics-book-one-05": { src: `${harryMedia}05-the-diadems-test.mp4` },
    "relics-book-one-06": { src: `${harryMedia}06-naginis-trail.mp4` },
    "relics-book-two-01": { src: `${harryMedia}07-the-scars-memories.mp4` },
    "relics-book-two-02": { src: `${harryMedia}08-the-unwrapped-turban.mp4` },
    "relics-book-two-03": { src: `${harryMedia}09-dobbys-missing-sock.mp4` },
    "relics-book-two-04": { src: `${harryMedia}10-the-golden-snitch-key.mp4` },
    "relics-book-two-05": { src: `${harryMedia}11-the-elder-wand-cipher.mp4` },
    "relics-book-two-06": { src: `${harryMedia}12-the-final-merge.mp4` },
  },
};

/** A book may also provide one continuous film, available after all chapters. */
export const BOOK_FULL_MOVIES: Record<string, ChapterVideo> = {
  "harry-potter": { src: `${harryMedia}complete-story.mp4` },
};

export function playableVideo(value: ChapterVideo | undefined): value is ChapterVideo {
  return !!value && (/^https:\/\//.test(value.src) || /^\/(?!\/)/.test(value.src) || /^media\/[a-zA-Z0-9/_-]+\.mp4$/.test(value.src));
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
