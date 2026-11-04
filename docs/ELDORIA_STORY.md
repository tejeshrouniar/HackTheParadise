# The Fragments of Eldoria

Refined from STORI.pages for Storicode. Aether replaces the dragon as the playable character. SpellScript remains the name of Eldoria’s magical language.

## 1. The book that answered

*The Arcane Academy · Objects & movement commands*

On the morning the last streetlamp goes dark, Aether breaks into the abandoned Wizard Academy. He is looking for a candle. He finds a book that knows his name.

Once, the Ethereal Core carried magic through all of Eldoria: into its forests, its healing potions, the wards around its villages. The old wizards shaped that power with SpellScript, a language of precise instructions. Then Malachar, the Core’s guardian, tried to make every spell answer to him alone. The Core fractured. Five fragments scattered across the kingdom, and magic began to fail.

Aether is only an apprentice. He has never lit a lantern without help. But the marks in this book make sense to him—the first person in a generation able to read the original language. Between the pages, five empty shapes glow like windows.

**The spellbook:** You can read me. That is a beginning. Power is not the same as understanding, Aether. Start with one clear instruction.

Aether rests a hand on the page. What does he say?

- **One step at a time.** The ink settles into a neat line. “A sensible place to begin,” the book replies.
- **Show me what these symbols can do.** A point of gold lights up across the courtyard. “Then let us make a little light.”

A fragment gleams beyond the cracked courtyard tiles. Aether must move two steps east, turn right, take two steps south, and collect it. The book calls him an object: something with a name and actions. He calls it a rather strange introduction. Either way, the first command is aether.move_forward().

## 2. Something worth keeping

*Alchemical Storage · Variables & assignment*

The first fragment leads Aether into the academy’s alchemy room. Its shelves still smell of rain and burnt sugar. Here, a second fragment is sealed inside a bottle of cloudy glass. The label reads: FOR WHEN THE WORLD NEEDS MENDING.

Aether finds star dew, an empty mana flask, and a recipe written in the same small script as the book. He reaches for the ingredients, then stops. Three drops is not the same as thirty. A name is useful only if he remembers what it holds.

**The spellbook:** A variable keeps a value under a name. Give mana_flask the value 100. Give star_dew the value 3. The cauldron cannot follow a recipe you have not prepared.

Aether writes the two assignments and calls cauldron.brew_elixir(). If the measures are right, the restoration elixir will clear the glass and release the second fragment. For the first time, the recipe feels less like a secret and more like something he can learn.

## 3. The patient work of growing

*The Repeating Grove · For-loops & iteration*

Beyond the academy, the Repeating Grove has fallen silent. Six stone beds line the old path. Nothing grows in them. In the heart of the oldest tree, the third fragment shines behind a cage of roots.

Aether kneels at the first bed and copies the growth spell. At the second, he writes it again. By the third, he has smudged the page and misplaced a bracket. The book gently turns back to the first line.

**The spellbook:** The task is the same each time. Tell me how many times to repeat it, and which instruction belongs inside the loop. Remember the stopping point. Even a good spell needs an end.

Six repetitions. One grow_flower() inside an indented block. Aether begins to understand why the old wizards wrote so little to accomplish so much. When all six beds bloom, their roots will carry light back to the tree and loosen its grip on the fragment.

## 4. A way across

*The Sky Citadel · Functions & invocation*

The path ends at open sky. Across a gulf of clouds, the Sky Citadel hangs beneath a pale moon. Its bridge has broken into four missing spans. On the far side waits the fourth fragment, too far to reach and too bright to ignore.

A weathered inscription describes how to place a starlight tile. Aether could write the instructions again each time. Instead, he gathers them under one name: build_bridge. The book glows approvingly. Nothing else happens.

**The spellbook:** You have defined a function. That tells me how the spell works. Now invoke it. A recipe on a shelf does not make supper.

Aether puts a four-step loop inside build_bridge(), then calls the function by name. A reusable spell: not just an answer for this crossing, but a tool for the next. Beyond the bridge, the citadel’s bell waits to ring again.

## 5. The mistake in the stone

*The Obsidian Crypt · Debugging & index errors*

With four fragments tucked safely into the spellbook, Aether descends into the Obsidian Crypt. The final fragment lies beyond it, in the Chrono Vault. Three numbered runes seal the passage. Malachar has left a spell beside them, almost correct.

The first instruction names rune 1. The second names rune 2. The last points to rune 9. Aether searches the wall again. There are only three runes. For a moment he thinks he has failed to understand something grand. Then he notices the simpler truth: the instruction is wrong.

**The spellbook:** An error is information. Read what it tells you, compare it with the world, and change the part that does not fit. Do not throw away the whole spell.

Repair the last command so it names rune 3, then purify all three runes. This is debugging: a careful correction, not a louder incantation. Somewhere beneath the stone, the way forward begins to stir.

## 6. What a spell gives back

*The Celestial Stargate · Parameters & returns*

The crypt opens into an observatory. Brass rings circle an empty doorway, and the Chrono Vault is visible through it like a reflection in dark water. A dial reads: REQUIRED FLUX — 200. Aether’s flask holds only 100 units of mana.

An old conversion spell can double an input. But the spell must receive a value, calculate a result, and return it. Aether names the parameter mana and writes return mana * 2. He has not made power from nothing; he has translated the flask’s stored mana into the gate’s measure of flux.

**The spellbook:** A parameter is what a function receives. A return value is what it gives back. Store the result of calculate_flux(100), align the rings, then use that result to charge the gate.

The order matters. Aether steadies the brass rings before sending the calculated flux through them. If the conversion is right, the doorway will hold long enough to cross. On the other side, a clock is ticking backwards.

## 7. The order of things

*The Chrono Vault · Lists, indices & sorting*

Inside the vault, rain rises toward the ceiling. An hourglass fills from below. Four numbered control crystals orbit a sealed chamber in the order 4, 1, 3, 2. Beyond the chamber’s glass rests the fifth and final Core fragment.

These four crystals are the vault’s controls, not pieces of the Core. Their values tell the machine when to act; their indices tell Aether where each sits in the list. The first position is index 0. Position and value, he discovers, are different things.

**The spellbook:** Keep the crystals together in one list. Sort their values into ascending order, then pass the sorted list to stabilize_vortex. The machine needs the result, not merely the promise that you sorted it.

Aether writes crystals = [4, 1, 3, 2]. With the controls restored to 1, 2, 3, 4, the vault can release its hold on time—and its final fragment. Five lights will fill the book. One broken Core remains to be mended.

## 8. A light that belongs to everyone

*The Ethereal Core · Bringing it all together*

Malachar waits beside the fractured Core. His spell has wrapped it in a lattice of violet light, a hundred points of corruption holding the pieces apart. The five fragments in Aether’s book pull toward their old places.

**Malachar:** I could have kept Eldoria safe. One will. One perfect spell. No mistakes.

Aether thinks of the smudged page in the grove, the bridge he forgot to invoke, the wrong number on the crypt wall. Every mistake taught him something. A world that can never change can never mend.

Before he opens the book, what does Aether choose to remember?

- **A mistake can show us the next step.** Aether turns to the page he once crossed out. This time, he knows why the spell will work.
- **Magic belongs to everyone who learns it.** Aether imagines the academy with its doors open, its tables crowded, and enough books for everyone.

**The spellbook:** Protect yourself first: mana_shield = 100. Repeat the starlight bolt three times to weaken the lattice. Then call restore_core() to break the last binding. You have learned every part of this spell.

Aether lifts the book. He is still an apprentice. He is still afraid. But he no longer needs to know everything before he can begin. One clear instruction. Then the next.

## Ending — unlocked by the final quest

The last binding breaks. The five fragments return to the Core, and light moves through Eldoria like a held breath finally released. Malachar’s staff falls silent. Aether closes the book, then opens the academy doors. The first lesson is waiting on the board: a small instruction, written clearly, for anyone willing to try. The legendary SpellScript was never meant to belong to one wizard.
