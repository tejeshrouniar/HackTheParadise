import { useEffect, useRef, useState } from "react";
import { AvatarGraphic } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";
import { JOURNEY } from "../../content/journey";
import { sound } from "../../utils/sound";
import { usePreferences } from "../settings/PreferencesContext";
import { useProgress } from "../learning/ProgressContext";
import { journeyProgress } from "../learning/journeyProgress";
import lanternwood from "../../assets/realms/lanternwood.png";
import moonlit from "../../assets/realms/moonlit.png";
import amber from "../../assets/realms/amber.png";
import dawnreach from "../../assets/realms/dawnreach.png";
const realmAssets = import.meta.glob<string>("../../assets/realms/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const prop = (name: string) => realmAssets[`../../assets/realms/${name}.png`];
import { useMusic } from "../tools/MusicContext";
import { soundscapes } from "../../services/music";
import { PixelDragon } from "./PixelDragon";

const backgrounds = [lanternwood, moonlit, amber, dawnreach];
// Cutscene poses are deterministic from chapter, beat, and playback progress.
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const phase = (progress: number, start: number, end: number) =>
  clamp((progress - start) / (end - start));
const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export function JourneyScene({
  chapter,
  beat = 0,
  progress: rawProgress = 0,
  playing = false,
}: {
  chapter: number;
  beat?: number;
  progress?: number;
  playing?: boolean;
}) {
  const { appearance } = useAppearance();
  const { preferences } = usePreferences();
  const progress = preferences.reduced_motion
    ? Number(rawProgress >= 0.55)
    : rawProgress;
  const floor = chapter === 0 ? 312 : 288;
  const crossing = chapter === 1 || chapter === 3;
  const item = (name: string, x: number, y: number, size = 32) => (
    <image
      href={prop(name)}
      x={x}
      y={y}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
    />
  );

  const routes = [
    [[28, 176], [128, 278], [112, 292]],
    [[40, 210], [170, 318], [258, 378]],
    [[38, 226], [220, 310], [138, 300]],
    [[120, 284], [140, 296], [268, 338]],
  ] as const;
  const [routeStart, routeEnd] = routes[chapter][beat];
  let playerX = mix(routeStart, routeEnd, ease(phase(progress, 0.08, 0.72)));
  let playerY = floor - 64;
  let playerSize = 64;
  const playerDirection: "left" | "right" = "right";
  const walk = playing && progress < 0.91;

  let dragonX = 0;
  let dragonY = 0;
  let dragonOpacity = 0;
  let wingAngle = 0;
  let shadow = false;
  let trapped = false;
  let breath = 0;
  let dragonGlow = 0;

  if (chapter === 0 && beat === 0) {
    const sweep = phase(progress, 0.13, 0.78);
    dragonX = 610 - sweep * 690;
    dragonY = 34 + Math.sin(sweep * Math.PI) * 17;
    dragonOpacity = phase(progress, 0.12, 0.2) * (1 - phase(progress, 0.75, 0.9));
    wingAngle = Math.sin(sweep * Math.PI * 3) * 14;
    shadow = true;
  } else if (chapter === 0 && beat === 1) {
    const sweep = phase(progress, 0.37, 0.83);
    dragonX = 540 - sweep * 215;
    dragonY = 55 + Math.sin(sweep * Math.PI) * 14;
    dragonOpacity = phase(progress, 0.35, 0.5) * (1 - phase(progress, 0.77, 0.9)) * 0.75;
    wingAngle = Math.sin(sweep * Math.PI * 2) * 12;
    shadow = true;
  } else if (chapter === 0 && beat === 2) {
    dragonX = 396;
    dragonY = 195;
    dragonOpacity = phase(progress, 0.24, 0.57);
    trapped = progress < 0.72;
    dragonGlow = phase(progress, 0.72, 0.92);
    wingAngle = -phase(progress, 0.72, 0.92) * 19;
  } else if (chapter === 1 && beat === 0) {
    dragonX = mix(442, 365, ease(phase(progress, 0.22, 0.77)));
    dragonY = 172;
    dragonOpacity = phase(progress, 0.12, 0.32);
    wingAngle = Math.sin(progress * Math.PI * 3) * 8;
  } else if (chapter === 1 && beat === 1) {
    dragonX = 416;
    dragonY = 163 - phase(progress, 0.48, 0.8) * 12;
    dragonOpacity = 1;
    dragonGlow = phase(progress, 0.44, 0.75);
    wingAngle = Math.sin(progress * Math.PI * 3) * 10;
  } else if (chapter === 1 && beat === 2) {
    const lift = phase(progress, 0.48, 0.88);
    dragonX = 360 + lift * 190;
    dragonY = 158 - lift * 82;
    dragonOpacity = 1;
    wingAngle = Math.sin(progress * Math.PI * 3) * 18;
    dragonGlow = phase(progress, 0.34, 0.62);
  } else if (chapter === 2 && beat === 0) {
    dragonX = 390;
    dragonY = 190;
    dragonOpacity = phase(progress, 0.12, 0.42);
    trapped = true;
  } else if (chapter === 2 && beat === 1) {
    dragonX = 378;
    dragonY = 182 - phase(progress, 0.7, 0.95) * 34;
    dragonOpacity = 1;
    trapped = progress < 0.69;
    dragonGlow = phase(progress, 0.62, 0.9);
    wingAngle = -phase(progress, 0.73, 0.95) * 22;
  } else if (chapter === 2 && beat === 2) {
    const flight = phase(progress, 0.42, 0.94);
    dragonX = 330 + flight * 250;
    dragonY = 196 - flight * 136;
    dragonOpacity = 1;
    dragonGlow = 0.8;
    wingAngle = Math.sin(flight * Math.PI * 4) * 19;
    const mount = ease(phase(progress, 0.23, 0.49));
    playerX = mix(playerX, dragonX + 25, mount);
    playerY = mix(floor - 64, dragonY + 5, mount);
    playerSize = mix(64, 46, mount);
  } else if (chapter === 3 && beat === 0) {
    const arrival = phase(progress, 0.02, 0.86);
    dragonX = 76 + arrival * 360;
    dragonY = 36 + arrival * 146;
    dragonOpacity = 1;
    wingAngle = Math.sin(arrival * Math.PI * 4) * 18;
    const landing = ease(phase(progress, 0.02, 0.86));
    playerX = dragonX + 26;
    playerY = mix(dragonY + 3, floor - 60, landing);
    playerSize = mix(46, 58, landing);
  } else if (chapter === 3 && beat === 1) {
    dragonX = 322;
    dragonY = 184;
    dragonOpacity = 1;
    breath = phase(progress, 0.34, 0.84);
    dragonGlow = breath;
  } else if (chapter === 3 && beat === 2) {
    const farewell = phase(progress, 0.14, 0.82);
    dragonX = 348 + farewell * 270;
    dragonY = 62 - Math.sin(farewell * Math.PI) * 26;
    dragonOpacity = 1;
    wingAngle = Math.sin(farewell * Math.PI * 4) * 17;
    dragonGlow = 0.7;
  }

  const playerAction = walk ? "walk" : "idle";
  const cinder = (extra?: { scale?: number }) => (
    <PixelDragon
      x={dragonX}
      y={dragonY}
      scale={extra?.scale ?? 1.5}
      opacity={dragonOpacity}
      shadow={shadow}
      wingAngle={wingAngle}
      glow={dragonGlow}
      trapped={trapped}
      breath={breath}
    />
  );

  return (
    <svg
      className={`sc-journey-scene realm-${JOURNEY[chapter].theme}`}
      viewBox="0 0 640 352"
      role="img"
      aria-label={`${JOURNEY[chapter].place}: ${JOURNEY[chapter].lines[beat]}`}
      shapeRendering="crispEdges"
    >
      <image href={backgrounds[chapter]} width="640" height="352" />

      {crossing && (
        <g>
          {Array.from({ length: chapter === 1 ? 6 : 4 }, (_, index) => {
            const x = (chapter === 1 ? 224 : 256) + index * 32;
            let built = 1;
            if (chapter === 1 && beat === 0 && index >= 2 && index <= 3) built = 0;
            if (chapter === 1 && beat === 1 && index >= 2 && index <= 3)
              built = phase(progress, 0.2 + index * 0.08, 0.48 + index * 0.08);
            const rise = (1 - built) * 24;
            return (
              <g
                key={index}
                opacity={built}
                transform={`translate(0 ${rise})`}
              >
                {item("oasis_fill", x, 320)}
                {item("oasis_top_a", x, 288)}
                {item("bridge", x, 280)}
              </g>
            );
          })}
          {item("obelisk", 480, 224, 64)}
          {beat === 2 && (
            <g opacity={phase(progress, 0.36, 0.74)}>
              {item("soul_stone", 496, 208)}
            </g>
          )}
        </g>
      )}

      {chapter === 0 && beat === 0 && (
        <g opacity={phase(progress, 0.72, 0.92)}>
          <polygon points="185,252 193,244 201,252 193,260" fill="#c8774d" />
          <polygon points="188,252 193,248 198,252 193,256" fill="#f2c768" />
          <rect x="190" y="238" width="6" height="2" fill="#ffe89a" opacity="0.8" />
        </g>
      )}
      {chapter === 0 && beat === 1 && (
        <g>
          {cinder({ scale: 1.25 })}
          <g opacity={phase(progress, 0.2, 0.48)}>
            <rect x="266" y="214" width="3" height="3" fill="#fff0a5" />
            <rect x="279" y="202" width="2" height="2" fill="#ffe07b" />
            <rect x="292" y="220" width="3" height="3" fill="#fff0a5" />
          </g>
          <g opacity={phase(progress, 0.42, 0.68)}>
            <circle cx="304" cy={floor - 16} r="23" fill="#ffd56f" opacity="0.15" />
            {item("lantern", 288, floor - 32)}
          </g>
        </g>
      )}
      {chapter === 0 && beat === 2 && (
        <g>
          <g opacity={phase(progress, 0.04, 0.48)}>
            <path d="M352 312l10-14 3-18 9 15 11-8 6 13 14-4 3 16" fill="none" stroke="#52372f" strokeWidth="8" />
            <path d="M392 312l8-15 14-6-3 14 13 4 3 8" fill="none" stroke="#684335" strokeWidth="7" />
          </g>
          {cinder({ scale: 1.65 })}
          <g opacity={dragonGlow * 0.8}>
            <rect x="443" y="217" width="3" height="3" fill="#ffe8a0" />
            <rect x="458" y="202" width="2" height="2" fill="#ffe8a0" />
            <rect x="424" y="199" width="3" height="3" fill="#ffe8a0" />
          </g>
        </g>
      )}

      {chapter === 1 && beat === 0 && cinder()}
      {chapter === 1 && beat === 1 && (
        <g>
          {cinder()}
          <g opacity={phase(progress, 0.48, 0.84)}>
            {[0, 1, 2].map((index) => (
              <rect
                key={index}
                x={290 + index * 17}
                y={155 - index * 11}
                width="5"
                height="2"
                fill="#f7d77f"
              />
            ))}
          </g>
        </g>
      )}
      {chapter === 1 && beat === 2 && (
        <g>
          {cinder()}
          <g opacity={phase(progress, 0.48, 0.8)} fill="#ffe89a">
            <rect x="438" y="112" width="3" height="3" />
            <rect x="464" y="96" width="2" height="2" />
            <rect x="488" y="122" width="3" height="3" />
          </g>
        </g>
      )}

      {chapter === 2 && beat === 0 && (
        <g>
          <g opacity={dragonOpacity} fill="none" stroke="#d8a947" strokeWidth="3">
            <path d="M400 212C370 196 352 203 335 222" />
            <path d="M398 220C372 231 352 226 334 219" strokeWidth="2" />
          </g>
          {cinder()}
          {item("obelisk", 288, 224, 64)}
          {item("sun_disc", 288, 192, 64)}
        </g>
      )}
      {chapter === 2 && beat === 1 && (
        <g>
          <g opacity={1 - phase(progress, 0.62, 0.9)} fill="none" stroke="#edca6a" strokeWidth="2">
            <path d="M390 202l-44 24M386 211l-34-32M378 221l-22-25" />
          </g>
          {cinder()}
          <g opacity={phase(progress, 0.74, 0.96)} fill="none" stroke="#fff0a8" strokeWidth="3">
            <circle cx="430" cy="220" r={8 + phase(progress, 0.74, 0.96) * 38} />
            <circle cx="430" cy="220" r={4 + phase(progress, 0.74, 0.96) * 21} />
          </g>
        </g>
      )}
      {chapter === 2 && beat === 2 && (
        <g>
          {cinder()}
          <g opacity={phase(progress, 0.48, 0.84)} fill="#ffe58c">
            {[0, 1, 2, 3, 4].map((index) => (
              <rect
                key={index}
                x={265 + index * 49}
                y={117 - (index % 2) * 19}
                width="3"
                height="3"
              />
            ))}
          </g>
        </g>
      )}

      {chapter === 3 && (
        <g>
          {crossing &&
            [160, 416, 544].map((x, index) => (
              <g key={x} opacity={beat === 0 ? 0.45 : phase(progress, 0.08 + index * 0.18, 0.3 + index * 0.18)}>
                {item("wooden_sign", x, 256)}
                {beat > 0 && item("lantern", x, 224)}
                {beat > 0 && (
                  <circle
                    cx={x + 16}
                    cy={240}
                    r={12 + phase(progress, 0.1 + index * 0.16, 0.34 + index * 0.16) * 9}
                    fill="#ffd76e"
                    opacity={phase(progress, 0.1 + index * 0.16, 0.34 + index * 0.16) * 0.16}
                  />
                )}
              </g>
            ))}
          {cinder()}
          {beat === 2 && (
            <g opacity={phase(progress, 0.12, 0.45)}>
              <rect x="82" y="222" width="3" height="3" fill="#fff1b0" />
              <rect x="104" y="204" width="2" height="2" fill="#fff1b0" />
              <rect x="126" y="222" width="3" height="3" fill="#fff1b0" />
            </g>
          )}
        </g>
      )}

      <AvatarGraphic
        appearance={appearance}
        action={playerAction}
        direction={playerDirection}
        directControl={playing}
        x={playerX}
        y={playerY}
        size={playerSize}
      />
    </svg>
  );
}

export function StoryCinema({ chapter, musicTrackId = "twilight", onOpenMap }: { chapter: number; musicTrackId?: string; onOpenMap?: () => void }) {
  const { completed } = useProgress();
  const realm = JOURNEY[chapter];
  const [beat, setBeat] = useState(0);
  const unlocked = realm.levels[beat] <= journeyProgress(completed).cleared;
  const nextUnlocked = beat < 2 && realm.levels[beat + 1] <= journeyProgress(completed).cleared;
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [narrate, setNarrate] = useState(true);
  const [notice, setNotice] = useState("");
  const music = useMusic();
  const soundtrack = soundscapes.find((track) => track.id === musicTrackId);
  const { preferences, update } = usePreferences();
  const audio = useRef<HTMLAudioElement>(null);
  const autoAdvance = useRef(false);
  const finishHandled = useRef(false);
  const advanceTimer = useRef<number | undefined>(undefined);
  const timelineStart = useRef(performance.now());
  const soundCue = useRef("");
  const source = `${import.meta.env.BASE_URL}narration/story-${chapter}-${beat}.wav`;
  const duration = Math.max(8500, realm.lines[beat].length * 54);

  function playNarration(restart = false) {
    const player = audio.current;
    if (!player) return;
    setNotice("");
    if (restart || player.ended) {
      try {
        player.currentTime = 0;
      } catch {
        // The browser will begin at zero once its metadata finishes loading.
      }
    }
    void player.play().catch(() => {
      setPlaying(false);
      setNotice("Narration could not start. Turn narration off to play with captions.");
    });
  }

  function finishScene() {
    if (finishHandled.current) return;
    finishHandled.current = true;
    setProgress(1);
    setPlaying(false);
    audio.current?.pause();
    if (!nextUnlocked) return;
    if (advanceTimer.current !== undefined) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      autoAdvance.current = true;
      setProgress(0);
      setBeat((value) => value + 1);
    }, 900);
  }

  function startScene() {
    if (advanceTimer.current !== undefined) window.clearTimeout(advanceTimer.current);
    if (soundtrack && (!music.playing || music.track.id !== soundtrack.id)) void music.play(soundtrack, [soundtrack]);
    else if (!music.playing) void music.play();
    setNotice("");
    timelineStart.current = performance.now() - (progress >= 1 ? 0 : progress * duration);
    if (progress >= 1) {
      finishHandled.current = false;
      setProgress(0);
    }
    if (narrate) playNarration(progress >= 1);
    else setPlaying(true);
  }

  function pauseScene() {
    if (advanceTimer.current !== undefined) window.clearTimeout(advanceTimer.current);
    audio.current?.pause();
    setPlaying(false);
  }

  function replayScene() {
    if (advanceTimer.current !== undefined) window.clearTimeout(advanceTimer.current);
    finishHandled.current = false;
    timelineStart.current = performance.now();
    setProgress(0);
    if (narrate) playNarration(true);
    else setPlaying(true);
  }

  function selectScene(value: number) {
    if (advanceTimer.current !== undefined) window.clearTimeout(advanceTimer.current);
    autoAdvance.current = false;
    finishHandled.current = false;
    audio.current?.pause();
    setProgress(0);
    setPlaying(false);
    setNotice("");
    setBeat(value);
  }

  useEffect(() => {
    finishHandled.current = false;
    if (!autoAdvance.current) return;
    autoAdvance.current = false;
    if (narrate) playNarration(true);
    else {
      timelineStart.current = performance.now();
      setPlaying(true);
    }
    // The audio element is reused so the next line starts only after the prior line ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    if (!playing || !unlocked) return;
    const timer = window.setInterval(() => {
      let nextProgress: number;
      if (narrate && audio.current?.duration) {
        nextProgress = clamp(audio.current.currentTime / audio.current.duration);
      } else {
        nextProgress = clamp((performance.now() - timelineStart.current) / duration);
      }
      setProgress(nextProgress);
      if (nextProgress >= 1) finishScene();
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, unlocked, narrate, duration, chapter, beat]);

  useEffect(() => {
    if (!playing || !unlocked || !preferences.sound_effects) return;
    const cue = `${chapter}-${beat}`;
    if (soundCue.current === cue) return;
    soundCue.current = cue;
    sound.playWandCast();
  }, [playing, unlocked, preferences.sound_effects, chapter, beat]);

  useEffect(
    () => () => {
      audio.current?.pause();
      if (advanceTimer.current !== undefined) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  if (!unlocked)
    return (
      <section className="sc-cinema sc-locked-scene">
        <h3>Scene {beat + 1} is locked</h3>
        <p>Complete level {realm.levels[beat]} from Play levels to reveal this scene.</p>
        {onOpenMap && <button className="sc-button mint" onClick={onOpenMap}>Play levels</button>}
        {beat > 0 && (
          <button className="sc-button secondary" onClick={() => selectScene(beat - 1)}>
            Previous scene
          </button>
        )}
        {beat < 2 && (
          <button className="sc-button secondary" onClick={() => selectScene(beat + 1)}>
            Next scene
          </button>
        )}
      </section>
    );

  return (
    <section className={`sc-cinema${playing ? " is-playing" : ""}`} aria-label="Story cutscene">
      <JourneyScene chapter={chapter} beat={beat} progress={progress} playing={playing} />
      <p className="sc-cinema-caption" aria-live="polite">{realm.lines[beat]}</p>
      <audio
        ref={audio}
        className="sc-story-narration"
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        src={source}
        onPlay={() => {
          setPlaying(true);
          setNotice("");
        }}
        onPause={() => setPlaying(false)}
        onEnded={finishScene}
        onError={() => {
          setPlaying(false);
          if (narrate) setNotice("Narration could not load. Turn narration off to play with captions.");
        }}
      />
      <div className="sc-cinema-controls">
        <button className="sc-button mint" onClick={playing ? pauseScene : startScene}>
          {playing ? "Pause story" : progress >= 1 ? "Play again" : "Play story"}
        </button>
        <button className="sc-button secondary" onClick={replayScene}>
          Restart scene
        </button>
        <button className="sc-button secondary" disabled={beat === 0} onClick={() => selectScene(beat - 1)}>
          Previous
        </button>
        <span aria-live="polite">Scene {beat + 1} / 3</span>
        <button
          className="sc-button secondary"
          disabled={beat === 2 || !nextUnlocked}
          onClick={() => selectScene(beat + 1)}
        >
          {nextUnlocked ? "Next scene" : "Next · locked"}
        </button>
        <label>
          <input
            type="checkbox"
            checked={preferences.sound_effects}
            onChange={(event) =>
              void update({ sound_effects: event.target.checked }).catch(() =>
                setNotice("Sound preference could not be saved."),
              )
            }
          />
          Effects
        </label>
        <label>
          <input
            type="checkbox"
            checked={narrate}
            onChange={(event) => {
              audio.current?.pause();
              setPlaying(false);
              finishHandled.current = false;
              timelineStart.current = performance.now();
              setProgress(0);
              setNarrate(event.target.checked);
              setNotice("");
            }}
          />
          Narration
        </label>
      </div>
      {notice && <small role="status">{notice}</small>}
    </section>
  );
}
