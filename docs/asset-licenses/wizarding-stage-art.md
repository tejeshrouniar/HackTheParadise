# Wizarding stage art sources

- Harry's 32×32 grid comes from the supplied `Harry_Potter_Spritesheets.zip`. Its three columns are left step, idle, and right step. The level uses the right-facing row.
- The bathroom plate is drawn in `scripts/wizarding-bathroom.mjs` and exported by the stage builder.
- The other stage plates use `pipo-map001.png` and `pipo-map001_at.png` from the 32×32 folder in the supplied Pipoya RPG World Tileset for Tiled 1.5 archive. The general archive includes the corresponding tile art.
- The seamless grass layer was exported in [Tile Kitchen](https://spritekitchen.com/studio/tile-kitchen/) using **Both** axes and **Mirror**. The source is the 64×64 crop at `(176, 16)` in `pipo-map001_at.png`.

To rebuild, extract the two 32×32 tile atlases and `$Harry_Potter_(32x32_grid).png` into one directory. From the repository root, run `node scripts/build-wizarding-stages.mjs <source-directory> <seamless-grass.png>`.

These notes record the supplied sources and transformations. The Harry archive contains a frame layout description. The supplied Pipoya archives contain the tile images and editor data.
