import fs from 'fs';
import path from 'path';

const envDir = path.resolve('src/assets/environments');
const propDir = path.resolve('src/assets/props');

if (!fs.existsSync(envDir)) fs.mkdirSync(envDir, { recursive: true });
if (!fs.existsSync(propDir)) fs.mkdirSync(propDir, { recursive: true });

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${path.basename(dest)}`);
  } else {
    console.warn(`Not found: ${src}`);
  }
}

const baseP = path.resolve('src/assets/packs/GandalfHardcore_Platformer/GandalfHardcore FREE Platformer Assets');
const baseF = path.resolve('src/assets/packs/Fantasy_Forest/FREE_Fantasy Forest');
const baseV = path.resolve('src/assets/packs/Village_Props/Textures');
const baseH = path.resolve('src/assets/packs/GandalfHardcore_Hp_bar/GandalfHardcore Hp bar');

// 1. Environments
copyIfExists(path.join(baseP, 'GandalfHardcore Background layers/Normal BG/Background Castle .png'), path.join(envDir, 'eldoria_castle.png'));
copyIfExists(path.join(baseP, 'GandalfHardcore Background layers/Normal BG/GandalfHardcore Background layers_layer 1.png'), path.join(envDir, 'eldoria_sky.png'));
copyIfExists(path.join(baseP, 'GandalfHardcore Background layers/Normal BG/GandalfHardcore Background layers_layer 2.png'), path.join(envDir, 'eldoria_mountains.png'));
copyIfExists(path.join(baseP, 'GandalfHardcore Background layers/Winter BG/Background Castle  Winter.png'), path.join(envDir, 'chronos_winter_castle.png'));
copyIfExists(path.join(baseP, 'GandalfHardcore Background layers/Autumn BG/Background Castle Autumn.png'), path.join(envDir, 'forge_autumn_castle.png'));

// Sylva Forest
copyIfExists(path.join(baseF, 'Backgrounds/Sky.png'), path.join(envDir, 'sylva_sky.png'));
copyIfExists(path.join(baseF, 'Backgrounds/Clouds.png'), path.join(envDir, 'sylva_clouds.png'));
copyIfExists(path.join(baseF, 'Backgrounds/Rock Mountains.png'), path.join(envDir, 'sylva_mountains_rock.png'));
copyIfExists(path.join(baseF, 'Backgrounds/Grass Mountains.png'), path.join(envDir, 'sylva_mountains_grass.png'));
copyIfExists(path.join(baseF, 'Tiles/Tileset Outside.png'), path.join(envDir, 'sylva_tiles.png'));

// Atlantis
copyIfExists(path.join(baseP, 'Animated Sprites/GandalfHardcore Animated Water Tiles.png'), path.join(envDir, 'atlantis_water_animated.png'));
copyIfExists(path.join(baseP, 'Animated Sprites/GandalfHardcore Water Tiles sheet.png'), path.join(envDir, 'atlantis_water_sheet.png'));

// 2. Props & FX
copyIfExists(path.join(baseP, 'Alchemy Decor.png'), path.join(propDir, 'alchemy_decor.png'));
copyIfExists(path.join(baseP, 'Animated Sprites/Campfire sheet.png'), path.join(propDir, 'campfire.png'));
copyIfExists(path.join(baseP, 'Animated Sprites/GandalfHardcore Portal sheet.png'), path.join(propDir, 'portal_sheet.png'));
copyIfExists(path.join(baseP, 'Furnace and Sawmill.png'), path.join(propDir, 'furnace.png'));
copyIfExists(path.join(baseP, 'Ores.png'), path.join(propDir, 'ores.png'));
copyIfExists(path.join(baseP, 'Garden Decorations.png'), path.join(propDir, 'garden_decor.png'));
copyIfExists(path.join(baseP, 'Bonsai.png'), path.join(propDir, 'bonsai.png'));
copyIfExists(path.join(baseP, 'Weeping Willow1.png'), path.join(propDir, 'weeping_willow.png'));
copyIfExists(path.join(baseP, 'Angel Statue.png'), path.join(propDir, 'angel_statue.png'));

// Village props & FX
copyIfExists(path.join(baseV, 'TX Chest Animation.png'), path.join(propDir, 'chest_animation.png'));
copyIfExists(path.join(baseV, 'TX FX Flame.png'), path.join(propDir, 'fx_flame.png'));
copyIfExists(path.join(baseV, 'TX FX Torch Flame.png'), path.join(propDir, 'fx_torch.png'));
copyIfExists(path.join(baseV, 'TX Village Props.png'), path.join(propDir, 'village_props.png'));

// HP / Mana bars
copyIfExists(path.join(baseH, 'red bar.png'), path.join(propDir, 'hp_bar_red.png'));
copyIfExists(path.join(baseH, 'Blue bar.png'), path.join(propDir, 'mana_bar_blue.png'));
copyIfExists(path.join(baseH, 'yellow bar.png'), path.join(propDir, 'energy_bar_yellow.png'));

console.log('Organized all assets into environments and props!');
