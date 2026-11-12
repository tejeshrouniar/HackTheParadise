import { useEffect, useRef, useState } from "react";
import { readLocal, writeLocal } from "../../lib/validation";
import { usePreferences } from "../settings/PreferencesContext";

/** Entrance is remembered locally; deep links never have to pass through it. */
export function LibraryEntrance({ children, force = false, onEnter }: { children?: React.ReactNode; force?: boolean; onEnter?: () => void }) {
  const [entered, setEntered] = useState(() => !force && readLocal<boolean>("htp-entered", false));
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const { preferences } = usePreferences();
  useEffect(() => () => clearTimeout(timer.current), []);
  function enter(skip = false) {
    if (opening && !skip) return;
    clearTimeout(timer.current);
    setOpening(true);
    const quiet = preferences.reduced_motion || matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => {
      writeLocal("htp-entered", true); setEntered(true); onEnter?.();
      requestAnimationFrame(() => document.getElementById("main-content")?.focus());
    }, skip || quiet ? 0 : 950);
  }
  if (entered) return <>{children}</>;
  return <section className={`htp-entrance ${opening ? "is-opening" : ""}`} aria-label="Library entrance">
    <div className="htp-doorway" aria-hidden="true"><div className="htp-door htp-door--left"/><div className="htp-door htp-door--right"/></div>
    <div className="htp-entrance__copy"><span className="htp-eyebrow">A library of hidden worlds</span><h1>Hack The<br/>Paradise</h1><p>Every book opens a new world.</p><button className="sc-button" disabled={opening} onClick={() => enter()}>Enter the library <span aria-hidden="true">→</span></button><button className="htp-skip" onClick={() => enter(true)}>Skip entrance</button></div>
    <div className="htp-dust" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{left:`${8+i*7}%`,animationDelay:`${i*-.7}s`}}/>)}</div>
  </section>;
}
