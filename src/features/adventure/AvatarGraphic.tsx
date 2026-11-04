import { useEffect, useLayoutEffect, useRef, useState } from "react";
import atlas from "../../assets/trail/adventurer.png";
import type { Appearance } from "./appearance";
import { usePreferences } from "../settings/PreferencesContext";
import {
  advanceSprite,
  changeSpriteAction,
  createSpritePlayback,
  type SpriteAction,
} from "./spriteAnimation";

export type { SpriteAction } from "./spriteAnimation";

const frameSize = 32;
export type SpriteDirection = "down" | "left" | "right" | "up";
const bands: SpriteAction[] = ["idle", "walk", "run", "interact"];
const rows: Record<SpriteDirection, number> = {
  down: 0,
  right: 2,
  left: 2,
  up: 4,
};
type RGB = [number, number, number];
const skins: Record<Appearance["skin"], RGB> = {
  Peach: [243, 196, 157],
  Honey: [209, 153, 103],
  Bronze: [168, 111, 74],
  Umber: [122, 77, 56],
};
const hairs: Record<Appearance["hair"], RGB> = {
  Chestnut: [106, 58, 41],
  Ink: [50, 50, 66],
  Copper: [174, 80, 45],
  Silver: [188, 187, 195],
};
const outfits: Record<Appearance["outfit"], RGB> = {
  Fern: [66, 147, 104],
  Indigo: [88, 105, 181],
  Rust: [182, 93, 62],
  Plum: [156, 85, 144],
  Ocean: [50, 144, 161],
};

let source: Promise<HTMLImageElement> | undefined;
const cache = new Map<string, string>();
function loadAtlas() {
  source ??= new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = atlas;
  });
  return source;
}

async function dyeAtlas(appearance: Appearance, key: string) {
  const image = await loadAtlas();
  const cached = cache.get(key);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) return atlas;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = pixels;
  function paint(offset: number, color: RGB, shade = 1) {
    for (let i = 0; i < 3; i++) data[offset + i] = color[i] * shade;
  }
  for (let top = 0; top < height; top += frameSize) {
    const row = (top / frameSize) % 5;
    for (let left = 0; left < width; left += frameSize) {
      const offsetAt = (x: number, y: number) =>
        ((top + y) * width + left + x) * 4;
      let head = -1;
      let headX = 16;
      for (let y = 0; y < 13 && head < 0; y++) {
        const pixels = Array.from({ length: frameSize }, (_, x) => x).filter(
          (x) => data[offsetAt(x, y) + 3],
        );
        if (pixels.length) {
          head = y;
          headX = (pixels[0] + pixels[pixels.length - 1]) / 2;
        }
      }
      if (head < 0) continue;
      for (let y = head; y < frameSize; y++) {
        for (let x = 0; x < frameSize; x++) {
          const offset = offsetAt(x, y);
          const light = data[offset];
          if (!data[offset + 3] || light < 60) continue;
          const h = y - head;
          const distance = Math.abs(x - headX);
          const shade = light < 195 ? 0.7 : light < 240 ? 0.89 : 1;
          if (h <= 10) {
            const fringe =
              appearance.cut === "Swept" ? 5 - Math.abs(x - headX - 2) / 2 : 3;
            const hair =
              h <= fringe ||
              (appearance.cut === "Long" && distance >= 4 && h < 10) ||
              (row === 4 && h < 9);
            paint(
              offset,
              hair ? hairs[appearance.hair] : skins[appearance.skin],
              shade,
            );
          } else if (h <= 18 && y < 27) {
            paint(
              offset,
              appearance.accessory === "Scarf" && h === 12
                ? [242, 183, 91]
                : outfits[appearance.outfit],
              shade,
            );
          } else {
            paint(offset, y >= 29 ? [77, 51, 47] : [66, 70, 91], shade);
          }
        }
      }
      if (appearance.accessory === "Trail hat") {
        for (let y = Math.max(0, head - 3); y <= head + 2; y++) {
          const brim = y >= head + 1;
          const half = brim ? 7 : 4;
          for (
            let x = Math.round(headX) - half;
            x <= Math.round(headX) + half;
            x++
          ) {
            const offset = offsetAt(x, y);
            data[offset + 3] = 255;
            paint(
              offset,
              brim ? [123, 76, 41] : [220, 157, 81],
              y === head ? 0.75 : 1,
            );
          }
        }
      }
    }
  }
  context.putImageData(pixels, 0, 0);
  const result = canvas.toDataURL();
  if (cache.size >= 24) cache.delete(cache.keys().next().value!);
  cache.set(key, result);
  return result;
}

export function AvatarGraphic({
  appearance,
  action = "idle",
  direction = "down",
  x = 0,
  y = 0,
  size = 32,
  playId = 0,
  loop = false,
  directControl = false,
}: {
  appearance: Appearance;
  action?: SpriteAction;
  direction?: SpriteDirection;
  x?: number;
  y?: number;
  size?: number;
  playId?: number;
  loop?: boolean;
  directControl?: boolean;
}) {
  const { preferences } = usePreferences();
  const key = JSON.stringify(appearance);
  const [sheet, setSheet] = useState(() => cache.get(key));
  const imageRef = useRef<SVGImageElement>(null);
  const playback = useRef(createSpritePlayback(action));
  const previousPlayId = useRef(playId);
  useEffect(() => {
    let current = true;
    void dyeAtlas(appearance, key)
      .then((url) => {
        if (current) setSheet(url);
      })
      .catch(() => {
        if (current) setSheet(atlas);
      });
    return () => {
      current = false;
    };
  }, [key]);
  const ready = !!sheet;
  useLayoutEffect(() => {
    changeSpriteAction(playback.current, action, previousPlayId.current !== playId);
    previousPlayId.current = playId;
    const image = imageRef.current;
    if (!image || !ready) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let request = 0;
    let previous = performance.now();
    let painted = -1;
    const paint = () => {
      if (painted === playback.current.frame) return;
      painted = playback.current.frame;
      image.setAttribute("x", String(-frameSize * painted));
      image.setAttribute("data-frame", String(painted));
    };
    function animate(time: number) {
      if (!document.hidden) advanceSprite(playback.current, time - previous, loop);
      previous = time;
      paint();
      request = requestAnimationFrame(animate);
    }
    function resume() {
      cancelAnimationFrame(request);
      previous = performance.now();
      image!.setAttribute("data-motion", preferences.reduced_motion || (media.matches && !directControl)
        ? "reduced" : document.hidden ? "paused" : "playing");
      if (preferences.reduced_motion || (media.matches && !directControl)) {
        playback.current.frame = 0;
        playback.current.elapsed = 0;
      } else if (!document.hidden) {
        request = requestAnimationFrame(animate);
      }
      paint();
    }
    resume();
    media.addEventListener("change", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      cancelAnimationFrame(request);
      media.removeEventListener("change", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [action, playId, loop, directControl, ready, preferences.reduced_motion]);
  const row = bands.indexOf(action) * 5 + rows[direction];
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      overflow="hidden"
      aria-hidden="true"
      data-sprite-action={action}
    >
      <g
        transform={
          direction === "left" ? "translate(32 0) scale(-1 1)" : undefined
        }
      >
        {sheet && (
          <image
            ref={imageRef}
            href={sheet}
            width="192"
            height="640"
            x={0}
            y={-frameSize * row}
            style={{ imageRendering: "pixelated" }}
          />
        )}
      </g>
    </svg>
  );
}
