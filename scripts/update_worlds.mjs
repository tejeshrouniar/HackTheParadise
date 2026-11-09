import fs from 'fs';

// 1. Update PotionCauldronWorld.tsx
let cauldron = fs.readFileSync('src/components/GameWorlds/PotionCauldronWorld.tsx', 'utf8');
if (!cauldron.includes('alchemyDecor')) {
  cauldron = cauldron.replace(
    "import { FlaskConical, Sparkles, Trophy, Flame } from 'lucide-react';",
    "import { FlaskConical, Sparkles, Trophy, Flame } from 'lucide-react';\nimport alchemyDecor from '../../assets/props/alchemy_decor.png';"
  );
  cauldron = cauldron.replace(
    '{/* Background magical wisps */}',
    `{/* Background alchemy pixel art decor */}
      <div className="absolute right-3 bottom-14 opacity-35 pointer-events-none">
        <img src={alchemyDecor} alt="Alchemy Props" className="w-36 h-auto object-contain filter drop-shadow-xl" />
      </div>

      {/* Background magical wisps */}`
  );
  fs.writeFileSync('src/components/GameWorlds/PotionCauldronWorld.tsx', cauldron, 'utf8');
  console.log('Updated PotionCauldronWorld.tsx');
}

// 2. Update BossBattleWorld.tsx
let boss = fs.readFileSync('src/components/GameWorlds/BossBattleWorld.tsx', 'utf8');
if (!boss.includes('hpBarRed')) {
  boss = boss.replace(
    "import { Swords, Shield, Trophy, Sparkles, Heart } from 'lucide-react';",
    "import { Swords, Shield, Trophy, Sparkles, Heart } from 'lucide-react';\nimport hpBarRed from '../../assets/props/hp_bar_red.png';\nimport manaBarBlue from '../../assets/props/mana_bar_blue.png';"
  );
  boss = boss.replace(
    '<div className="grid grid-cols-2 gap-4">',
    `<div className="grid grid-cols-2 gap-4">
          {/* Pixel Art Mini Banner */}
          <div className="col-span-2 flex items-center justify-between px-2 py-1 bg-black/40 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <img src={manaBarBlue} alt="Mana" className="h-3 w-auto object-contain pixelated" />
              <span>Sanctum Shield Energy</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <span>Glitch Titan Life</span>
              <img src={hpBarRed} alt="Health" className="h-3 w-auto object-contain pixelated" />
            </div>
          </div>`
  );
  fs.writeFileSync('src/components/GameWorlds/BossBattleWorld.tsx', boss, 'utf8');
  console.log('Updated BossBattleWorld.tsx');
}
