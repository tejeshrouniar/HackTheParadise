import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Hand, LockKeyhole } from "lucide-react";
import { sound } from "../../utils/sound";
import { AvatarGraphic, type SpriteDirection, type SpriteAction } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { BOOK_PUZZLES } from "../../content/codeCampaign";
import diary from "../../assets/storybooks/relics/diary.webp";
import ring from "../../assets/storybooks/relics/ring.webp";
import locket from "../../assets/storybooks/relics/locket.webp";
import cup from "../../assets/storybooks/relics/cup.webp";
import diadem from "../../assets/storybooks/relics/diadem.webp";
import snake from "../../assets/storybooks/relics/snake.webp";
import pensieve from "../../assets/storybooks/relics/pensieve.webp";
import voldemort from "../../assets/storybooks/relics/voldemort.webp";
import sock from "../../assets/storybooks/relics/sock.webp";
import snitch from "../../assets/storybooks/relics/snitch.webp";
import wand from "../../assets/storybooks/relics/wand.webp";
import greatHall from "../../assets/storybooks/relics/great-hall.webp";

const SEGMENT = 300;
const WORLD_WIDTH = SEGMENT * BOOK_PUZZLES.length;
const WORLD_HEIGHT = 360;
const WALK_KEY = "storicode:harry-potter-world-position-v1";
const relics = [diary, ring, locket, cup, diadem, snake, pensieve, voldemort, sock, snitch, wand, greatHall];

/** A controlled, keyboard and touch friendly route through the coding chapters. */
export function WizardingWalk({
  completed,
  onOpenChapter,
}: {
  completed: readonly string[];
  onOpenChapter: (chapterId: string) => void;
}) {
  const { appearance } = useAppearance();
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const x = useRef(80);
  const cameraPosition = useRef(0);
  const nearestPosition = useRef(0);
  const held = useRef({ left: false, right: false, run: false });
  const target = useRef<number | null>(null);
  const announcedStop = useRef<number | null>(null);
  const [viewport, setViewport] = useState(900);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const [action, setAction] = useState<SpriteAction>("idle");
  const actionRef = useRef<SpriteAction>("idle");
  const [direction, setDirection] = useState<SpriteDirection>("right");
  const directionRef = useRef<SpriteDirection>("right");
  const [nearestIndex, setNearestIndex] = useState(0);
  const [notice, setNotice] = useState("Walk to a chapter marker, then press E to open it.");
  const [regionFlash, setRegionFlash] = useState<number | null>(null);

  const unlockedIndex = useMemo(() => {
    const firstOpen = BOOK_PUZZLES.findIndex((chapter) => !completed.includes(chapter.chapterId));
    return firstOpen < 0 ? BOOK_PUZZLES.length - 1 : firstOpen;
  }, [completed]);
  const stops = useMemo(() => BOOK_PUZZLES.map((chapter, index) => ({
    chapter,
    index,
    x: 150 + index * SEGMENT,
    unlocked: index <= unlockedIndex,
    done: completed.includes(chapter.chapterId),
  })), [completed, unlockedIndex]);
  const nearest = stops[nearestIndex];
  const pixelScale = window.devicePixelRatio || 1;
  const snap = (value: number) => Math.round(value * pixelScale) / pixelScale;
  const maxX = stops[unlockedIndex]?.x ?? stops[0].x;
  const region = Math.floor(nearestIndex / 3);
  const route = useRef({ maxX, nearestIndex, stops });
  route.current = { maxX, nearestIndex, stops };

  function setSpriteAction(next: SpriteAction) {
    if (actionRef.current === next) return;
    actionRef.current = next;
    setAction(next);
  }

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const measure = () => setViewport(element.clientWidth || 900);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let saved: number | null = null;
    try {
      const value = Number(sessionStorage.getItem(WALK_KEY));
      if (Number.isFinite(value) && value >= 40) saved = value;
    } catch { /* Walking remains available when session storage is blocked. */ }
    const start = Math.max(50, Math.min(saved ?? Math.max(80, stops[unlockedIndex].x - 110), maxX));
    x.current = start;
    nearestPosition.current = Math.max(0, Math.min(stops.length - 1, Math.round((start - 150) / SEGMENT)));
    setNearestIndex(nearestPosition.current);
  // The route initializes once; later progress updates only move its boundary.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (x.current > maxX) {
      x.current = maxX;
      target.current = null;
      held.current = { left: false, right: false, run: false };
    }
  }, [maxX]);

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    let lastStep = 0;
    const animate = (now: number) => {
      const currentRoute = route.current;
      const dt = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      const keys = Number(held.current.right) - Number(held.current.left);
      const remaining = target.current === null ? 0 : target.current - x.current;
      const drive = keys || Math.sign(remaining);
      if (drive && !document.hidden) {
        const speed = held.current.run ? 200 : 112;
        const distance = drive * Math.min(speed * dt, keys ? Number.POSITIVE_INFINITY : Math.abs(remaining));
        const next = Math.max(42, Math.min(currentRoute.maxX, x.current + distance));
        if (next !== x.current) {
          x.current = next;
          const nextDirection = drive < 0 ? "left" : "right";
          if (directionRef.current !== nextDirection) {
            directionRef.current = nextDirection;
            setDirection(nextDirection);
          }
          setSpriteAction(held.current.run ? "run" : "walk");
          if (now - lastStep > 360) {
            sound.playDragonStep();
            lastStep = now;
          }
        } else {
          setSpriteAction("idle");
          target.current = null;
        }
        const arrived = target.current !== null && Math.abs(target.current - x.current) < 1;
        const nearestNow = Math.max(0, Math.min(currentRoute.stops.length - 1, Math.round((x.current - 150) / SEGMENT)));
        const close = Math.abs(currentRoute.stops[nearestNow]?.x - x.current) < 32;
        if (arrived || close) {
          target.current = null;
          setSpriteAction("idle");
          if (close && announcedStop.current !== nearestNow) {
            announcedStop.current = nearestNow;
            setNotice(currentRoute.stops[nearestNow].unlocked
              ? `${currentRoute.stops[nearestNow].chapter.chapterTitle}. Press E or choose “Enter chapter” to begin.`
              : "The mist hides this path. Complete the earlier chapter to continue.");
          }
        }
      } else {
        setSpriteAction("idle");
      }
      // Drive pixel positions directly per frame. React only updates at chapter
      // boundaries, avoiding full map-tree renders while the player is walking.
      const viewWidth = viewportRef.current;
      const camera = snap(Math.max(0, Math.min(WORLD_WIDTH - viewWidth, x.current - viewWidth * 0.42)));
      cameraPosition.current = camera;
      world.current?.style.setProperty("transform", `translate3d(${-camera}px,0,0)`);
      player.current?.style.setProperty("left", `${snap(x.current - 36)}px`);
      shadow.current?.style.setProperty("left", `${snap(x.current)}px`);
      const nearestNow = Math.max(0, Math.min(currentRoute.stops.length - 1, Math.round((x.current - 150) / SEGMENT)));
      if (nearestNow !== nearestPosition.current) {
        nearestPosition.current = nearestNow;
        setNearestIndex(nearestNow);
      }
      frame = requestAnimationFrame(animate);
    };
    const stop = () => { held.current = { left: false, right: false, run: false }; target.current = null; setSpriteAction("idle"); };
    frame = requestAnimationFrame(animate);
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      try { sessionStorage.setItem(WALK_KEY, String(x.current)); } catch { /* Optional position memory. */ }
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);

  useEffect(() => {
    setRegionFlash(region);
    const timer = window.setTimeout(() => setRegionFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [region]);

  function walkTo(index: number) {
    const stop = stops[index];
    if (!stop?.unlocked) {
      setNotice("Complete the previous code chapter to unlock this landmark.");
      return;
    }
    announcedStop.current = null;
    target.current = stop.x;
    stage.current?.focus();
  }

  function enter(index = nearestIndex) {
    const stop = stops[index];
    if (!stop?.unlocked) {
      setNotice("Complete the previous code chapter to unlock this landmark.");
      return;
    }
    if (Math.abs(stop.x - x.current) > 36) {
      walkTo(index);
      setNotice(`Walking to ${stop.chapter.chapterTitle}…`);
      return;
    }
    sound.playClick();
    onOpenChapter(stop.chapter.chapterId);
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target !== event.currentTarget) return;
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "a", "d", "shift"].includes(key)) {
      event.preventDefault();
      if (key === "shift") held.current.run = true;
      else {
        held.current[key === "a" || key === "arrowleft" ? "left" : "right"] = true;
        target.current = null;
        announcedStop.current = null;
      }
    } else if ((key === "e" || key === "enter") && !event.repeat) {
      event.preventDefault();
      enter();
    }
  }

  function onKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    const key = event.key.toLowerCase();
    if (key === "shift") held.current.run = false;
    if (["arrowleft", "a"].includes(key)) held.current.left = false;
    if (["arrowright", "d"].includes(key)) held.current.right = false;
    if (!held.current.left && !held.current.right) setSpriteAction("idle");
  }

  function movePointer(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    target.current = Math.max(42, Math.min(maxX, cameraPosition.current + event.clientX - rect.left));
    announcedStop.current = null;
    stage.current?.focus();
  }

  const regionName = ["The Castle", "The Forbidden Forest", "The Cave and Pensieve", "The Final Stand"][region];
  return (
    <section className="sc-walking-world sc-wizard-walking" aria-label="Walk through the Harry Potter coding adventure">
      <div className="sc-trail-label">
        <div><span>CHAPTER {String(nearestIndex + 1).padStart(2, "0")}</span><h2>{regionName}</h2></div>
        <small>{completed.length}/{BOOK_PUZZLES.length} chapters solved</small>
      </div>
      <div
        className="sc-walking-stage sc-wizard-walk-stage"
        ref={stage}
        tabIndex={0}
        role="group"
        aria-label="Interactive map. Use left and right arrow keys or A and D to walk, Shift to run, and E or Enter to open the selected chapter."
        data-region={region}
        data-scene={nearest.chapter.scene}
        onKeyDown={onKey}
        onKeyUp={onKeyUp}
        onBlur={() => { held.current = { left: false, right: false, run: false }; setSpriteAction("idle"); }}
        onClick={movePointer}
      >
        <div className="sc-wizard-sky" aria-hidden="true">
          <span className="sc-wizard-castle" />
          <span className="sc-wizard-tower sc-wizard-tower--left" />
          <span className="sc-wizard-tower sc-wizard-tower--right" />
          <span className="sc-wizard-moon" />
          <span className="sc-wizard-glow" />
        </div>
        <div ref={world} className="sc-wizard-world" style={{ width: WORLD_WIDTH }}>
          <svg className="sc-wizard-path" width={WORLD_WIDTH} height={WORLD_HEIGHT} viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`} aria-hidden="true">
            <path d={`M 45 282 ${stops.map((stop, index) => `Q ${stop.x - 20} ${index % 2 ? 262 : 275} ${stop.x} 278`).join(" ")}`} />
          </svg>
          {stops.map((stop) => (
            <button
              className={`sc-wizard-stop ${stop.done ? "is-done" : ""} ${!stop.unlocked ? "is-locked" : ""} ${nearestIndex === stop.index ? "is-current" : ""}`}
              key={stop.chapter.chapterId}
              type="button"
              style={{ left: stop.x }}
              aria-label={`${stop.done ? "Completed" : stop.unlocked ? "Walk to" : "Locked"}: Chapter ${stop.index + 1}, ${stop.chapter.chapterTitle}`}
              aria-disabled={!stop.unlocked}
              aria-current={nearestIndex === stop.index ? "step" : undefined}
              onClick={(event) => { event.stopPropagation(); walkTo(stop.index); }}
            >
              <span className="sc-wizard-stop__art"><img src={relics[stop.index]} alt="" /></span>
              <span className="sc-wizard-stop__pin">{stop.done ? <Check size={17} /> : stop.unlocked ? String(stop.index + 1).padStart(2, "0") : <LockKeyhole size={14} />}</span>
              <span className="sc-wizard-stop__name"><strong>{stop.chapter.chapterTitle}</strong><small>{stop.chapter.conceptName}</small></span>
            </button>
          ))}
          <span className="sc-wizard-ground" aria-hidden="true" />
          <span className="sc-wizard-fog" style={{ left: stops[unlockedIndex + 1]?.x ?? WORLD_WIDTH, width: Math.max(0, WORLD_WIDTH - (stops[unlockedIndex + 1]?.x ?? WORLD_WIDTH)) }} aria-hidden="true" />
          <span ref={shadow} className="sc-wizard-shadow" aria-hidden="true" />
          <div ref={player} className="sc-wizard-player" aria-hidden="true">
            <AvatarGraphic appearance={appearance} action={action} direction={direction} size={72} directControl={action !== "idle"} />
          </div>
        </div>
        {regionFlash !== null && <div className="sc-chapter-arrival sc-wizard-arrival" role="status" key={regionFlash}><small>NEW PLACE</small><strong>{["The Castle", "The Forbidden Forest", "The Cave and Pensieve", "The Final Stand"][regionFlash]}</strong></div>}
      </div>
      <p className="sc-clearing-message" role="status" aria-live="polite">{notice}</p>
      <div className="sc-trail-controls sc-wizard-controls">
        <span>← → walk · Shift run · E enter</span>
        <div>
          {([-1, 1] as const).map((step) => (
            <button
              key={step}
              type="button"
              aria-label={step < 0 ? "Walk left" : "Walk right"}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                held.current[step < 0 ? "left" : "right"] = true;
                target.current = null;
              }}
              onPointerUp={() => { held.current.left = false; held.current.right = false; setSpriteAction("idle"); }}
              onPointerCancel={() => { held.current.left = false; held.current.right = false; setSpriteAction("idle"); }}
              onLostPointerCapture={() => { held.current.left = false; held.current.right = false; setSpriteAction("idle"); }}
              onClick={(event) => {
                if (event.detail === 0) {
                  target.current = Math.max(42, Math.min(maxX, x.current + step * 95));
                  stage.current?.focus();
                }
              }}
            >{step < 0 ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}</button>
          ))}
          <button type="button" disabled={!nearest.unlocked} onClick={() => enter()}><Hand size={16} /> Enter chapter</button>
        </div>
      </div>
      <section className="sc-wizard-levels" aria-labelledby="sc-wizard-levels-title">
        <header className="sc-wizard-levels__heading">
          <div><span>THE CODE PATH</span><h3 id="sc-wizard-levels-title">Chapter levels</h3></div>
          <small>{completed.length} of {BOOK_PUZZLES.length} solved</small>
        </header>
        <ol className="sc-wizard-level-grid">
          {stops.map((stop) => (
            <li key={stop.chapter.chapterId}>
              <button
                className={`sc-wizard-level ${stop.done ? "is-done" : ""}`}
                type="button"
                disabled={!stop.unlocked}
                onClick={() => onOpenChapter(stop.chapter.chapterId)}
                aria-label={`${stop.done ? "Replay completed" : stop.unlocked ? "Start" : "Locked"} level ${stop.index + 1}: ${stop.chapter.chapterTitle}. ${stop.chapter.conceptName}`}
              >
                <span className="sc-wizard-level__number">{String(stop.index + 1).padStart(2, "0")}</span>
                <span className="sc-wizard-level__copy"><small>{stop.done ? "COMPLETE" : stop.unlocked ? "CODE LEVEL" : "LOCKED"}</small><strong>{stop.chapter.chapterTitle}</strong><span>{stop.chapter.conceptName}</span></span>
                <span className="sc-wizard-level__state" aria-hidden="true">{stop.done ? <Check size={16} /> : stop.unlocked ? <ArrowRight size={16} /> : <LockKeyhole size={14} />}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
