import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const uploads = 'C:/Users/Justy/.gemini/antigravity/brain/76867956-a2fd-4998-9b0c-56f322e5328e/.user_uploaded';
const target = path.resolve('src/assets/packs');

if (!fs.existsSync(target)) {
  fs.mkdirSync(target, { recursive: true });
}

const map = {
  'media_1793940538908_ebee9590.zip': 'Fantasy_Forest',
  'media_1793940538909_0e2945dd.zip': 'GandalfHardcore_Archer',
  'media_1793940538911_6b438b66.zip': 'Village_Props',
  'media_1793940538912_29906a68.zip': 'BaT_v2.0',
  'media_1793940566729_3d51ef73.zip': 'Medieval_Free',
  'media_1793940566764_f9d3a6b3.zip': 'GandalfHardcore_Hp_bar',
  'media_1793940566799_b143ee35.zip': 'GandalfHardcore_Platformer',
  'media_1793940566801_29deac64.zip': 'GandalfHardcore_Characters'
};

for (const [file, folder] of Object.entries(map)) {
  const zipPath = path.join(uploads, file);
  const dest = path.join(target, folder);
  if (fs.existsSync(zipPath)) {
    console.log(`Extracting ${folder}...`);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    execSync(`tar -xf "${zipPath}" -C "${dest}"`);
    console.log(`Done: ${folder}`);
  }
}

console.log('All packs extracted successfully!');
