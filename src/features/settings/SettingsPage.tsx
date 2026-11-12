import { Grimoire } from "../library/Grimoire";
import { useState } from "react";
import { SparkWalletCard } from "../learning/SparkWalletCard";
import {
  LogOut,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { ProfileForm } from "../profile/ProfileForm";
import { usePreferences } from "./PreferencesContext";
import { ErrorNotice, Loading } from "../../components/ui/Status";
import { errorMessage } from "../../lib/validation";
import { PixelJournalMark } from "../library/PixelJournalMark";
export default function SettingsPage({
  onSignIn,
  onCharacter,
}: {
  onSignIn: () => void;
  onCharacter: () => void;
}) {
  const { user, signOut } = useAuth();
  const { profile, loading, error, refresh } = useProfile();
  const {
    preferences,
    update,
    error: preferenceError,
    loading: preferencesLoading,
  } = usePreferences();
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preferenceStatus, setPreferenceStatus] = useState("");
  const [savingPreference, setSavingPreference] = useState(false);
  const save = async (patch: Parameters<typeof update>[0]) => {
    setActionError("");
    setPreferenceStatus("Saving preference…");
    setSavingPreference(true);
    try {
      await update(patch);
      setPreferenceStatus("Preference saved");
    } catch (error) {
      setPreferenceStatus("");
      setActionError(errorMessage(error));
    } finally {
      setSavingPreference(false);
    }
  };
  async function logout() {
    setBusy(true);
    try {
      await signOut();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="sc-page">
      <div className="sc-page-heading">
        <div>
          <h1><PixelJournalMark kind="settings" /> Settings</h1>
        </div>
      </div>
      <Grimoire label="Settings journal" className="htp-journal htp-pixel-journal" left={<>
        <SparkWalletCard onSignIn={onSignIn} />
        <section className="sc-card sc-settings-card">
          <h2>
            <UserRound size={21} />
            Your profile
          </h2>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorNotice message={error} retry={() => void refresh()} />
          ) : user && profile ? (
            <ProfileForm key={profile.id} />
          ) : (
            <div className="sc-empty">
              <UserRound size={35} />
              <h3>Make this adventure yours.</h3>
              <p>
                Sign in to build your profile and keep your progress across
                devices.
              </p>
              <button className="sc-button" onClick={onSignIn}>
                Sign in or create an account
              </button>
            </div>
          )}
        </section>
        </>} right={<div>
          <section className="sc-card sc-settings-card sc-character-settings">
            <h2>
              <Shirt size={21} /> Your adventurer
            </h2>
            <button className="sc-button secondary" onClick={onCharacter}>
              Customize character
            </button>
          </section>
          <section className="sc-card sc-settings-card">
            <h2>
              <SlidersHorizontal size={21} />
              Your learning environment
            </h2>
            <div className="sc-setting-row">
              <div>
                <strong>Sound effects</strong>
                <p>
                  Small celebrations and quest feedback. Music has its own
                  controls.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={preferences.sound_effects}
                aria-label="Sound effects"
                className="sc-switch"
                disabled={preferencesLoading || savingPreference}
                onClick={() =>
                  void save({ sound_effects: !preferences.sound_effects })
                }
              >
                <span />
              </button>
            </div>
            <div className="sc-setting-row">
              <div>
                <strong>Reduce motion</strong>
                <p>
                  Keep transitions quiet. Your device’s reduced-motion setting
                  is always respected.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={preferences.reduced_motion}
                aria-label="Reduce motion"
                className="sc-switch"
                disabled={preferencesLoading || savingPreference}
                onClick={() =>
                  void save({ reduced_motion: !preferences.reduced_motion })
                }
              >
                <span />
              </button>
            </div>
            <label className="sc-setting-row">
              <div>
                <strong>Default focus session</strong>
                <p>Your timer starts with this duration.</p>
              </div>
              <select
                aria-label="Default focus duration"
                value={preferences.focus_minutes}
                disabled={preferencesLoading || savingPreference}
                onChange={(e) =>
                  void save({ focus_minutes: Number(e.target.value) })
                }
              >
                {[5, 15, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} min
                  </option>
                ))}
              </select>
            </label>
            {preferenceStatus && <p className="htp-preference-status" role="status">{preferenceStatus}</p>}
            {(actionError || preferenceError) && (
              <ErrorNotice message={actionError || preferenceError} />
            )}
          </section>
          {user && (
            <section className="sc-card sc-settings-card">
              <h2>
                <ShieldCheck size={21} />
                Your account
              </h2>
              <p className="sc-muted sc-account-email">{user.email}</p>
              <p className="sc-caption sc-muted">
                Your email and preferences stay private. Other learners can see
                your name, username, avatar, and bio.
              </p>
              <button
                className="sc-button secondary"
                disabled={busy}
                onClick={() => void logout()}
              >
                <LogOut size={17} />
                {busy ? "Signing out…" : "Sign out"}
              </button>
            </section>
          )}
        </div>} />
    </div>
  );
}
