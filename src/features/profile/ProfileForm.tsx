import { useEffect, useId, useRef, useState } from "react";
import { Camera, Check, LoaderCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  errorMessage,
  normalizePhoneNumber,
  normalizeUsername,
  usernameError,
} from "../../lib/validation";
import { useProfile } from "./ProfileContext";
import { usePreferences } from "../settings/PreferencesContext";
import { Avatar } from "../../components/ui/Avatar";
import { ErrorNotice } from "../../components/ui/Status";
import { PhoneNumberField } from "../../components/ui/PhoneNumberField";

export function ProfileForm({
  onSaved,
  onboarding = false,
}: {
  onSaved?: () => void;
  onboarding?: boolean;
}) {
  const { user } = useAuth();
  const { profile, saveProfile } = useProfile();
  const { preferences, update } = usePreferences();
  const usernameHint = useId();
  const [username, setUsername] = useState(
    /^u_[0-9a-f]{32}$/.test(profile?.username ?? "")
      ? ""
      : (profile?.username ?? ""),
  );
  const [name, setName] = useState(profile?.display_name ?? "");
  const [school, setSchool] = useState(profile?.school_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [gender, setGender] = useState(preferences.gender);
  const [joinLeaderboard, setJoinLeaderboard] = useState(onboarding || profile?.leaderboard_visible === true);
  const [phone, setPhone] = useState(profile?.phone_number ?? "");
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [availability, setAvailability] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const dirty = useRef(false);
  useEffect(() => {
    if (!profile?.onboarding_completed || dirty.current) return;
    setUsername(profile.username);
    setName(profile.display_name);
    setSchool(profile.school_name ?? "");
    setBio(profile.bio);
    setPhone(profile.phone_number ?? "");
    setJoinLeaderboard(profile.leaderboard_visible === true);
  }, [profile]);
  useEffect(() => {
    if (!dirty.current) setGender(preferences.gender);
  }, [preferences.gender]);
  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    let active = true;
    if (usernameError(username)) {
      setAvailability("");
      return;
    }
    setAvailability("Checking username…");
    const timer = setTimeout(() => {
      if (!supabase) return;
      void Promise.resolve(supabase
        .rpc("username_available", { candidate: username })
        .then(({ data, error }) => {
          if (active)
            setAvailability(
              error
                ? "Availability could not be checked. Try saving to retry."
                : data
                  ? "Username available"
                  : "That username is taken",
            );
        })).catch(() => {
          if (active) setAvailability("Availability could not be checked. Try saving to retry.");
        });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setSaved(false);
    const invalid = usernameError(username);
    if (invalid) {
      setError(invalid);
      return;
    }
    const normalizedPhone = normalizePhoneNumber(phone);
    if (normalizedPhone === null || (onboarding && !normalizedPhone)) {
      setPhoneInvalid(true);
      return;
    }
    const schoolName = school.trim();
    if (onboarding && !schoolName) {
      setError("Enter your affiliation.");
      return;
    }
    if (!user || !supabase) return;
    setBusy(true);
    let uploadedPath: string | undefined;
    let profileSubmitted = false;
    try {
      let avatar = profile?.avatar_url;
      if (file) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 2 * 1024 * 1024
        )
          throw new Error("Choose a JPG, PNG or WebP image under 2 MB.");
        const bitmap = await createImageBitmap(file);
        if (bitmap.width > 10000 || bitmap.height > 10000) {
          bitmap.close();
          throw new Error(
            "Choose an image smaller than 10,000 pixels per side.",
          );
        }
        const canvas = document.createElement("canvas");
        const ratio = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.round(bitmap.width * ratio);
        canvas.height = Math.round(bitmap.height * ratio);
        const context = canvas.getContext("2d");
        if (!context) {
          bitmap.close();
          throw new Error("Your browser could not process this picture. Try another browser or save without a picture.");
        }
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", 0.85),
        );
        if (!blob)
          throw new Error(
            "This image could not be processed. Try another image.",
          );
        uploadedPath = `${user.id}/${crypto.randomUUID()}.webp`;
        const upload = await supabase.storage
          .from("avatars")
          .upload(uploadedPath, blob, {
            contentType: "image/webp",
            cacheControl: "3600",
          });
        if (upload.error) throw upload.error;
        avatar = supabase.storage.from("avatars").getPublicUrl(uploadedPath)
          .data.publicUrl;
      }
      if (gender !== preferences.gender) await update({ gender });
      profileSubmitted = true;
      await saveProfile({
        username,
        display_name: name.trim(),
        bio: bio.trim(),
        school_name: schoolName || null,
        phone_number: normalizedPhone || null,
        avatar_url: avatar ?? null,
        leaderboard_visible: joinLeaderboard,
      });
      dirty.current = false;
      // The new avatar is now attached to the saved profile.
      const replacedPicture = uploadedPath && profile?.avatar_url;
      uploadedPath = undefined;
      setSaved(true);
      setFile(null);
      onSaved?.();
      if (replacedPicture) {
        const prefix = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}/`).data.publicUrl;
        if (replacedPicture.startsWith(prefix))
          await supabase.storage
            .from("avatars")
            .remove([
              `${user.id}/${replacedPicture.slice(prefix.length).split("?")[0]}`,
            ]).catch(() => {});
      }
    } catch (error) {
      // A lost save response may follow a commit that already references this file.
      if (uploadedPath && !profileSubmitted)
        await supabase.storage.from("avatars").remove([uploadedPath]).catch(() => {});
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="sc-form" onChangeCapture={() => {
      dirty.current = true;
      setSaved(false);
    }}>
      <fieldset className="sc-form-fields" disabled={busy}>
      <div className="sc-profile-photo">
        {preview ? (
          <img
            className="sc-avatar"
            style={{ width: 72, height: 72 }}
            src={preview}
            alt="New avatar preview"
          />
        ) : (
          <Avatar name={name} url={profile?.avatar_url} size={72} />
        )}
        <div>
          <label className="sc-button secondary sc-upload">
            <Camera size={16} />
            Change picture
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setSaved(false);
              }}
            />
          </label>
          {file && <button type="button" className="sc-link" disabled={busy} onClick={() => setFile(null)}>Clear selected picture</button>}
          <small>
            JPG, PNG or WebP · up to 2 MB · visible to other learners
          </small>
        </div>
      </div>
      <label>
        Username
        <span className="sc-input-prefix">
          <span>@</span>
          <input
            value={username}
            required
            minLength={3}
            maxLength={36}
            autoComplete="username"
            pattern="[a-z0-9_]{3,36}"
            onChange={(e) => {
              setUsername(normalizeUsername(e.target.value));
              setSaved(false);
            }}
            aria-describedby={usernameHint}
          />
        </span>
        <small id={usernameHint} aria-live="polite">
          {availability ||
            "3–36 lowercase letters, numbers or underscores. Unique to you."}
        </small>
      </label>
      <label>
        Display name
        <input
          required
          maxLength={60}
          value={name}
          autoComplete="nickname"
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
      </label>
      <label>
        Affiliation
        <input
          value={school}
          autoComplete="organization"
          placeholder="Your organization, school or college"
          maxLength={120}
          required={onboarding}
          onChange={(event) => {
            setSchool(event.target.value);
            setSaved(false);
          }}
        />
        <small>Shown below your name if you join the leaderboard.</small>
      </label>
      <PhoneNumberField
        value={phone}
        invalid={phoneInvalid}
        disabled={busy}
        required={onboarding}
        onChange={(value) => {
          setPhone(value);
          setPhoneInvalid(false);
          setSaved(false);
        }}
      />
      <label className="sc-profile-leaderboard-option">
        <input
          type="checkbox"
          checked={joinLeaderboard}
          disabled={busy}
          onChange={(event) => {
            setJoinLeaderboard(event.target.checked);
            setSaved(false);
          }}
        />
        <span>Join the leaderboard</span>
        <small>Share your name, affiliation and level count with other players. Developer exports include your email and phone number. You appear when you join, including with zero levels cleared.</small>
      </label>
      <label>
        About you <span className="sc-muted">(optional)</span>
        <textarea
          rows={3}
          maxLength={280}
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            setSaved(false);
          }}
          placeholder="What are you curious about?"
        />
        <small>{bio.length}/280 · visible to other learners</small>
      </label>
      <label>
        Gender <span className="sc-muted">(optional, private)</span>
        <select
          value={gender}
          onChange={(e) => {
            setGender(e.target.value);
            setSaved(false);
          }}
        >
          <option value="">Leave blank</option>
          <option value="woman">Woman</option>
          <option value="man">Man</option>
          <option value="nonbinary">Non-binary</option>
          <option value="self-described">Self-described</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </label>
      {error && <ErrorNotice message={error} />}
      <button
        className="sc-button"
        disabled={busy || availability === "That username is taken"}
        type="submit"
      >
        {busy ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <Check size={18} />
        )}
        {busy
          ? "Saving…"
          : onboarding
            ? "Let’s start learning"
            : "Save profile"}
      </button>
      {saved && (
        <p className="sc-success" role="status">
          Your profile is saved.
        </p>
      )}
      </fieldset>
    </form>
  );
}
