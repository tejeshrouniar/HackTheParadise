import { Check, Copy, HelpCircle, Play, RotateCcw, Square } from "lucide-react";
import type { RefObject, ReactNode } from "react";
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

  return (
    <section className="sc-card sc-spell-editor" aria-label="Code editor">
      <header>
        <h2>Your spell</h2>
        <div>
          <button type="button" className="sc-icon-button" onClick={onCopy} aria-label={copied ? "Code copied" : "Copy code"}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button type="button" className="sc-icon-button" aria-label="Reset code and scene" disabled={isRunning} onClick={onReset}>
            <RotateCcw size={16} />
          </button>
        </div>
      </header>
      <div className="sc-code-input">
        <div className="sc-code-lines" aria-hidden="true">
          {Array.from({ length: Math.max(12, lines.length) }, (_, index) => (
            <div key={index} className={error?.lineIndex === index ? "error" : activeLine === index ? "active" : ""}>
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          aria-label="Quest code editor"
          ref={textareaRef}
          maxLength={20000}
          value={code}
          readOnly={isRunning}
          onChange={(event) => onCodeChange(event.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="# Write your spell here"
        />
      </div>
      {error && (
        <div className="sc-code-error" role="alert">
          <strong>Line {error.lineIndex + 1}: {error.message}</strong>
          <p>{error.suggestion}</p>
        </div>
      )}
      <div className="sc-spell-actions">
        <button type="button" className="sc-button mint" onClick={onRun} disabled={isRunning || !canRun}>
          <Play size={16} /> {isRunning ? "Checking…" : runLabel}
        </button>
        {isRunning && onStop && (
          <button type="button" className="sc-button secondary" onClick={onStop}>
            <Square size={14} /> Stop
          </button>
        )}
        {onGuide && (
          <button type="button" className="sc-button secondary" onClick={onGuide}>
            <HelpCircle size={16} /> Quest guide
          </button>
        )}
      </div>
      {children}
      <details className="sc-quest-disclosure">
        <summary>Hints and solution</summary>
        <SparkUnlock bookId={sparkBookId} id={sparkLessonId} kind="hint" />
        <details>
          <summary>Show solution</summary>
          <SparkUnlock bookId={sparkBookId} id={sparkLessonId} kind="solution" onUse={onSolutionUse} />
        </details>
      </details>
      <details className="sc-quest-disclosure">
        <summary>Console</summary>
        <pre className="sc-code-log" aria-live="polite">{consoleLogs.join("\n")}</pre>
      </details>
    </section>
  );
}
