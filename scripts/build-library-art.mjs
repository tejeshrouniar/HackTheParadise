import sharp from "sharp";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "src/assets/library/library-spritesheet-source.png");
const outputDir = resolve(root, "src/assets/library");

const crops = [
  // Small prop clusters dress the single case without introducing a second one.
  { name: "library-foyer-reading-nook.png", left: 1035, top: 336, width: 165, height: 46 },
  { name: "library-foyer-ladder.png", left: 1268, top: 552, width: 45, height: 93 },
  { name: "bookshelf-adventures.png", left: 744, top: 382, width: 236, height: 270 },
  { name: "bookshelf-tutorial.png", left: 456, top: 382, width: 236, height: 270 },
  { name: "bookshelf-personal.png", left: 228, top: 382, width: 174, height: 270 },
  { name: "bookshelf-guild.png", left: 1030, top: 382, width: 178, height: 270 },
];

// Build one continuous wall and align its panels so the floor meets the skirting.
const wallPanelWidth = 113;
const wallPanelHeight = 153;
const wallPanels = await Promise.all([575, 803, 1263].map(async (left, index) => ({
  input: await sharp(sourcePath).extract({ left, top: 19, width: wallPanelWidth, height: wallPanelHeight }).png().toBuffer(),
  left: index * wallPanelWidth,
  top: 0,
})));
await sharp({ create: { width: wallPanels.length * wallPanelWidth, height: wallPanelHeight, channels: 3, background: "#422b1d" } })
  .composite(wallPanels)
  .png({ compressionLevel: 9 })
  .toFile(resolve(outputDir, "library-foyer-wall.png"));

function isSpriteSheetBackdrop(red, green, blue) {
  const lightness = (red + green + blue) / 3;
  const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
  return lightness >= 24 && lightness <= 82 && chroma <= 8;
}

for (const crop of crops) {
  const raw = await sharp(sourcePath)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (
    crop.name.startsWith("bookshelf-") ||
    crop.name === "library-foyer-reading-nook.png" ||
    crop.name === "library-foyer-ladder.png"
  ) {
    for (let index = 0; index < raw.data.length; index += raw.info.channels) {
      if (isSpriteSheetBackdrop(raw.data[index], raw.data[index + 1], raw.data[index + 2])) {
        raw.data[index + 3] = 0;
      }
    }
  }

  await sharp(raw.data, { raw: raw.info })
    .png({ compressionLevel: 9, adaptiveFiltering: false })
    .toFile(resolve(outputDir, crop.name));
}

console.log(`Built ${crops.length + 1} library scene assets from ${sourcePath}`);

const coverSheet = resolve(outputDir, "library-cover-sheet.png");
const covers = [
  { id: "cinder", left: 15, top: 20, width: 153, height: 178, titleBand: [24, 74, 137, 94] },
  { id: "harry-potter", left: 190, top: 20, width: 156, height: 178, titleBand: [28, 66, 139, 96] },
  { id: "theme", left: 368, top: 20, width: 156, height: 178, titleBand: [28, 74, 137, 94] },
  { id: "lore", left: 545, top: 20, width: 156, height: 178, titleBand: [31, 74, 136, 94] },
  { id: "profile", left: 191, top: 214, width: 155, height: 168, titleBand: [28, 72, 138, 93] },
  { id: "account", left: 365, top: 212, width: 159, height: 170, titleBand: [25, 74, 148, 96] },
  { id: "contact", left: 13, top: 395, width: 153, height: 172, titleBand: [26, 74, 136, 95] },
  { id: "community", left: 188, top: 395, width: 158, height: 172, titleBand: [28, 73, 142, 96] },
  { id: "credits", left: 13, top: 395, width: 153, height: 172, titleBand: [26, 74, 136, 95] },
  { id: "tools-bookmark", left: 727, top: 394, width: 106, height: 176 },
];

for (const { id, titleBand, ...crop } of covers) {
  const { data, info } = await sharp(coverSheet).extract(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Only remove dark backdrop pixels connected to the edge of the crop.
  const { width, height } = info;
  const visit = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = (y * width + x) * 4;
    const [red, green, blue, alpha] = data.subarray(offset, offset + 4);
    if (!alpha || blue <= red + 3 || Math.max(red, green, blue) > 43) return;
    data[offset + 3] = 0;
    queue.push([x, y]);
  };
  const queue = [];
  for (let x = 0; x < width; x++) { visit(x, 0); visit(x, height - 1); }
  for (let y = 0; y < height; y++) { visit(0, y); visit(width - 1, y); }
  for (let index = 0; index < queue.length; index++) {
    const [x, y] = queue[index];
    visit(x - 1, y); visit(x + 1, y); visit(x, y - 1); visit(x, y + 1);
  }
  if (titleBand) {
    // Clear the baked title band so cover names are rendered at screen resolution.
    const [left, top, right, bottom] = titleBand;
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        const before = ((top - 1) * width + x) * 4;
        const after = (bottom * width + x) * 4;
        const target = (y * width + x) * 4;
        const blend = (y - top + 1) / (bottom - top + 1);
        for (let channel = 0; channel < 3; channel++) {
          data[target + channel] = Math.round(data[before + channel] * (1 - blend) + data[after + channel] * blend);
        }
      }
    }
  }
  if (id === "credits") {
    // Reuse the leather binding, with a different color and a clean lower label.
    const [left, right] = [35, 122];
    for (let y = 139; y < 152; y++) {
      for (let x = left; x < right; x++) {
        const source = (135 * width + x) * 4;
        data.copy(data, (y * width + x) * 4, source, source + 4);
      }
    }
  }
  const sprite = sharp(data, { raw: info });
  if (id === "credits") sprite.modulate({ hue: -55, saturation: 1.2, brightness: 1.12 });
  await sprite.webp({ lossless: true }).toFile(resolve(outputDir, `cover-${id}.webp`));
}

// The full room and its foreground layers can be rebuilt from the supplied PNGs.
const [roomSource, propSource] = process.argv.slice(2);
if (roomSource && propSource) {
  // Recover edge contrast in the original art before creating the large-screen version.
  const sharpenedRoom = await sharp(roomSource)
    .sharpen({ sigma: 1.65, m1: 1.1, m2: 3.2, x1: 2, y2: 11, y3: 11 })
    .png()
    .toBuffer();
  const { width: roomWidth } = await sharp(sharpenedRoom).metadata();
  await Promise.all([
    sharp(sharpenedRoom).webp({ quality: 96, smartSubsample: true })
      .toFile(resolve(outputDir, "library-room.webp")),
    sharp(sharpenedRoom).resize({ width: roomWidth * 2, kernel: "lanczos3" })
      .webp({ quality: 94, smartSubsample: true })
      .toFile(resolve(outputDir, "library-room-large.webp")),
  ]);

  const props = [
    { name: "room-ivy", left: 1958, top: 438, width: 367, height: 386 },
    { name: "room-ivy-left", left: 42, top: 518, width: 398, height: 319 },
    { name: "room-open-book", left: 1230, top: 1150, width: 210, height: 117 },
    { name: "room-book-stack", left: 2115, top: 1295, width: 178, height: 205 },
    { name: "room-sconce", left: 1523, top: 142, width: 94, height: 226 },
  ];
  for (const { name, ...crop } of props) {
    const { data, info } = await sharp(propSource).extract(crop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let index = 0; index < data.length; index += 4) {
      const [red, green, blue] = data.subarray(index, index + 3);
      const key = name.startsWith("room-ivy") ? green - blue : red - blue;
      // Feather the edge by color so dark sheet pixels never form a box.
      data[index + 3] = Math.round(data[index + 3] * Math.min(1, Math.max(0, (key - 4) / 11)));
      if (name === "room-sconce") {
        const pixel = index / 4;
        const x = pixel % info.width;
        const y = Math.floor(pixel / info.width);
        const edge = Math.min(x, info.width - 1 - x, y, info.height - 1 - y);
        const glow = Math.min(1, Math.max(0, (green - 42) / 45), edge / 15);
        data[index + 3] = Math.round(data[index + 3] * glow);
      }
    }
    await sharp(data, { raw: info }).webp({ lossless: true }).toFile(resolve(outputDir, `${name}.webp`));
  }
}
