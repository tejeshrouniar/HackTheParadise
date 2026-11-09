import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Wand2,
  Code2,
  Play,
  HelpCircle,
  CheckCircle2,
  Repeat,
  Compass,
  FlaskConical,
  ShieldAlert,
} from 'lucide-react';
import { sound } from '../../utils/sound';

export interface NewUserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuest?: () => void;
}

export const NewUserGuideModal: React.FC<NewUserGuideModalProps> = ({
  isOpen,
  onClose,
  onStartQuest,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Storicode Academy',
      subtitle: 'Where Every Line of Code Casts a Magical Spell',
      badge: 'Step 1 of 4: The Core Concept',
      icon: '🪄',
      color: 'border-spellPink text-spellPink',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-moonCream/90 leading-relaxed">
            Welcome, young apprentice! In this magical academy, programming isn't about boring syntax on plain screens. Here, logic is an enchanted superpower:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-pink-950/50 border border-spellPink/30">
              <span className="font-fantasy font-bold text-spellPink flex items-center gap-1.5 mb-1">
                <FlaskConical className="w-3.5 h-3.5" /> Variables = Magic Bottles
              </span>
              <p className="text-moonCream/70">
                Store mana, numbers, and secret potion ingredients inside labeled crystal flasks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/50 border border-manaMint/30">
              <span className="font-fantasy font-bold text-manaMint flex items-center gap-1.5 mb-1">
                <Repeat className="w-3.5 h-3.5" /> Loops = Repeating Chants
              </span>
              <p className="text-moonCream/70">
                Repeat an incantation <code className="text-manaMint">N times</code> to multiply blooms or starry crystals effortlessly.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/50 border border-magic/30">
              <span className="font-fantasy font-bold text-magic-light flex items-center gap-1.5 mb-1">
                <Wand2 className="w-3.5 h-3.5" /> Functions = Reusable Spells
              </span>
              <p className="text-moonCream/70">
                Write a spell once and summon its name whenever you need to build bridges or grow forests.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-red-950/50 border border-cursedRed/30">
              <span className="font-fantasy font-bold text-cursedRed flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Debugging = Breaking Curses
              </span>
              <p className="text-moonCream/70">
                Fix corrupted lines of code to shatter the dark chains sealing dungeon gates.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Inscribe Your Spell: "Type Code Here"',
      subtitle: 'Two Ways to Code: Snap Magic Blocks OR Type Real Python',
      badge: 'Step 2 of 4: Writing Logic',
      icon: '✍️',
      color: 'border-magic text-magic-light',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-moonCream/90 leading-relaxed">
            In the Spell Lab, you can assemble logic in whatever way feels most comfortable:
          </p>

          <div className="p-4 rounded-2xl bg-night-950/80 border-2 border-magic/40 shadow-inner space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-fantasy font-bold text-xs text-moonCream flex items-center gap-2">
                <span>📜</span> The Spell Parchment
              </span>
              <span className="text-[11px] font-code text-spellPink font-bold">
                "type code here"
              </span>
            </div>

            <div className="p-3 rounded-xl bg-night-900/90 border border-white/10 font-code text-xs text-manaMint space-y-1">
              <div className="text-moonCream/40 italic"># 🪄 "type code here" — Write your instructions:</div>
              <div className="text-spellPink">dragon.move_forward()</div>
              <div className="text-spellPink">dragon.turn_right()</div>
              <div className="text-runeAmber">for bloom in range(6):</div>
              <div className="pl-4 text-moonCream">grow_flower(color="lotus")</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-moonCream/80">
                <span className="text-base">🧱</span>
                <span><strong>Blocks Mode:</strong> Drag & snap commands visually.</span>
              </div>
              <div className="flex items-center gap-2 text-moonCream/80">
                <span className="text-base">⌨️</span>
                <span><strong>Type Code Mode:</strong> Type directly or use quick-insert chips!</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Cast Spell & Watch the World React',
      subtitle: 'Instant Cause-and-Effect Visual Feedback',
      badge: 'Step 3 of 4: The Magic Engine',
      icon: '✨',
      color: 'border-manaMint text-manaMint',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-moonCream/90 leading-relaxed">
            Pressing <strong className="text-moonCream">✨ Cast Spell</strong> awakens your program. The Code-to-Magic engine interprets your instructions line-by-line:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-night-950/70 border border-manaMint/30 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-manaMint/20 text-manaMint">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <strong className="text-moonCream">Step-by-Step Highlighting:</strong>
                <p className="text-moonCream/70 mt-0.5">
                  Each instruction lights up with a glowing golden border as it triggers an action in the world.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-night-950/70 border border-spellPink/30 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-spellPink/20 text-spellPink">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-moonCream">Live Animated Simulation:</strong>
                <p className="text-moonCream/70 mt-0.5">
                  Sparky steps across the grid, flowers burst with upward chimes, cauldrons boil with color, and starlight bridges assemble!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-night-950/70 border border-runeAmber/30 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-runeAmber/20 text-runeAmber">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-moonCream">Control the Flow:</strong>
                <p className="text-moonCream/70 mt-0.5">
                  Use the <strong>1x / 2x / 4x Speed Multiplier</strong> to accelerate spells, or click <strong>Reset</strong> to start fresh anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Breaking Curses with Archmage Lumina',
      subtitle: 'Friendly AI Guidance & Helpful Diagnostics',
      badge: 'Step 4 of 4: Debugging Mentor',
      icon: '🧙‍♀️',
      color: 'border-runeAmber text-runeAmber',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-moonCream/90 leading-relaxed">
            Mistakes are part of every wizard's journey! If your spell hits a wall or has an error, you won't see a cryptic machine crash:
          </p>

          <div className="p-4 rounded-2xl bg-night-950/80 border border-runeAmber/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-magic to-spellPink flex items-center justify-center text-lg">
                🧙‍♀️
              </div>
              <div>
                <div className="font-fantasy font-bold text-xs text-moonCream">Archmage Lumina</div>
                <div className="text-[10px] text-manaMint">Logic Mentor & Curse Breaker</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/60 border border-magic/30 text-xs text-moonCream/90 space-y-2">
              <div className="flex items-center gap-1.5 text-spellPink font-bold">
                <HelpCircle className="w-3.5 h-3.5" /> 3 Progressive Hint Tiers:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-moonCream/80 text-[11px]">
                <li><strong>Hint 1:</strong> A gentle nudge pointing in the right direction.</li>
                <li><strong>Hint 2:</strong> Specific instructions on which line or value to check.</li>
                <li><strong>Hint 3:</strong> The full magical solution to get you back on track!</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    sound.playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      sound.playVictoryFanfare();
      onClose();
      if (onStartQuest) onStartQuest();
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#241a38] via-[#1a1329] to-[#0f0b18] border-2 border-magic/60 rounded-3xl shadow-magic-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-magic/30 bg-night-900/90">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{step.icon}</span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-spellPink font-fantasy">
                {step.badge}
              </span>
              <h3 className="font-fantasy font-bold text-lg text-moonCream leading-tight">
                {step.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-moonCream/60 hover:text-moonCream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="px-6 pt-3 pb-1 flex items-center gap-2 bg-night-950/40">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sound.playClick();
                setCurrentStep(idx);
              }}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-gradient-to-r from-magic to-spellPink'
                  : idx < currentStep
                  ? 'bg-manaMint/60'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Main Step Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="text-xs font-fantasy font-semibold text-magic-light mb-3">
            {step.subtitle}
          </div>
          {step.content}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-magic/20 bg-night-900/90 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-moonCream/70 hover:text-moonCream disabled:opacity-20 text-xs font-fantasy font-bold flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="text-xs font-code text-moonCream/50">
            {currentStep + 1} / {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-magic to-spellPink text-night-950 font-fantasy font-bold text-xs shadow-magic hover:opacity-95 transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <span>{currentStep === steps.length - 1 ? 'Begin Magic 🪄' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

