import academy from "../../assets/eldoria/academy.webp";
import academySmall from "../../assets/eldoria/academy-small.webp";
import grove from "../../assets/eldoria/grove.webp";
import groveSmall from "../../assets/eldoria/grove-small.webp";
import core from "../../assets/eldoria/core.webp";
import coreSmall from "../../assets/eldoria/core-small.webp";
import aether from "../../assets/eldoria/aether.webp";

export const AETHER_PORTRAIT = aether;
const artwork = [
  {
    src: academy,
    small: academySmall,
    alt: "Aether opens his spellbook before the floating towers of Eldoria.",
    position: "70% 55%",
  },
  {
    src: grove,
    small: groveSmall,
    alt: "An enchanted grove leads across a broken sky bridge to a distant citadel.",
    position: "50% 55%",
  },
  {
    src: core,
    small: coreSmall,
    alt: "Malachar stands beside the fractured Ethereal Core in the ruined observatory.",
    position: "60% 55%",
  },
];

export function StoryArtwork({
  lesson = 1,
  className = "",
  decorative = false,
  priority = false,
  compact = false,
}: {
  lesson?: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  compact?: boolean;
}) {
  const art = artwork[lesson <= 2 ? 0 : lesson <= 4 ? 1 : 2];
  return (
    <img
      className={`sc-story-art ${className}`}
      src={compact ? art.small : art.src}
      srcSet={compact ? undefined : `${art.small} 640w, ${art.src} 1600w`}
      sizes={
        compact
          ? undefined
          : "(max-width: 700px) 100vw, (max-width: 1200px) 75vw, 1000px"
      }
      width={1600}
      height={900}
      alt={decorative ? "" : art.alt}
      style={{ objectPosition: art.position }}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
