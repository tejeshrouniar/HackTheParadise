import React, { useState, useEffect, useRef } from 'react';
import { SpellBlock, BlockType, QuestLevel } from '../../types';
import { Code2, Play, RotateCcw, Copy, Check, Sparkles, Terminal, Plus } from 'lucide-react';
import { sound } from '../../utils/sound';

export interface InteractiveCodeEditorProps {
  initialBlocks: SpellBlock[];
  onApplyCode: (blocks: SpellBlock[]) => void;
  onExecuteNow: () => void;
  isExecuting?: boolean;
  allowedTypes?: BlockType[];
  currentLevel: QuestLevel;
}

export const InteractiveCodeEditor: React.FC<InteractiveCodeEditorProps> = ({
  initialBlocks,
  onApplyCode,
  onExecuteNow,
  isExecuting,
  allowedTypes,
  currentLevel,
}) => {
  // Generate initial code string from blocks
  const blocksToCode = (blocksList: SpellBlock[], indent = 0): string => {
    const spaces = '    '.repeat(indent);
    const lines: string[] = [];

    blocksList.forEach((b) => {
      switch (b.type) {
        case 'MOVE_FORWARD':
          lines.push(`${spaces}dragon.move_forward()`);
          break;
        case 'TURN_LEFT':
          lines.push(`${spaces}dragon.turn_left()`);
          break;
        case 'TURN_RIGHT':
          lines.push(`${spaces}dragon.turn_right()`);
          break;
        case 'COLLECT_CRYSTAL':
          lines.push(`${spaces}dragon.collect_crystal()`);
          break;
        case 'GROW_FLOWER':
          lines.push(`${spaces}grow_flower(color="${b.params.color || 'lotus'}")`);
          break;
        case 'BUILD_BRIDGE':
          lines.push(`${spaces}place_starlight_tile()`);
          break;
        case 'REPEAT_N': {
          const count = b.params.count ?? 5;
          lines.push(`${spaces}for step in range(${count}):`);
          if (b.children && b.children.length > 0) {
            lines.push(blocksToCode(b.children, indent + 1));
          } else {
            lines.push(`${spaces}    pass`);
          }
          break;
        }
        case 'SET_VARIABLE':
          lines.push(`${spaces}${b.params.variableName || 'mana'} = ${JSON.stringify(b.params.variableValue ?? 100)}`);
          break;
        case 'BREW_POTION':
          lines.push(`${spaces}cauldron.brew_elixir()`);
          break;
        case 'DEFINE_FUNCTION': {
          const name = b.params.functionName || 'build_bridge';
          lines.push(`${spaces}def ${name}():`);
          if (b.children && b.children.length > 0) {
            lines.push(blocksToCode(b.children, indent + 1));
          } else {
            lines.push(`${spaces}    pass`);
          }
          break;
        }
        case 'CALL_FUNCTION': {
          const name = b.params.functionName || 'build_bridge';
          lines.push(`${spaces}${name}()`);
          break;
        }
        case 'PURIFY_RUNE':
          lines.push(`${spaces}purify_rune(id=${b.params.targetRune ?? 1})`);
          break;
        case 'CAST_SPELL':
          lines.push(`${spaces}cast_spell("${b.params.spellName || 'Starlight Bolt'}")`);
          break;
        default:
          lines.push(`${spaces}# ${b.type}`);
      }
    });

    return lines.join('\n');
  };

  const [code, setCode] = useState<string>(() => {
    const starter = blocksToCode(initialBlocks);
    return starter;
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [parseNotice, setParseNotice] = useState<string>('Valid code ready to cast.');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync code whenever initialBlocks prop changes (e.g. user switched level)
  useEffect(() => {
    setCode(blocksToCode(initialBlocks));
  }, [initialBlocks]);

  // Parser: converts user typed lines back into executable SpellBlocks
  const parseCodeToBlocks = (codeText: string): SpellBlock[] => {
    const rawLines = codeText.split('\n');
    const rootBlocks: SpellBlock[] = [];
    let currentContainer: SpellBlock | null = null;

    rawLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return; // ignore comments & empties

      const isIndented = line.startsWith('    ') || line.startsWith('\t');

      // Check REPEAT loop header
      const loopMatch = trimmed.match(/^for\s+\w+\s+in\s+range\((\d+)\):/);
      if (loopMatch) {
        const count = parseInt(loopMatch[1]) || 5;
        const loopBlock: SpellBlock = {
          id: `typed-loop-${idx}`,
          type: 'REPEAT_N',
          params: { count },
          children: [],
        };
        rootBlocks.push(loopBlock);
        currentContainer = loopBlock;
        return;
      }

      // Check FUNCTION def header
      const funcMatch = trimmed.match(/^def\s+(\w+)\(\):/);
      if (funcMatch) {
        const funcBlock: SpellBlock = {
          id: `typed-func-${idx}`,
          type: 'DEFINE_FUNCTION',
          params: { functionName: funcMatch[1] },
          children: [],
        };
        rootBlocks.push(funcBlock);
        currentContainer = funcBlock;
        return;
      }

      // Check Variable assignment: var = val
      const varMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (varMatch && !trimmed.startsWith('def') && !trimmed.startsWith('for')) {
        const varName = varMatch[1];
        let val: any = varMatch[2].replace(/['"]/g, '');
        if (!isNaN(Number(val))) val = Number(val);

        const varBlock: SpellBlock = {
          id: `typed-var-${idx}`,
          type: 'SET_VARIABLE',
          params: { variableName: varName, variableValue: val },
        };
        if (isIndented && currentContainer && currentContainer.children) {
          currentContainer.children.push(varBlock);
        } else {
          currentContainer = null;
          rootBlocks.push(varBlock);
        }
        return;
      }

      // Single action blocks
      let actionType: BlockType | null = null;
      let params: Record<string, any> = {};

      if (trimmed.includes('move_forward')) {
        actionType = 'MOVE_FORWARD';
      } else if (trimmed.includes('turn_right')) {
        actionType = 'TURN_RIGHT';
      } else if (trimmed.includes('turn_left')) {
        actionType = 'TURN_LEFT';
      } else if (trimmed.includes('collect_crystal')) {
        actionType = 'COLLECT_CRYSTAL';
      } else if (trimmed.includes('grow_flower')) {
        actionType = 'GROW_FLOWER';
        params = { color: '#F3A9D4' };
      } else if (trimmed.includes('place_starlight_tile')) {
        actionType = 'BUILD_BRIDGE';
      } else if (trimmed.includes('brew_elixir')) {
        actionType = 'BREW_POTION';
      } else if (trimmed.includes('purify_rune')) {
        actionType = 'PURIFY_RUNE';
        const m = trimmed.match(/id\s*=\s*(\d+)/) || trimmed.match(/\((\d+)\)/);
        params = { targetRune: m ? parseInt(m[1]) : 1 };
      } else if (trimmed.includes('cast_spell')) {
        actionType = 'CAST_SPELL';
        params = { spellName: 'Starlight Bolt' };
      } else if (trimmed.endsWith('()') && !trimmed.startsWith('def')) {
        // Function call
        const name = trimmed.replace('()', '').trim();
        actionType = 'CALL_FUNCTION';
        params = { functionName: name };
      }

      if (actionType) {
        const block: SpellBlock = {
          id: `typed-act-${idx}`,
          type: actionType,
          params,
        };

        if (isIndented && currentContainer && currentContainer.children) {
          currentContainer.children.push(block);
        } else {
          currentContainer = null;
          rootBlocks.push(block);
        }
      }
    });

    return rootBlocks;
  };

  // Handle live code edits
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCode(newText);
    const parsed = parseCodeToBlocks(newText);
    setParseNotice(`Recognized ${parsed.length} executable instructions`);
    onApplyCode(parsed);
  };

  // Quick insert helper
  const handleInsertSnippet = (snippet: string) => {
    sound.playClick();
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode = code.substring(0, start) + snippet + '\n' + code.substring(end);
    setCode(newCode);
    const parsed = parseCodeToBlocks(newCode);
    onApplyCode(parsed);
    // restore focus
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length + 1;
    }, 50);
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetStarter = () => {
    sound.playClick();
    const starter = blocksToCode(initialBlocks);
    setCode(starter);
    onApplyCode(parseCodeToBlocks(starter));
  };

  // Compute line count
  const linesCount = Math.max(12, code.split('\n').length);

  // Quick chips depending on world
  const getQuickChips = () => {
    switch (currentLevel.worldType) {
      case 'dragon-grid':
        return [
          { label: '+ move_forward()', code: 'dragon.move_forward()' },
          { label: '+ turn_right()', code: 'dragon.turn_right()' },
          { label: '+ turn_left()', code: 'dragon.turn_left()' },
          { label: '+ collect_crystal()', code: 'dragon.collect_crystal()' },
          { label: '+ repeat loop', code: 'for step in range(3):\n    dragon.move_forward()' },
        ];
      case 'garden':
        return [
          { label: '+ for step in range(6):', code: 'for step in range(6):\n    grow_flower(color="lotus")' },
          { label: '+ grow_flower()', code: 'grow_flower(color="lotus")' },
        ];
      case 'cauldron':
        return [
          { label: '+ mana_flask = 100', code: 'mana_flask = 100' },
          { label: '+ star_dew = 3', code: 'star_dew = 3' },
          { label: '+ moon_dust = 2', code: 'moon_dust = 2' },
          { label: '+ brew_elixir()', code: 'cauldron.brew_elixir()' },
        ];
      case 'bridge-tower':
        return [
          { label: '+ def build_bridge():', code: 'def build_bridge():\n    for step in range(4):\n        place_starlight_tile()' },
          { label: '+ build_bridge()', code: 'build_bridge()' },
        ];
      case 'dungeon-runes':
        return [
          { label: '+ purify_rune(1)', code: 'purify_rune(id=1)' },
          { label: '+ purify_rune(2)', code: 'purify_rune(id=2)' },
          { label: '+ purify_rune(3)', code: 'purify_rune(id=3)' },
        ];
      default:
        return [
          { label: '+ mana_shield = 100', code: 'mana_shield = 100' },
          { label: '+ cast_spell()', code: 'for i in range(4):\n    cast_spell("Starlight Bolt")' },
          { label: '+ holy_smite()', code: 'holy_smite()' },
        ];
    }
  };

  return (
    <div className="bg-night-950/90 border-2 border-magic/40 rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col h-full space-y-3">
      {/* Header with Quote Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-magic/30">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-manaMint" />
            <span className="font-fantasy font-bold text-sm text-moonCream tracking-wider">
              Storicode Code Editor
            </span>
          </div>
          {/* Exact Quote Highlight */}
          <div className="text-[11px] text-spellPink font-code mt-0.5 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-spellPink animate-spin-slow" />
            <span>"type code here"</span>
            <span className="text-moonCream/50 font-normal">— live interactive spell compiler</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-moonCream/70 hover:text-moonCream px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-manaMint" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy
              </>
            )}
          </button>

          <button
            onClick={handleResetStarter}
            className="flex items-center gap-1 text-[11px] text-moonCream/70 hover:text-moonCream px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Reset code to starter template"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>

          <button
            onClick={() => {
              sound.playWandCast();
              onExecuteNow();
            }}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-magic to-spellPink text-night-950 font-fantasy font-bold text-xs shadow-magic hover:opacity-95 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? 'Casting...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Quick Insert Snippet Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs">
        <span className="text-[10px] text-moonCream/50 font-fantasy uppercase tracking-wider shrink-0 mr-1">
          Quick Inscribe:
        </span>
        {getQuickChips().map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleInsertSnippet(chip.code)}
            className="px-2 py-0.5 rounded-lg bg-magic/20 hover:bg-magic/30 border border-magic/30 text-magic-light hover:text-moonCream text-[11px] font-code shrink-0 transition-all active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Editor Body: Line Numbers + Textarea */}
      <div className="relative flex-1 rounded-2xl bg-night-900/80 border border-white/10 overflow-hidden flex min-h-[300px] shadow-inner">
        {/* Line Numbers Column */}
        <div className="w-10 bg-night-950/80 border-r border-white/5 p-3 select-none text-right font-code text-[11px] text-moonCream/30 space-y-[2px]">
          {Array.from({ length: linesCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          spellCheck={false}
          placeholder={`# 🪄 "type code here" — Inscribe your instructions below\n# Example:\ndragon.move_forward()\ndragon.turn_right()\ndragon.collect_crystal()`}
          className="flex-1 bg-transparent text-manaMint font-code text-xs p-3 focus:outline-none resize-none leading-[18px] selection:bg-magic selection:text-white"
        />
      </div>

      {/* Status Footer */}
      <div className="flex items-center justify-between text-[11px] text-moonCream/60 pt-1">
        <span className="flex items-center gap-1 text-manaMint">
          <Sparkles className="w-3 h-3" /> {parseNotice}
        </span>
        <span className="text-magic-light font-code">
          Press 'Run Code' or switch to Blocks anytime
        </span>
      </div>
    </div>
  );
};

