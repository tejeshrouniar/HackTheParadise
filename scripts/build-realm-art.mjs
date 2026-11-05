import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
// Rebuild from the user's extracted packs; only selected, game-used assets are shipped.
const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing the extracted asset packs.');
const out = 'src/assets/realms';
await fs.mkdir(out, {recursive:true});
const moon = path.join(source,'Final/Final');
const desert = path.join(source,'Pixel_Platformer_Desert_Ruins_Tileset_v1.0/PNG/native');
const trees = path.join(source,'Pixel Trees 32x32 v2/Pixel Trees 32x32 v2/All Sprite Sheets');
const icons = path.join(source,'fantasy-rpg-item-icons-free-v1.1/fantasy-rpg-item-icons-free/png/32');
const png = async (p,w,h) => sharp(p).resize(w,h,{kernel:'nearest',fit:'fill'}).png().toBuffer();
const tile = async (name) => png(path.join(desert,name+'.png'),32,32);
const tree = async season => sharp(path.join(trees,`${season} Tree 1 without Outline Pixel Trees 32x32 v2.png`)).extract({left:0,top:0,width:32,height:32}).resize(96,96,{kernel:'nearest'}).png().toBuffer();
async function save(name,layers,color='#182a35') {await sharp({create:{width:640,height:352,channels:4,background:color}}).composite(layers).png().toFile(`${out}/${name}.png`);}
let layers=[];
for(const name of ['sky','far','near','ground']) layers.push({input:await sharp(`src/assets/trail/${name}.png`).extract({left:0,top:0,width:640,height:352}).png().toBuffer(),left:0,top:0});
await save('lanternwood',layers);
layers=[];
for(const name of ['Background_0','Background_1']) layers.push({input:await sharp(`${moon}/${name}.png`).extract({left:64,top:0,width:640,height:352}).png().toBuffer(),left:0,top:0});
const moonTop=await sharp(`${moon}/Tiles.png`).extract({left:160,top:80,width:32,height:32}).png().toBuffer();
const moonFill=await sharp(`${moon}/Tiles.png`).extract({left:256,top:288,width:32,height:32}).png().toBuffer();
for(let x=0;x<640;x+=32) {if(x>=224&&x<416)continue;layers.push({input:moonTop,left:x,top:288},{input:moonFill,left:x,top:320});}
await save('moonlit',layers);
// Construct the ruins from 32px tiles, keeping the central court open for the player.
layers=[{input:Buffer.from('<svg width="640" height="352"><path fill="#eacb9a" d="M0 0h640v352H0z"/><path fill="#d6af80" d="M0 168l96-64 64 32 96-64 96 96 96-32 96 32 96-64v248H0z"/><path fill="#af886a" d="M0 224l96-32 64 32 96-32 96 32 96-32 96 32 96-32v160H0z"/></svg>'),left:0,top:0}];
const autumn=await tree('Autumn');for(const [x,y] of [[0,192],[96,192],[480,192],[544,192]])layers.push({input:autumn,left:x,top:y});
for(let x=0;x<640;x+=32)for(let y=288;y<352;y+=32)layers.push({input:await tile('terrain/'+(y===288?'ruins_top':'ruins_center')),left:x,top:y});
for(const x of [192,384]) {for(const y of [192,224,256])layers.push({input:await tile('desert/pillar_full'),left:x,top:y});layers.push({input:await tile('desert/pillar_top'),left:x,top:160});}
for(const x of [160,192,224,352,384,416])layers.push({input:await tile('terrain/ruins_top'),left:x,top:128});
await save('amber',layers);
layers=[{input:Buffer.from('<svg width="640" height="352"><path fill="#acd5cc" d="M0 0h640v352H0z"/><path fill="#dfe8c8" d="M448 48h64v64h-64z"/><path fill="#7aaa91" d="M0 176l96-48 96 32 96-32 96 48 96-32 160 48v160H0z"/><path fill="#518670" d="M0 224l96-32 128 32 96-32 128 32 192-32v160H0z"/></svg>'),left:0,top:0}];
const summer=await tree('Summer');for(const [x,y] of [[0,192],[64,192],[160,192],[448,192],[544,192]])layers.push({input:summer,left:x,top:y});
for(let x=0;x<640;x+=32)for(let y=288;y<352;y+=32){if(x>=256&&x<384)continue;layers.push({input:await tile('terrain/'+(y===288?'sandstone_top':'sandstone_center')),left:x,top:y});}
await save('dawnreach',layers);
for(const name of ['lantern','resin_bottle','healing_herb','gold_key','soul_stone','treasure_chest','hammer','scroll','wood_log','magic_staff']) await fs.copyFile(`${icons}/${name}.png`,`${out}/${name}.png`);
for(const name of ['sun_disc','clay_pot','obelisk','wooden_sign'])await sharp(await tile('desert/'+name)).toFile(`${out}/${name}.png`);
await sharp(`${moon}/Tiles.png`).extract({left:64,top:248,width:32,height:32}).png().toFile(`${out}/bridge.png`);
// One raster strip avoids independently sampled tile seams during camera movement.
await sharp({create:{width:1280,height:32,channels:4,background:'#182820'}})
  .composite(Array.from({length:40},(_,i)=>({input:`${out}/bridge.png`,left:i*32,top:0})))
  .png().toFile(`${out}/walkway.png`);
for(const name of ['oasis_top_a','oasis_top_b','oasis_fill'])await sharp(await tile('liquid/'+name)).toFile(`${out}/${name}.png`);
await sharp(autumn).toFile(`${out}/autumn-tree.png`);
await sharp(summer).toFile(`${out}/summer-tree.png`);
console.log('Built four 640x352 environments and selected 32px props.');
