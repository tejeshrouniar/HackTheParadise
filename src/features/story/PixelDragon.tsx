import dragon from "../../assets/storybooks/characters/cinder-dragon.webp";

type PixelDragonProps = {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  shadow?: boolean;
  wingAngle?: number;
  glow?: number;
  trapped?: boolean;
  breath?: number;
};

/** The story timeline selects a frame from the two 32px DragonPack poses. */
export function PixelDragon({
  x, y, scale = 1.5, opacity = 1, shadow = false,
  wingAngle = 0, glow = 0, trapped = false, breath = 0,
}: PixelDragonProps) {
  const frame = Math.abs(wingAngle) > 7 ? 32 : 0;
  return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} aria-hidden="true">
    {glow > 0 && <ellipse cx="34" cy="29" rx="31" ry="17" fill="#ffc35f" opacity={glow * 0.2} />}
    <g transform="translate(64 0) scale(-1 1)">
      <svg x="0" y="-20" width="64" height="64" viewBox={`${frame} 0 32 32`} overflow="hidden">
        <image href={dragon} width="64" height="32" style={{ imageRendering: "pixelated", filter: shadow ? "brightness(0)" : undefined }} />
      </svg>
    </g>
    {trapped && !shadow && <g fill="none" stroke="#f2d47c" strokeWidth="2" opacity=".85">
      <path d="M10 13h48v27H10zM22 13v27m12-27v27m12-27v27M10 26h48" />
    </g>}
    {breath > 0 && !shadow && <g opacity={breath} shapeRendering="crispEdges">
      <rect x="60" y="14" width={Math.round(29 * breath)} height="4" fill="#fff0a3" />
      <rect x="61" y="11" width={Math.round(25 * breath)} height="3" fill="#f4a64d" />
      <rect x="61" y="18" width={Math.round(22 * breath)} height="3" fill="#f06e3e" />
    </g>}
  </g>;
}
