import type { PuzzleTestCase, PuzzleValue } from "../features/learning/puzzleRunner";

/** Standalone puzzle content for the optional storybook volumes. These IDs are
 * not Cinder lesson IDs; completion is stored under each chapter's own slug. */
export type StorybookId = "book-one" | "book-two";
export interface BookPuzzle {
  id: number;
  bookId: StorybookId;
  chapterId: string;
  chapterTitle: string;
  subtitle: string;
  scene: string;
  symbol: string;
  title: string;
  conceptName: string;
  story: string;
  outcome: string;
  lesson: string;
  taskObjective: string;
  functionName: string;
  tests: PuzzleTestCase[];
}

const cases = (items: Array<[string, PuzzleValue[], PuzzleValue]>): PuzzleTestCase[] =>
  items.map(([label, input, expected]) => ({ label, input, expected }));

export const BOOK_PUZZLES: BookPuzzle[] = [
  {
    id: 1, bookId: "book-one", chapterId: "relics-book-one-01", chapterTitle: "The Inkbound Journal",
    subtitle: "The west archive · A message written backward", scene: "archive", symbol: "◈",
    title: "The Backwards Ink", conceptName: "Strings · slicing",
    story: "On your first night at Emberfall Academy, a journal slides from a shelf that has been sealed for a century. Its ink runs backward whenever you try to read it. A small brass moth lands on the page, then points toward a hidden line beneath the cover.",
    outcome: "The letters turn around. The journal names six relics and warns that their keeper is already inside the Academy.",
    lesson: "Text is an ordered sequence of characters. A slice can read that sequence from the end when its step is negative.",
    taskObjective: "Define reveal_message(text) and return each message in reverse order.", functionName: "reveal_message",
    tests: cases([["First ink mark", ["thgil"], "light"], ["A name in the margin", ["nalioR"], "Roilan"], ["Longer note", ["emoh eht dnif"], "find the home"]]),
  },
  {
    id: 2, bookId: "book-one", chapterId: "relics-book-one-02", chapterTitle: "The Thorn Ring",
    subtitle: "The old glasshouse · A curse in the readings", scene: "glasshouse", symbol: "◯",
    title: "A Ring of Thorn and Ash", conceptName: "Lists · filtering",
    story: "The journal leads you to a ring sealed beneath the academy's abandoned glasshouse. Its curse has mixed clean readings with harmful ones. Archivist Ilyra steadies the ward while you sort the ring's measurements into a safe list.",
    outcome: "The harmless readings settle into a clear pattern. The ring opens, and a silver thread points toward the flooded cloister.",
    lesson: "A list comprehension builds a new list from an existing one. An if condition keeps only values that pass a check.",
    taskObjective: "Define cleanse_ring(energy_levels) and keep every value that is zero or higher, in its original order.", functionName: "cleanse_ring",
    tests: cases([["Mixed readings", [[-50, 20, -10, 80]], [20, 80]], ["Zero is safe", [[0, -3, 4, 0]], [0, 4, 0]], ["Only the curse remains", [[-2, -1]], []]]),
  },
  {
    id: 3, bookId: "book-one", chapterId: "relics-book-one-03", chapterTitle: "The Serpent Locket",
    subtitle: "The flooded cloister · A lock that answers in hisses", scene: "cloister", symbol: "〰",
    title: "The Locket's Hush-Language", conceptName: "Strings · loops and replacement",
    story: "A locket rests below the cloister water, clasped by a lock that answers only to a sibilant alphabet. You find a list of vowels etched on its inner rim. Each one must be changed before the door will hear the full phrase.",
    outcome: "The locket repeats the translated phrase. A hidden stair rises from the water and leads to a chamber full of identical cups.",
    lesson: "A loop can visit every character in a string. replace() returns changed text, so save each new version before the next pass.",
    taskObjective: "Define hush_language(text). Replace every upper- and lowercase vowel with the text 'sss'.",
    functionName: "hush_language",
    tests: cases([["Cloister word", ["open"], "ssspsssn"], ["Mixed case", ["Aerie"], "ssssssrssssss"], ["No vowels", ["myth"], "myth"]]),
  },
  {
    id: 4, bookId: "book-one", chapterId: "relics-book-one-04", chapterTitle: "The Echo Chalice",
    subtitle: "The mirror vault · Find the original among copies", scene: "mirror-vault", symbol: "◉",
    title: "The Original Weight", conceptName: "Lists · counting",
    story: "The locket unlocks a mirror vault. Touching the chalice makes it copy itself until the room is full of gold. Each true cup carries the same weight mark; the copies carry false marks. Count the originals before the mirrors close.",
    outcome: "The original cups chime together. Their sound opens the vault's inner door, where a glass diadem waits under a beam of light.",
    lesson: "Lists may hold repeated values. count() returns how many entries match a chosen value.",
    taskObjective: "Define count_originals(items, target_weight) and return the number of matching weight tags.", functionName: "count_originals",
    tests: cases([["True cup marks", [[10, 5, 10, 10, 2], 10], 3], ["No matching mark", [[1, 2, 3], 8], 0], ["Repeated zero", [[0, 0, 1], 0], 2]]),
  },
  {
    id: 5, bookId: "book-one", chapterId: "relics-book-one-05", chapterTitle: "The Glass Diadem",
    subtitle: "The moon room · A test of judgment", scene: "moon-room", symbol: "✥",
    title: "A Proof of Clear Intent", conceptName: "Logic · comparisons and booleans",
    story: "The diadem is suspended in the moon room. Its ward asks two questions: does wisdom outweigh pride, and is the bearer acting with kind intent? One true answer cannot stand in for the other.",
    outcome: "Both parts of the proof hold. The diadem shows a moving mark in the courtyard: a great ash serpent tracing a route around the sixth seal.",
    lesson: "Comparisons produce True or False. The and operator returns True only when both checks are True.",
    taskObjective: "Define may_claim_diadem(wisdom, pride, kind_intent). Return True only when wisdom is greater than pride and kind_intent is True.", functionName: "may_claim_diadem",
    tests: cases([["Wisdom with care", [90, 20, true], true], ["Pride wins", [10, 30, true], false], ["Intent matters", [90, 20, false], false]]),
  },
  {
    id: 6, bookId: "book-one", chapterId: "relics-book-one-06", chapterTitle: "The Ashcoil Serpent",
    subtitle: "The academy court · Follow the trail", scene: "courtyard", symbol: "⌁",
    title: "Track the Ashcoil", conceptName: "Loops · tuples and conditionals",
    story: "The ashcoil is not a monster but a guardian, frightened by the broken wards. You follow its glowing tracks across the courtyard tiles. The route starts at a coordinate and changes one step at a time.",
    outcome: "You reach the ashcoil without trapping it. The guardian reveals a memory of the Hollow Regent and the first page of a second book.",
    lesson: "Unpack an (x, y) pair, loop through each direction, and use if/elif branches to update one coordinate at a time.",
    taskObjective: "Define track_ashcoil(start_pos, moves). Apply each direction and return the final (x, y) pair. UP increases y; DOWN decreases y.", functionName: "track_ashcoil",
    tests: cases([["Courtyard trail", [[0, 0], ["UP", "RIGHT", "UP"]], [1, 2]], ["Loop back", [[3, 2], ["LEFT", "DOWN", "RIGHT"]], [3, 1]], ["No steps", [[-1, 4], []], [-1, 4]]]),
  },
  {
    id: 7, bookId: "book-two", chapterId: "relics-book-two-01", chapterTitle: "The Memory Mark",
    subtitle: "The sealed observatory · Rebuild a lost timeline", scene: "observatory", symbol: "✴",
    title: "The Order of Memories", conceptName: "Lists · sorting",
    story: "The second volume opens at the sealed observatory. A mark on your hand flashes with timestamps from the Hollow Regent's past, but the memories arrive out of order. Arrange them before the next vision fades.",
    outcome: "The memories align: the Regent was once an apprentice who feared losing the people he loved. The next clue is hidden beneath a many-layered mask.",
    lesson: "sorted() creates a new list in ascending order, leaving the original sequence unchanged.",
    taskObjective: "Define order_memories(timestamps) and return the timestamps from earliest to latest.", functionName: "order_memories",
    tests: cases([["Three memories", [[1981, 1926, 1943]], [1926, 1943, 1981]], ["Already ordered", [[1, 2, 3]], [1, 2, 3]], ["Include earlier years", [[12, -1, 4]], [-1, 4, 12]]]),
  },
  {
    id: 8, bookId: "book-two", chapterId: "relics-book-two-02", chapterTitle: "The Veiled Mask",
    subtitle: "The portrait gallery · Unfold the hidden design", scene: "gallery", symbol: "◩",
    title: "Layers Behind the Veil", conceptName: "Lists · nested collections",
    story: "In the portrait gallery, the Regent's mask is woven from layers of cloth and old spells. The rows are nested inside a larger list. Unfold each row in order to reveal the pattern stitched into the lining.",
    outcome: "The pattern reveals a doorway beneath the gallery. You see a small familiar waiting on the other side, searching for a missing charm.",
    lesson: "A nested list comprehension can visit each row and then each item in that row while preserving order.",
    taskObjective: "Define unfold_veil(layers) and return all entries in row order as one flat list.", functionName: "unfold_veil",
    tests: cases([["Two woven rows", [[ ["thread", "silver"], ["ash"] ]], ["thread", "silver", "ash"]], ["Empty first layer", [[[], ["moon"]]], ["moon"]], ["No layers", [[]], []]]),
  },
  {
    id: 9, bookId: "book-two", chapterId: "relics-book-two-03", chapterTitle: "The Missing Charm",
    subtitle: "The familiars' room · Find the gap", scene: "familiar-room", symbol: "⌑",
    title: "One Number Is Gone", conceptName: "Arithmetic · sums and integer division",
    story: "A familiar has scattered a numbered set of brass charms across the room. One is missing, and the remaining charms must be returned before the little creature can find its way home. The set should contain every number from one to n.",
    outcome: "The missing charm clicks into place. The familiar leads you to a silver comet crossing the academy roof.",
    lesson: "The first n positive integers add up to n × (n + 1) ÷ 2. Subtract the sum you have to find what is missing.",
    taskObjective: "Define find_missing_charm(charms, n). Return the missing number from the sequence 1 through n.", functionName: "find_missing_charm",
    tests: cases([["Middle charm", [[1, 2, 4, 5], 5], 3], ["First charm", [[2, 3, 4], 4], 1], ["Last charm", [[1, 2, 3], 4], 4]]),
  },
  {
    id: 10, bookId: "book-two", chapterId: "relics-book-two-04", chapterTitle: "The Silver Comet",
    subtitle: "Above the old roofs · Measure its flight", scene: "rooftops", symbol: "⊹",
    title: "A Key in Motion", conceptName: "Numbers · safe division",
    story: "A silver comet carries a key along the roofline. The observatory gives its distance and travel time, but a stalled comet reports zero time. Measure its speed without letting the calculation divide by zero.",
    outcome: "The comet slows to a catchable arc. Its key opens the chamber where the Founder's Wand was hidden.",
    lesson: "A conditional can handle the zero-time edge case before the normal distance ÷ time calculation runs.",
    taskObjective: "Define calculate_speed(distance, time). Return 0 when time is zero; otherwise return distance divided by time.", functionName: "calculate_speed",
    tests: cases([["Steady flight", [100, 5], 20], ["Longer crossing", [21, 3], 7], ["Stalled comet", [100, 0], 0]]),
  },
  {
    id: 11, bookId: "book-two", chapterId: "relics-book-two-05", chapterTitle: "The Founder's Wand",
    subtitle: "The rune chamber · Read the shifted inscription", scene: "rune-chamber", symbol: "✦",
    title: "The One-Step Cipher", conceptName: "Strings · character codes",
    story: "The Founder's Wand is not a weapon; it is a record of every spell the academy has shared. Its instructions are shifted one character forward. Decode each letter to read the final ward.",
    outcome: "The inscription says the last seal cannot be opened by one person alone. It needs every key gathered along the road.",
    lesson: "ord() changes a character into its number code; chr() turns the adjusted code back into a character. += can build a result string.",
    taskObjective: "Define decode_inscription(cipher). Shift every character back by one code point and return the new text.", functionName: "decode_inscription",
    tests: cases([["Short inscription", ["Fwqf"], "Evpe"], ["Lowercase", ["bcd"], "abc"], ["Word and space", ["ifmmp"], "hello"]]),
  },
  {
    id: 12, bookId: "book-two", chapterId: "relics-book-two-06", chapterTitle: "The Hollow Regent",
    subtitle: "The central archive · Bind the keys together", scene: "central-archive", symbol: "◉",
    title: "A Ward Shared by All", conceptName: "Dictionaries · merging records",
    story: "The Hollow Regent waits beside the central archive. The six keys gathered across both books are stored in separate records. Bring them together into one dictionary; then the ward can be restored without giving any one keeper control of it.",
    outcome: "The records join, the six relics answer, and the archive opens its doors to every apprentice. The Regent lays down the last key. The story ends with a choice to rebuild the Academy together.",
    lesson: "A dictionary maps keys to values. Start with an empty dictionary, loop over each record, and use update() to merge its entries.",
    taskObjective: "Define combine_archive_keys(records). Merge every dictionary in order and return one dictionary.", functionName: "combine_archive_keys",
    tests: cases([["Two keys", [[{ first: "journal" }, { second: "ring" }]], { first: "journal", second: "ring" }], ["Later value wins", [[{ seal: "old" }, { seal: "new" }]], { seal: "new" }], ["No records", [[]], {}]]),
  },
];
