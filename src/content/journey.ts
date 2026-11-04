export const JOURNEY = [
  {
    "title": "The Last Light",
    "place": "Lanternwood",
    "theme": "dawn",
    "levels": [
      1,
      2,
      3
    ],
    "stops": [
      "Find the spark",
      "Brew the lantern fuel",
      "Wake the roots"
    ],
    "lines": [
      "You arrive in Lanternwood with an empty lantern. Beyond the trees, your village has vanished into a quiet mist.",
      "A spark answers your footsteps. You bottle its light, then repeat a growing spell until the roots begin to stir.",
      "The forest opens a path. The lantern belongs to you now, and every spell you learn changes the road ahead."
    ]
  },
  {
    "title": "Across the Hollow",
    "place": "Moonlit Crossing",
    "theme": "moon",
    "levels": [
      4,
      5,
      6
    ],
    "stops": [
      "Build the crossing",
      "Mend the ward",
      "Open the passage"
    ],
    "lines": [
      "You reach a broken crossing under a silver moon. On the far bank, a sealed passage carries the same mark as your lantern.",
      "You build a bridge from a reusable spell. Across the hollow, you repair the ward one rune at a time.",
      "The rings turn when you give them the right amount of light. You step through the passage to find what stopped the seasons."
    ]
  },
  {
    "title": "The Borrowed Hours",
    "place": "Amber Ruins",
    "theme": "amber",
    "levels": [
      7,
      8,
      9
    ],
    "stops": [
      "Order the hours",
      "Free the heart",
      "Plant tomorrow"
    ],
    "lines": [
      "You emerge among amber trees. Leaves hang motionless in the air, held there by the clock beneath the ruins.",
      "You put the scattered hours in order and break the binding around the clock's heart. Time begins to move again.",
      "You plant three sleeping seeds. Their new leaves point toward home, but the road still needs one final crossing."
    ]
  },
  {
    "title": "A Road for Everyone",
    "place": "Dawnreach",
    "theme": "sunrise",
    "levels": [
      10,
      11,
      12
    ],
    "stops": [
      "Bridge the stream",
      "Light the way",
      "Bring the dawn"
    ],
    "lines": [
      "Dawnreach is close enough to hear its bells. A stream separates you from the people waiting on the other bank.",
      "You reuse your bridge spell and light the trail markers. The way you build must stay open for everyone who follows.",
      "You send the last light through the gate. Your village returns from the mist. You set down your lantern beside the open road."
    ]
  }
] as const;
export const realmForLesson = (id: number) => JOURNEY[Math.min(3, Math.max(0, Math.floor((id - 1) / 3)))];
