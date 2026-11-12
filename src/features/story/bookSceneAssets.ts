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
const stagePlates = import.meta.glob<string>("../../assets/storybooks/stages/*.webp", { eager: true, query: "?url", import: "default" });

export const BOOK_STAGE_BACKDROPS = Object.fromEntries(
  Object.entries(stagePlates).map(([path, url]) => [path.split("/").at(-1)!.replace(".webp", ""), url]),
);

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
