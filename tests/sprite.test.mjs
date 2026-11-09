import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  advanceSprite,
  changeSpriteAction,
  createSpritePlayback,
  spriteClips,
} from "../src/features/adventure/spriteAnimation.ts";

test("every directional animation frame in the packed atlas contains artwork", async () => {
  const { data, info } = await sharp(fileURLToPath(new URL("../src/assets/trail/adventurer.png", import.meta.url)))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (const [band, [action, clip]] of Object.entries(spriteClips).entries()) {
    for (let row = 0; row < 5; row++) {
      for (let frame = 0; frame < clip.frames; frame++) {
        let opaque = 0;
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            opaque += data[((band * 160 + row * 32 + y) * info.width + frame * 32 + x) * 4 + 3] > 0;
          }
        }
        assert.ok(opaque > 50, `${action}, direction ${row}, frame ${frame} is missing`);
      }
    }
  }
});

test("walk and run visit every frame in order, including after a stalled paint", () => {
  for (const action of ["walk", "run"]) {
    const playback = createSpritePlayback(action);
    const clip = spriteClips[action];
    const seen = [playback.frame];
    for (let i = 0; i < clip.frames * 2; i++) {
      advanceSprite(playback, i === 2 ? 2000 : clip.frameMs);
      seen.push(playback.frame);
    }
    assert.deepEqual(seen, Array.from({ length: clip.frames * 2 + 1 }, (_, i) => i % clip.frames));
  }
});

test("switching walk/run preserves the current foot phase instead of restarting", () => {
  const playback = createSpritePlayback("walk");
  advanceSprite(playback, 140);
  advanceSprite(playback, 140);
  advanceSprite(playback, 70);
  changeSpriteAction(playback, "run");
  assert.equal(playback.frame, 3);
  assert.equal(playback.elapsed, 75);
  changeSpriteAction(playback, "walk");
  assert.equal(playback.frame, 2);
  assert.equal(playback.elapsed, 70);
});

test("interaction holds its final pose, can replay, and loops in the creator", () => {
  const playback = createSpritePlayback("interact");
  for (let i = 0; i < 8; i++) advanceSprite(playback, 140);
  assert.equal(playback.frame, 3);
  changeSpriteAction(playback, "interact", true);
  assert.deepEqual(playback, createSpritePlayback("interact"));
  for (let i = 0; i < 3; i++) advanceSprite(playback, 140, true);
  advanceSprite(playback, 140, true);
  assert.equal(playback.frame, 3);
  advanceSprite(playback, 280, true);
  assert.equal(playback.frame, 0);
});
