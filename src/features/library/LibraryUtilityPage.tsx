import { useState } from "react";
import { ArrowRight, Headphones, LogOut, Shirt } from "lucide-react";
import { LIBRARY, PROJECT_CONTRIBUTORS, PROJECT_REPOSITORY } from "../../content/library";
import { STORY_BOOKS } from "../../content/storyBooks";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { ProfileForm } from "../profile/ProfileForm";
import { usePreferences } from "../settings/PreferencesContext";
import { SparkWalletCard } from "../learning/SparkWalletCard";
import { ErrorNotice, Loading } from "../../components/ui/Status";
import { Grimoire } from "./Grimoire";
import { errorMessage, safeUrl } from "../../lib/validation";
import { PixelJournalMark, type PixelJournalKind } from "./PixelJournalMark";
import { AvatarGraphic } from "../adventure/AvatarGraphic";
import { useAppearance } from "../adventure/AppearanceContext";

function SignOutButton() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setBusy(true);
    setError("");
    try {
      await signOut();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="sc-button secondary" disabled={busy} onClick={handleSignOut}>
      <LogOut size={16} aria-hidden="true" /> {busy ? "Signing out…" : "Sign out"}
    </button>
    {error && <ErrorNotice message={error} />}
  </>;
}

export function LibraryUtilityPage({ id, onNavigate, onSignIn, onCharacter, onTools }: {
  id: string; onNavigate: (route: string) => void; onSignIn: () => void; onCharacter: () => void; onTools: () => void;
}) {
  const entry = LIBRARY.find((book) => book.id === id)!;
  const { user } = useAuth();
  const { profile, loading, error, refresh } = useProfile();
  const { appearance } = useAppearance();
  const { preferences, update, loading: saving } = usePreferences();
  const [notice, setNotice] = useState("");
  const [preferenceStatus, setPreferenceStatus] = useState("");
  const save = (patch: Parameters<typeof update>[0]) => {
    setNotice("");
    setPreferenceStatus("Saving preference…");
    void update(patch).then(() => setPreferenceStatus("Preference saved")).catch((err) => {
      setPreferenceStatus("");
      setNotice(errorMessage(err));
    });
  };
  const intro = <div className="sc-utility-intro">
    <PixelJournalMark kind={id as PixelJournalKind} />
    <div><h1>{entry.title}</h1><p>{entry.subtitle}</p></div>
  </div>;
  const bookLinks = (story: boolean) => <div className="sc-utility-links">
    {STORY_BOOKS.map((book) => <button key={book.id} onClick={() => onNavigate(`${story ? "book-story" : "book"}/${book.id}`)}>
      <span className="htp-journal-swatches" aria-hidden="true">
        {[book.palette.primary, book.palette.secondary, book.palette.accent, book.palette.paper].map((color) => <i key={color} style={{ backgroundColor: color }} />)}
      </span>
      <span><strong>{book.title}</strong><small>{story ? "Read story" : "Open book"}</small></span>
      <ArrowRight size={16} />
    </button>)}
  </div>;
  let left, right;
  if (id === "profile") {
    left = <>{intro}{user && <SignOutButton />}{!user ? <><p>Keep your place in every book and make your adventurer your own.</p><button className="sc-button" onClick={onSignIn}>Sign in or create an account</button></> : loading ? <Loading /> : error ? <ErrorNotice message={error} retry={() => void refresh()} /> : profile && <ProfileForm key={profile.id} />}</>;
    right = <><h2>Your adventurer</h2>
      <div className="htp-journal-avatar" role="img" aria-label="Preview of your current adventurer"><AvatarGraphic appearance={appearance} size={96} /></div>
      <p>Choose your character’s hair, outfit and accessories for the walking paths.</p>
      <button className="sc-button" onClick={onCharacter}><Shirt size={18} /> Customize character</button>
      {bookLinks(false)}
    </>;
  } else if (id === "account") {
    left = <>{intro}<h2>{user ? "Your account" : "Your place, saved"}</h2><p>{user?.email ?? "Sign in to sync progress, unlock hints and collect Sparks."}</p>{user ? <SignOutButton /> : <button className="sc-button" onClick={onSignIn}>Sign in</button>}<h2>Every book is yours to explore</h2><p>Stories keep separate progress. Your Spark balance and purchased help are saved to your account.</p></>;
    right = <SparkWalletCard onSignIn={onSignIn} />;
  } else if (id === "theme") {
    left = <>{intro}<h2>Make the magic comfortable</h2>{([{ key: "reduced_motion", title: "Reduce motion", description: "Gentler page turns and scene effects." }, { key: "sound_effects", title: "Sound effects", description: "Spell sounds and small celebrations." }] as const).map((option) => <div className="sc-setting-row" key={option.key}><div><strong>{option.title}</strong><p>{option.description}</p></div><button className="sc-switch" role="switch" aria-label={option.title} aria-checked={preferences[option.key]} disabled={saving} onClick={() => save({ [option.key]: !preferences[option.key] })}><span /></button></div>)}{notice && <ErrorNotice message={notice} />}</>;
    right = <><span className="sc-volume-kicker">COLOUR & SOUND</span><h2>Every book, its own atmosphere</h2><p>Copper and forest for Cinder. Burgundy, ink and gold for Hogwarts. The cover sets the mood when you open a book.</p>{bookLinks(false)}<button className="sc-button" onClick={onTools}><Headphones size={18} /> Choose your soundtrack</button></>;
  } else if (id === "lore") {
    left = <>{intro}<h2>The stories you bring to life</h2><p>Every solved level reveals another scene. Open a book to watch the chapters you have unlocked.</p>{bookLinks(true)}</>;
    right = <><span className="sc-volume-kicker">FROM CODE TO STORY</span><h2>Write. Cast. Discover.</h2><ol className="sc-utility-steps"><li><strong>Choose an adventure</strong><p>Start with The Last Light or enter the world of Hogwarts.</p></li><li><strong>Write your spell</strong><p>Use the editor, follow the level’s goal, and watch your code run.</p></li><li><strong>Turn the page</strong><p>Your completed levels become films you can revisit here.</p></li></ol></>;
  } else if (id === "credits") {
    const links = [
      { label: "GitHub repository", href: PROJECT_REPOSITORY },
      { label: "Patreon", href: safeUrl(import.meta.env.VITE_PROJECT_PATREON_URL) },
      { label: "Instagram", href: safeUrl(import.meta.env.VITE_PROJECT_INSTAGRAM_URL) },
    ];
    left = <>
      {intro}
      <h2>Contributors</h2>
      <ul className="sc-utility-links htp-contributor-list">
        {PROJECT_CONTRIBUTORS.map(({ name, github }) => (
          <li key={github}>
            <a href={`https://github.com/${github}`} target="_blank" rel="noreferrer">
              <span><strong>{name}</strong><small>@{github}</small></span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <p>© 2026 Hack The Paradise</p>
    </>;
    right = <><h2>Project links</h2><div className="sc-utility-links">
      {links.map(({ label, href }) => href && <a key={label} href={href} target="_blank" rel="noreferrer">{label}<ArrowRight size={18} /></a>)}
      <a href={`${PROJECT_REPOSITORY}/graphs/contributors`} target="_blank" rel="noreferrer">
        All GitHub contributors <ArrowRight size={18} aria-hidden="true" />
      </a>
      <button type="button" onClick={() => onNavigate("library/contact")}>Contact / feedback <ArrowRight size={18} /></button>
    </div></>;
  } else {
    left = <>{intro}<h2>A library built together</h2><p>Found a bug, have a new story idea, or want to help improve Hack The Paradise?</p><div className="sc-utility-links"><a href={`${PROJECT_REPOSITORY}/issues/new`} target="_blank" rel="noreferrer">Report a bug or share feedback <ArrowRight size={18} /></a><button onClick={() => onNavigate("community")}>Visit the community & suggestions <ArrowRight size={18} /></button></div></>;
    right = <><h2>Project links</h2><div className="sc-utility-links"><button type="button" onClick={() => onNavigate("library/credits")}>Open Credits <ArrowRight size={18} /></button></div></>;
  }
  return <div className="sc-page sc-utility-book"><Grimoire className="htp-pixel-journal" pageKey={id} label={entry.title} coverColor={entry.coverColor} left={<>{left}{preferenceStatus && <p className="htp-preference-status" role="status">{preferenceStatus}</p>}</>} right={right} /></div>;
}
