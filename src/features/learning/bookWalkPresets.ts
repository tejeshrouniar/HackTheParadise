import { JOURNEY } from "../../content/journey";
import { BOOK_PUZZLES } from "../../content/codeCampaign";
import { BOOK_SCENE_ART } from "../story/bookSceneAssets";
import castleScene from "../../assets/storybooks/scenes/wizarding-castle-map.svg";
import forestScene from "../../assets/storybooks/scenes/wizarding-forest-map.svg";
import caveScene from "../../assets/storybooks/scenes/wizarding-cave-map.svg";
import hallScene from "../../assets/storybooks/scenes/wizarding-hall-map.svg";
import lanternwood from "../../assets/realms/lanternwood.png";
import moonlit from "../../assets/realms/moonlit.png";
import amber from "../../assets/realms/amber.png";
import dawnreach from "../../assets/realms/dawnreach.png";
import walkway from "../../assets/realms/walkway.png";
import harrySprite from "../../assets/storybooks/stages/harry-32.webp";

export interface WalkMapStop {
  /** Stable progress key; never infer saved completion from list position. */
  id: string;
  /** Cinder quests retain their numeric player_progress IDs. */
  questId?: number;
  title: string;
  subtitle: string;
  art?: string;
}

export interface WalkMapRegion {
  id: string;
  chapterLabel: string;
  title: string;
  subtitle: string;
  background: string;
  ground?: string;
  stops: readonly WalkMapStop[];
}

export interface BookWalkPreset {
  bookId: string;
  kind: "tutorial" | "story";
  levelNoun: string;
  walker?: { sheet: string; leftRow: number; rightRow: number };
  regions: readonly WalkMapRegion[];
}

const realmBackgrounds = [lanternwood, moonlit, amber, dawnreach];
const realmProps = ["lantern", "resin_bottle", "healing_herb", "hammer", "scroll", "gold_key", "sun_disc", "soul_stone", "healing_herb", "wood_log", "lantern", "magic_staff"];
const realmArt = import.meta.glob<string>("../../assets/realms/*.png", { eager: true, query: "?url", import: "default" });

function makeCinderPreset(): BookWalkPreset {
  return {
    bookId: "cinder",
    kind: "tutorial",
    levelNoun: "spell",
    regions: JOURNEY.map((chapter, regionIndex) => ({
      id: `cinder-region-${regionIndex + 1}`,
      chapterLabel: `CHAPTER ${String(regionIndex + 1).padStart(2, "0")}`,
      title: chapter.place,
      subtitle: chapter.title,
      background: realmBackgrounds[regionIndex],
      ground: walkway,
      stops: chapter.levels.map((levelId, stopIndex) => ({
        id: `quest:${levelId}`,
        questId: levelId,
        title: chapter.stops[stopIndex],
        subtitle: `SPELL ${String(levelId).padStart(2, "0")}`,
        art: realmArt[`../../assets/realms/${realmProps[levelId - 1]}.png`],
      })),
    })),
  };
}

function makeWizardingPreset(): BookWalkPreset {
  const regions = [
    { title: "The Castle", subtitle: "The first clues · chapters 01–03", background: castleScene },
    { title: "The Forbidden Forest", subtitle: "Through the forest · chapters 04–06", background: forestScene },
    { title: "The Cave and Pensieve", subtitle: "Memories and relics · chapters 07–09", background: caveScene },
    { title: "The Final Stand", subtitle: "The last clues · chapters 10–12", background: hallScene },
  ];
  return {
    bookId: "harry-potter",
    kind: "story",
    levelNoun: "chapter",
    walker: { sheet: harrySprite, leftRow: 1, rightRow: 2 },
    regions: regions.map((region, regionIndex) => {
      const chapters = BOOK_PUZZLES.filter((chapter) => chapter.bookId === "harry-potter").slice(regionIndex * 3, regionIndex * 3 + 3);
      return {
        id: `wizarding-region-${regionIndex + 1}`,
        chapterLabel: `CHAPTERS ${String(regionIndex * 3 + 1).padStart(2, "0")}–${String(regionIndex * 3 + 3).padStart(2, "0")}`,
        title: region.title,
        subtitle: region.subtitle,
        background: region.background,
        stops: chapters.map((chapter) => ({
          id: chapter.chapterId,
          title: chapter.chapterTitle,
          subtitle: chapter.conceptName,
          art: BOOK_SCENE_ART[chapter.chapterId],
        })),
      };
    }),
  };
}

/**
 * New books plug their chapter groups and scene art into this walk-map preset.
 * The shared renderer owns movement, locked fog, chapter transitions, controls,
 * and the non-walking chapter directory.
 */
export const BOOK_WALK_PRESETS: Readonly<Record<string, BookWalkPreset>> = {
  cinder: makeCinderPreset(),
  "harry-potter": makeWizardingPreset(),
};
