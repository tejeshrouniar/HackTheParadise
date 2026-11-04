import { useId, useState } from "react";
import { motion } from "framer-motion";
import {
  AvatarGraphic,
  type SpriteAction,
  type SpriteDirection,
} from "../../features/adventure/AvatarGraphic";
import { useAppearance } from "../../features/adventure/AppearanceContext";
import { spriteClips } from "../../features/adventure/spriteAnimation";
import type { useQuestEngine } from "../../features/learning/useQuestEngine";
import "../../styles/worlds.css";
import forestWorld from "../../assets/eldoria/forest-world-small.webp";
import coreWorld from "../../assets/eldoria/core-small.webp";

type Engine = ReturnType<typeof useQuestEngine>;
function Crystal({
  x = 0,
  y = 0,
  size = 1,
  color = "#b4f5d6",
}: {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        d="M0 -30 19 -8 13 19 0 33 -13 19 -19 -8Z"
        fill={color}
        stroke="#effff3"
        strokeWidth="1.5"
      />
      <path d="M0 -30 6 -8 0 33 -6 -8Z" fill="#fff" opacity=".5" />
      <path
        d="m-19 -8 19 5 19 -5M0 -3v36"
        fill="none"
        stroke="#235b62"
        opacity=".5"
      />
    </g>
  );
}
function QuestAvatar({
  x,
  y,
  size = 90,
  action,
  direction,
  playId,
}: {
  x: number;
  y: number;
  size?: number;
  action?: SpriteAction;
  direction?: SpriteDirection;
  playId?: number;
}) {
  const { appearance } = useAppearance();
  return (
    <g>
      <ellipse
        cx={x}
        cy={y + 2}
        rx={size * 0.3}
        ry={8}
        fill="#090c20"
        opacity=".6"
      />
      <AvatarGraphic
        appearance={appearance}
        x={x - size / 2}
        y={y - size + 3}
        size={size}
        action={action}
        direction={direction}
        playId={playId}
      />
    </g>
  );
}
function Flower({ bloomed, index }: { bloomed: boolean; index: number }) {
  return (
    <g>
      <ellipse cy="13" rx="55" ry="18" fill="#080f21" opacity=".65" />
      <path
        d="M-48 0 0 -15 48 0 40 16 0 26 -40 16Z"
        fill="#486060"
        stroke="#82917d"
      />
      <path d="M-42 -1 0 -12 42 -1 0 12Z" fill="#283f40" />
      {bloomed ? (
        <g className="world-grow">
          <path
            d="M0 3Q-7 -30 0 -61"
            fill="none"
            stroke="#89c7a5"
            strokeWidth="5"
          />
          <path
            d="M-2 -18Q-39 -45 -29 -9Q-10 -3 -2 -18M0 -30Q36 -54 27 -22Q10 -13 0 -30"
            fill="#65aa90"
            stroke="#b4e2a1"
          />
          <g transform="translate(0 -66)">
            {Array.from({ length: 6 }, (_, i) => (
              <ellipse
                key={i}
                cy="-17"
                rx="11"
                ry="22"
                transform={`rotate(${i * 60})`}
                fill={index % 2 ? "#e3a4c7" : "#b8b0ee"}
                stroke="#ffebd9"
                strokeWidth="1.5"
              />
            ))}
            <circle r="11" fill="#efd48b" />
            <circle r="5" fill="#fff4b6" />
          </g>
          <g className="world-motes" fill="#e8e5a2">
            <circle cx="-32" cy="-65" r="2" />
            <circle cx="28" cy="-88" r="3" />
            <circle cx="36" cy="-44" r="2" />
          </g>
        </g>
      ) : (
        <path
          d="M0 2v-20M0 -8Q-22 -27 -22 -12Q-12 0 0 -8M0 -15Q17 -31 19 -18Q13 -6 0 -15"
          fill="#679886"
          stroke="#9cccad"
          strokeWidth="2"
        />
      )}
    </g>
  );
}

export function StageWorld({ state: s }: { state: Engine }) {
  const [walking, setWalking] = useState(false);
  const id = useId().replace(/:/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;
  const kind = s.lesson.stageType;
  const spellAction: SpriteAction = s.isExecuting && s.executionStep.current > 0
    ? "interact" : "idle";
  const caption =
    kind === "dragon"
      ? `${s.collectedCrystal ? "Fragment recovered" : "Reach the golden fragment"} · Facing ${s.dragon.direction.toLowerCase()}`
      : kind === "potion"
        ? s.isBrewed
          ? "The elixir is ready"
          : "Add your ingredients, then brew"
        : kind === "garden"
          ? `${s.bloomedFlowers} of ${s.lesson.stageConfig?.target ?? 6} flowers awake`
          : kind === "bridge"
            ? `${s.bridgeTiles} of ${s.lesson.stageConfig?.target ?? 4} bridge stones restored`
            : kind === "curse"
              ? `${s.purifiedRunes.length} runes released`
              : kind === "stargate"
                ? `${s.stargateFlux} / ${s.lesson.stageConfig?.target ?? 200} flux · Rings ${s.stargateRingsAligned ? "aligned" : "unaligned"}`
                : kind === "chrono"
                  ? s.isVortexStabilized
                    ? "The timeline is steady"
                    : "Arrange the crystals from smallest to largest"
                  : `Binding ${s.bossHp}/100 · Shield ${s.playerShield}/100`;
  return (
    <figure className={`sc-world world-${kind}`}>
      <svg
        viewBox="0 0 800 490"
        role="img"
        aria-label={`${s.currentStageInfo.name}. ${caption}`}
      >
        <defs>
          <linearGradient id={`${id}-sky`} x2="0" y2="1">
            <stop stopColor="#111c36" />
            <stop offset="1" stopColor="#39415c" />
          </linearGradient>
          <linearGradient id={`${id}-stone`} x2=".2" y2="1">
            <stop stopColor="#8799a5" />
            <stop offset="1" stopColor="#334355" />
          </linearGradient>
          <linearGradient id={`${id}-gold`} x2="1" y2="1">
            <stop stopColor="#fff2bd" />
            <stop offset="1" stopColor="#b4955f" />
          </linearGradient>
          <linearGradient id={`${id}-liquid`} x2="0" y2="1">
            <stop stopColor="#c7f8d3" />
            <stop offset="1" stopColor="#35a6a1" />
          </linearGradient>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#a3efd0" stopOpacity=".5" />
            <stop offset="1" stopColor="#a3efd0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-portal`}>
            <stop stopColor="#ebffff" />
            <stop offset=".4" stopColor="#75d9c3" />
            <stop offset="1" stopColor="#54518a" stopOpacity=".2" />
          </radialGradient>
        </defs>
        <rect width="800" height="490" fill={ref("sky")} />
        <image
          href={s.lesson.id <= 4 || s.lesson.id >= 9 ? forestWorld : coreWorld}
          width="800"
          height="490"
          preserveAspectRatio="xMidYMid slice"
        />
        <rect width="800" height="490" fill="#071b1b" opacity=".67" />
        <circle cx="620" cy="100" r="160" fill={ref("halo")} opacity=".35" />
        {Array.from({ length: 25 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 137 + 37) % 800}
            cy={(i * 61 + 19) % 270}
            r={i % 4 === 0 ? 1.8 : 0.8}
            fill="#e4dfc2"
            opacity={0.2 + (i % 4) * 0.15}
          />
        ))}
        <ellipse
          cx="400"
          cy="453"
          rx="350"
          ry="36"
          fill="#0b1729"
          opacity=".8"
        />

        {kind === "dragon" && (
          <>
            <path
              d="m119 382 245 67 310 -75 -18 32 -290 73 -236 -65Z"
              fill="#243145"
              stroke="#58616a"
            />
            {Array.from({ length: 25 }, (_, i) => {
              const x = i % 5,
                y = Math.floor(i / 5),
                px = 184 + x * 86,
                py = 116 + y * 62;
              const occupied = s.dragon.x === x && s.dragon.y === y,
                blocked = x === 1 && y === 1;
              return (
                <g key={i} transform={`translate(${px} ${py})`}>
                  <path
                    d="M-40 10 0 -6 40 10 40 46 0 61 -40 46Z"
                    fill="#334456"
                    stroke="#637984"
                  />
                  <path
                    d="M-40 10 0 -6 40 10 0 27Z"
                    fill={occupied ? "#82b8a9" : "#5a7380"}
                    stroke="#94a8a1"
                  />
                  <path d="M0 27v34" stroke="#172d42" />
                  {blocked && (
                    <g>
                      <path
                        d="M-30 13 -15 -30 11 -43 33 -7 24 23 0 31Z"
                        fill="#3e4656"
                        stroke="#97a0a5"
                      />
                      <path
                        d="m-15 -30 12 31 36 -8M11 -43-3 1 0 31"
                        fill="none"
                        stroke="#75818b"
                      />
                    </g>
                  )}
                  {x === 2 && y === 2 && !s.collectedCrystal && (
                    <g className="world-hover">
                      <circle cy="-10" r="42" fill={ref("halo")} />
                      <Crystal y={-17} size={0.75} color="#f5d493" />
                    </g>
                  )}
                </g>
              );
            })}
            <motion.g
              initial={false}
              animate={{ x: 184 + s.dragon.x * 86, y: 140 + s.dragon.y * 62 }}
              transition={{
                duration: Math.min(
                  spriteClips.walk.frames * spriteClips.walk.frameMs,
                  s.stepDuration,
                ) / 1000,
                ease: "linear",
              }}
              onAnimationStart={() => setWalking(true)}
              onAnimationComplete={() => setWalking(false)}
            >
              <QuestAvatar
                x={0}
                y={0}
                size={98}
                action={walking && s.isExecuting ? "walk" : "idle"}
                direction={s.dragon.direction.toLowerCase() as SpriteDirection}
              />
              <path
                d="m-5 10 10 0 -5 7Z"
                fill="#e6d6a0"
                transform={`rotate(${{ DOWN: 0, LEFT: 90, UP: 180, RIGHT: 270 }[s.dragon.direction]} 0 10)`}
              />
            </motion.g>
            {s.collectedCrystal && (
              <g className="world-grow" transform="translate(650 110)">
                <Crystal color="#f5d493" />
                <text y="59" textAnchor="middle">
                  Recovered
                </text>
              </g>
            )}
            {s.errorPointer && (
              <text x="400" y="468" textAnchor="middle" fill="#f5b5bc">
                The path is blocked. Check the highlighted line.
              </text>
            )}
          </>
        )}

        {kind === "potion" && (
          <>
            <path
              d="M65 352 710 352 748 386 45 386Z"
              fill="#80694f"
              stroke="#c2a77a"
            />
            <path
              d="M70 387h642v18H70ZM99 405h20v68H99ZM667 405h20v68h-20Z"
              fill="#3c3840"
            />
            {[
              { x: 163, name: "mana_flask", color: "#ba9ce9" },
              { x: 634, name: "star_dew", color: "#7edbc0" },
            ].map((b) => (
              <g key={b.name} transform={`translate(${b.x} 0)`}>
                <path
                  d="M-16 164h32v52l28 31v95q-44 22-88 0v-95l28-31Z"
                  fill="#1c3346"
                  stroke="#b6cdd5"
                  strokeWidth="3"
                />
                {s.potionVars[b.name] !== undefined && (
                  <path
                    className="world-fill"
                    d="M-40 274q40-14 80 0v65q-40 18-80 0Z"
                    fill={b.color}
                    opacity=".85"
                  />
                )}
                <path d="M-20 158h40v17h-40Z" fill="#a28b67" />
                <path
                  d="M-30 250v62"
                  stroke="#fff"
                  opacity=".4"
                  strokeWidth="5"
                />
                <text y="124" textAnchor="middle">
                  {b.name}
                </text>
                <text
                  y="309"
                  textAnchor="middle"
                  className="world-large-number"
                >
                  {s.potionVars[b.name] ?? "—"}
                </text>
              </g>
            ))}
            <path
              d="m305 287 13 78 30 30h102l32-30 13-78Z"
              fill="#283747"
              stroke="#8f9b9d"
              strokeWidth="4"
            />
            <ellipse
              cx="400"
              cy="285"
              rx="98"
              ry="26"
              fill="#0d2231"
              stroke="#b4b6a7"
              strokeWidth="6"
            />
            <ellipse
              cx="400"
              cy="285"
              rx="87"
              ry="19"
              fill={s.isBrewed ? ref("liquid") : "#655387"}
            />
            <path
              d="m337 398-14 20m142-20 14 20M307 301q-42-32-36 18q0 22 46 20M492 301q42-32 36 18q0 22-46 20"
              fill="none"
              stroke="#9a9c92"
              strokeWidth="7"
            />
            {s.isBrewed && (
              <g className="world-grow">
                <circle cx="400" cy="241" r="103" fill={ref("halo")} />
                {[0, 1, 2, 3, 4].map((i) => (
                  <circle
                    key={i}
                    className="world-bubble"
                    style={{ animationDelay: `${i * 0.18}s` }}
                    cx={364 + i * 19}
                    cy={260 - (i % 2) * 30}
                    r={5 + (i % 3) * 3}
                    fill="#b8f6d2"
                  />
                ))}
                <Crystal x={400} y={190} size={0.6} color="#f5d493" />
              </g>
            )}
            <QuestAvatar
              action={spellAction}
              playId={s.executionStep.current}
              direction="right"
              x={97}
              y={450}
              size={94}
            />
          </>
        )}

        {kind === "garden" && (
          <>
            <path
              d="M20 375Q250 290 400 325T780 368L752 443Q390 481 43 432Z"
              fill="#334f4c"
              stroke="#74968a"
              strokeWidth="2"
            />
            <path
              d="M48 428Q376 470 752 443L703 479 366 489 90 464Z"
              fill="#1b3540"
            />
            <path
              d="M61 353Q132 205 88 75M105 234 37 160M100 195 181 98M720 356Q671 234 732 82M702 223 642 148"
              fill="none"
              stroke="#334b51"
              strokeWidth="21"
            />
            {[
              { x: 269, y: 307 },
              { x: 401, y: 307 },
              { x: 533, y: 307 },
              { x: 269, y: 400 },
              { x: 401, y: 400 },
              { x: 533, y: 400 },
            ].map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y})`}>
                <Flower bloomed={i < s.bloomedFlowers} index={i} />
              </g>
            ))}
            <QuestAvatar
              action={spellAction}
              playId={s.executionStep.current}
              direction="right"
              x={143}
              y={383}
              size={102}
            />
          </>
        )}

        {kind === "bridge" && (
          <>
            <path
              d="M0 294 153 256 213 300 176 383 113 456 79 382 0 359ZM610 298 691 257 800 279V379l-75 83-71-53Z"
              fill="#39495c"
              stroke="#8797a0"
              strokeWidth="2"
            />
            <path
              d="m0 294 153-38 60 44-79 34Z M610 298l81-41 109 22-89 57Z"
              fill="#758b8e"
            />
            <QuestAvatar
              action={spellAction}
              playId={s.executionStep.current}
              direction="right"
              x={125}
              y={302}
              size={112}
            />
            {[0, 1, 2, 3].map((i) => (
              <g
                key={i}
                transform={`translate(${242 + i * 96} ${303 - Math.sin((i / 3) * Math.PI) * 20})`}
              >
                <path
                  d="M-36 0 0-12 36 0 0 13Z"
                  fill="none"
                  stroke="#9cacb4"
                  strokeDasharray="4 6"
                  opacity=".4"
                />
                {i < s.bridgeTiles && (
                  <g className="world-build">
                    <path
                      d="M-40 0 0-15 40 0 40 27 0 45 -40 27Z"
                      fill="#475e72"
                      stroke="#afc8c8"
                    />
                    <path d="M-40 0 0-15 40 0 0 17Z" fill="#b6d9ce" />
                    <path d="M-23 2 0-6 23 2 0 10Z" fill="#eed998" />
                    <path d="M0 17v28" stroke="#7899a2" />
                  </g>
                )}
              </g>
            ))}
            <path
              d="M671 284V149h71v135M658 149l48-59 49 59Z"
              fill="#687a8d"
              stroke="#b3b6af"
              strokeWidth="2"
            />
            <path d="M693 284v-48q13-24 26 0v48" fill="#ccebc0" />
            <path d="M697 176h17v30h-17Z" fill="#e4cc95" />
          </>
        )}

        {kind === "curse" && (
          <>
            <path
              d="M102 425V90h596v335M129 425V119h542v306"
              fill="#1c2c40"
              stroke="#7e7b83"
              strokeWidth="8"
            />
            <path
              d="M180 420V191Q400-19 620 191V420Z"
              fill="#101b30"
              stroke="#5a677c"
              strokeWidth="15"
            />
            {[1, 2, 3].map((num) => {
              const clean = s.purifiedRunes.includes(num);
              return (
                <g
                  key={num}
                  transform={`translate(${240 + (num - 1) * 160} 270)`}
                >
                  <path
                    d="M-57-74 0-91 57-74 57 74 0 91 -57 74Z"
                    fill={clean ? "#305252" : "#3e3049"}
                    stroke={clean ? "#c2e4b8" : "#9f708b"}
                    strokeWidth="3"
                  />
                  <path
                    d="M-44-64 0-77 44-64v126L0 77-44 62Z"
                    fill="none"
                    stroke={clean ? "#92b994" : "#77556f"}
                  />
                  <text
                    textAnchor="middle"
                    y="16"
                    className="world-rune"
                    fill={clean ? "#c2f5d3" : "#df9eb7"}
                  >
                    {["ᚠ", "ᚢ", "ᚦ"][num - 1]}
                  </text>
                  <text textAnchor="middle" y="59">
                    {num}
                  </text>
                  {clean && (
                    <circle
                      className="world-ring-burst"
                      r="62"
                      fill="none"
                      stroke="#d7efb9"
                      strokeWidth="3"
                    />
                  )}
                </g>
              );
            })}
            <QuestAvatar
              action={spellAction}
              playId={s.executionStep.current}
              direction="right"
              x={96}
              y={450}
              size={100}
            />
          </>
        )}

        {kind === "stargate" && (
          <>
            <path
              d="m196 417 83-37h253l77 37-38 36H226Z"
              fill="#5c6b7d"
              stroke="#9babae"
              strokeWidth="2"
            />
            <g transform="translate(405 239)">
              <circle
                r="156"
                fill="#101f35"
                stroke="#9da7a7"
                strokeWidth="14"
              />
              <circle r="139" fill="none" stroke="#ccb98b" strokeWidth="2" />
              <g
                className={`world-gate-ring ${s.stargateRingsAligned ? "aligned" : ""}`}
              >
                <path
                  d="M0-130 113-65 113 65 0 130-113 65-113-65Z"
                  fill="none"
                  stroke={s.stargateRingsAligned ? "#bce8cc" : "#67748d"}
                  strokeWidth="6"
                />
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <g key={n} transform={`rotate(${n * 60})`}>
                    <path d="m0-148 8 13-8 12-8-12Z" fill="#e6d6a0" />
                  </g>
                ))}
              </g>
              <circle
                r="101"
                fill={
                  s.stargateFlux >= (s.lesson.stageConfig?.target ?? 200)
                    ? ref("portal")
                    : "#162338"
                }
                stroke="#6b8c9a"
                strokeWidth="3"
              />
              {s.stargateFlux >= (s.lesson.stageConfig?.target ?? 200) && (
                <g className="world-grow">
                  <path
                    d="M-55 18Q-24-67 52-20Q97 29 6 58Q-62 53-30-9"
                    fill="none"
                    stroke="#e8f7e4"
                    strokeWidth="5"
                    opacity=".65"
                  />
                  <circle
                    r="68"
                    fill="none"
                    stroke="#d4eddd"
                    strokeDasharray="3 18"
                  />
                </g>
              )}
            </g>
            <QuestAvatar
              action={spellAction}
              playId={s.executionStep.current}
              direction="right"
              x={164}
              y={445}
              size={112}
            />
            <rect x="289" y="423" width="231" height="7" fill="#142333" />
            <rect
              x="289"
              y="423"
              height="7"
              width={Math.max(
                0,
                Math.min(
                  231,
                  (s.stargateFlux / (s.lesson.stageConfig?.target ?? 200)) *
                    231,
                ),
              )}
              fill="#a3e1c0"
              className="world-meter"
            />
          </>
        )}

        {kind === "chrono" && (
          <>
            <g
              transform="translate(400 218)"
              opacity={s.isVortexStabilized ? 0.8 : 0.25}
            >
              <circle r="128" fill="none" stroke="#d2c094" strokeWidth="2" />
              <circle
                r="114"
                fill="none"
                stroke="#c7b8ec"
                strokeDasharray="1 14"
                strokeWidth="8"
              />
              <path
                d="M0-101V0l65 45"
                stroke="#ece0bc"
                strokeWidth="4"
                fill="none"
              />
            </g>
            <path
              d="M100 364 400 304 700 364 663 414 400 460 136 414Z"
              fill="#43596a"
              stroke="#a0adb0"
              strokeWidth="2"
            />
            {s.chronoCrystals.slice(0, 8).map((value, index, values) => (
              <motion.g
                key={`${value}-${values.slice(0, index).filter((v) => v === value).length}`}
                initial={false}
                animate={{
                  x:
                    220 +
                    index * Math.min(120, 400 / Math.max(1, values.length - 1)),
                  y: 310,
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <ellipse
                  cy="66"
                  rx="47"
                  ry="15"
                  fill="#172d40"
                  stroke="#829c9f"
                />
                <Crystal
                  size={1.35}
                  color={value === index + 1 ? "#abe3c3" : "#b6aae2"}
                />
                <text
                  y="7"
                  textAnchor="middle"
                  className="world-large-number"
                  fill="#23314b"
                >
                  {value}
                </text>
                <text y="100" textAnchor="middle">
                  [{index}]
                </text>
              </motion.g>
            ))}
            <QuestAvatar
              action={spellAction}
              playId={s.executionStep.current}
              direction="right"
              x={112}
              y={440}
              size={103}
            />
          </>
        )}

        {kind === "boss" && (
          <>
            <path
              d="M64 398 404 306 747 398 692 457H118Z"
              fill="#3b4b60"
              stroke="#83969e"
              strokeWidth="2"
            />
            {[130, 661].map((x) => (
              <g key={x}>
                <path
                  d={`M${x - 24} 367V103h48v264`}
                  fill="#344658"
                  stroke="#687a8c"
                  strokeWidth="3"
                />
                <path d={`M${x - 34} 105h68l-13-25h-42Z`} fill="#8b95a0" />
              </g>
            ))}
            <g transform="translate(528 223)">
              <circle
                r="137"
                fill={ref("halo")}
                opacity={s.bossHp <= 0 ? 1 : 0.3}
              />
              <g className={s.bossHitFlash ? "world-impact" : "world-hover"}>
                <Crystal
                  size={2.5}
                  color={s.bossHp <= 0 ? "#c6f6d9" : "#ac95d7"}
                />
              </g>
              {s.bossHp > 0 && (
                <g
                  stroke="#cf99b6"
                  fill="none"
                  strokeWidth="4"
                  opacity={s.bossHp / 100}
                >
                  <ellipse rx="110" ry="35" transform="rotate(-35)" />
                  <ellipse rx="110" ry="35" transform="rotate(35)" />
                  <path d="m-33-84 35 56-21 44 40 61" />
                </g>
              )}
              {s.bossHp <= 0 && (
                <circle
                  className="world-ring-burst"
                  r="110"
                  stroke="#d1f5cc"
                  fill="none"
                  strokeWidth="4"
                />
              )}
            </g>
            <QuestAvatar
              action={spellAction}
              playId={s.executionStep.current}
              direction="right"
              x={207}
              y={389}
              size={158}
            />
            {s.playerShield > 0 && (
              <ellipse
                cx="206"
                cy="316"
                rx="74"
                ry="101"
                fill={ref("halo")}
                stroke="#a3e9dc"
                strokeWidth="2"
                opacity=".7"
              />
            )}
            {s.bossHitFlash && (
              <g key={s.bossHp} className="world-bolt">
                <path
                  d="m239 301 85-50-14 37 100-62-10 33 91-41"
                  fill="none"
                  stroke="#ddf6c7"
                  strokeWidth="7"
                />
                <path
                  d="m239 301 85-50-14 37 100-62-10 33 91-41"
                  fill="none"
                  stroke="#fff6dd"
                  strokeWidth="2"
                />
                <circle cx="515" cy="222" r="69" fill={ref("halo")} />
              </g>
            )}
            <text x="400" y="451" textAnchor="middle">
              {s.bossHp <= 0 ? "The Core is free" : "Break Malachar’s binding"}
            </text>
          </>
        )}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
