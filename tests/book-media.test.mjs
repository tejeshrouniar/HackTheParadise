import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { BOOK_FULL_MOVIES, BOOK_VIDEOS, canWatchMovie, locateMovieTime, movieTimeline, playableVideo, validResume } from '../src/content/bookMedia.ts';
import { BOOK_PUZZLES } from '../src/content/codeCampaign.ts';
import { planSpellPlayback } from '../src/features/story/spellPlayback.ts';

test('spell playback preserves interpreter steps and holds the solved scene before the film', () => {
  const trace = Array.from({ length: 55 }, (_, index) => `Step ${index}`);
  const result = { label: 'Long spell', input: [10], actual: 'a'.repeat(40), passed: true, trace };
  const frames = planSpellPlayback([result], 450);
  assert.deepEqual(frames.flatMap(frame => frame.trace), trace);
  assert.ok(frames.filter(frame => frame.phase === 'work').length <= 6);
  assert.equal(frames[0].phase, 'input');
  assert.ok(frames[0].duration >= 900);
  assert.equal(frames.at(-2).phase, 'complete');
  assert.equal(frames.at(-2).revealed, 32);
  assert.equal(frames.at(-1).phase, 'payoff');
  assert.ok(frames.at(-1).duration >= 2600);
  const failedRun = planSpellPlayback([{ ...result, passed: false }, result], 450);
  assert.equal(failedRun.some(frame => frame.phase === 'payoff'), false);
});

test('movie access requires every real chapter and playable media, never just a matching completion count', () => {
  const chapters = [{ id: 'first' }, { id: 'second' }];
  const media = { first: { src: '/first.mp4' }, second: { src: 'https://example.com/second.mp4' } };
  assert.equal(canWatchMovie(chapters, ['second', 'unrelated'], media), false);
  assert.equal(canWatchMovie(chapters, ['first', 'second'], media), true);
  assert.equal(canWatchMovie(chapters, ['first', 'second'], { first: media.first }), false);
  assert.equal(canWatchMovie([], [], {}), false);
  for (const src of ['javascript:alert(1)', '//example.com/movie', 'http://example.com/movie', '']) assert.equal(playableVideo({ src }), false);
});

test('each Harry Potter chapter has its supplied film and the complete movie is present', () => {
  const chapters = BOOK_PUZZLES.filter(chapter => chapter.bookId === 'harry-potter');
  const media = BOOK_VIDEOS['harry-potter'];
  assert.equal(chapters.length, 12);
  assert.equal(Object.keys(media).length, chapters.length);
  for (const chapter of chapters) {
    const video = media[chapter.chapterId];
    assert.equal(playableVideo(video), true, chapter.chapterId);
    assert.equal(existsSync(`public/${video.src}`), true, chapter.chapterId);
  }
  assert.equal(playableVideo(BOOK_FULL_MOVIES['harry-potter']), true);
  assert.equal(existsSync(`public/${BOOK_FULL_MOVIES['harry-potter'].src}`), true);
});

test('combined seeking handles boundaries, clamping, unknown durations and invalid input', () => {
  assert.deepEqual(movieTimeline([10, 20, 5]), { offsets: [0, 10, 30], total: 35 });
  assert.deepEqual(locateMovieTime([10, 20, 5], 10), { index: 1, time: 0 });
  assert.deepEqual(locateMovieTime([10, 20, 5], 32), { index: 2, time: 2 });
  assert.deepEqual(locateMovieTime([10, 20, 5], 100), { index: 2, time: 5 });
  assert.deepEqual(locateMovieTime([10, 20, 5], -10), { index: 0, time: 0 });
  for (const durations of [[], [10, undefined], [0], [-1], [Infinity], [NaN]]) assert.equal(movieTimeline(durations), null);
  assert.equal(locateMovieTime([10], NaN), null);
});

test('playback bookmarks tolerate corrupt device storage without granting chapter access', () => {
  assert.equal(validResume(null, ['a']), null);
  assert.equal(validResume({ chapter: 'deleted', time: 7 }, ['a']), null);
  assert.deepEqual(validResume({ chapter: 'a', time: -4 }, ['a']), { chapter: 'a', time: 0 });
  assert.deepEqual(validResume({ chapter: 'a', time: Infinity }, ['a']), { chapter: 'a', time: 0 });
  assert.deepEqual(validResume({ chapter: 'a', time: 12.5 }, ['a']), { chapter: 'a', time: 12.5 });
});
