import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  compileQuestCode,
  QuestCodeError,
} from "../src/features/learning/questCompiler.ts";
import {
  normalizeUsername,
  usernameError,
  mergeLessons,
  safeUrl,
  messageError,
} from "../src/lib/validation.ts";
import { CODEDEX_LESSONS } from "../src/data/codedexLessons.ts";
import { CORE_FRAGMENTS, chapterOutcome } from "../src/content/eldoria.ts";

// Paid solution fixtures live in tests only. They are deliberately not imported
// by the browser bundle; production reads them after a Supabase entitlement check.
const SOLUTIONS = {
  1: `player.move_forward()\nplayer.move_forward()\nplayer.turn_right()\nplayer.move_forward()\nplayer.move_forward()\nplayer.collect_crystal()`,
  2: `mana_flask = 100\nstar_dew = 3\ncauldron.brew_elixir()`,
  3: `for step in range(6):\n    grow_flower()`,
  4: `def build_bridge():\n    for step in range(4):\n        place_starlight_tile()\n\nbuild_bridge()`,
  5: `purify_rune(1)\npurify_rune(2)\npurify_rune(3)`,
  6: `align_gate_rings()\n\ndef calculate_flux(core_power):\n    return core_power * 2\n\ncharge_stargate(calculate_flux(100))`,
  7: `crystals = [4, 1, 3, 2]\ncrystals.sort()\nstabilize_vortex(crystals)`,
  8: `mana_shield = 100\nfor bolt in range(3):\n    cast_starlight_bolt()\nrestore_core()`,
  9: `for seed in range(3):\n    grow_flower()`,
  10: `def build_crossing():\n    for stone in range(3):\n        place_starlight_tile()\n\nbuild_crossing()`,
  11: `purify_rune(2)\npurify_rune(3)`,
  12: `align_gate_rings()\ncharge_stargate(120)`,
};

test("Player commands retain the existing movement semantics and old commands remain valid", () => {
  const solution = SOLUTIONS[1];
  assert.match(solution, /player\.move_forward/);
  assert.deepEqual(
    compileQuestCode(solution),
    compileQuestCode(solution.replaceAll("player.", "dragon.")),
  );
  assert.throws(
    () => compileQuestCode("aether.fly()"),
    /Unknown command: aether.fly/,
  );
  assert.deepEqual(
    compileQuestCode("restore_core()"),
    compileQuestCode("holy_smite()"),
  );
});
test("the final story outcome requires all five fragments, including out-of-order play", () => {
  assert.equal(CORE_FRAGMENTS.length, 5);
  assert.match(chapterOutcome(8, [8]), /missing fragments/);
  assert.match(chapterOutcome(8, [1, 2, 3, 4, 7, 8]), /academy doors/);
});

test("all quest solutions and guide examples compile into real actions", () => {
  for (const lesson of CODEDEX_LESSONS) {
    const instructions = compileQuestCode(SOLUTIONS[lesson.id]);
    assert.ok(instructions.length > 0, lesson.title);
    assert.ok(
      compileQuestCode(lesson.codeExample).length > 0,
      `${lesson.title} guide example`,
    );
  }
});
test("forest campaign spells produce the actions needed by each mission", () => {
  const actions = (id) => compileQuestCode(SOLUTIONS[id]);
  assert.equal(actions(9).filter((action) => action.name === "grow_flower").length, 3);
  assert.equal(actions(10).filter((action) => action.name === "place_starlight_tile").length, 3);
  assert.deepEqual(actions(11).filter((action) => action.name === "purify_rune").map((action) => action.args[0]), [2, 3]);
  assert.ok(actions(12).some((action) => action.name === "align_gate_rings"));
  assert.equal(actions(12).find((action) => action.name === "charge_stargate").args[0], 120);
});
test("bridge functions only run when invoked and expand their real loop body", () => {
  const lessonId = CODEDEX_LESSONS.find(
    (l) => l.stageType === "bridge",
  ).id;
  const solution = SOLUTIONS[lessonId];
  assert.equal(
    compileQuestCode(solution).filter((i) => i.name === "place_starlight_tile")
      .length,
    4,
  );
  assert.deepEqual(
    compileQuestCode("def build_bridge():\n    place_starlight_tile()"),
    [],
  );
  assert.throws(() => compileQuestCode("build_bridge()"), /Unknown command/);
});
test("stargate return values are calculated, not assumed to be 200", () => {
  const lessonId = CODEDEX_LESSONS.find(
    (l) => l.stageType === "stargate",
  ).id;
  const solution = SOLUTIONS[lessonId];
  assert.equal(
    compileQuestCode(solution).find((i) => i.name === "charge_stargate")
      .args[0],
    200,
  );
  assert.equal(
    compileQuestCode(
      solution.replace("calculate_flux(100)", "calculate_flux(30)"),
    ).find((i) => i.name === "charge_stargate").args[0],
    60,
  );
});
test("boss shield and all loop attacks execute", () => {
  const actions = compileQuestCode(
    SOLUTIONS[8],
  );
  assert.deepEqual(actions[0], {
    line: 0,
    name: "assign:mana_shield",
    args: [100],
  });
  assert.equal(
    actions.filter((a) => a.name === "cast_starlight_bolt").length,
    3,
  );
});
test("sorting keeps the actual list values", () => {
  assert.deepEqual(
    compileQuestCode("crystals = [5, 1, 3]\ncrystals.sort()").at(-1).args,
    [[1, 3, 5]],
  );
});
test("syntax errors keep their source location", () => {
  assert.throws(
    () => compileQuestCode("# hi\ndragon.fly()"),
    (e) => e instanceof QuestCodeError && e.line === 1,
  );
  assert.throws(
    () => compileQuestCode("for step in range(4):\ngrow_flower()"),
    /indented body/,
  );
  assert.throws(() => compileQuestCode("    grow_flower()"), /left edge/);
  assert.throws(() => compileQuestCode("purify_rune(1,2)"), /needs 1/);
});
test("untrusted code cannot execute JS, unlimited loops or recursion", () => {
  for (const code of [
    'fetch("https://example.com")',
    "eval(1)",
    "while True:\n    grow_flower()",
    "for x in range(100000000):\n    grow_flower()",
    "def recurse():\n    recurse()\nrecurse()",
    "for x in range(100):\n    for y in range(100):\n        grow_flower()",
  ])
    assert.throws(() => compileQuestCode(code));
});
test("usernames normalize consistently and reject invalid names", () => {
  assert.equal(normalizeUsername("  Sparky_42 "), "sparky_42");
  assert.equal(usernameError("sparky_42"), "");
  for (const value of [
    "a",
    "ABCD",
    "bad name",
    "name@here",
    "x".repeat(37),
    "a\nb",
  ])
    assert.ok(usernameError(value));
});
test("progress merges without losing completions and ignores corrupted local data", () => {
  assert.deepEqual(
    mergeLessons([1, 3], [2, 3, 8], null, "oops", [0, 13, "4", NaN]),
    [1, 2, 3, 8],
  );
});
test("only https media links are usable and messages have real limits", () => {
  assert.equal(safeUrl("javascript:alert(1)"), undefined);
  assert.equal(safeUrl("data:image/svg+xml,abc"), undefined);
  assert.equal(safeUrl("https://example.com/a"), "https://example.com/a");
  assert.ok(messageError(" "));
  assert.ok(messageError("a".repeat(2001)));
  assert.equal(messageError("hello"), "");
});
test("writer content has stable, unique IDs and valid quest links", () => {
  const story = JSON.parse(
    readFileSync(
      new URL("../src/content/stories/first-light.json", import.meta.url),
      "utf8",
    ),
  );
  const chapters = new Set();
  const positions = new Set();
  for (const chapter of story.chapters) {
    assert.ok(!chapters.has(chapter.id));
    chapters.add(chapter.id);
    assert.ok(!positions.has(chapter.position));
    positions.add(chapter.position);
    assert.ok(CODEDEX_LESSONS.some((l) => l.id === chapter.lesson_id));
    const sections = new Set();
    for (const section of chapter.content) {
      assert.ok(!sections.has(section.id));
      sections.add(section.id);
      assert.ok(["narration", "dialogue", "choice"].includes(section.type));
      if (section.type === "choice") {
        assert.ok(section.options.length > 1);
        assert.equal(
          new Set(section.options.map((o) => o.id)).size,
          section.options.length,
        );
      }
    }
  }
});
