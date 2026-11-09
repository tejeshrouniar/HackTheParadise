import React from 'react';
import { Swords, Shield, Trophy, Sparkles, Heart } from 'lucide-react';
import hpBarRed from '../../assets/props/hp_bar_red.png';
import manaBarBlue from '../../assets/props/mana_bar_blue.png';

export interface BossBattleProps {
  bossHp: number;
  maxBossHp?: number;
  playerHp: number;
  maxPlayerHp?: number;
  hasShield: boolean;
  bossState: 'idle' | 'hit' | 'defeated';
  stepMessage?: string;
  isExecuting?: boolean;
}

export const BossBattleWorld: React.FC<BossBattleProps> = ({
  bossHp,
  maxBossHp = 100,
  playerHp,
  maxPlayerHp = 100,
  hasShield,
  bossState,
  stepMessage,
  isExecuting,
}) => {
  const isDefeated = bossHp <= 0 || bossState === 'defeated';

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl bg-gradient-to-b from-[#2a133d] via-[#160c23] to-[#09050f] border border-magic/40 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
      {/* Background glitch aura particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-10 w-32 h-32 rounded-full bg-red-600/20 blur-3xl animate-ping" />
      </div>

      {/* Top Header & Boss HP Bar */}
      <div className="z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between bg-night-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-magic/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">👑</span>
            <div>
              <h4 className="font-fantasy font-bold text-sm text-moonCream tracking-wider">The Glitch Chimera Overlord</h4>
              <p className="text-xs text-spellPink/90 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-runeAmber" /> Final Trial of the Grand Academy
              </p>
            </div>
          </div>

          {isDefeated && (
            <div className="flex items-center gap-1.5 bg-manaMint/20 border border-manaMint text-manaMint text-xs font-bold px-3 py-1 rounded-lg animate-pulse">
              <Trophy className="w-4 h-4" /> BOSS VANQUISHED!
            </div>
          )}
        </div>

        {/* Health Bars Row */}
        <div className="grid grid-cols-2 gap-4">
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
          </div>
          {/* Player HP */}
          <div className="bg-night-950/70 border border-manaMint/30 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-bold text-manaMint">
                <Heart className="w-3.5 h-3.5 text-spellPink fill-spellPink" /> Apprentice HP
              </span>
              <span className="font-code font-bold text-moonCream">
                {playerHp} / {maxPlayerHp}
              </span>
            </div>
            <div className="w-full h-2 bg-night-900 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-manaMint to-emerald-400 transition-all duration-300"
                style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
              />
            </div>
            {hasShield && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-magic-light font-bold">
                <Shield className="w-3 h-3 text-magic-light" /> Mana Shield Active (100)
              </div>
            )}
          </div>

          {/* Boss HP */}
          <div className="bg-night-950/70 border border-cursedRed/30 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-bold text-cursedRed">
                <Swords className="w-3.5 h-3.5 text-cursedRed" /> Chimera HP
              </span>
              <span className="font-code font-bold text-moonCream">
                {Math.max(0, bossHp)} / {maxBossHp}
              </span>
            </div>
            <div className="w-full h-2 bg-night-900 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cursedRed to-orange-500 transition-all duration-300"
                style={{ width: `${(Math.max(0, bossHp) / maxBossHp) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] text-cursedRed/80 font-code text-right">
              {bossHp <= 0 ? 'Defeated' : `${Math.round((bossHp / maxBossHp) * 100)}% Integrity`}
            </div>
          </div>
        </div>
      </div>

      {/* Duel Arena Canvas */}
      <div className="my-auto py-4 z-10 flex items-center justify-between px-8">
        {/* Player Wizard Hero */}
        <div className="relative flex flex-col items-center">
          {hasShield && (
            <div className="absolute -inset-4 rounded-full border-2 border-manaMint/80 bg-manaMint/10 animate-pulse pointer-events-none shadow-[0_0_20px_rgba(184,232,220,0.4)]" />
          )}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-magic/30 to-night-950 border-2 border-magic flex items-center justify-center text-5xl filter drop-shadow-[0_0_15px_rgba(146,116,216,0.6)]">
            🧙‍♂️
          </div>
          <span className="mt-2 text-xs font-fantasy font-bold text-moonCream">Grand Apprentice</span>
        </div>

        {/* Combat projectile center area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {isExecuting && (
            <div className="flex items-center gap-2 animate-bounce">
              <span className="text-2xl text-astralCyan">⚡</span>
              <span className="text-xl text-spellPink">✨</span>
              <span className="text-2xl text-runeAmber">☄️</span>
            </div>
          )}
          {isDefeated && (
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-4xl">💎👑💎</span>
              <span className="text-xs font-fantasy text-manaMint font-bold mt-1">VICTORY REWARDS UNLOCKED!</span>
            </div>
          )}
        </div>

        {/* Boss Creature */}
        <div className="relative flex flex-col items-center">
          <div
            className={`w-28 h-28 rounded-2xl border-2 flex items-center justify-center text-6xl transition-all duration-300 ${
              isDefeated
                ? 'bg-night-950 border-white/20 opacity-30 grayscale rotate-12 scale-90'
                : bossState === 'hit'
                ? 'bg-cursedRed/40 border-white scale-110 shadow-[0_0_30px_rgba(255,255,255,0.8)]'
                : 'bg-gradient-to-b from-purple-900/40 to-night-950 border-magic shadow-[0_0_25px_rgba(146,116,216,0.4)] animate-float'
            }`}
          >
            {isDefeated ? '💀' : '👾'}
          </div>
          <span className="mt-2 text-xs font-fantasy font-bold text-spellPink">Glitch Overlord</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="z-10 flex items-center justify-between text-xs bg-night-900/90 border border-magic/30 px-4 py-2.5 rounded-xl">
        <div className="flex items-center gap-2 text-moonCream/90 truncate">
          <Sparkles className="w-4 h-4 text-magic-light shrink-0 animate-spin-slow" />
          <span className="truncate">{stepMessage || 'Combine variables, loops, and functions to conquer the Overlord!'}</span>
        </div>
        <div className="text-[11px] text-magic-light/80 shrink-0 font-code ml-2">
          Boss Raid Arena
        </div>
      </div>
    </div>
  );
};

