import { JOURNEY } from "../content/journey.ts";
import { forestLessons } from "./forestLessons.ts";
export interface CodedexTask {
  id: string;
  text: string;
  check: (code: string, state: any) => boolean;
}

export interface CodedexLesson {
  id: number;
  chapter: string;
  title: string;
  conceptName: string;

  // Section 1: What is this?
  whatIsThisTitle: string;
  whatIsThisBody: string;
  whatIsThisCallout?: string;

  // Section 2: How can I write / give this?
  howToWriteTitle: string;
  howToWriteBody: string;
  codeExample: string;

  // Section 3: What you have to do (System instructions)
  taskObjective: string;
  tasks: Array<{
    id: string;
    description: string;
    codeKeyword: string;
  }>;

  // Editor initial code (clean with "type code here")
  initialCode: string;

  // Stage configuration
  stageType:
    | "dragon"
    | "potion"
    | "garden"
    | "bridge"
    | "curse"
    | "stargate"
    | "chrono"
    | "boss";
  stageConfig: any;
}

export const CODEDEX_LESSONS: CodedexLesson[] = [
  {
    id: 1,
    chapter: "Chapter 1: The Arcane Academy",
    title: "Your first spark",
    conceptName: "Objects & Movement Commands",

    whatIsThisTitle: "What is an object?",
    whatIsThisBody:
      "In programming, **player** is an *object*—your character in the world! An object groups a name, a state, and actions you can call. Your avatar moves when you specify exactly how many steps to take and which way to turn.",
    whatIsThisCallout:
      "Computers do not guess what you want. They obey your commands in the exact order you write them!",

    howToWriteTitle: "⌨️ How do I give commands to your avatar?",
    howToWriteBody:
      "To make your avatar act, write the object name `player`, a dot `.` and the action with parentheses `()`:",
    codeExample: "player.move_forward()\nplayer.turn_left()",

    taskObjective:
      "Move from your starting tile at (0, 0) to collect the Core fragment at (2, 2)!",
    tasks: [
      {
        id: "t1",
        description: "Move forward 2 times to reach the intersection.",
        codeKeyword: "player.move_forward()",
      },
      {
        id: "t2",
        description: "Turn right to face down.",
        codeKeyword: "player.turn_right()",
      },
      {
        id: "t3",
        description: "Move forward 2 times towards the crystal.",
        codeKeyword: "player.move_forward()",
      },
      {
        id: "t4",
        description: "Collect the crystal with player.collect_crystal().",
        codeKeyword: "player.collect_crystal()",
      },
    ],

    initialCode: `# Type your spell instructions below to guide your avatar!

`,

    stageType: "dragon",
    stageConfig: {
      gridSize: 5,
      startX: 0,
      startY: 0,
      startDir: "RIGHT",
      targetX: 2,
      targetY: 2,
      obstacles: [{ x: 1, y: 1 }],
    },
  },

  {
    id: 2,
    chapter: "Chapter 2: Alchemical Storage",
    title: "The Magic Bottles",
    conceptName: "Variables & Data Assignment",

    whatIsThisTitle: "⚗️ What is a variable?",
    whatIsThisBody:
      "In programming, a **variable** is like a labeled magic bottle! When an alchemist brews a potion, they don't pour everything randomly—they store ingredients in separate flasks. A variable stores a value in computer memory so you can use it whenever you need.",
    whatIsThisCallout:
      "Variables allow your program to remember numbers, words, and player stats!",

    howToWriteTitle: "🍾 How do I give a variable?",
    howToWriteBody:
      "To create a variable, write the name of your magic bottle on the left, an equal sign `=` in the middle, and the value on the right:",
    codeExample: "mana_flask = 20\nstar_dew = 1",

    taskObjective:
      "Assign 100 power to mana_flask, store 3 drops of star_dew, and call cauldron.brew_elixir() to brew the potion!",
    tasks: [
      {
        id: "t1",
        description: "Create variable mana_flask = 100",
        codeKeyword: "mana_flask = 100",
      },
      {
        id: "t2",
        description: "Create variable star_dew = 3",
        codeKeyword: "star_dew = 3",
      },
      {
        id: "t3",
        description: "Call cauldron.brew_elixir() to mix the ingredients.",
        codeKeyword: "cauldron.brew_elixir()",
      },
    ],

    initialCode: `# Create your variables and brew the potion!

`,

    stageType: "potion",
    stageConfig: {
      targetVariables: { mana_flask: 100, star_dew: 3 },
    },
  },

  {
    id: 3,
    chapter: "Chapter 3: The Repeating Grove",
    title: "Repeating Enchantments",
    conceptName: "For-Loops & Iteration",

    whatIsThisTitle: "🌿 What is a loop?",
    whatIsThisBody:
      'Imagine you need 100 flowers to bloom. Typing `grow_flower()` 100 times would make your fingers ache and your voice hoarse! A **loop** is a repeating chant that tells the computer: *"Repeat the instructions inside this block N times."*',
    whatIsThisCallout:
      "Loops turn 100 lines of boring repetition into just 2 lines of clean magic code!",

    howToWriteTitle: "🔁 How do I write a loop in Python?",
    howToWriteBody:
      "In Python, we use a `for` loop with `range(number):`. Notice the colon `:` at the end and the 4 spaces of indentation inside:",
    codeExample: "for step in range(2):\n    grow_flower()",

    taskObjective:
      "Write a loop that repeats 6 times to cultivate 6 enchanted flowers across the meadow path!",
    tasks: [
      {
        id: "t1",
        description: "Start the loop header: for step in range(6):",
        codeKeyword: "for step in range(6):",
      },
      {
        id: "t2",
        description: "Indent 4 spaces and write grow_flower().",
        codeKeyword: "grow_flower()",
      },
    ],

    initialCode: `# Write a repeat loop to bloom 6 flowers!

`,

    stageType: "garden",
    stageConfig: {
      targetFlowers: 6,
    },
  },

  {
    id: 4,
    chapter: "Chapter 4: The Sky Citadel",
    title: "The Reusable Bridge",
    conceptName: "Functions & Invocation",

    whatIsThisTitle: "🔮 What is a function?",
    whatIsThisBody:
      "A **function** is an inscribed spell scroll with a name! Instead of chanting the whole 20-word recipe every single time, you define it once under a name like `build_bridge()`. Whenever you shout that name, the entire spell executes automatically.",
    whatIsThisCallout:
      "Definition = writing the recipe scroll. Invocation = reading the scroll to cast the magic!",

    howToWriteTitle: "📜 How do I define and call a function?",
    howToWriteBody:
      "Use the `def` keyword (short for define), write your function name with `():`, and call it at the bottom:",
    codeExample: "def practice_bridge():\n    place_starlight_tile()\n\npractice_bridge()",

    taskObjective:
      "Define function build_bridge() with 4 starlight tiles, then call build_bridge() to cross the astral chasm!",
    tasks: [
      {
        id: "t1",
        description: "Define the function: def build_bridge():",
        codeKeyword: "def build_bridge():",
      },
      {
        id: "t2",
        description: "Place 4 tiles using a loop or instructions inside.",
        codeKeyword: "place_starlight_tile()",
      },
      {
        id: "t3",
        description: "Call build_bridge() at the end to cast it.",
        codeKeyword: "build_bridge()",
      },
    ],

    initialCode: `# Define your reusable bridge spell and invoke it!

`,

    stageType: "bridge",
    stageConfig: {
      targetBridge: 4,
    },
  },

  {
    id: 5,
    chapter: "Chapter 5: The Obsidian Crypt",
    title: "Breaking Curses",
    conceptName: "Debugging & Index Errors",

    whatIsThisTitle: "⚡ What is debugging?",
    whatIsThisBody:
      "Every programmer—from beginners to senior wizards—makes mistakes! In magic lore, mistakes are called **curses**; in coding, they are called **bugs**. **Debugging** is the art of reading the error clue, inspecting the code line-by-line, and repairing the curse.",
    whatIsThisCallout:
      "Never fear bugs! Errors are clues left by the computer to help you fix your logic.",

    howToWriteTitle: "🔍 How do I find and fix the curse?",
    howToWriteBody:
      "The dungeon altar has 3 ancient runes (#1, #2, #3). But someone chanted `purify_rune(9)`! Rune #9 does not exist—trying to touch an item that isn't there causes an **Index Error**.",
    codeExample: "purify_rune(1)  # Select one valid rune by its number",

    taskObjective:
      "Purify all three runes (1, 2, 3) to break the chains and unlock the dungeon vault door!",
    tasks: [
      {
        id: "t1",
        description: "Purify Rune #1: purify_rune(1)",
        codeKeyword: "purify_rune(1)",
      },
      {
        id: "t2",
        description: "Purify Rune #2: purify_rune(2)",
        codeKeyword: "purify_rune(2)",
      },
      {
        id: "t3",
        description: "Purify Rune #3: purify_rune(3)",
        codeKeyword: "purify_rune(3)",
      },
    ],

    initialCode: `# Fix the broken line to cleanse all 3 runes!
purify_rune(1)
purify_rune(2)
purify_rune(9)  # ⚠️ Bug: Change 9 to 3!
`,

    stageType: "curse",
    stageConfig: {
      targetRunes: [1, 2, 3],
    },
  },

  {
    id: 6,
    chapter: "Chapter 6: The Celestial Stargate",
    title: "Cosmic Portal Alignment",
    conceptName: "Functions, Parameters & Return",

    whatIsThisTitle: "🌌 What is a return value?",
    whatIsThisBody:
      'In advanced magic, functions don\'t just perform actions—they can calculate and return values back to your spell! Using the "return" keyword, your function computes energy flux and hands the result back to power the celestial stargate.',
    whatIsThisCallout:
      "A function with a return statement acts like an enchanted oracle: you give it inputs (parameters) and it answers with an output calculation!",

    howToWriteTitle: "⚙️ How do I write a function with parameters & return?",
    howToWriteBody:
      "Define the function with parameters in the parentheses, perform the calculation, and return the result:",
    codeExample: "def double_energy(value):\n    return value * 2\n\nenergy = double_energy(15)",

    taskObjective:
      "Align the celestial rings, define calculate_flux(core_power) to return core_power * 2, and charge the stargate to 200 Flux!",
    tasks: [
      {
        id: "t1",
        description: "Align the 3 astral rings: align_gate_rings()",
        codeKeyword: "align_gate_rings()",
      },
      {
        id: "t2",
        description: "Define function: def calculate_flux(core_power):",
        codeKeyword: "def calculate_flux(core_power):",
      },
      {
        id: "t3",
        description: "Return doubled power: return core_power * 2",
        codeKeyword: "return core_power * 2",
      },
      {
        id: "t4",
        description: "Charge gate: charge_stargate(200)",
        codeKeyword: "charge_stargate",
      },
    ],

    initialCode: `# Align celestial rings and charge the Stargate to 200 Flux!

`,

    stageType: "stargate",
    stageConfig: {
      targetFlux: 200,
    },
  },

  {
    id: 7,
    chapter: "Chapter 7: The Chrono Vault",
    title: "The Chrono Time Matrix",
    conceptName: "Lists, Indices & Sorting",

    whatIsThisTitle: "⏳ What is a List?",
    whatIsThisBody:
      "A List in Python is an ordered collection of magical items enclosed in square brackets [...]. You can store fractured crystal shards, sort them in chronological order, and access them by index!",
    whatIsThisCallout:
      "Time shards out of order create dangerous temporal paradoxes. Python lists have built-in spells like .sort() to restore order!",

    howToWriteTitle: "💎 How do I create and sort a list?",
    howToWriteBody:
      "Create a list of numbers or items, then use .sort() to order them from lowest to highest:",
    codeExample: "crystals = [8, 2, 5]\ncrystals.sort()",

    taskObjective:
      "Store fractured crystals [4, 1, 3, 2], sort them with crystals.sort(), and stabilize the chrono vortex!",
    tasks: [
      {
        id: "t1",
        description: "Declare list: crystals = [4, 1, 3, 2]",
        codeKeyword: "crystals = [4, 1, 3, 2]",
      },
      {
        id: "t2",
        description: "Sort list in ascending order: crystals.sort()",
        codeKeyword: "crystals.sort()",
      },
      {
        id: "t3",
        description: "Stabilize timeline: stabilize_vortex(crystals)",
        codeKeyword: "stabilize_vortex(crystals)",
      },
    ],

    initialCode: `# Repair the fractured timeline crystals!
crystals = [4, 1, 3, 2]

`,

    stageType: "chrono",
    stageConfig: {
      targetOrder: [1, 2, 3, 4],
    },
  },

  {
    id: 8,
    chapter: "Chapter 8: The Ethereal Core",
    title: "Malachar’s last binding",
    conceptName: "Variables, loops & function calls",

    whatIsThisTitle: "What is the final restoration spell?",
    whatIsThisBody:
      "The ultimate trial of an Archmage! The sorcerer Malachar holds the Ethereal Core inside a binding with 100 corruption. You must combine variables (Mana Shield), loops (Starlight Bolt barrage), and functions (Core Restoration) in one grand master spell to liberate the realm!",
    whatIsThisCallout:
      "True mastery is knowing when to use variables to defend, loops to barrage, and function calls to break the final binding!",

    howToWriteTitle: "⚔️ How do I assemble the Master Spell?",
    howToWriteBody:
      "Store shield energy in a variable, use an indented loop for repeated actions, and finish with a separate function call. Choose the values required by your mission.",
    codeExample: "mana_shield = 25\nfor bolt in range(1):\n    cast_starlight_bolt()",

    taskObjective:
      "Assemble the master spell: raise mana_shield = 100, cast 3 starlight bolts with a loop, and finish with restore_core()!",
    tasks: [
      {
        id: "t1",
        description: "Charge shield: mana_shield = 100",
        codeKeyword: "mana_shield = 100",
      },
      {
        id: "t2",
        description:
          "Barrage with loop: for bolt in range(3): cast_starlight_bolt()",
        codeKeyword: "for bolt in range(3):",
      },
      {
        id: "t3",
        description: "Cast bolt inside loop: cast_starlight_bolt()",
        codeKeyword: "cast_starlight_bolt()",
      },
      {
        id: "t4",
        description: "Finish boss: restore_core()",
        codeKeyword: "restore_core()",
      },
    ],

    initialCode: `# Assemble your grand master spell to break Malachar’s binding!

`,

    stageType: "boss",
    stageConfig: {
      bossHp: 100,
    },
  },
];

CODEDEX_LESSONS.push(...forestLessons(CODEDEX_LESSONS));

for (const realm of JOURNEY) {
  realm.levels.forEach((id, index) => {
    const lesson = CODEDEX_LESSONS.find(item => item.id === id)!;
    lesson.title = realm.stops[index];
    lesson.chapter = realm.title + " · " + realm.place;
  });
}
