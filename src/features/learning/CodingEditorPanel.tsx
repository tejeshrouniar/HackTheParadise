import { Check, Copy, HelpCircle, Play, RotateCcw, Square } from "lucide-react";
import { useRef, type RefObject, type ReactNode } from "react";
import { SparkUnlock } from "./SparkUnlock";

export interface CodingEditorError {
  lineIndex: number;
  message: string;
  suggestion: string;
}

interface CodingEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onReset: () => void;
  onCopy: () => void;
  onGuide?: () => void;
  onStop?: () => void;
  onSolutionUse: (code: string) => void;
  sparkBookId?: string;
  sparkLessonId: number;
  isRunning: boolean;
  canRun?: boolean;
  runLabel?: string;
  copied?: boolean;
  activeLine?: number | null;
  error?: CodingEditorError | null;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  consoleLogs: string[];
  children?: ReactNode;
}

/** Shared editor, paid hint/solution unlocks, and console for every coding book. */
export function CodingEditorPanel({
  code,
  onCodeChange,
  onRun,
  onReset,
  onCopy,
  onGuide,
  onStop,
  onSolutionUse,
  sparkBookId = "cinder",
  sparkLessonId,
  isRunning,
  canRun = true,
  runLabel = "Run spell",
  copied = false,
  activeLine = null,
  error = null,
  textareaRef,
  consoleLogs,
  children,
}: CodingEditorPanelProps) {
  const lines = code.split("\n");
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sc-grimoire-editor-page">
    <section className="sc-card sc-spell-editor" aria-label="Code editor">
      <header>
        <h2>Spell weaving</h2>
        <button type="button" className="sc-cast-button" onClick={onRun} disabled={isRunning || !canRun}>
          <Play size={14} /> {isRunning ? "Casting…" : "Cast spell (Run)"}
        </button>
      </header>
      <div className="sc-editor-meta"><span>PYTHON · YOUR SPELL</span><div>
        <button type="button" onClick={onCopy} aria-label={copied ? "Code copied" : "Copy code"}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
        <button type="button" aria-label="Reset code and scene" disabled={isRunning} onClick={onReset}><RotateCcw size={14} /></button>
      </div></div>
      <div className="sc-code-input sc-highlight-editor">
        <div className="sc-code-gutter" aria-hidden="true"><div className="sc-code-lines" ref={gutterRef}>
          {Array.from({ length: Math.max(12, lines.length) }, (_, index) => <div key={index} className={error?.lineIndex === index ? "error" : activeLine === index ? "active" : ""}>{index + 1}</div>)}
        </div></div>
        <div className="sc-code-surface">
          <pre className="sc-code-highlight" ref={highlightRef} aria-hidden="true">{lines.map((line, index) => <code key={index} className={error?.lineIndex === index ? "error" : activeLine === index ? "active" : ""}>{colorLine(line)}{"\n"}</code>)}</pre>
          <textarea aria-label="Quest code editor" aria-describedby="sc-editor-shortcut" ref={textareaRef}
            maxLength={20000} value={code} readOnly={isRunning}
            onChange={(event) => onCodeChange(event.target.value)}
            onScroll={(event) => {
              if (highlightRef.current) highlightRef.current.style.transform = 'translate(' + -event.currentTarget.scrollLeft + 'px,' + -event.currentTarget.scrollTop + 'px)';
              if (gutterRef.current) gutterRef.current.style.transform = 'translateY(' + -event.currentTarget.scrollTop + 'px)';
            }}
            onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); if (!isRunning && canRun) onRun(); } }}
            spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" />
        </div>
      </div>
      {error && <div className="sc-code-error" role="alert"><strong>Line {error.lineIndex + 1}: {error.message}</strong><p>{error.suggestion}</p></div>}
      <div className="sc-editor-footer"><small id="sc-editor-shortcut">Ctrl / ⌘ + Enter to cast</small>
        {isRunning && onStop && <button type="button" onClick={onStop}><Square size={12} /> Stop spell</button>}
        {onGuide && <button type="button" onClick={onGuide}><HelpCircle size={14} /> Quest guide</button>}
      </div>
    </section>
    <section className="sc-grimoire-help" aria-label="Hints and solutions">
      <header><h2>Hints & solutions</h2><span>YOUR FIELD NOTES</span></header>
      {children}
      <details className="sc-quest-disclosure"><summary>Reveal hint <small>10 Sparks</small></summary><SparkUnlock bookId={sparkBookId} id={sparkLessonId} kind="hint" /></details>
      <details className="sc-quest-disclosure"><summary>Reveal solution <small>20 Sparks</small></summary><SparkUnlock bookId={sparkBookId} id={sparkLessonId} kind="solution" onUse={onSolutionUse} /></details>
    </section>
    </div>
  );
}

// Syntax colour is presentation only. Tokens render as escaped React text;
// learner code is still executed exclusively by each book's bounded runner.
function colorLine(line: string) {
  const tokens = line.split(/(#[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:def|return|for|in|if|else|elif|and|or|not|True|False|None|while|break)\b|\b\d+(?:\.\d+)?\b)/g);
  return tokens.map((token, index) => <span key={index} className={token.startsWith("#") ? "token-comment" : /^["']/.test(token) ? "token-string" : /^\d/.test(token) ? "token-number" : /^(def|return|for|in|if|else|elif|and|or|not|True|False|None|while|break)$/.test(token) ? "token-keyword" : undefined}>{token}</span>);
}
