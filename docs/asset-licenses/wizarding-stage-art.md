# Wizarding stage art sources

- Harry's 32×32 grid comes from the supplied `Harry_Potter_Spritesheets.zip`. Its columns are three animation frames; rows face front, left, right, and away. The level animates the right-facing row.
- All twelve chapter plates come from the supplied `Harry_Potter_Horcrux_Code_12_Backgrounds.zip`. The app uses lossless WebP copies of the native 256×144 PNGs, enlarged with pixelated rendering.
- The supplied background archive contained no license or attribution file; add the pack's license terms here when available.
- Coding stages, completion scenes, and the Story reader use the same plates. The chapter's scene key selects the image and the floor and spell coordinates in `src/features/story/bookSceneAssets.ts`.

To rebuild, extract the background ZIP and run `node scripts/build-wizarding-stages.mjs <extracted-directory>` from the repository root. Pass the parent of `256x144_native`. The importer checks the chapter numbering and dimensions and leaves the existing Harry spritesheet in place.
