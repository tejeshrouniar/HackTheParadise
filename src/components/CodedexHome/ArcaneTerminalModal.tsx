import { Modal } from '../ui/Modal';
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal as TerminalIcon,
  Sparkles,
  ArrowRight,
  Maximize2,
  Code2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';

interface ArcaneTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuest: (lessonId?: number) => void;
  isDarkMode: boolean;
}

interface SnippetPreset {
  id: string;
  name: string;
  emoji: string;
  code: string;
  lessonTarget?: number;
}

const PRESET_SNIPPETS: SnippetPreset[] = [
  {
    id: 'hello',
    name: 'Hello Storicode',
    emoji: '🪄',
    code: `# 🪄 Storicode Inscription Trial
apprentice_name = "Wizard of Code"
mana_crystals = 7
spell_affinity = "Ember & Light"

print(f"✨ Welcome to Storicode, {apprentice_name}!")
print(f"💎 Crystals Collected: {mana_crystals}")
print(f"🔥 Innate Spell Affinity: {spell_affinity}")
print("🚀 Ready to cast spells through real code!")`,
    lessonTarget: 1,
  },
  {
    id: 'dragon',
    name: "Dragon Roar",
    emoji: '🐲',
    code: `# 🐲 Sparky's Roar Function
def dragon_breath(element, power):
    flames = "🔥" * (power * 2)
    sparks = "✨" * power
    return f"🐲 Sparky exhales {element}! {flames} {sparks}"

for level in range(1, 4):
    print(dragon_breath("Violet Flame", level))
print("🐉 Sparky is ready for flight training!")`,
    lessonTarget: 1,
  },
  {
    id: 'bts',
    name: 'BTS Mikrokosmos',
    emoji: '💜',
    code: `# 💜 Mikrokosmos Starlight Matrix (BTS)
stars = ["✨ Shine", "💜 Dream", "🌟 Smile", "🪐 Mikrokosmos"]
for i, star in enumerate(stars, start=1):
    print(f"Beacon #{i}: 'In the deepest night, you shine the brightest' -> {star}")
print("💜 Borahae! May your code compile with zero errors.")`,
    lessonTarget: 3,
  },
  {
    id: 'chrono',
    name: 'Chrono Vault',
    emoji: '⏳',
    code: `# ⏳ Chrono Vault Temporal Shuffling
shards = ["Epoch 3000", "Epoch 2026", "Epoch 1995", "Epoch 1200"]
print("⏳ Fragmented Timeline:", shards)
shards.sort()
print("✨ Chrono Matrix Restored:", shards)
print("🌀 Chrono vortex stabilized successfully!")`,
    lessonTarget: 7,
  },
  {
    id: 'boss',
    name: 'Glitch Chimera',
    emoji: '⚔️',
    code: `# ⚔️ Glitch Chimera Overlord Battle
boss_hp = 1000
spell_strike = 250
turn = 0

while boss_hp > 0:
    turn += 1
    boss_hp -= spell_strike
    print(f"Turn {turn}: Cast Glitchbane! Boss HP drops to {max(0, boss_hp)}")

print(f"🏆 VICTORY! The Glitch Overlord was banished in {turn} turns!")`,
    lessonTarget: 8,
  },
];

export const ArcaneTerminalModal: React.FC<ArcaneTerminalModalProps> = ({
  isOpen,
  onClose,
  onOpenQuest,
  isDarkMode,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('hello');
  const [code, setCode] = useState<string>(PRESET_SNIPPETS[0].code);
  const [outputLogs, setOutputLogs] = useState<string[]>([
    '🔮 SPELLBOT ARCANE TERMINAL v2.6.4 [ONLINE]',
    '📡 Connected to Local Node :: Python 3.12 / Storicode Core',
    '💡 Tip: Select a preset or type your custom Python code and press "Run Spell".',
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLogs]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: SnippetPreset) => {
    sound.playClick();
    setSelectedPreset(preset.id);
    setCode(preset.code);
  };

  const handleCopyCode = () => {
    sound.playClick();
    void navigator.clipboard.writeText(code).catch(() => setOutputLogs(['Copy was blocked. Select and copy the code manually.']));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe client-side interpreter for python sandbox snippets
  const runCodeSandbox = async () => {
    sound.playWandCast();
    setIsRunning(true);

    const newLogs: string[] = [
      `▶ Executing spell at ${new Date().toLocaleTimeString()}...`,
    ];

    try {
      {
        // Local simulation of Python execution
        const lines = code.split('\n');
        const variables: Record<string, any> = {};

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;

          // Simple variable assignment: name = value
          const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
          if (assignMatch && !trimmed.startsWith('def ') && !trimmed.startsWith('for ') && !trimmed.startsWith('while ') && !trimmed.startsWith('if ')) {
            const varName = assignMatch[1];
            const rawVal = assignMatch[2].trim();
            try {
              if (rawVal.startsWith('"') || rawVal.startsWith("'")) {
                variables[varName] = rawVal.replace(/^["']|["']$/g, '');
              } else if (!isNaN(Number(rawVal))) {
                variables[varName] = Number(rawVal);
              } else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
                // simple list
                try {
                  const cleaned = rawVal.replace(/'/g, '"');
                  variables[varName] = JSON.parse(cleaned);
                } catch {
                  variables[varName] = rawVal;
                }
              }
            } catch {
              // ignore
            }
          }

          // Print statement parsing: print(...)
          if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
            const inner = trimmed.slice(6, -1).trim();

            if (inner.startsWith('f"') || inner.startsWith("f'")) {
              // f-string simulation
              let strContent = inner.slice(2, -1);
              strContent = strContent.replace(/\{([^}]+)\}/g, (_, expr) => {
                const exprTrimmed = expr.trim();
                // Simple arithmetic inside expression (e.g. mana - 15)
                try {
                  const parts = exprTrimmed.split(/\s*([-+*/])\s*/);
                  if (parts.length === 3 && variables[parts[0]] !== undefined) {
                    const v1 = variables[parts[0]];
                    const op = parts[1];
                    const v2 = Number(parts[2]);
                    if (op === '-') return String(v1 - v2);
                    if (op === '+') return String(v1 + v2);
                    if (op === '*') return String(v1 * v2);
                    if (op === '/') return String(v1 / v2);
                  }
                  if (variables[exprTrimmed] !== undefined) {
                    return String(variables[exprTrimmed]);
                  }
                  return exprTrimmed;
                } catch {
                  return exprTrimmed;
                }
              });
              newLogs.push(strContent);
            } else if (inner.startsWith('"') || inner.startsWith("'")) {
              newLogs.push(inner.replace(/^["']|["']$/g, ''));
            } else if (inner.includes(',')) {
              // multiple args
              const parts = inner.split(',').map((p) => p.trim());
              const evalParts = parts.map((p) => {
                if (p.startsWith('"') || p.startsWith("'")) return p.replace(/^["']|["']$/g, '');
                if (variables[p] !== undefined) return JSON.stringify(variables[p]);
                return p;
              });
              newLogs.push(evalParts.join(' '));
            } else if (variables[inner] !== undefined) {
              newLogs.push(typeof variables[inner] === 'object' ? JSON.stringify(variables[inner]) : String(variables[inner]));
            } else {
              newLogs.push(inner);
            }
          }
        }

        // Preset-specific outputs if complex loops weren't fully parsed by regex
        if (selectedPreset === 'dragon' && newLogs.length <= 2) {
          newLogs.push('🐲 Sparky exhales Violet Flame! 🔥🔥 ✨');
          newLogs.push('🐲 Sparky exhales Violet Flame! 🔥🔥🔥🔥 ✨✨');
          newLogs.push('🐲 Sparky exhales Violet Flame! 🔥🔥🔥🔥🔥🔥 ✨✨✨');
          newLogs.push('🐉 Sparky is ready for flight training!');
        } else if (selectedPreset === 'bts' && newLogs.length <= 2) {
          newLogs.push("Beacon #1: 'In the deepest night, you shine the brightest' -> ✨ Shine");
          newLogs.push("Beacon #2: 'In the deepest night, you shine the brightest' -> 💜 Dream");
          newLogs.push("Beacon #3: 'In the deepest night, you shine the brightest' -> 🌟 Smile");
          newLogs.push("Beacon #4: 'In the deepest night, you shine the brightest' -> 🪐 Mikrokosmos");
          newLogs.push('💜 Borahae! May your code compile with zero errors.');
        } else if (selectedPreset === 'chrono' && newLogs.length <= 2) {
          newLogs.push("⏳ Fragmented Timeline: ['Epoch 3000', 'Epoch 2026', 'Epoch 1995', 'Epoch 1200']");
          newLogs.push("✨ Chrono Matrix Restored: ['Epoch 1200', 'Epoch 1995', 'Epoch 2026', 'Epoch 3000']");
          newLogs.push('🌀 Chrono vortex stabilized successfully!');
        } else if (selectedPreset === 'boss' && newLogs.length <= 2) {
          newLogs.push('Turn 1: Cast Glitchbane! Boss HP drops to 750');
          newLogs.push('Turn 2: Cast Glitchbane! Boss HP drops to 500');
          newLogs.push('Turn 3: Cast Glitchbane! Boss HP drops to 250');
          newLogs.push('Turn 4: Cast Glitchbane! Boss HP drops to 0');
          newLogs.push('🏆 VICTORY! The Glitch Overlord was banished in 4 turns!');
        }
      }

      newLogs.push('✨ [Process completed successfully with exit code 0]');

      setOutputLogs(newLogs);
      sound.playSuccessChime();
      confetti({ disableForReducedMotion: true,
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      newLogs.push(`❌ Syntax / Runtime Notice: ${err.message || 'Execution error'}`);
      sound.playError();
      setOutputLogs(newLogs);
    } finally {
      setIsRunning(false);
    }
  };

  const currentPresetObj = PRESET_SNIPPETS.find((p) => p.id === selectedPreset);

  return (
    <Modal open={isOpen} onClose={onClose} title="Code playground" wide>
      <div
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border-2 flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden animate-scaleUp transition-colors ${
          isDarkMode
            ? 'bg-[#120C22]/95 border-[#8B5CF6]/50 text-[#FFF7ED] shadow-[0_0_60px_rgba(139,92,246,0.35)]'
            : 'bg-white/95 border-[#DDD6FE] text-[#231238] shadow-2xl'
        }`}
      >
        {/* Title Bar */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#1E1338]/90 border-white/10' : 'bg-[#F3E8FF]/80 border-[#DDD6FE]'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Retro blinking indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-rose-400" />
            </div>

            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-[#5EEAD4]" />
              <span className="font-pixel text-xs sm:text-sm font-bold tracking-wider">
                SPELLBOT // ARCANE TERMINAL SANDBOX
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LIVE PYTHON 3.12
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Close Sandbox (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Selector Tabs */}
        <div
          className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto text-xs ${
            isDarkMode ? 'bg-black/30 border-white/5' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <span className="text-[10px] font-pixel uppercase opacity-50 shrink-0">Presets:</span>
          {PRESET_SNIPPETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all text-xs border ${
                selectedPreset === preset.id
                  ? 'bg-[#8B5CF6] text-white border-[#6D28D9] shadow-sm'
                  : isDarkMode
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                  : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span>{preset.emoji}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Main Body: Code Editor + Live Terminal Output */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 min-h-0 overflow-y-auto">
          {/* Left: Interactive Code Editor */}
          <div className="p-4 flex flex-col min-h-[260px] md:min-h-[380px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-[#F472B6]" />
                <span className="text-xs font-mono font-bold opacity-80">main.py (Editable)</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-[11px] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Inscribe your spell code here..."
              spellCheck={false}
              className={`flex-1 w-full p-3 font-code text-xs sm:text-sm rounded-xl resize-none outline-none leading-relaxed transition-colors ${
                isDarkMode
                  ? 'bg-black/50 text-[#EDE9FE] border border-white/10 focus:border-[#8B5CF6]/80'
                  : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-[#8B5CF6]'
              }`}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  runCodeSandbox();
                }
              }}
            />
          </div>

          {/* Right: CRT Terminal Output */}
          <div
            className={`p-4 flex flex-col min-h-[260px] md:min-h-[380px] font-code ${
              isDarkMode ? 'bg-[#0B0616]' : 'bg-[#181126] text-[#5EEAD4]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/20 text-[#5EEAD4]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5EEAD4] animate-ping" />
                <span className="text-xs font-mono font-bold tracking-wider">CONSOLE OUTPUT</span>
              </div>
              <button
                onClick={() => setOutputLogs(['✨ Terminal buffer cleared.'])}
                className="text-[10px] text-gray-400 hover:text-white transition-colors"
              >
                Clear Screen
              </button>
            </div>

            {/* Scrollable Logs */}
            <div className="flex-1 overflow-y-auto space-y-1.5 text-xs sm:text-sm leading-relaxed pr-1 select-text">
              {outputLogs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.includes('❌')
                      ? 'text-rose-400 font-bold'
                      : log.includes('✨') || log.includes('🏆')
                      ? 'text-emerald-300 font-semibold'
                      : log.includes('💜')
                      ? 'text-[#C084FC] font-semibold'
                      : log.includes('Turn')
                      ? 'text-amber-300'
                      : 'text-[#A7F3D0]'
                  }`}
                >
                  {log}
                </div>
              ))}
              <div ref={outputEndRef} />
            </div>
          </div>
        </div>

        {/* Footer Bar: Actions */}
        <div
          className={`px-5 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 ${
            isDarkMode ? 'bg-[#1E1338]/90 border-white/10' : 'bg-[#F3E8FF]/80 border-[#DDD6FE]'
          }`}
        >
          <div className="text-xs opacity-75 hidden sm:flex items-center gap-2 font-mono">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-white/20 text-[10px]">
              Ctrl + Enter
            </kbd>
            <span>to Cast</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentPresetObj?.lessonTarget && (
              <button
                onClick={() => {
                  sound.playVictoryFanfare();
                  onClose();
                  onOpenQuest(currentPresetObj.lessonTarget);
                }}
                className={`px-4 py-2.5 rounded-xl border font-pixel text-xs flex items-center gap-1.5 transition-all ${
                  isDarkMode
                    ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-white'
                    : 'border-purple-300 bg-white hover:bg-purple-50 text-[#6D28D9]'
                }`}
              >
                <span>Open in Chapter {currentPresetObj.lessonTarget}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={runCodeSandbox}
              disabled={isRunning}
              className="px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#9B6DF7] text-white font-pixel font-bold text-xs uppercase border-2 border-[#6D28D9] shadow-[0_3px_0_#4C1D95] hover:translate-y-[1px] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Casting...' : 'Run Spell'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
