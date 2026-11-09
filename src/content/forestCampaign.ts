/** Browser-safe campaign copy. Paid hints and solutions live in the Spark content table. */
export const FOREST_CHAPTERS = [
  {
    id: 9,
    title: "The Sleeping Seeds",
    chapter: "The Ancient Forest",
    conceptName: "Loops · repetition",
    story:
      "Past the restored academy, a forest has forgotten spring. Three sleeping seeds wait beside a lantern; a small spell could wake them.",
    objective: "Wake three seeds. Try using a loop to repeat the spell.",
    howToWriteBody: "A loop repeats its indented body once for every value produced by range().",
    codeExample: "for seed in range(1):\n    grow_flower()",
    stage: "garden",
    target: 3,
  },
  {
    id: 10,
    title: "A Bridge for Strangers",
    chapter: "The River Crossing",
    conceptName: "Functions · reuse",
    story:
      "A river divides the forest from an abandoned village. Build a short crossing so that the villagers can meet again.",
    objective:
      "Create three bridge stones. Try putting the spell in a function.",
    howToWriteBody: "A function gives a group of instructions a name so you can call them later.",
    codeExample: "def open_path():\n    place_starlight_tile()\n\nopen_path()",
    stage: "bridge",
    target: 3,
  },
  {
    id: 11,
    title: "The Lantern Runes",
    chapter: "The Old Watch",
    conceptName: "Arguments · precision",
    story:
      "A keeper left two lanterns behind a sealed door. The symbols numbered two and three must be released before the path can glow again.",
    objective: "Purify runes 2 and 3.",
    howToWriteBody: "An argument is the value passed between a command's parentheses.",
    codeExample: "purify_rune(1)",
    stage: "curse",
    target: [2, 3],
  },
  {
    id: 12,
    title: "The Way Home",
    chapter: "The Lantern Gate",
    conceptName: "Variables · calculation",
    story:
      "Light reaches the gate, but the trail home is still dark. Align the rings and send the gate exactly enough energy to open a safe path.",
    objective: "Align the rings and charge the gate with at least 120 flux.",
    howToWriteBody: "Store a value in a variable, then pass it to a command as an argument.",
    codeExample: "energy = 60\ncharge_stargate(energy)",
    stage: "stargate",
    target: 120,
  },
] as const;
/** Short, independent outcomes keep the new story editable outside the UI. */
export const FOREST_OUTCOMES: Record<number, string> = {
  9: "Three flowers lift their heads. Their light wakes a narrow path through the trees, and the old lantern warms for the first time in years.",
  10: "The last stone settles. Across the river, a village bell rings, and someone answers from the far bank.",
  11: "Two lanterns flare to life. Their light reveals footprints on the old road: the forest was never as empty as it seemed.",
  12: "The gate opens onto a familiar sky. Behind you, the forest glows with paths that others can follow. There are still stories waiting beyond the trees.",
};
