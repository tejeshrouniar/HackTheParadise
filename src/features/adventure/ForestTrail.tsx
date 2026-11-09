import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Footprints,
  Hand,
  Sparkles,
} from "lucide-react";
import {
  AvatarGraphic,
  type SpriteAction,
  type SpriteDirection,
} from "./AvatarGraphic";
import { useAppearance } from "./AppearanceContext";
import { interactionDuration, spriteClips } from "./spriteAnimation";

import { sound } from "../../utils/sound";
import sky from "../../assets/trail/sky.png";
import far from "../../assets/trail/far.png";
import middle from "../../assets/trail/middle.png";
import near from "../../assets/trail/near.png";
import bushes from "../../assets/trail/bushes.png";
import ground from "../../assets/trail/ground.png";
import lamp from "../../assets/trail/lamp.png";
import chest from "../../assets/realms/treasure_chest.png";
import arch from "../../assets/trail/arch.png";

const viewWidth = 640;
const trailWidth = 1280;
const groundLine = 309;
const viewHeight = 278;
const walkSpeed = 96;
const runSpeed = 176;
const acceleration = 1100;
const layers = [
  [far, 0.18],
  [middle, 0.36],
  [near, 0.58],
  [bushes, 0.82],
  [ground, 1],
] as const;
const landmarks = [
  {
    x: 270,
    image: lamp,
    width: 40,
    height: 108,
    name: "Light the lantern",
  },
  {
    x: 610,
    image: chest,
    width: 64,
    height: 64,
    name: "Find the keepsake",
  },
  {
    x: 1040,
    image: arch,
    width: 167,
    height: 110,
    name: "Enter your story",
  },
];
type Landmark = (typeof landmarks)[number];

function bound(value: number, min = 46, max = trailWidth - 46) {
  return Math.max(min, Math.min(max, value));
}

export function ForestTrail({ onStory }: { onStory: () => void }) {
  const { appearance } = useAppearance();
  const [position, setPosition] = useState(160);
  const [action, setAction] = useState<SpriteAction>("idle");
  const [direction, setDirection] = useState<SpriteDirection>("right");
  const [interactionId, setInteractionId] = useState(0);
  const [lanternLit, setLanternLit] = useState(false);
  const [message, setMessage] = useState("A quiet clearing, a hidden keepsake, and a road waiting for you.");
  const [destination, setDestination] = useState<Landmark | null>(null);
  const [discovered, setDiscovered] = useState<string[]>(() => {
    try { const saved: unknown = JSON.parse(localStorage.getItem("storicode:clearing") ?? "[]"); return Array.isArray(saved) ? saved.filter((value): value is string => typeof value === "string" && landmarks.some(mark => mark.name === value)) : []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("storicode:clearing", JSON.stringify(discovered)); } catch { /* Exploration remains available when storage is blocked. */ } }, [discovered]);
  const glowId = useId();
  const x = useRef(160);
  const target = useRef<number | null>(null);
  const velocity = useRef(0);
  const travelRunning = useRef(false);
  const pending = useRef<Landmark | null>(null);
  const keys = useRef({ left: false, right: false, sprint: false });
  const playing = useRef<SpriteAction>("idle");
  const interactUntil = useRef(0);
  const stepAt = useRef(0);
  const stage = useRef<HTMLDivElement>(null);

  function interact(landmark: Landmark, time = performance.now()) {
    target.current = null;
    pending.current = null;
    velocity.current = 0;
    keys.current = { left: false, right: false, sprint: false };
    interactUntil.current = time + interactionDuration;
    playing.current = "interact";
    setAction("interact");
    setInteractionId((value) => value + 1);
    setDirection(landmark.x < x.current ? "left" : "right");
    if (landmark.image === lamp) { setLanternLit(value => !value); setMessage("The lantern answers your touch. Come back whenever you need a little light."); }
    if (landmark.image === chest) setMessage("You found the clearing’s keepsake. A small discovery, just for you.");
    if (landmark.image === arch) setDestination(landmark);
    setDiscovered((previous) =>
      previous.includes(landmark.name)
        ? previous
        : [...previous, landmark.name],
    );
    sound.playCrystalCollect();
  }

  useEffect(() => {
    let frame = 0;
    let previous = performance.now();
    function animate(time: number) {
      const dt = Math.min((time - previous) / 1000, 0.05);
      previous = time;
      const keyboard = Number(keys.current.right) - Number(keys.current.left);
      const remaining =
        target.current === null ? 0 : target.current - x.current;
      const interacting = time < interactUntil.current;
      const move = interacting ? 0 : keyboard || Math.sign(remaining);
      const running = keyboard ? keys.current.sprint : travelRunning.current;
      const speed = running ? runSpeed : walkSpeed;
      // Brake toward a click destination, and ease keyboard starts/stops.
      const desired = move * (keyboard ? speed : Math.min(
        speed, Math.sqrt(2 * acceleration * Math.abs(remaining)),
      ));
      velocity.current += bound(desired - velocity.current, -acceleration * dt, acceleration * dt);
      if (Math.abs(velocity.current) < 0.5) velocity.current = 0;
      let distance = velocity.current * dt;
      if (!keyboard && target.current !== null && Math.sign(distance) === Math.sign(remaining))
        distance = Math.sign(distance) * Math.min(Math.abs(distance), Math.abs(remaining));
      const next = bound(x.current + distance);
      let nextAction: SpriteAction =
        time < interactUntil.current ? "interact" : "idle";

      if (Math.abs(next - x.current) > 0.01) {
        x.current = next;
        setPosition(next);
        setDirection(distance < 0 ? "left" : "right");
        nextAction = Math.abs(velocity.current) > walkSpeed + 18 ? "run" : "walk";
        const gait = spriteClips[nextAction];
        if (time - stepAt.current > gait.frames * gait.frameMs / 2) {
          sound.playDragonStep();
          stepAt.current = time;
        }
      }
      if (target.current !== null && Math.abs(target.current - x.current) < 1) {
        x.current = target.current;
        setPosition(x.current);
        target.current = null;
        velocity.current = 0;
        if (pending.current) {
          interact(pending.current, time);
          pending.current = null;
          nextAction = "interact";
        }
      }
      if (nextAction !== playing.current) {
        playing.current = nextAction;
        setAction(nextAction);
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    const release = () => {
      keys.current = { left: false, right: false, sprint: false };
      velocity.current = 0;
      target.current = null;
      pending.current = null;
      previous = performance.now();
    };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", release);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", release);
    };
  }, []);

  useEffect(() => {
    if (!destination) return;
    const timer = window.setTimeout(
      () => onStory(),
      interactionDuration,
    );
    return () => window.clearTimeout(timer);
  }, [destination, onStory]);

  const renderPosition = Math.round(position);
  const camera = Math.round(bound(position - viewWidth / 2, 0, trailWidth - viewWidth));
  const nearby = landmarks.find(
    (landmark) => Math.abs(landmark.x - position) <= 86,
  );
  function goTo(destination: number, landmark?: Landmark) {
    setDestination(null);
    interactUntil.current = 0;
    pending.current = landmark ?? null;
    target.current = bound(destination);
    travelRunning.current = Math.abs(target.current - x.current) > 150;
    stage.current?.focus({ preventScroll: true });
  }
  function onKey(event: KeyboardEvent<HTMLDivElement>, down: boolean) {
    if (
      event.target !== event.currentTarget ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "a", "d", "shift"].includes(key)) {
      event.preventDefault();
      if (key === "arrowleft" || key === "a") keys.current.left = down;
      else if (key === "arrowright" || key === "d") keys.current.right = down;
      else keys.current.sprint = down;
      if (down && key !== "shift") {
        target.current = null;
        pending.current = null;
        interactUntil.current = 0;
        setDestination(null);
      }
    } else if (down && key === "e" && nearby && !event.repeat) {
      event.preventDefault();
      interact(nearby);
    }
  }

  return (
    <section className="sc-trail sc-home-clearing" aria-label="Explore the clearing">
      <div className="sc-trail-label">
        <div>
          <span>
            <Sparkles size={14} /> FREE ROAM
          </span>
          <h2>The Lantern Clearing</h2>
        </div>
        <small>
          {discovered.filter(name => name !== "Enter your story").length} / 2 discoveries
        </small>
      </div>
      <div
        className="sc-trail-stage"
        ref={stage}
        tabIndex={0}
        aria-label="The clearing. Arrow keys to walk, Shift to run, E to interact."
        onKeyDown={(event) => onKey(event, true)}
        onKeyUp={(event) => onKey(event, false)}
        onBlur={() => {
          keys.current = { left: false, right: false, sprint: false };
        }}
        onClick={(event) => {
          if ((event.target as Element).closest("button"))
            return;
          const bounds = event.currentTarget.getBoundingClientRect();
          goTo(
            camera + ((event.clientX - bounds.left) / bounds.width) * viewWidth,
          );
        }}
      >
        <svg
          viewBox={`0 ${360 - viewHeight} ${viewWidth} ${viewHeight}`}
          aria-hidden="true"
          className="sc-trail-art"
        >
          <defs>
            <radialGradient id={glowId}>
              <stop stopColor="#fff0a5" stopOpacity=".8" />
              <stop offset="1" stopColor="#ffc66c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <image href={sky} width="640" height="360" />
          {layers.map(([asset, depth]) => {
            const offset = Math.round(camera * depth) % viewWidth;
            return (
              <g key={asset}>
                <image href={asset} x={-offset} width="640" height="360" />
                <image
                  href={asset}
                  x={viewWidth - offset}
                  width="640"
                  height="360"
                />
              </g>
            );
          })}
          {landmarks.map((landmark) => (
            <g key={landmark.name}>
              <image
                href={landmark.image}
                x={landmark.x - camera - landmark.width / 2}
                y={groundLine - landmark.height}
                width={landmark.width}
                height={landmark.height}
              />
              {(landmark.image === lamp ? lanternLit : discovered.includes(landmark.name)) && (
                <circle
                  cx={landmark.x - camera + (landmark.image === lamp ? 10 : 0)}
                  cy={groundLine - landmark.height + 30}
                  r="29"
                  fill={`url(#${glowId})`}
                />
              )}
            </g>
          ))}
          <ellipse
            cx={renderPosition - camera}
            cy={groundLine}
            rx={13}
            ry={3}
            fill="#092118"
            opacity=".7"
          />
          <AvatarGraphic
            appearance={appearance}
            action={action}
            playId={interactionId}
            directControl={action === "walk" || action === "run"}
            direction={direction}
            size={64}
            x={renderPosition - camera - 32}
            y={groundLine - 63}
          />
        </svg>
        {landmarks
          .filter((item) => item.x - camera > 38 && item.x - camera < 602)
          .map((landmark) => (
            <button
              type="button"
              key={landmark.name}
              className="sc-trail-marker"
              style={{
                left: `${((landmark.x - camera) / viewWidth) * 100}%`,
                bottom: `${((360 - groundLine + landmark.height + 10) / viewHeight) * 100}%`,
              }}
              onClick={() => {
                if (Math.abs(landmark.x - position) <= 86) interact(landmark);
                else goTo(landmark.x + (x.current < landmark.x ? -36 : 36), landmark);
              }}
            >
              <Hand size={13} /> {discovered.includes(landmark.name) && landmark.image !== arch ? "✓ " : ""}{landmark.name}
            </button>
          ))}

      </div>
      <p className="sc-clearing-message" role="status">{message}</p>
      <div className="sc-trail-controls">
        <span>
          <Footprints size={16} /> Click the trail or use <kbd>←</kbd>{" "}
          <kbd>→</kbd>. Hold <kbd>Shift</kbd> to run.
        </span>
        <div>
          <button
            type="button"
            aria-label="Walk left"
            onClick={() => goTo(x.current - 100)}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            aria-label="Walk right"
            onClick={() => goTo(x.current + 100)}
          >
            <ArrowRight size={19} />
          </button>
          <button
            type="button"
            disabled={!nearby}
            onClick={() => {
              if (nearby) interact(nearby);
            }}
          >
            <Hand size={16} /> Interact
          </button>
        </div>
      </div>

    </section>
  );
}
