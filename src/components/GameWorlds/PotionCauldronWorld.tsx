import React from 'react';
import { FlaskConical, Sparkles, Trophy, Flame } from 'lucide-react';
import alchemyDecor from '../../assets/props/alchemy_decor.png';

export interface PotionCauldronProps {
  variables: Record<string, any>;
  targetVariables: Record<string, any>;
  potionName: string;
  isGoalReached: boolean;
  stepMessage?: string;
  isExecuting?: boolean;
}

export const PotionCauldronWorld: React.FC<PotionCauldronProps> = ({
  variables,
  targetVariables,
  potionName,
  isGoalReached,
  stepMessage,
  isExecuting,
}) => {
  // Compute cauldron liquid color based on variables
  const getCauldronColor = () => {
    if (isGoalReached) return 'from-pink-500 via-purple-500 to-indigo-600';
    if (variables['star_dew'] && variables['moon_dust']) return 'from-cyan-400 via-teal-500 to-emerald-600';
    if (variables['mana_flask']) return 'from-purple-500 via-violet-600 to-night-950';
    return 'from-purple-900/60 to-night-950';
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl bg-gradient-to-b from-[#251733] via-[#1a1226] to-[#0d0915] border border-spellPink/30 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
      {/* Background alchemy pixel art decor */}
      <div className="absolute right-3 bottom-14 opacity-35 pointer-events-none">
        <img src={alchemyDecor} alt="Alchemy Props" className="w-36 h-auto object-contain filter drop-shadow-xl" />
      </div>

      {/* Background magical wisps */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/3 left-10 w-32 h-32 rounded-full bg-spellPink/20 blur-2xl animate-pulse" />
        <div className="absolute top-1/2 right-12 w-40 h-40 rounded-full bg-magic/20 blur-3xl animate-pulse" />
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 bg-night-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-spellPink/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-spellPink/20 border border-spellPink/40 flex items-center justify-center text-xl">
            ⚗️
          </div>
          <div>
            <h4 className="font-fantasy font-bold text-sm text-moonCream tracking-wider">The Alchemical Workshop</h4>
            <p className="text-xs text-spellPink/90 flex items-center gap-1">
              <FlaskConical className="w-3.5 h-3.5" /> Recipe: <span className="font-bold text-moonCream">{potionName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isGoalReached && (
            <div className="flex items-center gap-1.5 bg-spellPink/20 border border-spellPink text-spellPink text-xs font-bold px-3 py-1 rounded-lg animate-pulse">
              <Trophy className="w-3.5 h-3.5" /> Elixir Brewed!
            </div>
          )}
        </div>
      </div>

      {/* Main Laboratory Scene */}
      <div className="my-auto py-4 z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Side: Magic Variable Bottles Shelf */}
        <div className="bg-night-900/70 border border-magic/30 rounded-2xl p-4 backdrop-blur shadow-inner">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="text-xs font-fantasy uppercase tracking-wider text-moonCream/80 flex items-center gap-1.5">
              <span>🧪</span> Magic Bottles (Variables)
            </span>
            <span className="text-[10px] text-magic-light font-code">Memory Stack</span>
          </div>

          <div className="space-y-3">
            {Object.keys(targetVariables).map((varName) => {
              const currentVal = variables[varName];
              const targetVal = targetVariables[varName];
              const isMatch = currentVal === targetVal;

              return (
                <div
                  key={varName}
                  className={`p-3 rounded-xl border transition-all ${
                    isMatch
                      ? 'bg-magic/20 border-magic shadow-[0_0_15px_rgba(146,116,216,0.3)]'
                      : 'bg-night-950/60 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍾</span>
                      <div>
                        <div className="text-xs font-bold text-moonCream font-code">{varName}</div>
                        <div className="text-[10px] text-moonCream/60">
                          Target: <span className="text-manaMint font-bold">{targetVal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-bold font-code px-2.5 py-1 rounded-lg border ${
                          currentVal !== undefined
                            ? isMatch
                              ? 'bg-manaMint/20 border-manaMint text-manaMint'
                              : 'bg-spellPink/20 border-spellPink text-spellPink'
                            : 'bg-white/5 border-white/10 text-moonCream/40'
                        }`}
                      >
                        {currentVal !== undefined ? currentVal : 'unassigned'}
                      </div>
                    </div>
                  </div>

                  {/* Liquid fill visual bar inside the bottle */}
                  <div className="mt-2.5 h-1.5 w-full bg-night-950 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isMatch ? 'bg-gradient-to-r from-magic to-manaMint' : 'bg-spellPink'
                      }`}
                      style={{
                        width: `${currentVal !== undefined ? Math.min(100, (Number(currentVal) / Number(targetVal)) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: The Swirling Cauldron */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="relative flex flex-col items-center">
            {/* Rising magical bubbles & steam */}
            <div className="absolute -top-12 flex items-center justify-center gap-3">
              <span className="text-sm animate-bounce text-spellPink">✨</span>
              <span className="text-xs animate-ping text-manaMint">🫧</span>
              <span className="text-sm animate-pulse text-moonCream">⭐</span>
              <span className="text-xs animate-bounce text-magic-light">🫧</span>
            </div>

            {/* The Cauldron Vessel */}
            <div className="relative w-48 h-40 rounded-b-[4.5rem] rounded-t-[1.5rem] bg-gradient-to-b from-[#342a47] via-[#221833] to-[#120c1d] border-4 border-[#4f3e69] shadow-2xl flex flex-col items-center justify-start overflow-hidden">
              {/* Cauldron Rim */}
              <div className="w-full h-7 bg-[#4f3e69] border-b-2 border-[#2b223a] rounded-t-xl flex items-center justify-center">
                <span className="text-[10px] uppercase font-fantasy tracking-wider text-moonCream/70">
                  Transmutation Core
                </span>
              </div>

              {/* Swirling Liquid */}
              <div
                className={`w-40 h-28 mt-2 rounded-b-[4rem] bg-gradient-to-tr ${getCauldronColor()} shadow-inner transition-all duration-700 relative overflow-hidden flex items-center justify-center`}
              >
                {/* Surface shimmer */}
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                {isExecuting && (
                  <Sparkles className="w-8 h-8 text-white/90 animate-spin-slow" />
                )}
                {isGoalReached && (
                  <div className="text-3xl animate-bounce filter drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
                    🌟
                  </div>
                )}
              </div>
            </div>

            {/* Fire braziers under cauldron */}
            <div className="flex items-center gap-4 -mt-1 text-2xl filter drop-shadow-[0_0_8px_rgba(255,179,71,0.8)]">
              <Flame className="w-6 h-6 text-runeAmber animate-pulse" />
              <Flame className="w-7 h-7 text-spellPink animate-bounce" />
              <Flame className="w-6 h-6 text-runeAmber animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer feedback */}
      <div className="z-10 flex items-center justify-between text-xs bg-night-900/90 border border-spellPink/20 px-4 py-2.5 rounded-xl">
        <div className="flex items-center gap-2 text-moonCream/90 truncate">
          <Sparkles className="w-4 h-4 text-spellPink shrink-0 animate-spin-slow" />
          <span className="truncate">{stepMessage || 'Assign values to your potion bottles to brew the elixir!'}</span>
        </div>
        <div className="text-[11px] text-spellPink/80 shrink-0 font-code ml-2">
          Variables = Magic Bottles
        </div>
      </div>
    </div>
  );
};

