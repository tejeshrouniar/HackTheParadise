import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Hand, LockKeyhole } from "lucide-react";
import { sound } from "../../utils/sound";
import { AvatarGraphic, type SpriteAction, type SpriteDirection } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { usePreferences } from "../settings/PreferencesContext";
import type { BookWalkPreset, WalkMapStop } from "./bookWalkPresets";

const REGION_WIDTH = 960;
const PLAYER_WIDTH = 72;
const PLAYER_HEIGHT = 88;
const WALK_FRAMES = [0, 1, 2, 1] as const;
const STRIDE_FRAME_DISTANCE = 13;
const NEW_POSITION_KEY = "storicode:book-walk-position-v1";
const CINDER_POSITION_KEYS = ["storicode:journey-position-v2", "storicode:journey-position"];
const WIZARDING_POSITION_KEY = "storicode:harry-potter-world-position-v1";

interface PositionedStop extends WalkMapStop {
  index: number;
  regionIndex: number;
  x: number;
  canEnter: boolean;
  complete: boolean;
}

interface WalkableBookMapProps {
  preset: BookWalkPreset;
  completedIds: readonly string[];
  onEnter: (stop: WalkMapStop) => void;
}

function savedPosition(preset: BookWalkPreset, firstOpenIndex: number, stops: readonly PositionedStop[], worldWidth: number) {
  try {
    const saved = sessionStorage.getItem(`${NEW_POSITION_KEY}:${preset.bookId}`);
    if (saved) {
      const position = Number(saved);
      if (Number.isFinite(position)) return Math.max(45, Math.min(worldWidth - 45, position));
    }

    // Preserve the old walking spot when upgrading existing Cinder and Harry maps.
    if (preset.bookId === "cinder") {
      for (const key of CINDER_POSITION_KEYS) {
        const old = Number(sessionStorage.getItem(key));
        if (Number.isFinite(old) && old >= 40) return Math.max(45, Math.min(worldWidth - 45, old / (1280 * 4) * worldWidth));
      }
    } else if (preset.bookId === "harry-potter") {
      const old = Number(sessionStorage.getItem(WIZARDING_POSITION_KEY));
      if (Number.isFinite(old) && old >= 40) {
        const oldIndex = Math.max(0, Math.min(stops.length - 1, Math.round((old - 150) / 300)));
        return Math.max(45, Math.min(worldWidth - 45, stops[oldIndex]?.x ?? stops[0].x));
      }
    }
  } catch { /* Map progress and movement do not depend on session storage. */ }
  return Math.max(55, (stops[firstOpenIndex]?.x ?? stops[0].x) - 88);
}

/**
 * One navigation system for every book: preset data supplies region art and
 * level markers, while movement, chapter gates, accessibility, and feedback
 * stay consistent across books.
 */
export function WalkableBookMap({ preset, completedIds, onEnter }: WalkableBookMapProps) {
  const { appearance } = useAppearance();
  const { preferences } = usePreferences();
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = preferences.reduced_motion || !!systemReducedMotion;
  const regionCount = preset.regions.length;
  const worldWidth = REGION_WIDTH * regionCount;
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const firstOpenIndex = Math.max(0, preset.regions.flatMap((region) => region.stops).findIndex((stop) => !completed.has(stop.id)));
  const allComplete = preset.regions.every((region) => region.stops.every((stop) => completed.has(stop.id)));
  const availableStopIndex = allComplete ? preset.regions.reduce((sum, region) => sum + region.stops.length, 0) - 1 : firstOpenIndex;
  const unlockedRegionIndex = Math.min(preset.regions.length - 1, Math.floor(availableStopIndex / Math.max(1, preset.regions[0]?.stops.length ?? 3)));
  const flattenedStops = useMemo(() => preset.regions.flatMap((region, regionIndex) =>
    region.stops.map((stop, stopInRegion) => ({
      ...stop,
      index: preset.regions.slice(0, regionIndex).reduce((sum, item) => sum + item.stops.length, 0) + stopInRegion,
      regionIndex,
      x: regionIndex * REGION_WIDTH + 145 + stopInRegion * (REGION_WIDTH / Math.max(1, region.stops.length)),
      canEnter: false,
      complete: completed.has(stop.id),
    })),
  ), [preset, completed]);
  const stops = useMemo(() => flattenedStops.map((stop) => ({
    ...stop,
    canEnter: stop.index <= availableStopIndex,
  })), [flattenedStops, availableStopIndex]);
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const walkerSprite = useRef<HTMLSpanElement>(null);
  const input = useRef({ left: false, right: false, run: false });
  const target = useRef<number | null>(null);
  const pending = useRef<string | null>(null);
  const x = useRef(0);
  const facing = useRef<SpriteDirection>("right");
  const cameraX = useRef(0);
  const nearestStopIndex = useRef(0);
  const previousRegion = useRef(0);
  const route = useRef({ stops, maxX: REGION_WIDTH - 42, unlockedRegionIndex, availableStopIndex });
  const [viewportWidth, setViewportWidth] = useState(900);
  const [position, setPosition] = useState(() => savedPosition(preset, allComplete ? availableStopIndex : firstOpenIndex, flattenedStops, worldWidth));
  const [nearestIndex, setNearestIndex] = useState(0);
  const [regionIndex, setRegionIndex] = useState(0);
  const [arrival, setArrival] = useState<number | null>(null);
  const [notice, setNotice] = useState("Walk to a landmark, then press E to enter its level.");
  const [motion, setMotion] = useState<SpriteAction>("idle");
  const [direction, setDirection] = useState<SpriteDirection>("right");
  const [playId, setPlayId] = useState(0);
  const currentRouteCallback = useRef(onEnter);
  currentRouteCallback.current = onEnter;
  const viewportRef = useRef(viewportWidth);
  viewportRef.current = viewportWidth;
  const arrivalTimer = useRef<number | undefined>(undefined);

  const unlockedMaxX = Math.min(worldWidth - 42, (unlockedRegionIndex + 1) * REGION_WIDTH - 42);
  const firstLockedRegionX = Math.min(worldWidth, (unlockedRegionIndex + 1) * REGION_WIDTH);
  const currentStop = stops[nearestIndex] ?? stops[0];
  route.current = { stops, maxX: unlockedMaxX, unlockedRegionIndex, availableStopIndex };

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const measure = () => setViewportWidth(element.clientWidth || 900);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const start = Math.min(unlockedMaxX, position);
    x.current = start;
    const nearest = stops.reduce((best, stop, index) =>
      Math.abs(stop.x - start) < Math.abs(stops[best]?.x - start) ? index : best, 0);
    nearestStopIndex.current = nearest;
    setNearestIndex(nearest);
    const region = Math.min(unlockedRegionIndex, Math.floor(start / REGION_WIDTH));
    previousRegion.current = region;
    setRegionIndex(region);
    // Initialize once per book. Saved positions are session-only and never
    // override the progression boundary when a later chapter remains locked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset.bookId]);

  useEffect(() => {
    if (x.current > unlockedMaxX) {
      x.current = unlockedMaxX;
      target.current = null;
      pending.current = null;
      input.current = { left: false, right: false, run: false };
    }
  }, [unlockedMaxX]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let lastStep = 0;
    let lastMotion: SpriteAction = "idle";
    let stride = 0;
    let paintedPose = -1;
    let paintedPosition = -1;
    let paintedCamera = -1;
    const maxStep = 110;
    const snap = (value: number) => Math.round(value * (window.devicePixelRatio || 1)) / (window.devicePixelRatio || 1);

    const animate = (now: number) => {
      const currentRoute = route.current;
      const dt = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      const keys = Number(input.current.right) - Number(input.current.left);
      const remaining = target.current === null ? 0 : target.current - x.current;
      const drive = keys || Math.sign(remaining);
      const startX = x.current;
      let nextMotion: SpriteAction = "idle";

      if (drive && !document.hidden) {
        const speed = input.current.run ? 190 : maxStep;
        const distance = drive * Math.min(speed * dt, keys ? Number.POSITIVE_INFINITY : Math.abs(remaining));
        const next = Math.max(42, Math.min(currentRoute.maxX, x.current + distance));
        if (next !== x.current) {
          x.current = next;
          nextMotion = input.current.run ? "run" : "walk";
          const nextDirection = drive < 0 ? "left" : "right";
          if (nextDirection !== facing.current) {
            facing.current = nextDirection;
            setDirection(nextDirection);
          }
          if (now - lastStep > 380) {
            sound.playDragonStep();
            lastStep = now;
          }
        } else {
          target.current = null;
          pending.current = null;
          if (drive > 0 && currentRoute.unlockedRegionIndex < preset.regions.length - 1) {
            setNotice("The next chapter opens when this chapter’s levels are complete.");
          }
        }
        if (target.current !== null && Math.abs(target.current - x.current) < 1) {
          x.current = target.current;
          target.current = null;
          const stopId = pending.current;
          pending.current = null;
          const stop = currentRoute.stops.find((item) => item.id === stopId);
          if (stop?.canEnter) {
            sound.playClick();
            currentRouteCallback.current(stop);
          }
        }
      }

      if (nextMotion !== lastMotion) {
        lastMotion = nextMotion;
        setMotion(nextMotion);
      }

      if (walkerSprite.current) {
        // A step follows distance traveled, including short clicks and speed changes.
        const moving = nextMotion !== "idle" && !preferences.reduced_motion;
        stride = moving ? stride + Math.abs(x.current - startX) : 0;
        const pose = moving ? WALK_FRAMES[Math.floor(stride / STRIDE_FRAME_DISTANCE) % WALK_FRAMES.length] : 1;
        if (pose !== paintedPose) {
          walkerSprite.current.style.backgroundPositionX = `${pose * 50}%`;
          paintedPose = pose;
        }
      }

      const camera = snap(Math.max(0, Math.min(worldWidth - viewportRef.current, x.current - viewportRef.current * 0.42)));
      cameraX.current = camera;
      if (camera !== paintedCamera) {
        world.current?.style.setProperty("transform", `translate3d(${-camera}px,0,0)`);
        paintedCamera = camera;
      }
      const screenPosition = snap(x.current);
      if (screenPosition !== paintedPosition) {
        const translation = `translate3d(${screenPosition}px,0,0)`;
        player.current?.style.setProperty("transform", translation);
        shadow.current?.style.setProperty("transform", translation);
        paintedPosition = screenPosition;
      }

      const nearest = currentRoute.stops.reduce((best, stop, index) =>
        Math.abs(stop.x - x.current) < Math.abs(currentRoute.stops[best]?.x - x.current) ? index : best, 0);
      if (nearest !== nearestStopIndex.current) {
        nearestStopIndex.current = nearest;
        setNearestIndex(nearest);
        const nearestStop = currentRoute.stops[nearest];
        if (nearestStop) setNotice(nearestStop.canEnter
          ? `${nearestStop.title}. Press E or choose “Enter level” to begin.`
          : `${nearestStop.title} opens after the previous level is complete.`);
      }

      const newRegion = Math.min(currentRoute.unlockedRegionIndex, Math.floor(x.current / REGION_WIDTH));
      if (newRegion !== previousRegion.current) {
        previousRegion.current = newRegion;
        setRegionIndex(newRegion);
        setArrival(newRegion);
        setPlayId((id) => id + 1);
        sound.playWandCast();
        window.clearTimeout(arrivalTimer.current);
        arrivalTimer.current = window.setTimeout(() => setArrival((active) => active === newRegion ? null : active), reducedMotion ? 120 : 1150);
      }
      frame = requestAnimationFrame(animate);
    };

    const stop = () => {
      input.current = { left: false, right: false, run: false };
      target.current = null;
      pending.current = null;
    };
    frame = requestAnimationFrame(animate);
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      try { sessionStorage.setItem(`${NEW_POSITION_KEY}:${preset.bookId}`, String(x.current)); } catch { /* Optional movement memory. */ }
      cancelAnimationFrame(frame);
      window.clearTimeout(arrivalTimer.current);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  // Stable RAF loop reads the current route and callbacks through refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset.bookId, preferences.reduced_motion, reducedMotion, worldWidth]);

  function walkToStop(index: number) {
    const stop = stops[index];
    if (!stop || stop.regionIndex > unlockedRegionIndex) {
      setNotice("Complete this chapter’s levels to reveal the path ahead.");
      return;
    }
    target.current = stop.x;
    pending.current = null;
    nearestStopIndex.current = index;
    stage.current?.focus();
  }

  function enterStop(index = nearestIndex) {
    const stop = stops[index];
    if (!stop) return;
    if (!stop.canEnter) {
      setNotice("Complete the previous level to unlock this one.");
      return;
    }
    if (Math.abs(stop.x - x.current) > 42) {
      target.current = stop.x;
      pending.current = stop.id;
      stage.current?.focus();
      setNotice(`Walking to ${stop.title}…`);
      return;
    }
    sound.playClick();
    onEnter(stop);
  }

  function walkToRegion(index: number) {
    if (index > unlockedRegionIndex) return;
    target.current = index * REGION_WIDTH + 48;
    pending.current = null;
    stage.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target !== event.currentTarget) return;
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "a", "d", "shift"].includes(key)) {
      event.preventDefault();
      if (key === "shift") input.current.run = true;
      else {
        input.current[key === "a" || key === "arrowleft" ? "left" : "right"] = true;
        target.current = null;
        pending.current = null;
      }
    } else if ((key === "e" || key === "enter") && !event.repeat) {
      event.preventDefault();
      enterStop();
    }
  }

  function handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    const key = event.key.toLowerCase();
    if (key === "shift") input.current.run = false;
    if (["arrowleft", "a"].includes(key)) input.current.left = false;
    if (["arrowright", "d"].includes(key)) input.current.right = false;
  }

  function walkToPointer(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const next = cameraX.current + event.clientX - rect.left;
    target.current = Math.max(42, Math.min(unlockedMaxX, next));
    pending.current = null;
    stage.current?.focus();
  }

  const activeRegion = preset.regions[regionIndex] ?? preset.regions[0];
  const sceneStyle = (background: string): CSSProperties => ({ backgroundImage: `url("${background}")` });
  const chapterDirectory = preset.regions.flatMap((region, index) => region.stops.map((stop) => ({ region, regionIndex: index, stop })));

  return (
    <section className="sc-walking-world sc-book-walk" data-book-theme={preset.bookId === "cinder" ? "cinder" : "wizarding"} aria-label={`Walk through ${preset.bookId === "cinder" ? "The Last Light" : "The Horcrux Code"}`}>
      <ol className="sc-book-walk-chapters" aria-label="Chapter areas">
        {preset.regions.map((region, index) => {
          const open = index <= unlockedRegionIndex;
          const done = index < unlockedRegionIndex || allComplete;
          return (
            <li key={region.id}>
              <button type="button" disabled={!open} aria-current={index === regionIndex ? "location" : undefined} onClick={() => walkToRegion(index)}>
                <span className="sc-book-walk-chapters__number">{done ? <Check size={14} /> : !open ? <LockKeyhole size={13} /> : String(index + 1).padStart(2, "0")}</span>
                <span><small>{region.chapterLabel}</small><strong>{region.title}</strong><em>{region.subtitle}</em></span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="sc-book-walk-map-head">
        <div><small>{activeRegion.chapterLabel}</small><h2>{activeRegion.title}</h2><p>{activeRegion.subtitle}</p></div>
        <span>{completed.size}/{stops.length} {preset.levelNoun === "spell" ? "spells" : "chapters"} complete</span>
      </div>

      <div
        className={`sc-walking-stage sc-book-walk-stage${reducedMotion ? " is-reduced-motion" : ""}`}
        ref={stage}
        tabIndex={0}
        role="group"
        aria-label="Interactive chapter path. Use left and right arrow keys or A and D to walk, Shift to run, and E or Enter to open a level."
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={() => { input.current = { left: false, right: false, run: false }; }}
        onClick={walkToPointer}
      >
        <div ref={world} className="sc-book-walk-world" style={{ width: worldWidth }}>
          {preset.regions.map((region, index) => (
            <div className="sc-book-walk-region" key={region.id} data-region-index={index} style={{ ...sceneStyle(region.background), left: index * REGION_WIDTH, width: REGION_WIDTH }} aria-hidden="true">
              <span className="sc-book-walk-horizon" />
              <span className="sc-book-walk-ground" style={region.ground ? sceneStyle(region.ground) : undefined} />
              {index > 0 && <span className="sc-book-walk-gate" />}
              <span className="sc-book-walk-sign"><small>{region.chapterLabel}</small><strong>{region.title}</strong></span>
            </div>
          ))}
          <svg className="sc-book-walk-route" width={worldWidth} height="100%" viewBox={`0 0 ${worldWidth} 400`} preserveAspectRatio="none" aria-hidden="true">
            <path d={`M ${stops[0]?.x ?? 145} 324 ${stops.map((stop, index) => `Q ${stop.x - 18} ${index % 2 ? 299 : 313} ${stop.x} 324`).join(" ")}`} />
          </svg>
          {stops.map((stop) => (
            <button
              className={`sc-book-walk-stop${stop.complete ? " is-complete" : ""}${!stop.canEnter ? " is-locked" : ""}${nearestIndex === stop.index ? " is-current" : ""}`}
              key={stop.id}
              type="button"
              style={{ left: stop.x }}
              aria-label={`${stop.complete ? "Completed" : stop.canEnter ? "Available" : "Locked"}: ${stop.title}. ${stop.subtitle}`}
              aria-disabled={!stop.canEnter}
              aria-current={nearestIndex === stop.index ? "step" : undefined}
              onClick={(event) => { event.stopPropagation(); walkToStop(stop.index); }}
            >
              <span className="sc-book-walk-stop__art">{stop.art ? <img src={stop.art} alt="" /> : <span aria-hidden="true">✦</span>}</span>
              <span className="sc-book-walk-stop__pin">{stop.complete ? <Check size={16} /> : !stop.canEnter ? <LockKeyhole size={14} /> : String(stop.index + 1).padStart(2, "0")}</span>
              <span className="sc-book-walk-stop__name"><strong>{stop.title}</strong><small>{stop.subtitle}</small></span>
            </button>
          ))}
          <span ref={shadow} className="sc-book-walk-shadow" aria-hidden="true" />
          <div ref={player} className="sc-book-walk-player" aria-hidden="true">
            {preset.walker ? (
              <span ref={walkerSprite} className="sc-book-walk-sprite" data-motion={motion}
                style={{ backgroundImage: `url(${preset.walker.sheet})`, backgroundPositionY: `${(direction === "left" ? preset.walker.leftRow : preset.walker.rightRow) / 3 * 100}%` }} />
            ) : (
              <AvatarGraphic appearance={appearance} action={motion} direction={direction} size={PLAYER_WIDTH} directControl={motion !== "idle"} playId={playId} />
            )}
          </div>
          {firstLockedRegionX < worldWidth && <div className="sc-book-walk-fog" style={{ left: firstLockedRegionX - 110, width: worldWidth - firstLockedRegionX + 110 }} aria-hidden="true" />}
        </div>
        {arrival !== null && <div key={arrival} className="sc-chapter-arrival sc-book-walk-arrival" role="status"><small>{preset.regions[arrival]?.chapterLabel}</small><strong>{preset.regions[arrival]?.title}</strong></div>}
      </div>
      <div className="sc-book-walk-caption" role="status" aria-live="polite"><strong>{currentStop?.title}</strong><span>{currentStop?.canEnter ? "Press E or select Enter level" : "Complete the previous level to open this one"}</span></div>
      <p className="sc-clearing-message sc-book-walk-notice" role="status" aria-live="polite">{notice}</p>
      <div className="sc-trail-controls sc-book-walk-controls">
        <span>← → walk · Shift run · E enter</span>
        <div>
          {([-1, 1] as const).map((step) => (
            <button key={step} type="button" aria-label={step < 0 ? "Walk left" : "Walk right"}
              onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); input.current[step < 0 ? "left" : "right"] = true; target.current = null; pending.current = null; }}
              onPointerUp={() => { input.current.left = false; input.current.right = false; }}
              onPointerCancel={() => { input.current.left = false; input.current.right = false; }}
              onLostPointerCapture={() => { input.current.left = false; input.current.right = false; }}
              onClick={(event) => { if (event.detail === 0) { target.current = Math.max(42, Math.min(unlockedMaxX, x.current + step * 100)); stage.current?.focus(); } }}
            >{step < 0 ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}</button>
          ))}
          <button type="button" disabled={!currentStop?.canEnter} onClick={() => enterStop()}><Hand size={15} /> Enter level</button>
        </div>
      </div>

      <details className="sc-accessible-route sc-book-walk-directory">
        <summary>Browse levels without walking</summary>
        <div>
          {chapterDirectory.map(({ region, regionIndex: group, stop }) => {
            const stopIndex = stops.findIndex((item) => item.id === stop.id);
            const positioned = stops[stopIndex];
            return <button type="button" key={stop.id} disabled={!positioned?.canEnter} onClick={() => onEnter(stop)}>
              <small>{region.chapterLabel} · {region.title}</small><strong>{stop.title}</strong><span>{positioned?.complete ? "Completed" : positioned?.canEnter ? "Open level" : group > unlockedRegionIndex ? "Chapter locked" : "Complete the previous level"}</span>
            </button>;
          })}
        </div>
      </details>
    </section>
  );
}
