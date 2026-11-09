import React, { useState } from 'react';
import { QUEST_REALMS } from '../../data/quests';
import { Realm, QuestLevel } from '../../types';
import { Lock, Sparkles, Star, ChevronRight, Play, Swords } from 'lucide-react';
import { sound } from '../../utils/sound';

export interface RealmMapProps {
  completedQuests: string[];
  onSelectLevel: (level: QuestLevel) => void;
}

export const RealmMap: React.FC<RealmMapProps> = ({
  completedQuests,
  onSelectLevel,
}) => {
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(QUEST_REALMS[0]);

  // Check if a realm is unlocked
  const isRealmUnlocked = (realmIndex: number): boolean => {
    if (realmIndex === 0) return true;
    const prevRealm = QUEST_REALMS[realmIndex - 1];
    // Unlocked if all quests in previous realm are completed
    return prevRealm.levels.every((lvl) => completedQuests.includes(lvl.id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Map Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-magic/20 border border-magic/40 text-xs font-fantasy uppercase tracking-wider text-spellPink">
          <Sparkles className="w-3.5 h-3.5" /> The Five Arcane Realms
        </div>
        <h2 className="font-fantasy font-bold text-3xl md:text-4xl text-moonCream tracking-wider">
          The Storicode Realm Map
        </h2>
        <p className="text-sm text-moonCream/70 max-w-xl mx-auto">
          Traverse the enchanted continents. Master each school of programming to break ancient seals and confront the Glitch Chimera.
        </p>
      </div>

      {/* Illustrated Realm Archipelago Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {QUEST_REALMS.map((realm, index) => {
          const unlocked = isRealmUnlocked(index);
          const completedCount = realm.levels.filter((lvl) => completedQuests.includes(lvl.id)).length;
          const isFinished = completedCount === realm.levels.length;
          const isSelected = selectedRealm?.id === realm.id;
          const isBoss = realm.id === 'boss';

          return (
            <div
              key={realm.id}
              onClick={() => {
                if (unlocked) {
                  sound.playClick();
                  setSelectedRealm(realm);
                } else {
                  sound.playError();
                }
              }}
              className={`relative rounded-3xl border-2 p-6 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                !unlocked
                  ? 'bg-night-950/60 border-white/5 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-gradient-to-br from-[#2f1f4d] via-[#1d1430] to-[#100a1c] border-spellPink shadow-magic-lg scale-[1.02]'
                  : 'bg-gradient-to-br from-[#211737]/80 to-[#120c20]/90 border-magic/30 hover:border-magic hover:shadow-magic hover:scale-[1.01]'
              } ${isBoss ? 'md:col-span-2 lg:col-span-3 border-amber-500/50' : ''}`}
            >
              {/* Top Row: Icon & Status */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border"
                      style={{
                        backgroundColor: `${realm.color}25`,
                        borderColor: realm.color,
                      }}
                    >
                      {realm.badge}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-magic-light font-fantasy">
                        Realm {index + 1} {isBoss ? '• Boss Raid' : ''}
                      </span>
                      <h3 className="font-fantasy font-bold text-lg text-moonCream">
                        {realm.name}
                      </h3>
                    </div>
                  </div>

                  {/* Lock or Progress Stars */}
                  <div>
                    {!unlocked ? (
                      <div className="flex items-center gap-1 text-xs text-moonCream/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-night-950/70 border border-white/10 px-2.5 py-1 rounded-full">
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isFinished ? 'text-runeAmber fill-runeAmber' : 'text-moonCream/30'
                          }`}
                        />
                        <span className="text-xs font-bold text-moonCream font-code">
                          {completedCount}/{realm.levels.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtitle & Description */}
                <div className="mt-3">
                  <div className="text-xs font-fantasy font-semibold text-spellPink">
                    {realm.subtitle}
                  </div>
                  <p className="text-xs text-moonCream/70 mt-1 leading-relaxed line-clamp-2">
                    {realm.description}
                  </p>
                </div>
              </div>

              {/* Bottom Row Action */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-magic-light font-code">
                  {realm.levels.length} {realm.levels.length === 1 ? 'Trial' : 'Trials'} Available
                </span>

                {unlocked && (
                  <span className="text-moonCream font-bold flex items-center gap-1 text-xs group-hover:text-spellPink transition-colors">
                    <span>View Quests</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Realm Quest Level Selector Panel */}
      {selectedRealm && (
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#241a38] via-[#1a1329] to-[#0f0b18] border-2 border-magic/50 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-magic/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedRealm.badge}</span>
              <div>
                <h3 className="font-fantasy font-bold text-xl text-moonCream">
                  {selectedRealm.name}: Quests
                </h3>
                <p className="text-xs text-manaMint">{selectedRealm.subtitle}</p>
              </div>
            </div>

            <div className="text-xs text-moonCream/70 font-code">
              {selectedRealm.levels.length} Quests in this Realm
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedRealm.levels.map((level) => {
              const isCompleted = completedQuests.includes(level.id);

              return (
                <div
                  key={level.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-magic/15 border-magic/60 shadow-inner'
                      : 'bg-night-900/60 border-white/10 hover:border-spellPink/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-moonCream/80 font-code">
                        Level {level.levelNumber}
                      </span>

                      {isCompleted && (
                        <span className="text-[10px] font-bold text-manaMint bg-manaMint/20 border border-manaMint/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-manaMint" /> Mastered
                        </span>
                      )}
                    </div>

                    <h4 className="font-fantasy font-bold text-base text-moonCream">
                      {level.title}
                    </h4>
                    <p className="text-xs text-moonCream/70 mt-1 leading-relaxed">
                      {level.story}
                    </p>

                    <div className="mt-3 p-2.5 rounded-xl bg-night-950/70 border border-white/5 text-xs text-spellPink/90">
                      <strong>Objective:</strong> {level.objective}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-runeAmber font-code font-bold">+{level.rewardXp} XP</span>
                      <span className="text-spellPink font-code font-bold">+{level.rewardGems} 💎</span>
                    </div>

                    <button
                      onClick={() => {
                        sound.playWandCast();
                        onSelectLevel(level);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-magic to-spellPink text-night-950 font-bold text-xs shadow-magic hover:opacity-95 transition-all hover:scale-105"
                    >
                      {level.realmId === 'boss' ? (
                        <>
                          <Swords className="w-4 h-4" /> Enter Boss Arena
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" /> Enter Spell Lab
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

