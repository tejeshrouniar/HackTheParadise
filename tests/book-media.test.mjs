import test from 'node:test';
import assert from 'node:assert/strict';
import { canWatchMovie, locateMovieTime, movieTimeline, playableVideo, validResume } from '../src/content/bookMedia.ts';

test('movie access requires every real chapter and playable media, never just a matching completion count', () => {
  const chapters = [{ id: 'first' }, { id: 'second' }];
  const media = { first: { src: '/first.mp4' }, second: { src: 'https://example.com/second.mp4' } };
  assert.equal(canWatchMovie(chapters, ['second', 'unrelated'], media), false);
  assert.equal(canWatchMovie(chapters, ['first', 'second'], media), true);
  assert.equal(canWatchMovie(chapters, ['first', 'second'], { first: media.first }), false);
  assert.equal(canWatchMovie([], [], {}), false);
  for (const src of ['javascript:alert(1)', '//example.com/movie', 'http://example.com/movie', '']) assert.equal(playableVideo({ src }), false);
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
