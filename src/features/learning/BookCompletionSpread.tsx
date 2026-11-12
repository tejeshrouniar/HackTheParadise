import { Grimoire } from "../library/Grimoire";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { SparkUnlock } from "./SparkUnlock";

type CompletionTheme = "cinder" | "wizarding";

interface BookCompletionSpreadProps {
  theme: CompletionTheme;
  bookId: string;
  bookTitle: string;
  chapterLabel: string;
  title: string;
  outcome: string;
  explanation: string;
  code: string;
  lessonId: number;
  executionSteps: string[];
  scene: ReactNode;
  chapterVideo?: ReactNode;
  onContinue: () => void;
  continueLabel: string;
  canContinue?: boolean;
  onReview?: () => void;
  onSkipAnimation?: () => void;
  onReplayAnimation?: () => void;
  audioSrc?: string;
  autoPlayNarration?: boolean;
  onReadAloud?: () => void;
  speaking?: boolean;
  narrationNotice?: string;
}

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const value = Math.floor(seconds);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
};

/** Shared two-page ending: learning notes stay on the left, the story scene on the right. */
export function BookCompletionSpread({
  theme,
  bookId,
  bookTitle,
  chapterLabel,
  title,
  outcome,
  explanation,
  code,
  lessonId,
  executionSteps,
  scene,
  chapterVideo,
  onContinue,
  continueLabel,
  canContinue = true,
  onReview,
  onSkipAnimation,
  onReplayAnimation,
  audioSrc,
  autoPlayNarration = false,
  onReadAloud,
  speaking = false,
  narrationNotice = "",
}: BookCompletionSpreadProps) {
  const section = useRef<HTMLElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioNotice, setAudioNotice] = useState("");
  const steps = executionSteps.filter((line) => line.trim()).slice(-16);

  useEffect(() => {
    section.current?.focus({ preventScroll: true });
    section.current?.scrollIntoView({ block: "start", behavior: "auto" });
    if (autoPlayNarration && audio.current) {
      void audio.current.play().catch(() => {
        setAudioNotice("Narration did not start automatically. Select Play narration to hear it.");
      });
    }
    return () => audio.current?.pause();
  }, [autoPlayNarration]);

  function toggleAudio() {
    const player = audio.current;
    if (!player) return;
    if (player.paused) {
      if (player.ended) player.currentTime = 0;
      setAudioNotice("");
      void player.play().catch(() => setAudioNotice("Narration could not start. The story text remains available above."));
    } else {
      player.pause();
    }
  }

  return (
    <section
      ref={section}
      tabIndex={-1}
      className={`sc-quest-aftermath sc-completion-page sc-completion-page--${theme}`}
      aria-label={`${bookTitle} chapter complete`}
    >
      <Grimoire className="sc-grimoire--completion" coverColor={theme === "cinder" ? "#9a4d29" : "#70272f"} label={`${bookTitle} completed spell`} pageKey={lessonId} left={
        <article className="sc-completion-page__leaf sc-completion-page__leaf--story">
          <header className="sc-completion-page__heading">
            <span className="sc-eyebrow">{chapterLabel}</span>
            <h1>{title}</h1>
          </header>
          <p className="sc-completion-page__outcome" aria-live="polite">{outcome}</p>

          <section className="sc-completion-page__explanation">
            <h2>How your spell worked</h2>
            <p>{explanation}</p>
          </section>

          <div className="sc-completion-code">
            <section>
              <h2>Your spell</h2>
              <pre><code>{code}</code></pre>
            </section>
            <section>
              <h2>Example solution <small>· 20 sparks</small></h2>
              <SparkUnlock
                bookId={bookId}
                id={lessonId}
                kind="solution"
                onUse={(solution) => void navigator.clipboard?.writeText(solution).catch(() => {})}
              />
            </section>
          </div>

          {steps.length > 0 && (
            <details className="sc-completion-page__steps">
              <summary>Execution steps</summary>
              <ol>{steps.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol>
            </details>
          )}

          <div className="sc-completion-page__narration">
            {audioSrc ? (
              <div className="sc-book-audio" aria-label="Chapter narration player">
                <audio
                  ref={audio}
                  preload="metadata"
                  src={audioSrc}
                  onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                  onDurationChange={(event) => setDuration(event.currentTarget.duration)}
                  onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                  onPlay={() => { setPlaying(true); setAudioNotice(""); }}
                  onPause={() => setPlaying(false)}
                  onEnded={() => { setPlaying(false); setCurrentTime(0); }}
                  onError={() => { setPlaying(false); setAudioNotice("Narration could not load. The story text remains available above."); }}
                />
                <button type="button" onClick={toggleAudio} aria-label={playing ? "Pause narration" : "Play narration"}>
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <span className="sc-book-audio__label">Chapter narration</span>
                <span className="sc-book-audio__time" aria-live="off">{clock(currentTime)} / {clock(duration)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  disabled={!duration}
                  aria-label="Seek narration"
                  aria-valuetext={`${clock(currentTime)} of ${clock(duration)}`}
                  onChange={(event) => {
                    const nextTime = Number(event.currentTarget.value);
                    if (audio.current) audio.current.currentTime = nextTime;
                    setCurrentTime(nextTime);
                  }}
                />
              </div>
            ) : onReadAloud ? (
              <button className="sc-button secondary" type="button" onClick={onReadAloud}>
                {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {speaking ? "Stop narration" : "Read this page aloud"}
              </button>
            ) : null}
            {(audioNotice || narrationNotice) && <small role="status">{audioNotice || narrationNotice}</small>}
          </div>
        </article>

        } right={

        <article className="sc-completion-page__leaf sc-completion-page__leaf--play">
          <div className={`sc-completion-page__scene sc-completion-page__scene--${theme}`} aria-label={`${title} level completion scene`}>
            {scene}
          </div>
          {chapterVideo}
          <div className="sc-completion-page__actions">
            <button className="sc-button" type="button" disabled={!canContinue} onClick={onContinue}>{continueLabel}</button>
            {canContinue && onReplayAnimation && <button className="sc-link sc-completion-page__replay" type="button" onClick={onReplayAnimation}><RotateCcw size={15} /> Replay scene</button>}
            {onReview && <button className="sc-link" type="button" onClick={onReview}>Review this level</button>}
            {!canContinue && onSkipAnimation && <button className="sc-link" type="button" onClick={onSkipAnimation}>Skip animation</button>}
          </div>
        </article>
      } />
    </section>
  );
}
