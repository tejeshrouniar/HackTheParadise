import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The order of the supplied artwork matches the book's original chapter order.
const sceneKeys = [
  "bathroom", "gaunt-shack", "seaside-cave", "lestrange-vault",
  "room-of-requirement", "courtyard", "pensieve", "old-classroom",
  "laundry-room", "quidditch-pitch", "wand-chamber", "great-hall",
];
const source = process.argv[2];
if (!source) throw new Error("Supply the extracted background archive directory.");
const native = join(source, "256x144_native");
const files = (await readdir(native)).filter(name => /^\d{2}_.+\.png$/.test(name)).sort();
if (files.length !== sceneKeys.length || files.some((name, index) => Number(name.slice(0, 2)) !== index + 1)) {
  throw new Error("Expected one native background for each chapter, numbered 01 to 12.");
}

const plates = await Promise.all(files.map(async name => {
  const plate = sharp(join(native, name));
  const { width, height } = await plate.metadata();
  if (width !== 256 || height !== 144) throw new Error(`Unexpected dimensions for ${name}: ${width} × ${height}`);
  return plate.webp({ lossless: true }).toBuffer();
}));

await Promise.all(sceneKeys.map((key, index) =>
  sharp(plates[index]).toFile(join("src", "assets", "storybooks", "stages", `${key}.webp`)),
));
