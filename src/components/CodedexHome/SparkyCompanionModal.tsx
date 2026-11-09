import { Modal } from '../ui/Modal';
import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  Award,
  RefreshCw,
  Coffee,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';

interface SparkyCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuest: (lessonId?: number) => void;
  isDarkMode: boolean;
}

interface DevJoke {
  joke: string;
  punchline: string;
  tag: string;
}

const DEV_JOKES: DevJoke[] = [
  {
    joke: 'Why do programmers prefer dark mode?',
    punchline: 'Because light attracts bugs! 🪲',
    tag: 'Dev Life',
  },
  {
    joke: 'There are only 10 types of people in the realm...',
    punchline: 'Those who understand binary, and those who don’t! ⚡',
    tag: 'Math & Logic',
  },
  {
    joke: 'Why was the JavaScript wizard sad?',
    punchline: 'Because they didn’t Node how to Express themselves! 📦',
    tag: 'Web Dev',
  },
  {
    joke: 'A SQL query walks into a tavern, approaches two tables and whispers:',
    punchline: "'Mind if I JOIN you?' 🍺",
    tag: 'Databases',
  },
  {
    joke: 'Why do Java archmages wear thick spectacles?',
    punchline: 'Because they can’t C#! 👓',
    tag: 'Languages',
  },
  {
    joke: 'What is the most relatable Git commit message in history?',
    punchline: "'Fixed the bug for real this time (round 4 final final)' 🔁",
    tag: 'Git Habits',
  },
  {
    joke: 'Why was the Python programmer so calm in the enchanted tempest?',
    punchline: 'Because they know how to `try... except` all disasters! 🛡️',
    tag: 'Python Magic',
  },
  {
    joke: 'Debugging code feels like...',
    punchline: 'Being the detective in a crime movie where you are also the murderer! 🕵️',
    tag: 'Debugging',
  },
  {
    joke: 'What did BTS say in Mikrokosmos that applies to coding?',
    punchline: "'In this pitch dark night, you shine the brightest.' Pass all your tests with pride! 💜",
    tag: 'BTS Army 💜',
  },
  {
    joke: 'Why did the developer cross the enchanted road?',
    punchline: 'To deploy to the other side! 🚀',
    tag: 'Deployment',
  },
];

export const SparkyCompanionModal: React.FC<SparkyCompanionModalProps> = ({
  isOpen,
  onClose,
  onOpenQuest,
  isDarkMode,
}) => {
  // Companion XP stored in localStorage
  const [xp, setXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('spellscript_sparky_xp');
      return saved ? parseInt(saved, 10) : 320;
    } catch {
      return 320;
    }
  });

  const [petCount, setPetCount] = useState<number>(0);
  const [dialogue, setDialogue] = useState<string>(
    "Rawr! Hello wizard friend! I'm Sparky, your dragon familiar. Ready to learn Python and breathe violet flames?"
  );
  const [currentJokeIndex, setCurrentJokeIndex] = useState<number>(0);
  const [showPunchline, setShowPunchline] = useState<boolean>(false);
  const [isSparkyExcited, setIsSparkyExcited] = useState<boolean>(false);

  // Compute level and progress
  const level = Math.floor(xp / 100) + 1;
  const progressInLevel = xp % 100;

  const saveXp = (newXp: number) => {
    setXp(newXp);
    try {
      localStorage.setItem('spellscript_sparky_xp', newXp.toString());
    } catch {
      // ignore
    }
  };

  const handlePetSparky = () => {
    sound.playSuccessChime();
    const newXp = xp + 10;
    saveXp(newXp);
    setPetCount((prev) => prev + 1);
    setIsSparkyExcited(true);
    setTimeout(() => setIsSparkyExcited(false), 1200);

    const petPhrases = [
      "Sparky leans his warm snout into your palm and sneezes a tiny purple heart firework! (+10 XP) 💜",
      "Sparky rolls onto his back happily! 'You're my favorite apprentice in the citadel!' (+10 XP) ✨",
      "Sparky purrs like a cozy laptop cooling fan: 'Purrrr... your syntax is looking sharper every day!' (+10 XP) 🐲",
      "Sparky's wings flutter with joy! 'Warm headpats make my flame breath 20% hotter!' (+10 XP) 🔥",
    ];
    setDialogue(petPhrases[Math.floor(Math.random() * petPhrases.length)]);

    confetti({ disableForReducedMotion: true,
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#F472B6', '#A78BFA', '#5EEAD4', '#FBBF24'],
    });

    if (newXp % 100 < 10) {
      sound.playVictoryFanfare();
    }
  };

  const handleFeedCrystal = () => {
    sound.playCrystalCollect();
    const newXp = xp + 15;
    saveXp(newXp);
    setIsSparkyExcited(true);
    setTimeout(() => setIsSparkyExcited(false), 1200);

    const feedPhrases = [
      "'Crunch crunch! Mana crystals taste like blueberries and clean code!' (+15 XP) 💎",
      "'Gulp! My flame core is supercharged with fresh mana! Let's go conquer Chapter 1!' (+15 XP) ⚡",
      "'Yum! Delicious bytes of pure algorithmic energy!' (+15 XP) 🔮",
    ];
    setDialogue(feedPhrases[Math.floor(Math.random() * feedPhrases.length)]);

    confetti({ disableForReducedMotion: true,
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#5EEAD4', '#8B5CF6', '#38BDF8'],
    });
  };

  const handleNextJoke = () => {
    sound.playClick();
    setCurrentJokeIndex((prev) => (prev + 1) % DEV_JOKES.length);
    setShowPunchline(false);
  };

  if (!isOpen) return null;

  const currentJoke = DEV_JOKES[currentJokeIndex];

  return (
    <Modal open={isOpen} onClose={onClose} title="Meet Sparky" wide>
      <div
        className={`w-full max-w-2xl max-h-[92vh] rounded-3xl border-2 flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden animate-scaleUp transition-colors ${
          isDarkMode
            ? 'bg-[#120C22]/95 border-[#8B5CF6]/50 text-[#FFF7ED] shadow-[0_0_60px_rgba(244,114,182,0.3)]'
            : 'bg-white/95 border-[#DDD6FE] text-[#231238] shadow-2xl'
        }`}
      >
        {/* Title Bar */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#1E1338]/90 border-white/10' : 'bg-[#FDF4FF]/90 border-[#DDD6FE]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>
              🐲
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-pixelify font-black text-lg sm:text-xl tracking-wide">
                  Sparky's Companion Sanctuary
                </h3>
                <span className="text-[10px] font-pixel px-2 py-0.5 rounded-full bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40">
                  FAMILIAR
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-[#DDD6FE]' : 'text-[#6D28D9]'}`}>
                Your personal coding companion & dev mentor
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Sparky Mascot Profile Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 transition-all ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#20133A] via-[#2A184C] to-[#160D2A] border-[#8B5CF6]/40'
                : 'bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border-purple-200'
            }`}
          >
            {/* Dragon Avatar */}
            <div className="relative group shrink-0">
              <div
                className={`w-24 h-24 rounded-2xl flex items-center justify-center text-6xl shadow-xl transition-transform ${
                  isSparkyExcited ? 'scale-110 rotate-6' : 'hover:scale-105'
                } ${isDarkMode ? 'bg-[#120C22] border-2 border-[#F472B6]' : 'bg-white border-2 border-pink-300'}`}
              >
                🐲
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500" />
              </span>
            </div>

            {/* Stats & Progress */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-pixelify font-bold text-xl text-[#F472B6]">Sparky the Ember Drake</span>
                <span className="text-xs font-pixel px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Lv. {level} Companion
                </span>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-code opacity-80">
                  <span>Bonding XP: {xp} total</span>
                  <span>{progressInLevel} / 100 to Lv. {level + 1}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#F472B6] to-[#5EEAD4] transition-all duration-500"
                    style={{ width: `${progressInLevel}%` }}
                  />
                </div>
              </div>

              {/* Interaction Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <button
                  onClick={handlePetSparky}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F472B6] hover:bg-[#F472B6]/90 text-white font-pixel text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Pet Sparky (+10 XP)</span>
                </button>
                <button
                  onClick={handleFeedCrystal}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white font-pixel text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Feed Mana (+15 XP)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sparky's Speech Bubble */}
          <div
            className={`p-4 rounded-2xl border relative flex items-start gap-3 transition-colors ${
              isDarkMode
                ? 'bg-black/30 border-[#8B5CF6]/30 text-[#EDE9FE]'
                : 'bg-purple-50/70 border-purple-200 text-purple-950'
            }`}
          >
            <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-pixel uppercase text-[#F472B6] tracking-wider">
                Sparky whispers:
              </span>
              <p className="text-xs sm:text-sm font-medium leading-relaxed italic">
                "{dialogue}"
              </p>
            </div>
          </div>

          {/* Relatable Dev Humor & BTS Easter Egg Card */}
          <div
            className={`p-5 rounded-2xl border space-y-3 transition-colors ${
              isDarkMode
                ? 'bg-[#180E2E]/90 border-white/10'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span className="font-pixel text-xs font-bold tracking-wider">
                  SPARKY’S RELATABLE DEV WISDOM
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {currentJoke.tag}
                </span>
              </div>

              <button
                onClick={handleNextJoke}
                className="text-xs flex items-center gap-1 font-pixel text-[#5EEAD4] hover:text-[#5EEAD4]/80 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Next Joke</span>
              </button>
            </div>

            <div className="space-y-2 py-1">
              <p className="text-sm font-bold text-base">
                "{currentJoke.joke}"
              </p>

              {showPunchline ? (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm font-semibold text-[#F472B6] animate-fadeIn">
                  {currentJoke.punchline}
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowPunchline(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-dashed border-[#8B5CF6]/50 text-xs font-bold text-[#A78BFA] hover:text-white hover:bg-[#8B5CF6]/20 transition-all cursor-pointer"
                >
                  👀 Click to reveal punchline...
                </button>
              )}
            </div>
          </div>

          {/* Quick Launch Quests with Sparky */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-pixel uppercase opacity-75 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Quests with Sparky</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playVictoryFanfare();
                  onClose();
                  onOpenQuest(1);
                }}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.02] cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/20'
                    : 'bg-purple-50/50 border-purple-200 hover:border-purple-400 hover:bg-purple-100/60'
                }`}
              >
                <div>
                  <div className="text-[10px] font-pixel text-[#5EEAD4]">CHAPTER 1</div>
                  <div className="font-bold text-xs">Dragon Movement Practice</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#F472B6]" />
              </button>

              <button
                onClick={() => {
                  sound.playVictoryFanfare();
                  onClose();
                  onOpenQuest(8);
                }}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:scale-[1.02] cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-[#F472B6] hover:bg-[#F472B6]/20'
                    : 'bg-pink-50/50 border-pink-200 hover:border-pink-400 hover:bg-pink-100/60'
                }`}
              >
                <div>
                  <div className="text-[10px] font-pixel text-rose-400">CHAPTER 8</div>
                  <div className="font-bold text-xs">Glitch Chimera Boss Arena</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#F472B6]" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#1E1338]/90 border-white/10' : 'bg-[#FDF4FF]/90 border-[#DDD6FE]'
          }`}
        >
          <span className="text-[11px] opacity-75 font-mono">
            🐲 Sparky has received {petCount} headpats today!
          </span>

          <button
            onClick={() => {
              sound.playVictoryFanfare();
              onClose();
              onOpenQuest(1);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#9B6DF7] text-white font-pixel font-bold text-xs uppercase border-2 border-[#6D28D9] shadow-[0_3px_0_#4C1D95] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Play Chapter 1 with Sparky</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
