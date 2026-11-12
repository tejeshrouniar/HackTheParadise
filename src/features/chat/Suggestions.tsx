import { useState } from "react";

export function Suggestions() {
  const [text, setText] = useState("");
  const limit = 2000;
  const issue = new URL("https://github.com/tejeshrouniar/HackTheParadise/issues/new");
  issue.searchParams.set("title", "Hack The Paradise suggestion");
  issue.searchParams.set("body", text.trim());

  return <section className="sc-card sc-suggestions">
    <h2>Suggest an improvement</h2>
    <label htmlFor="suggestion">What would make your adventure better?</label>
    <textarea id="suggestion" value={text} onChange={(event) => setText(event.target.value)} maxLength={limit} rows={4} aria-describedby="suggestion-help" />
    <small className="htp-suggestion-count">{text.length} / {limit}</small>
    <p id="suggestion-help">Review your draft in a new GitHub tab before submitting. A GitHub account is required.</p>
    {text.trim() ? (
      <a className="sc-button" href={issue.href} target="_blank" rel="noreferrer">Review suggestion on GitHub ↗</a>
    ) : (
      <button className="sc-button" disabled>Review suggestion on GitHub ↗</button>
    )}
  </section>;
}
