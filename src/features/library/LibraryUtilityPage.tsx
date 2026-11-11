import { useState } from "react";
import { ArrowRight, BookOpen, Headphones, Shirt } from "lucide-react";
import { LIBRARY } from "../../content/library";
import { STORY_BOOKS } from "../../content/storyBooks";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { ProfileForm } from "../profile/ProfileForm";
import { usePreferences } from "../settings/PreferencesContext";
import { SparkWalletCard } from "../learning/SparkWalletCard";
import { ErrorNotice, Loading } from "../../components/ui/Status";
import { Grimoire } from "./Grimoire";
import { errorMessage } from "../../lib/validation";

export function LibraryUtilityPage({ id, onNavigate, onSignIn, onCharacter, onTools }: {
  id: string; onNavigate: (route: string) => void; onSignIn: () => void; onCharacter: () => void; onTools: () => void;
}) {
  const entry = LIBRARY.find((book) => book.id === id)!;
  const { user, signOut } = useAuth();
  const { profile, loading, error, refresh } = useProfile();
  const { preferences, update, loading: saving } = usePreferences();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const save = (patch: Parameters<typeof update>[0]) => {
    setNotice("");
    void update(patch).catch((err) => setNotice(errorMessage(err)));
  };
  const intro = <div className="sc-utility-intro"><span className="sc-volume-kicker">STORICODE · YOUR LIBRARY</span><h1>{entry.title}</h1><p>{entry.subtitle}</p></div>;
  const bookLinks = (story: boolean) => <div className="sc-utility-links">{STORY_BOOKS.map((book) => <button key={book.id} onClick={() => onNavigate(`${story ? "book-story" : "book"}/${book.id}`)}><BookOpen size={24} /><span><strong>{book.title}</strong><small>{book.kind === "journey" ? "Beginner tutorial" : "Coding adventure"}</small></span><ArrowRight size={16} /></button>)}</div>;
  let left, right;
  if (id === "profile") {
    left = <>{intro}{loading ? <Loading /> : error ? <ErrorNotice message={error} retry={() => void refresh()} /> : user && profile ? <ProfileForm key={profile.id} /> : <><p>Keep your place in every book and make your adventurer your own.</p><button className="sc-button" onClick={onSignIn}>Sign in or create an account</button></>}</>;
    right = <><span className="sc-volume-kicker">YOUR ADVENTURER</span><h2>A character of your own</h2><p>Choose your character’s hair, outfit and accessories for the walking paths.</p><button className="sc-button" onClick={onCharacter}><Shirt size={18} /> Customize character</button>{bookLinks(false)}</>;
  } else if (id === "account") {
    left = <>{intro}<h2>{user ? "Your account" : "Your place, saved"}</h2><p>{user?.email ?? "Sign in to sync progress, unlock hints and collect Sparks."}</p>{user ? <button className="sc-button secondary" disabled={busy} onClick={async () => { setBusy(true); try { await signOut(); } catch (err) { setNotice(errorMessage(err)); } finally { setBusy(false); } }}>{busy ? "Signing out…" : "Sign out"}</button> : <button className="sc-button" onClick={onSignIn}>Sign in</button>}<h2>Every book is yours to explore</h2><p>Stories keep separate progress. Your Spark balance and purchased help are saved to your account.</p>{notice && <ErrorNotice message={notice} />}</>;
    right = <SparkWalletCard onSignIn={onSignIn} />;
  } else if (id === "theme") {
    left = <>{intro}<h2>Make the magic comfortable</h2>{([{ key: "reduced_motion", title: "Reduce motion", description: "Gentler page turns and scene effects." }, { key: "sound_effects", title: "Sound effects", description: "Spell sounds and small celebrations." }] as const).map((option) => <div className="sc-setting-row" key={option.key}><div><strong>{option.title}</strong><p>{option.description}</p></div><button className="sc-switch" role="switch" aria-label={option.title} aria-checked={preferences[option.key]} disabled={saving} onClick={() => save({ [option.key]: !preferences[option.key] })}><span /></button></div>)}{notice && <ErrorNotice message={notice} />}</>;
    right = <><span className="sc-volume-kicker">COLOUR & SOUND</span><h2>Every book, its own atmosphere</h2><p>Copper and forest for Cinder. Burgundy, ink and gold for Hogwarts. The cover sets the mood when you open a book.</p>{bookLinks(false)}<button className="sc-button" onClick={onTools}><Headphones size={18} /> Choose your soundtrack</button></>;
  } else if (id === "lore") {
    left = <>{intro}<h2>The stories you bring to life</h2><p>Every solved level reveals another scene. Open a book to watch the chapters you have unlocked.</p>{bookLinks(true)}</>;
    right = <><span className="sc-volume-kicker">FROM CODE TO STORY</span><h2>Write. Cast. Discover.</h2><ol className="sc-utility-steps"><li><strong>Choose an adventure</strong><p>Start with The Last Light or enter the world of Hogwarts.</p></li><li><strong>Write your spell</strong><p>Use the editor, follow the level’s goal, and watch your code run.</p></li><li><strong>Turn the page</strong><p>Your completed levels become films you can revisit here.</p></li></ol></>;
  } else {
    left = <>{intro}<h2>A library built together</h2><p>Found a bug, have a new story idea, or want to help improve Storicode?</p><div className="sc-utility-links"><a href="https://github.com/tejeshrouniar/StoriCode/issues/new" target="_blank" rel="noreferrer">Report a bug or share feedback <ArrowRight size={18} /></a><button onClick={() => onNavigate("community")}>Visit the community & suggestions <ArrowRight size={18} /></button></div></>;
    right = <><span className="sc-volume-kicker">THE PROJECT</span><h2>Storicode</h2><p>Learn to code, one adventure at a time.</p><div className="sc-utility-links"><a href="https://github.com/tejeshrouniar/StoriCode" target="_blank" rel="noreferrer">Explore the repository <ArrowRight size={18} /></a></div><p>© 2026 Storicode</p></>;
  }
  return <div className="sc-page sc-utility-book"><Grimoire pageKey={id} label={entry.title} coverColor={entry.coverColor} left={left} right={right} /></div>;
}
