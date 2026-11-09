import type { PuzzleTestCase, PuzzleValue } from "../features/learning/puzzleRunner";

/**
 * Puzzle chapters for the standalone Harry Potter book. The chapter IDs retain
 * the values introduced by the earlier two-volume merge so saved progress can
 * move into this single book without being reset.
 */
export type StorybookId = "harry-potter";

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
    id: 1, bookId: "harry-potter", chapterId: "relics-book-one-01", chapterTitle: "The Diary in the Bathroom",
    subtitle: "Moaning Myrtle’s bathroom · A message written backward", scene: "bathroom", symbol: "▤",
    title: "The Ink Runs Backward", conceptName: "Strings · slicing",
    story: "A rain of ink crawls backward across a battered diary in Moaning Myrtle’s bathroom. Harry reads the last line twice, then notices that every letter is facing the wrong way. A name waits beneath the blotches.",
    outcome: "The message turns around and answers Harry. The diary has been listening, and its first clue points to a ring hidden beyond the castle grounds.",
    lesson: "Text is an ordered sequence of characters. A slice with a step of -1 reads that sequence from the end.",
    taskObjective: "Define reveal_diary_secret(text) and return the text in reverse order.", functionName: "reveal_diary_secret",
    tests: cases([["A short clue", ["thgil"], "light"], ["A hidden name", ["elttop"], "pottle"], ["A longer note", ["emoh eht dnif"], "find the home"]]),
  },
  {
    id: 2, bookId: "harry-potter", chapterId: "relics-book-one-02", chapterTitle: "The Ring of Gaunt",
    subtitle: "The old shack · Filter the curse", scene: "gaunt-shack", symbol: "◯",
    title: "A Ring of Thorn and Ash", conceptName: "Lists · filtering",
    story: "Dumbledore finds Marvolo Gaunt’s ring beneath the floorboards of an abandoned shack. Its curse pulses whenever a negative reading touches the silver. Harry sorts the harmless traces from the dangerous ones before the ward breaks.",
    outcome: "The ring’s curse falls quiet. A narrow silver path appears on its inner band, leading toward a cave by the sea.",
    lesson: "A list comprehension makes a new list from an existing one. An if condition keeps only values that pass a check.",
    taskObjective: "Define cleanse_ring(energy_levels) and keep each value that is zero or higher, in its original order.", functionName: "cleanse_ring",
    tests: cases([["Mixed readings", [[-50, 20, -10, 80]], [20, 80]], ["Zero is safe", [[0, -3, 4, 0]], [0, 4, 0]], ["Only the curse remains", [[-2, -1]], []]]),
  },
  {
    id: 3, bookId: "harry-potter", chapterId: "relics-book-one-03", chapterTitle: "The Locket’s Hiss",
    subtitle: "The seaside cave · Speak the lock’s language", scene: "seaside-cave", symbol: "〰",
    title: "Parseltongue Practice", conceptName: "Strings · loops and replacement",
    story: "A locket rests in a pool beneath the cave, clasped by a lock that answers only to a hiss. Harry finds the vowel pattern scratched into the stone. Each vowel must become “sss” before the lock will hear the phrase.",
    outcome: "The locket clicks open. The cave water retreats from a stair, and a golden cup glints in the vault beyond.",
    lesson: "A loop can visit every character in a string. replace() returns changed text, so save each new version before the next pass.",
    taskObjective: "Define parseltongue(text). Replace every upper- and lowercase vowel with the text 'sss'.",
    functionName: "parseltongue",
    tests: cases([["Cave word", ["open"], "ssspsssn"], ["Mixed case", ["Aerie"], "ssssssrssssss"], ["No vowels", ["myth"], "myth"]]),
  },
  {
    id: 4, bookId: "harry-potter", chapterId: "relics-book-one-04", chapterTitle: "The Cup in the Vault",
    subtitle: "The Lestrange vault · Find the originals", scene: "lestrange-vault", symbol: "♜",
    title: "One Cup, Many Copies", conceptName: "Lists · counting",
    story: "In the Lestrange vault, every touch makes the cup copy itself. The room fills with gold until Harry spots a tiny weight mark on the originals. He counts the true cups before the copies bury the exit.",
    outcome: "The real cups chime in unison. Their sound reveals a hidden door to the Room of Requirement.",
    lesson: "Lists may contain repeated values. count() returns how many entries match a value.",
    taskObjective: "Define count_real_cups(items, target_weight) and return the number of matching weight tags.", functionName: "count_real_cups",
    tests: cases([["Original marks", [[10, 5, 10, 10, 2], 10], 3], ["No matching mark", [[1, 2, 3], 8], 0], ["Repeated zero", [[0, 0, 1], 0], 2]]),
  },
  {
    id: 5, bookId: "harry-potter", chapterId: "relics-book-one-05", chapterTitle: "The Diadem’s Test",
    subtitle: "The Room of Requirement · Prove your intent", scene: "room-of-requirement", symbol: "✥",
    title: "Wisdom Before Pride", conceptName: "Logic · comparisons and booleans",
    story: "The diadem hangs above a silent pool. Its ward asks two things of anyone who reaches for it: does wisdom outweigh arrogance, and is their intent pure? Harry must answer both without guessing.",
    outcome: "The proof holds, and the diadem’s light draws a moving path across the castle courtyard. A great serpent is circling the next clue.",
    lesson: "Comparisons produce True or False. The and operator returns True only when both checks are True.",
    taskObjective: "Define can_unlock_diadem(wisdom, arrogance, pure_intent). Return True only when wisdom is greater and pure_intent is True.", functionName: "can_unlock_diadem",
    tests: cases([["Wisdom with care", [90, 20, true], true], ["Arrogance wins", [10, 30, true], false], ["Intent matters", [90, 20, false], false]]),
  },
  {
    id: 6, bookId: "harry-potter", chapterId: "relics-book-one-06", chapterTitle: "Nagini’s Trail",
    subtitle: "The castle courtyard · Follow each turn", scene: "courtyard", symbol: "⌁",
    title: "Track the Serpent", conceptName: "Loops · tuples and conditionals",
    story: "Nagini slips between the courtyard statues. Harry follows the glowing marks left on each tile, but the trail doubles back across itself. He records every direction to find where the snake will surface.",
    outcome: "Harry reaches the serpent without losing the trail. His scar flashes with a memory that belongs to Voldemort’s past.",
    lesson: "Unpack an (x, y) pair, loop over each direction, and use if/elif branches to update one coordinate at a time.",
    taskObjective: "Define track_nagini(start_pos, moves). Apply each direction and return the final (x, y) pair. UP increases y; DOWN decreases y.", functionName: "track_nagini",
    tests: cases([["Courtyard trail", [[0, 0], ["UP", "RIGHT", "UP"]], [1, 2]], ["Loop back", [[3, 2], ["LEFT", "DOWN", "RIGHT"]], [3, 1]], ["No steps", [[-1, 4], []], [-1, 4]]]),
  },
  {
    id: 7, bookId: "harry-potter", chapterId: "relics-book-two-01", chapterTitle: "The Scar’s Memories",
    subtitle: "The Pensieve · Put the years in order", scene: "pensieve", symbol: "✴",
    title: "A Timeline Reassembled", conceptName: "Lists · sorting",
    story: "Harry’s scar burns, then spills a handful of years into the Pensieve. The memories arrive in the wrong order. He arranges the dates before the silver water closes over the scene again.",
    outcome: "The memories align into a timeline. One scene shows a turban being unwrapped in a classroom long ago.",
    lesson: "sorted() creates a new list in ascending order and leaves the original sequence unchanged.",
    taskObjective: "Define sort_memories(timestamps) and return the timestamps from earliest to latest.", functionName: "sort_memories",
    tests: cases([["Three memories", [[1981, 1926, 1943]], [1926, 1943, 1981]], ["Already ordered", [[1, 2, 3]], [1, 2, 3]], ["Include earlier years", [[12, -1, 4]], [-1, 4, 12]]]),
  },
  {
    id: 8, bookId: "harry-potter", chapterId: "relics-book-two-02", chapterTitle: "The Unwrapped Turban",
    subtitle: "The old classroom · Unfold each layer", scene: "old-classroom", symbol: "◩",
    title: "Layers Beneath the Cloth", conceptName: "Lists · nested collections",
    story: "An old turban has been wrapped in layers of enchanted fabric, each folded into a smaller bundle. Harry follows the seams and flattens the nested rows, one layer at a time, to reveal what has been hidden underneath.",
    outcome: "The final strip falls away. A face appears in the classroom portrait, and the memory shifts to a familiar looking for a missing sock.",
    lesson: "A nested list comprehension can visit each row and each item while preserving their order.",
    taskObjective: "Define unwrap_turban(layers) and return all entries in row order as one flat list.", functionName: "unwrap_turban",
    tests: cases([["Two cloth rows", [[ ["cloth", "cloth"], ["face"] ]], ["cloth", "cloth", "face"]], ["Empty first layer", [[[], ["silk"]]], ["silk"]], ["No layers", [[]], []]]),
  },
  {
    id: 9, bookId: "harry-potter", chapterId: "relics-book-two-03", chapterTitle: "Dobby’s Missing Sock",
    subtitle: "The laundry room · Find the missing number", scene: "laundry-room", symbol: "⌑",
    title: "A Number Gone Missing", conceptName: "Arithmetic · sums and integer division",
    story: "Dobby has gathered a numbered set of socks, but one is missing from the basket. He checks every drawer while Harry adds the numbers that remain. Together they can tell which sock will complete the set.",
    outcome: "The missing sock is found and handed back to Dobby. He points Harry toward a tiny golden shape streaking over the Quidditch pitch.",
    lesson: "The first n positive integers add to n × (n + 1) ÷ 2. Subtract the sum you have to find what is missing.",
    taskObjective: "Define find_missing_sock(sock_list, n). Return the missing number from the sequence 1 through n.", functionName: "find_missing_sock",
    tests: cases([["Middle sock", [[1, 2, 4, 5], 5], 3], ["First sock", [[2, 3, 4], 4], 1], ["Last sock", [[1, 2, 3], 4], 4]]),
  },
  {
    id: 10, bookId: "harry-potter", chapterId: "relics-book-two-04", chapterTitle: "The Golden Snitch Key",
    subtitle: "The Quidditch pitch · Measure its flight", scene: "quidditch-pitch", symbol: "⊹",
    title: "Catch It at the Right Speed", conceptName: "Numbers · safe division",
    story: "The Snitch hides a small key beneath its golden shell. It circles the pitch faster whenever Harry gets close. The spell that opens it needs the distance and flight time, but a stalled Snitch must not divide by zero.",
    outcome: "The Snitch slows to a catchable arc. Its key opens a chamber where the oldest wand has been kept out of reach.",
    lesson: "A conditional handles the zero-time edge case before the usual distance ÷ time calculation runs.",
    taskObjective: "Define calculate_speed(distance, time). Return 0 when time is zero; otherwise return distance divided by time.", functionName: "calculate_speed",
    tests: cases([["Steady flight", [100, 5], 20], ["Longer crossing", [21, 3], 7], ["Stalled Snitch", [100, 0], 0]]),
  },
  {
    id: 11, bookId: "harry-potter", chapterId: "relics-book-two-05", chapterTitle: "The Elder Wand Cipher",
    subtitle: "The wand chamber · Read the shifted inscription", scene: "wand-chamber", symbol: "✦",
    title: "The One-Step Cipher", conceptName: "Strings · character codes",
    story: "The Elder Wand carries a short inscription, but each character has been shifted one place forward. Harry traces the runes in order and shifts them back, careful not to lose a letter between steps.",
    outcome: "The decoded inscription names the place where Voldemort’s final binding is held. There is one last record to put together.",
    lesson: "ord() changes a character into its number code; chr() turns the adjusted code back into a character. += can build a result string.",
    taskObjective: "Define decrypt_wand_code(cipher). Shift each character back by one code point and return the text.", functionName: "decrypt_wand_code",
    tests: cases([["Short inscription", ["Fwqf"], "Evpe"], ["Lowercase", ["bcd"], "abc"], ["Word and space", ["ifmmp"], "hello"]]),
  },
  {
    id: 12, bookId: "harry-potter", chapterId: "relics-book-two-06", chapterTitle: "The Final Merge",
    subtitle: "The Great Hall · Join every key", scene: "great-hall", symbol: "◉",
    title: "Voldemort’s Last Loose End", conceptName: "Dictionaries · merging records",
    story: "The final Horcrux is hidden in a ridiculous place: where Voldemort’s nose should be. Its spell is split across the clues Harry has gathered. He joins the key-value records to reveal one complete instruction and end the fight with a cleanly timed counterspell.",
    outcome: "The records join, the last binding breaks, and Voldemort’s plan collapses in a cloud of smoke. The Great Hall fills with cheers; Dobby keeps the missing sock.",
    lesson: "A dictionary maps keys to values. Start with an empty dictionary, loop over each record, and use update() to merge its entries.",
    taskObjective: "Define combine_horcrux_keys(dict_list). Merge every dictionary in order and return one dictionary.", functionName: "combine_horcrux_keys",
    tests: cases([["Two keys", [[{ h1: "diary" }, { h2: "ring" }]], { h1: "diary", h2: "ring" }], ["Later value wins", [[{ seal: "old" }, { seal: "new" }]], { seal: "new" }], ["No records", [[]], {}]]),
  },
];
