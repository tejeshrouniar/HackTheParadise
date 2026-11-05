import { useState } from "react";
export function Suggestions() {
 const [text,setText]=useState("");
 const url=`https://github.com/tejeshrouniar/StoriCode/issues/new?title=${encodeURIComponent("Storicode suggestion")}&body=${encodeURIComponent(text.trim())}`;
 return <section className="sc-card sc-suggestions"><h2>Suggest an improvement</h2><label htmlFor="suggestion">What would make your adventure better?</label><textarea id="suggestion" value={text} onChange={e=>setText(e.target.value)} maxLength={2000} rows={3}/><p>Your suggestion opens on GitHub for review before you submit it. A GitHub account is required.</p>{text.trim()?<a className="sc-button" href={url} target="_blank" rel="noreferrer">Review suggestion on GitHub →</a>:<button className="sc-button" disabled>Write a suggestion first</button>}</section>;
}
