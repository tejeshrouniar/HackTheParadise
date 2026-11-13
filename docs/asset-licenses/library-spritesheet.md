# Library spritesheet artwork

The source sheet `src/assets/library/library-spritesheet-source.png` was supplied by the project owner as a Gemini-generated image for Storicode's library UI. It is used as a project-provided visual asset; no external source URL, third-party asset license, or attribution text was supplied with it. Do not represent it as a separately licensed stock asset.

`scripts/build-library-art.mjs` uses the installed `sharp` package to crop the front-facing foyer wall, small reading-corner props, and four distinct shelf illustrations:

- `library-foyer-wall.png` — the book-free foyer wall.
- `library-foyer-reading-nook.png` — a short stack of books and a reading stool for the foyer floor.
- `library-foyer-ladder.png` — the shelf ladder and cobweb detail for the opposite side of the foyer.
- `bookshelf-adventures.png` — the classic wooden adventure shelf.
- `bookshelf-tutorial.png` — the ivy-covered tutorial shelf.
- `bookshelf-personal.png` — the ornate personal archive shelf.
- `bookshelf-guild.png` — the enchanted guild shelf.

To regenerate these derivatives after updating the source sheet, run:

```powershell
node scripts/build-library-art.mjs
```

The project owner also supplied `src/assets/library/library-cover-sheet.png`. The same script crops the illustrated `cover-*.webp` files and moon bookmark. Cover titles render as live text for readability. The supplied sheets are retained so the crops remain reproducible.

The current foyer uses the owner-supplied `bg 1.png` and `props.png`. The room is sharpened from the original and exported at 2752 × 1536 and 5504 × 3072. Transparent crops supply the foreground ivy and books. To regenerate the assets, run `node scripts/build-library-art.mjs "path/to/bg 1.png" "path/to/props.png"`.

`src/assets/library/bookshelf-detailed.webp` is the front-facing cabinet used in the foyer. Its molding is reused in `src/assets/library/bookshelf-trim.webp` for the open shelves. The cabinet was generated with the built-in image tool, using the original `bookshelf-adventures.png` crop as the silhouette, palette, and layout reference. The prompt was:

> Create a high-resolution pixel-art game sprite of one antique walnut bookcase, using the reference for its front-facing silhouette, warm palette, and three columns. Draw it straight-on, symmetric, and tightly framed with the entire cabinet visible, isolated on a genuinely transparent background. Give the wooden frame crisp stepped edges and fine pixel detailing. Fill it with leather-bound books and a few brass curiosities at the reference scale. No wall, floor, labels, lettering, or extra objects outside the cabinet. Use deliberate small pixel clusters and clean edges without blur.
