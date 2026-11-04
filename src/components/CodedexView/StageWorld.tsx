import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

import { ArrowDown, ArrowRight, Gem, Mountain, Sparkles } from "lucide-react";
import {
  AETHER_PORTRAIT,
  StoryArtwork,
} from "../../features/story/StoryArtwork";

import type { useQuestEngine } from "../../features/learning/useQuestEngine";
export function StageWorld({
  state,
}: {
  state: ReturnType<typeof useQuestEngine>;
}) {
  const {
    lesson,
    code,
    errorPointer,
    dragon,
    collectedCrystal,
    potionVars,
    isBrewed,
    bloomedFlowers,
    bridgeTiles,
    purifiedRunes,
    stargateFlux,
    stargateRingsAligned,
    chronoCrystals,
    isVortexStabilized,
    bossHp,
    playerShield,
    bossHitFlash,
  } = state;
  return (
    <>
      {/* The internal stage key stays compatible; Aether is the playable character. */}
      {lesson.stageType === "dragon" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 w-full"
        >
          <div
            className="sc-aether-grid grid grid-cols-5 gap-2.5 p-4 rounded-2xl border border-magic/40 w-full max-w-sm aspect-square shadow-2xl"
            role="img"
            aria-label={`Aether at (${dragon.x}, ${dragon.y}), facing ${dragon.direction.toLowerCase()}. ${collectedCrystal ? "Fragment collected." : "Fragment at (2, 2); boulder at (1, 1)."}`}
          >
            {Array.from({ length: 25 }).map((_, idx) => {
              const x = idx % 5;
              const y = Math.floor(idx / 5);
              const isDragon = dragon.x === x && dragon.y === y;
              const isTarget = x === 2 && y === 2;
              const isRock = x === 1 && y === 1;
              const isErrorTile =
                errorPointer?.tileCoords?.x === x &&
                errorPointer?.tileCoords?.y === y;

              return (
                <div
                  key={idx}
                  className={cn(
                    "relative rounded-xl border flex items-center justify-center transition-all",
                    isErrorTile
                      ? "bg-red-950/80 border-cursedRed ring-2 ring-cursedRed shadow-[0_0_15px_rgba(255,89,100,0.8)]"
                      : isDragon
                        ? "bg-magic/35 border-magic shadow-magic scale-105"
                        : isTarget
                          ? "bg-amber-500/20 border-amber-400/80 animate-pulse"
                          : isRock
                            ? "bg-red-950/50 border-red-900/50"
                            : "bg-white/5 border-white/5",
                  )}
                >
                  {/* DYNAMIC ERROR ARROW */}
                  {isErrorTile && (
                    <div className="absolute -top-7 z-30 flex flex-col items-center animate-bounce pointer-events-none">
                      <span className="text-[9px] font-bold text-white bg-cursedRed px-1.5 py-0.5 rounded shadow">
                        Blocked!
                      </span>
                      <ArrowDown className="w-3.5 h-3.5 text-cursedRed stroke-[3]" />
                    </div>
                  )}

                  {isTarget && !collectedCrystal && (
                    <Gem className="sc-grid-fragment" size={23} />
                  )}

                  {isRock && <Mountain size={24} className="sc-grid-rock" />}

                  {isDragon && (
                    <div className="sc-aether-token">
                      <img
                        src={AETHER_PORTRAIT}
                        alt=""
                        width={335}
                        height={640}
                        style={{
                          transform:
                            dragon.direction === "LEFT"
                              ? "scaleX(-1)"
                              : undefined,
                        }}
                      />
                      <span
                        className="sc-facing-arrow"
                        style={{
                          transform: `rotate(${{ RIGHT: 0, DOWN: 90, LEFT: 180, UP: 270 }[dragon.direction]}deg)`,
                        }}
                      >
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-moonCream/80 flex items-center gap-3 font-code">
            <span>
              Pos: ({dragon.x}, {dragon.y})
            </span>
            <span>Facing: {dragon.direction}</span>
            <span className="text-runeAmber font-bold">
              {collectedCrystal ? "Fragment recovered" : "0/1 fragment"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Level 2: Potion Cauldron */}
      {lesson.stageType === "potion" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 w-full max-w-md py-4"
        >
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-[#0e0a19]/90 border border-spellPink/50 text-center shadow-lg">
              <span className="text-3xl">🍾</span>
              <div className="text-xs font-code font-bold text-moonCream mt-1.5">
                mana_flask
              </div>
              <div className="text-base font-bold text-spellPink font-code mt-0.5">
                {potionVars["mana_flask"] !== undefined
                  ? potionVars["mana_flask"]
                  : "empty"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0a19]/90 border border-manaMint/50 text-center shadow-lg">
              <span className="text-3xl">✨</span>
              <div className="text-xs font-code font-bold text-moonCream mt-1.5">
                star_dew
              </div>
              <div className="text-base font-bold text-manaMint font-code mt-0.5">
                {potionVars["star_dew"] !== undefined
                  ? potionVars["star_dew"]
                  : "empty"}
              </div>
            </div>
          </div>

          <div className="relative w-48 h-36 rounded-b-[4.5rem] bg-gradient-to-b from-[#35254a] to-[#160d21] border-4 border-[#523b72] flex items-center justify-center shadow-2xl">
            <div
              className={cn(
                "w-36 h-20 rounded-b-[4rem] transition-all duration-700 flex items-center justify-center",
                isBrewed
                  ? "bg-gradient-to-r from-spellPink via-magic to-manaMint shadow-[0_0_30px_rgba(243,169,212,0.9)]"
                  : "bg-purple-950/50",
              )}
            >
              <span className="text-3xl animate-bounce">
                {isBrewed ? "🌟" : "🫧"}
              </span>
            </div>
          </div>

          <div className="text-sm font-code text-moonCream font-medium bg-[#0e0a19]/70 px-4 py-1.5 rounded-xl border border-white/10">
            Cauldron:{" "}
            {isBrewed ? "Elixir Transmuted! 🎉" : "Awaiting ingredients..."}
          </div>
        </motion.div>
      )}

      {/* Level 3: Garden */}
      {lesson.stageType === "garden" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm"
        >
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#0a1813] border border-manaMint/40 shadow-inner w-full">
            {Array.from({ length: 6 }).map((_, idx) => {
              const isBloomed = idx < bloomedFlowers;

              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={
                    isBloomed
                      ? { scale: 1.05, opacity: 1 }
                      : { scale: 1, opacity: 0.4 }
                  }
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300",
                    isBloomed
                      ? "bg-manaMint/25 border border-manaMint shadow-mana"
                      : "bg-[#0e0a19]/60 border border-white/5",
                  )}
                >
                  <span className="text-3xl">{isBloomed ? "🌸" : "🌱"}</span>
                  <span className="text-[10px] font-bold text-manaMint mt-1">
                    {isBloomed ? `Bloom ${idx + 1}` : "Seed"}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="text-xs font-code font-bold text-manaMint">
            {bloomedFlowers} / 6 Flowers Bloomed
          </div>
        </motion.div>
      )}

      {/* Level 4: Bridge */}
      {lesson.stageType === "bridge" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between gap-1 w-full max-w-sm py-4"
        >
          <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
            <img
              className="sc-bridge-aether"
              src={AETHER_PORTRAIT}
              alt="Aether"
              width={335}
              height={640}
            />
            <span className="text-[9px] text-white/60">Cliff</span>
          </div>

          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-12 rounded-lg border flex items-center justify-center text-xs transition-all",
                i < bridgeTiles
                  ? "bg-gradient-to-t from-magic to-manaMint border-manaMint shadow-mana text-night-950 font-bold scale-105"
                  : "bg-white/5 border-dashed border-white/10 opacity-30",
              )}
            >
              {i < bridgeTiles ? "✨" : ""}
            </div>
          ))}

          <div className="w-16 h-20 rounded-xl bg-[#2a1d47] border border-magic flex flex-col items-center justify-center text-xs">
            <span className="text-2xl">🏰</span>
            <span className="text-[9px] text-white/60">Tower</span>
          </div>
        </motion.div>
      )}

      {/* Level 5: Curse */}
      {lesson.stageType === "curse" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
        >
          <div className="flex items-center justify-center gap-3">
            {[
              { id: 1, sym: "ᚠ" },
              { id: 2, sym: "ᚢ" },
              { id: 3, sym: "ᚦ" },
            ].map((r) => {
              const isClean = purifiedRunes.includes(r.id);

              return (
                <div
                  key={r.id}
                  className={cn(
                    "w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all",
                    isClean
                      ? "bg-manaMint/20 border-manaMint text-manaMint shadow-mana scale-105"
                      : "bg-red-950/40 border-cursedRed text-cursedRed animate-pulse",
                  )}
                >
                  <span className="text-2xl font-bold">{r.sym}</span>
                  <span className="text-[10px] mt-1 font-code">#{r.id}</span>
                  <span className="text-[8px] uppercase font-bold">
                    {isClean ? "Clean" : "Cursed"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 rounded-xl bg-[#0e0a19]/70 border border-white/10 text-center w-full text-xs">
            Dungeon Vault:{" "}
            <strong
              className={
                purifiedRunes.length === 3 ? "text-manaMint" : "text-cursedRed"
              }
            >
              {purifiedRunes.length === 3 ? "🔓 UNLOCKED!" : "🔒 SEALED BY HEX"}
            </strong>
          </div>
        </motion.div>
      )}

      {/* Level 6: Stargate */}
      {lesson.stageType === "stargate" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
        >
          <div className="relative w-44 h-44 rounded-full flex items-center justify-center border-4 border-dashed border-[#8B5CF6]/40 p-2">
            {/* Ring 1 */}
            <div
              className={cn(
                "absolute inset-2 rounded-full border-2 transition-all duration-1000",
                stargateRingsAligned
                  ? "border-[#5EEAD4] shadow-[0_0_20px_#5EEAD4] rotate-0"
                  : "border-white/20 rotate-45",
              )}
            />
            {/* Ring 2 */}
            <div
              className={cn(
                "absolute inset-5 rounded-full border-2 transition-all duration-1000",
                stargateRingsAligned
                  ? "border-[#F472B6] shadow-[0_0_20px_#F472B6] rotate-0"
                  : "border-white/20 -rotate-90",
              )}
            />
            {/* Ring 3 (Inner Portal) */}
            <div
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all duration-700",
                stargateFlux >= 200
                  ? "bg-gradient-to-tr from-[#5EEAD4] via-[#8B5CF6] to-[#F472B6] shadow-[0_0_35px_rgba(94,234,212,0.9)] scale-110 animate-spin"
                  : "bg-black/60 border border-white/20",
              )}
            >
              {stargateFlux >= 200 ? "🌌" : "🪐"}
            </div>
          </div>

          {/* Flux Power Meter */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs font-code">
              <span className="text-[#5EEAD4]">Stargate Flux</span>
              <span className="font-bold text-[#F472B6]">
                {stargateFlux} / 200 MW
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#5EEAD4] via-[#8B5CF6] to-[#F472B6] transition-all duration-500"
                style={{
                  width: `${Math.min(100, (stargateFlux / 200) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="text-[11px] font-code text-center text-white/80">
            Status:{" "}
            {stargateFlux >= 200
              ? "🌌 WORMHOLE ACTIVE & STABLE"
              : "⚡ AWAITING POWER INJECTION"}
          </div>
        </motion.div>
      )}

      {/* Level 7: Chrono Matrix */}
      {lesson.stageType === "chrono" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
        >
          <div className="grid grid-cols-4 gap-2 w-full">
            {chronoCrystals.map((val, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500",
                  val === idx + 1
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105"
                    : "bg-indigo-950/60 border-indigo-500/40 text-indigo-200",
                )}
              >
                <span
                  className="text-2xl animate-bounce"
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  💎
                </span>
                <span className="font-pixel text-lg font-bold">#{val}</span>
                <span className="text-[9px] font-code opacity-60">
                  idx [{idx}]
                </span>
              </div>
            ))}
          </div>

          <div className="w-full p-2.5 rounded-xl bg-[#0e0a19]/70 border border-white/10 text-center text-xs">
            Timeline Vortex:{" "}
            <strong
              className={
                isVortexStabilized ? "text-emerald-400" : "text-amber-400"
              }
            >
              {isVortexStabilized
                ? "🌀 100% STABILIZED (NO PARADOX)"
                : "⚠️ CHRONO ANOMALY DETECTED"}
            </strong>
          </div>
        </motion.div>
      )}

      {/* Level 8: Boss Battle Arena */}
      {lesson.stageType === "boss" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 w-full max-w-sm py-2"
        >
          <div
            className={`sc-malachar-scene ${bossHitFlash ? "hit" : ""} ${bossHp <= 0 ? "restored" : ""}`}
          >
            <StoryArtwork lesson={8} compact />
            <span>
              <Sparkles size={14} />
              {bossHp <= 0
                ? "The binding is broken"
                : "Malachar · Keeper of the broken Core"}
            </span>
          </div>

          {/* Boss Health Bar */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs font-code">
              <span className="text-red-400">Malachar’s binding</span>
              <span className="font-bold text-red-400">{bossHp} / 100</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-red-500/40">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-400"
                style={{ width: `${Math.max(0, bossHp)}%` }}
              />
            </div>
          </div>

          {/* Player Mana Shield */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs font-code">
              <span className="text-[#5EEAD4]">Player Mana Shield</span>
              <span className="font-bold text-[#5EEAD4]">
                {playerShield} / 100
              </span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/40">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-[#5EEAD4] transition-all duration-400"
                style={{ width: `${Math.min(100, playerShield)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] font-code text-center">
            {bossHp <= 0 ? (
              <span className="text-emerald-400 font-bold">
                The Core is free of Malachar’s binding.
              </span>
            ) : (
              <span className="text-amber-300">
                Protect Aether. Weaken the binding. Restore the Core.
              </span>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
