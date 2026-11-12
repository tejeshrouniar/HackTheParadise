import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { bathroomArtwork } from "./wizarding-bathroom.mjs";

// Compose the supplied Pipoya 32px atlas into stage plates. Pass the folder
// containing the extracted atlases and Harry's 32×32 spritesheet, followed by
// Tile Kitchen's 128×128 mirrored export of the Pipoya grass texture.
const source = process.argv[2];
const grassExport = process.argv[3];
if (!source || !grassExport) throw new Error("Supply the extracted art directory and the Tile Kitchen grass PNG.");
const out = "src/assets/storybooks/stages";
await mkdir(out, { recursive: true });
const atlas = join(source, "pipo-map001.png");
const autotile = join(source, "pipo-map001_at.png");
const cut = (left, top, width = 32, height = 32) => sharp(atlas).extract({ left, top, width, height }).png().toBuffer();
const water = await sharp(autotile).extract({left:448,top:416,width:32,height:32}).png().toBuffer();
const [grass, tree, pine, rock, cobble, brick, wood, castle, hall, darkCastle, mountain, village, pillar] = await Promise.all([
  cut(0,0), cut(32,32), cut(64,32), cut(128,32), cut(64,64), cut(96,64), cut(32,64),
  cut(0,352,96,96), cut(96,352,96,96), cut(0,448,96,96), cut(0,128,64,64), cut(32,192,64,32),
  cut(160,256,32,64),
]);
const W = 512, H = 320;
const seamlessGrass = await sharp(grassExport).resize(128, 128, { kernel: "nearest" }).png().toBuffer();
const grassEdge = await sharp(seamlessGrass).extract({ left: 0, top: 0, width: 128, height: 64 }).png().toBuffer();
const overlay = (width, height, color) => sharp({ create: { width, height, channels: 4, background: color } }).png().toBuffer();
const wallShadow = await overlay(W, 256, { r: 9, g: 17, b: 31, alpha: 0.68 });
const floorShade = await overlay(W, 32, { r: 9, g: 13, b: 26, alpha: 0.38 });
const forestLayer = await sharp("src/assets/trail/far.png").resize(W, 160, { fit: "fill", kernel: "nearest" }).png().toBuffer();
const ledgeWidths = [96, 128, 160, W];
const rims = new Map(await Promise.all(ledgeWidths.map(async width => [width, await overlay(width, 4, "#a98d5b")])));
const shadows = new Map(await Promise.all(ledgeWidths.map(async width => [width, await overlay(width, 6, "#111825")])));
const layouts = [
  ["bathroom", brick, pillar, rock, cobble, "#192d42"],
  ["gaunt-shack", grass, village, pine, wood, "#182920"],
  ["seaside-cave", water, mountain, rock, cobble, "#112839"],
  ["lestrange-vault", cobble, darkCastle, rock, brick, "#251d37"],
  ["room-of-requirement", wood, hall, rock, cobble, "#402b29"],
  ["courtyard", grass, castle, tree, cobble, "#1b352c"],
  ["pensieve", water, hall, rock, brick, "#152943"],
  ["old-classroom", wood, castle, rock, cobble, "#35282d"],
  ["laundry-room", brick, pillar, rock, wood, "#28313e"],
  ["quidditch-pitch", grass, hall, pine, wood, "#1b382c"],
  ["wand-chamber", cobble, darkCastle, rock, brick, "#251b36"],
  ["great-hall", brick, hall, tree, wood, "#36262c"],
];
for (const [index, [name, terrain, landmark, prop, path, sky]] of layouts.entries()) {
  if (name === "bathroom") {
    await sharp(bathroomArtwork()).webp({ lossless: true }).toFile(join(out, "bathroom.webp"));
    continue;
  }
  const layers = [];
  const put = (input, left, top) => layers.push({ input, left, top });
  const indoor = terrain === brick || terrain === wood || terrain === cobble;
  if (indoor) {
    for (let y = 0; y < 256; y += 32) for (let x = 0; x < W; x += 32) put(brick, x, y);
    put(wallShadow, 0, 0);
  } else if (terrain === grass) {
    put(forestLayer, 0, 96);
  } else {
    for (let x = 0; x < W; x += 32) put(water, x, 224);
  }
  const art = await sharp(landmark).resize({ width: landmark === pillar ? 64 : 128, kernel: "nearest" }).png().toBuffer();
  const height = (await sharp(art).metadata()).height;
  if (landmark === pillar) {
    for (const x of [32, 224, 416]) put(art, x, 256 - height);
  } else {
    put(art, index % 2 ? 320 : 192, 224 - height);
  }
  function platform(x, y, width) {
    for (let offset = 0; offset < width; offset += 32) put(path, x + offset, y);
    put(rims.get(width), x, y);
    put(shadows.get(width), x, y + 26);
  }
  const ledges = index % 2 ? [[32, 160, 128], [320, 128, 96]] : [[64, 128, 96], [320, 160, 128]];
  for (const [x, y, width] of ledges) {
    platform(x, y, width);
    put(prop, x + width - 32, y - 32);
  }
  if (terrain === grass) for (let x = 0; x < W; x += 128) put(grassEdge, x, 256);
  else for (let x = 0; x < W; x += 32) put(terrain, x, 288);
  platform(0, 256, W);
  put(floorShade, 0, 288);
  await sharp({create:{width:W,height:H,channels:4,background:sky}}).composite(layers).webp({lossless:true}).toFile(join(out,`${name}.webp`));
}
await sharp(join(source, "$Harry_Potter_(32x32_grid).png")).webp({lossless:true}).toFile(join(out,"harry-32.webp"));
