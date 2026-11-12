import diary from "../../assets/storybooks/relics/diary.webp";
import ring from "../../assets/storybooks/relics/ring.webp";
import locket from "../../assets/storybooks/relics/locket.webp";
import cup from "../../assets/storybooks/relics/cup.webp";
import diadem from "../../assets/storybooks/relics/diadem.webp";
import snake from "../../assets/storybooks/relics/snake.webp";
import pensieve from "../../assets/storybooks/relics/pensieve.webp";
import dobby from "../../assets/storybooks/relics/dobby-idle.webp";
import sock from "../../assets/storybooks/relics/sock.webp";
import snitch from "../../assets/storybooks/relics/snitch.webp";
import wand from "../../assets/storybooks/relics/wand.webp";
import voldemort from "../../assets/storybooks/relics/voldemort-idle.webp";
const stagePlates = import.meta.glob<string>(
  ["../../assets/storybooks/stages/*.webp", "!../../assets/storybooks/stages/harry-32.webp"],
  { eager: true, query: "?url", import: "default" },
);

const stageUrls = Object.fromEntries(
  Object.entries(stagePlates).map(([path, url]) => [path.split("/").at(-1)!.replace(".webp", ""), url]),
);

type StagePlacement = {
  floorY: number;
  focus: readonly [x: number, y: number];
  showRelic?: boolean;
};

/** Coordinates refer to the original 256×144 art. Most relics are part of the plate. */
export const BOOK_STAGE_PLACEMENTS: Readonly<Partial<Record<string, StagePlacement>>> = {
  bathroom: { floorY: 132, focus: [94, 122] },
  "gaunt-shack": { floorY: 128, focus: [128, 122] },
  "seaside-cave": { floorY: 124, focus: [128, 89] },
  "lestrange-vault": { floorY: 132, focus: [128, 119] },
  "room-of-requirement": { floorY: 130, focus: [128, 75] },
  courtyard: { floorY: 135, focus: [152, 111], showRelic: true },
  pensieve: { floorY: 129, focus: [128, 85] },
  "old-classroom": { floorY: 130, focus: [128, 85] },
  "laundry-room": { floorY: 132, focus: [188, 89], showRelic: true },
  "quidditch-pitch": { floorY: 125, focus: [128, 73] },
  "wand-chamber": { floorY: 130, focus: [128, 85] },
  "great-hall": { floorY: 130, focus: [128, 94] },
};

export function getBookStage(scene: string) {
  const backdrop = stageUrls[scene];
  const placement = BOOK_STAGE_PLACEMENTS[scene];
  return backdrop && placement ? { backdrop, ...placement } : undefined;
}

/** Relic art is keyed by stable chapter ID so reordering chapters never changes a scene. */
export const BOOK_SCENE_ART: Readonly<Record<string, string>> = {
  "relics-book-one-01": diary,
  "relics-book-one-02": ring,
  "relics-book-one-03": locket,
  "relics-book-one-04": cup,
  "relics-book-one-05": diadem,
  "relics-book-one-06": snake,
  "relics-book-two-01": pensieve,
  "relics-book-two-02": voldemort,
  "relics-book-two-03": sock,
  "relics-book-two-04": snitch,
  "relics-book-two-05": wand,
  "relics-book-two-06": voldemort,
};

/** Supporting characters also follow stable chapter IDs instead of array position. */
export const BOOK_SCENE_CHARACTERS: Readonly<Record<string, string>> = {
  "relics-book-two-03": dobby,
  "relics-book-two-06": voldemort,
};

export const DEFAULT_BOOK_SCENE_ART = wand;
