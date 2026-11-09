import React, { useState } from 'react';
import { WizardProfile, QuestLevel } from '../../types';
import { QUEST_REALMS } from '../../data/quests';
import homeBg from '../../assets/home-bg.png';
import {
  Sparkles,
  Play,
  Map,
  BookOpen,
  User,
  FlaskConical,
  Repeat,
  Wand2,
  ShieldAlert,
  Compass,
  Trophy,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { sound } from '../../utils/sound';

export interface AcademyHomeProps {
  profile: WizardProfile;
  onStartQuest: (level: QuestLevel) => void;
  onOpenMap: () => void;
  onOpenGrimoire: () => void;
  onOpenProfile: () => void;
  onOpenGuide: () => void;
}

export const AcademyHome: React.FC<AcademyHomeProps> = ({
  profile,
  onStartQuest,
  onOpenMap,
  onOpenGrimoire,
  onOpenProfile,
  onOpenGuide,
}) => {
  // Mini interactive garden preview on home page
  const [miniBlooms, setMiniBlooms] = useState<number>(3);
  const [isMiniCasting, setIsMiniCasting] = useState<boolean>(false);

  // First quest
  const firstQuest = QUEST_REALMS[0].levels[0];
  // Next uncompleted quest or first quest
  let nextQuest = firstQuest;
  for (const realm of QUEST_REALMS) {
    for (const lvl of realm.levels) {
      if (!profile.completedQuests.includes(lvl.id)) {
        nextQuest = lvl;
        break;
      }
    }
  }

  const handleMiniCast = () => {
    if (isMiniCasting) return;
    setIsMiniCasting(true);
    sound.playWandCast();
    let count = 0;
    setMiniBlooms(0);
    const interval = setInterval(() => {
      count++;
      setMiniBlooms(count);
      sound.playFlowerBloom();
      if (count >= 6) {
        clearInterval(interval);
        setIsMiniCasting(false);
      }
    }, 300);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 animate-fadeIn pb-16">
      {/* Academy Grand Entrance Hero */}
      <div className="relative rounded-3xl border-2 border-magic/40 bg-night-950 p-8 md:p-14 overflow-hidden shadow-magic-lg text-center">
        {/* Background Citadel Artwork */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <img
            src={homeBg}
            alt="Academy Background"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/70 to-night-950/40" />
        </div>

        {/* Background ambient cosmic glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-magic/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-spellPink/15 blur-3xl animate-pulse" />
        </div>

        {/* Hero Tag & Pill */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-night-950/80 border border-spellPink/40 text-xs font-fantasy tracking-widest text-spellPink uppercase shadow-md mb-6">
          <Sparkles className="w-4 h-4 text-spellPink" />
          <span>The Academy of Storicode</span>
          <span className="text-white/40">•</span>
          <span className="text-manaMint">Version 1.0</span>
        </div>

        {/* Main Heading */}
        <h1 className="relative z-10 font-fantasy font-black text-4xl sm:text-5xl md:text-6xl text-moonCream tracking-wider max-w-4xl mx-auto leading-tight">
          Code Your Magic. <br />
          <span className="bg-gradient-to-r from-spellPink via-magic-light to-manaMint bg-clip-text text-transparent">
            Build Your World.
          </span>
        </h1>

        <p className="relative z-10 text-base md:text-lg text-moonCream/80 max-w-2xl mx-auto mt-5 leading-relaxed font-body">
          Step beyond plain screens and syntax errors. In this enchanted academy, every line of logic casts glowing spells, grows vibrant forests, hatches baby dragons, and breaks ancient curses.
        </p>

        {/* Hero Actions */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={() => {
              sound.playWandCast();
              onStartQuest(nextQuest);
            }}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-magic via-spellPink to-manaMint text-night-950 font-fantasy font-bold text-sm shadow-magic hover:opacity-95 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Begin Your Journey</span>
          </button>

          <button
            onClick={() => {
              sound.playWandCast();
              onOpenGuide();
            }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-spellPink/20 to-magic/20 hover:from-spellPink/30 hover:to-magic/30 text-spellPink font-fantasy font-bold text-sm border border-spellPink/40 shadow-md transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-spellPink" />
            <span>Step-by-Step Guide</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenMap();
            }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-night-900/90 hover:bg-night-800 text-moonCream font-fantasy font-bold text-sm border border-magic/40 shadow-md transition-all hover:scale-105"
          >
            <Map className="w-4 h-4 text-magic-light" />
            <span>Explore Realm Map</span>
          </button>
        </div>

        {/* Live Wizard Stats Bar inside Hero */}
        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-moonCream/80 font-code">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧙‍♂️</span>
            <span>
              Wizard: <strong className="text-moonCream">{profile.name}</strong> (Lvl {profile.level})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span>
              Mana: <strong className="text-manaMint">{profile.mana} MP</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💎</span>
            <span>
              Cosmic Gems: <strong className="text-spellPink">{profile.gems}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📜</span>
            <span>
              Quests Completed: <strong className="text-runeAmber">{profile.completedQuests.length} / 7</strong>
            </span>
          </div>
        </div>
      </div>

      {/* The Core Concept: Five Magical Metaphors */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-fantasy uppercase tracking-wider text-spellPink">
            The Arcane Metaphors
          </span>
          <h2 className="font-fantasy font-bold text-2xl md:text-3xl text-moonCream">
            How Programming Becomes Magic
          </h2>
          <p className="text-xs md:text-sm text-moonCream/70 max-w-xl mx-auto">
            Instead of abstract rules, learn computer science through tangible fantasy interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: 'Variables = Magic Bottles',
              analogy: 'Store values like mana, player names, and potion ingredients in labeled crystal flasks.',
              icon: <FlaskConical className="w-5 h-5 text-spellPink" />,
              badge: '⚗️ Variables',
              color: 'border-spellPink/40 bg-pink-950/30',
            },
            {
              title: 'Loops = Repeating Enchantments',
              analogy: 'Repeat an incantation to make flowers bloom, stars appear, and crystals multiply instantly.',
              icon: <Repeat className="w-5 h-5 text-manaMint" />,
              badge: '🌿 Loops',
              color: 'border-manaMint/40 bg-emerald-950/30',
            },
            {
              title: 'Functions = Reusable Spells',
              analogy: 'Inscribe a spell once and summon it whenever needed, like a reusable growForest() chant.',
              icon: <Wand2 className="w-5 h-5 text-magic-light" />,
              badge: '🔮 Functions',
              color: 'border-magic/40 bg-purple-950/30',
            },
            {
              title: 'Debugging = Breaking Curses',
              analogy: 'Inspect the spell script, find faulty lines, and shatter the dark hex locking the vault door.',
              icon: <ShieldAlert className="w-5 h-5 text-cursedRed" />,
              badge: '⚡ Debugging',
              color: 'border-cursedRed/40 bg-red-950/30',
            },
            {
              title: 'Algorithms = Dragon Paths',
              analogy: 'Guide baby dragon Sparky step-by-step through floating labyrinths to starry treasures.',
              icon: <Compass className="w-5 h-5 text-runeAmber" />,
              badge: '🐲 Algorithms',
              color: 'border-runeAmber/40 bg-amber-950/30',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-105 flex flex-col justify-between ${item.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-night-950/60 border border-white/10">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold font-code text-moonCream/80">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-fantasy font-bold text-sm text-moonCream">
                  {item.title}
                </h3>
                <p className="text-xs text-moonCream/70 mt-2 leading-relaxed">
                  {item.analogy}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Live Demo: "The Code-to-Magic Engine" Preview */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1d1430] via-[#140e24] to-[#0a0714] border-2 border-magic/40 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-magic/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-fantasy uppercase text-manaMint">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Concept Prototype
            </div>
            <h3 className="font-fantasy font-bold text-2xl text-moonCream mt-1">
              The Code-to-Magic Engine in Action
            </h3>
          </div>
          <div className="text-xs text-moonCream/70 font-code">
            Live Simulated Spell Execution
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: Visual Recipe Code Block */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-night-950/80 border border-magic/30 space-y-3 shadow-inner">
              <div className="text-xs font-fantasy font-bold text-moonCream/80 flex items-center justify-between">
                <span>YOUR SPELL RECIPE</span>
                <span className="text-[10px] text-magic-light font-code">repeat 6 times</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-manaMint/50 font-code text-xs text-manaMint space-y-1">
                <div>repeat 6 times:</div>
                <div className="pl-4 text-moonCream">grow_flower(bloom="lotus")</div>
              </div>

              <button
                onClick={handleMiniCast}
                disabled={isMiniCasting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-magic to-spellPink text-night-950 font-fantasy font-bold text-xs shadow-magic hover:opacity-95 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isMiniCasting ? 'Enchantment Flowing...' : '✨ Cast Spell'}</span>
              </button>
            </div>

            <p className="text-xs text-moonCream/70 italic">
              "In the full Spell Lab, assemble arbitrary blocks, inspect variable stacks, and guide dragons through real puzzle algorithms!"
            </p>
          </div>

          {/* Right: The Live Enchanted Garden Bloom */}
          <div className="p-5 rounded-2xl bg-[#11241f]/70 border border-manaMint/40 shadow-inner flex flex-col items-center justify-center min-h-[220px]">
            <div className="text-xs font-fantasy uppercase tracking-wider text-manaMint mb-3">
              ✦ The Enchanted Garden ✦
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
              {Array.from({ length: 6 }).map((_, idx) => {
                const isBloomed = idx < miniBlooms;
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                      isBloomed
                        ? 'bg-manaMint/20 border border-manaMint text-2xl scale-105 shadow-mana'
                        : 'bg-night-950/60 border border-white/5 text-base opacity-40'
                    }`}
                  >
                    <span>{isBloomed ? '🌼' : '🌱'}</span>
                    <span className="text-[9px] font-bold text-moonCream/80 mt-1">
                      {isBloomed ? `Bloom ${idx + 1}` : 'Seed'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-[11px] text-manaMint font-code font-bold">
              {miniBlooms} / 6 Blossoms Bloomed
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => {
            sound.playClick();
            onOpenMap();
          }}
          className="p-6 rounded-3xl bg-night-900/80 border border-magic/30 hover:border-magic text-left transition-all hover:scale-105 flex flex-col justify-between shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-magic/20 border border-magic/40 flex items-center justify-center text-xl mb-3">
              🗺️
            </div>
            <h3 className="font-fantasy font-bold text-base text-moonCream">
              The Realm Map
            </h3>
            <p className="text-xs text-moonCream/70 mt-1">
              Access all 5 enchanted programming continents and the Glitch Chimera raid arena.
            </p>
          </div>
          <div className="mt-4 text-xs font-bold text-magic-light flex items-center gap-1">
            <span>Explore Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenGrimoire();
          }}
          className="p-6 rounded-3xl bg-night-900/80 border border-magic/30 hover:border-magic text-left transition-all hover:scale-105 flex flex-col justify-between shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-spellPink/20 border border-spellPink/40 flex items-center justify-center text-xl mb-3">
              📖
            </div>
            <h3 className="font-fantasy font-bold text-base text-moonCream">
              The Arcane Grimoire
            </h3>
            <p className="text-xs text-moonCream/70 mt-1">
              Read comprehensive programming guides, analogies, and copy Python code snippets.
            </p>
          </div>
          <div className="mt-4 text-xs font-bold text-spellPink flex items-center gap-1">
            <span>Open Grimoire</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="p-6 rounded-3xl bg-night-900/80 border border-magic/30 hover:border-magic text-left transition-all hover:scale-105 flex flex-col justify-between shadow-lg"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-manaMint/20 border border-manaMint/40 flex items-center justify-center text-xl mb-3">
              🧙‍♂️
            </div>
            <h3 className="font-fantasy font-bold text-base text-moonCream">
              Wizard Sanctuary
            </h3>
            <p className="text-xs text-moonCream/70 mt-1">
              Customize robes, wands, familiars, choose your House, and inspect your badges.
            </p>
          </div>
          <div className="mt-4 text-xs font-bold text-manaMint flex items-center gap-1">
            <span>Edit Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
};

