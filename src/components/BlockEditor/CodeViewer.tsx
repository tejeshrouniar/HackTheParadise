import React from 'react';
import { SpellBlock } from '../../types';
import { Code2, Copy, Check } from 'lucide-react';

export interface CodeViewerProps {
  blocks: SpellBlock[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ blocks }) => {
  const [copied, setCopied] = React.useState(false);

  // Convert blocks to readable Python / Storicode code
  const generateCode = (blockList: SpellBlock[], indentLevel = 0): string => {
    const indent = '    '.repeat(indentLevel);
    const lines: string[] = [];

    blockList.forEach((b) => {
      switch (b.type) {
        case 'MOVE_FORWARD':
          lines.push(`${indent}dragon.move_forward()`);
          break;
        case 'TURN_LEFT':
          lines.push(`${indent}dragon.turn_left()`);
          break;
        case 'TURN_RIGHT':
          lines.push(`${indent}dragon.turn_right()`);
          break;
        case 'COLLECT_CRYSTAL':
          lines.push(`${indent}dragon.collect_crystal()`);
          break;
        case 'GROW_FLOWER':
          lines.push(`${indent}grow_flower(color="${b.params.color || 'enchanted'}")`);
          break;
        case 'BUILD_BRIDGE':
          lines.push(`${indent}place_starlight_tile()`);
          break;
        case 'REPEAT_N': {
          const count = b.params.count ?? 5;
          lines.push(`${indent}for step in range(${count}):`);
          if (b.children && b.children.length > 0) {
            lines.push(generateCode(b.children, indentLevel + 1));
          } else {
            lines.push(`${indent}    pass  # empty spell loop`);
          }
          break;
        }
        case 'SET_VARIABLE':
          lines.push(`${indent}${b.params.variableName || 'mana'} = ${JSON.stringify(b.params.variableValue ?? 100)}`);
          break;
        case 'BREW_POTION':
          lines.push(`${indent}cauldron.brew_elixir()`);
          break;
        case 'DEFINE_FUNCTION': {
          const name = b.params.functionName || 'cast_spell';
          lines.push(`${indent}def ${name}():`);
          if (b.children && b.children.length > 0) {
            lines.push(generateCode(b.children, indentLevel + 1));
          } else {
            lines.push(`${indent}    pass  # function body`);
          }
          break;
        }
        case 'CALL_FUNCTION': {
          const name = b.params.functionName || 'cast_spell';
          lines.push(`${indent}${name}()`);
          break;
        }
        case 'PURIFY_RUNE':
          lines.push(`${indent}purify_rune(id=${b.params.targetRune ?? 1})`);
          break;
        case 'CAST_SPELL':
          lines.push(`${indent}cast_spell("${b.params.spellName || 'Starlight Bolt'}")`);
          break;
        default:
          lines.push(`${indent}# spell.${b.type}()`);
      }
    });

    return lines.join('\n');
  };

  const codeText = blocks.length > 0
    ? `# ✨ Storicode Python Translation ✨\n${generateCode(blocks)}`
    : '# Your spell parchment is empty.\n# Inscribe instructions to begin.';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-night-950/90 border border-magic/40 rounded-2xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-manaMint" />
          <span className="font-fantasy font-bold text-xs text-moonCream">Python Syntax View</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-magic-light hover:text-moonCream px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-manaMint" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy Code
            </>
          )}
        </button>
      </div>

      <pre className="flex-1 bg-night-900/80 p-3.5 rounded-xl border border-white/5 font-code text-xs text-manaMint overflow-auto leading-relaxed shadow-inner">
        <code>{codeText}</code>
      </pre>

      <div className="mt-2 text-[10px] text-moonCream/50 flex items-center justify-between">
        <span>Storicode Code Interpreter v1.0</span>
        <span className="text-magic-light">Safe Sandboxed Sandbox</span>
      </div>
    </div>
  );
};

