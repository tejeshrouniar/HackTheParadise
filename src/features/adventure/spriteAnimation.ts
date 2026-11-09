// Frame counts match the directional strips in Eris Esra's character template.
export const spriteClips = {
  idle: { frames: 4, frameMs: 240 },
  walk: { frames: 4, frameMs: 140 },
  run: { frames: 6, frameMs: 100 },
  interact: { frames: 4, frameMs: 140 },
} as const;

export type SpriteAction = keyof typeof spriteClips;
export interface SpritePlayback {
  action: SpriteAction;
  frame: number;
  elapsed: number;
}

export function createSpritePlayback(action: SpriteAction): SpritePlayback {
  return { action, frame: 0, elapsed: 0 };
}

export function changeSpriteAction(
  playback: SpritePlayback,
  action: SpriteAction,
  restart = false,
) {
  if (playback.action === action && !restart) return;
  const moving = (value: SpriteAction) => value === "walk" || value === "run";
  const before = spriteClips[playback.action];
  const after = spriteClips[action];
  // Both gaits start on the same foot. Retain its phase when changing speed.
  const phase = !restart && moving(playback.action) && moving(action)
    ? (playback.frame + playback.elapsed / before.frameMs) / before.frames
    : 0;
  const progress = phase * after.frames;
  playback.action = action;
  playback.frame = Math.floor(progress);
  playback.elapsed = (progress - playback.frame) * after.frameMs;
}

export function advanceSprite(playback: SpritePlayback, delta: number, loop = false) {
  const clip = spriteClips[playback.action];
  if (playback.action === "interact" && !loop && playback.frame === clip.frames - 1)
    return;
  // A delayed browser paint must never jump over a pose to catch up.
  const duration = clip.frameMs + (
    loop && playback.action === "interact" && playback.frame === clip.frames - 1
      ? 280 : 0
  );
  playback.elapsed += Math.max(0, Math.min(delta, duration));
  if (playback.elapsed >= duration) {
    playback.elapsed -= duration;
    playback.frame = (playback.frame + 1) % clip.frames;
  }
}

export const interactionDuration =
  spriteClips.interact.frames * spriteClips.interact.frameMs + 180;
