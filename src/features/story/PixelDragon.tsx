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

/** A small, authored pixel-dragon used as a story character, not a looping prop. */
export function PixelDragon({
  x,
  y,
  scale = 1.5,
  opacity = 1,
  shadow = false,
  wingAngle = 0,
  glow = 0,
  trapped = false,
  breath = 0,
}: PixelDragonProps) {
  const outline = shadow ? "#172323" : "#3d2930";
  const body = shadow ? "#172323" : "#b95d3e";
  const bodyLight = shadow ? "#172323" : "#e38b4e";
  const wing = shadow ? "#172323" : "#813d3a";
  const wingLight = shadow ? "#172323" : "#d36a46";

  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      opacity={opacity}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {glow > 0 && (
        <ellipse
          cx="34"
          cy="29"
          rx="31"
          ry="17"
          fill="#ffc35f"
          opacity={glow * 0.2}
        />
      )}

      {/* Tail and wings sit behind the body. The finite wing motion follows the scene timeline. */}
      <polygon
        points="20,27 12,25 7,28 2,27 5,33 12,32 19,35 25,31"
        fill={outline}
      />
      <polygon points="18,28 10,27 6,29 12,30 20,32" fill={body} />
      <g transform={`rotate(${wingAngle} 29 24)`}>
        <polygon
          points="24,25 16,21 11,14 7,13 10,9 7,4 17,8 21,3 26,13 35,17 39,23 32,28"
          fill={outline}
        />
        <polygon
          points="23,23 16,19 12,14 16,15 12,9 19,12 22,8 26,16 33,19 35,23 30,25"
          fill={wing}
        />
        {!shadow && (
          <polygon
            points="17,18 14,15 18,16 16,12 21,15 23,12 25,18 31,20 32,22 26,21"
            fill={wingLight}
          />
        )}
      </g>

      {/* Block-built torso, legs, neck and head keep the silhouette readable at pixel scale. */}
      <rect x="18" y="22" width="25" height="12" fill={outline} />
      <rect x="20" y="20" width="20" height="13" fill={body} />
      <rect x="23" y="18" width="15" height="6" fill={bodyLight} />
      <rect x="22" y="31" width="7" height="9" fill={outline} />
      <rect x="34" y="31" width="7" height="9" fill={outline} />
      <rect x="24" y="32" width="4" height="6" fill={body} />
      <rect x="36" y="32" width="4" height="6" fill={body} />
      <rect x="21" y="38" width="8" height="4" fill={outline} />
      <rect x="34" y="38" width="8" height="4" fill={outline} />
      <rect x="36" y="15" width="9" height="12" fill={outline} />
      <rect x="38" y="14" width="8" height="12" fill={body} />
      <rect x="43" y="12" width="13" height="11" fill={outline} />
      <rect x="45" y="13" width="10" height="8" fill={bodyLight} />
      <rect x="52" y="18" width="8" height="5" fill={body} />
      <rect x="57" y="20" width="5" height="3" fill={outline} />
      <rect x="46" y="10" width="3" height="5" fill={outline} />
      <rect x="48" y="9" width="3" height="4" fill={bodyLight} />
      <rect x="53" y="11" width="3" height="4" fill={outline} />
      {!shadow && (
        <>
          <rect x="50" y="16" width="3" height="3" fill="#ffe27c" />
          <rect x="53" y="17" width="1" height="1" fill="#fff8c8" />
          <rect x="29" y="24" width="4" height="3" fill="#f3b95e" />
          <rect x="32" y="27" width="4" height="3" fill="#f3b95e" />
          <rect x="25" y="27" width="4" height="3" fill="#f3b95e" />
        </>
      )}

      {trapped && !shadow && (
        <g fill="none" stroke="#f2d47c" strokeWidth="2.5">
          <path d="M20 21h23M22 28h22M27 19v15M37 19v15" />
          <path d="M23 18l19 18M42 18L24 36" strokeWidth="1.5" />
        </g>
      )}

      {breath > 0 && !shadow && (
        <g opacity={breath}>
          <rect x="60" y="18" width={Math.round(29 * breath)} height="3" fill="#fff0a3" />
          <rect x="61" y="16" width={Math.round(25 * breath)} height="2" fill="#f4a64d" />
          <rect x="61" y="21" width={Math.round(22 * breath)} height="2" fill="#f06e3e" />
          <rect x={64 + Math.round(22 * breath)} y="17" width="4" height="2" fill="#ffe08a" />
        </g>
      )}
    </g>
  );
}
