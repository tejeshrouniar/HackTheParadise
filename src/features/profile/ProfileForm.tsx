import { useEffect, useState } from "react";
import { Camera, Check, LoaderCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  errorMessage,
  normalizeUsername,
  usernameError,
} from "../../lib/validation";
import { useProfile } from "./ProfileContext";
import { usePreferences } from "../settings/PreferencesContext";
import { Avatar } from "../../components/ui/Avatar";
import { ErrorNotice } from "../../components/ui/Status";

export function ProfileForm({
  onSaved,
  onboarding = false,
}: {
  onSaved?: () => void;
  onboarding?: boolean;
}) {
  const { user } = useAuth();
  const { profile, refresh } = useProfile();
  const { preferences, update } = usePreferences();
  const [username, setUsername] = useState(
    /^u_[0-9a-f]{32}$/.test(profile?.username ?? "")
      ? ""
      : (profile?.username ?? ""),
  );
  const [name, setName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [gender, setGender] = useState(preferences.gender);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [availability, setAvailability] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setGender(preferences.gender);
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
      void supabase
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
        });
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    const invalid = usernameError(username);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (!user || !supabase) return;
    setBusy(true);
    let uploadedPath: string | undefined;
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
        canvas
          .getContext("2d")!
          .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
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
      const result = await supabase
        .from("profiles")
        .update({
          username,
          display_name: name.trim(),
          bio: bio.trim(),
          avatar_url: avatar,
          onboarding_completed: true,
        })
        .eq("id", user.id)
        .select("id")
        .single();
      if (result.error) throw result.error;
      if (uploadedPath && profile?.avatar_url) {
        const prefix = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}/`).data.publicUrl;
        if (profile.avatar_url.startsWith(prefix))
          await supabase.storage
            .from("avatars")
            .remove([
              `${user.id}/${profile.avatar_url.slice(prefix.length).split("?")[0]}`,
            ]);
      }
      uploadedPath = undefined;
      await refresh();
      setSaved(true);
      setFile(null);
      onSaved?.();
    } catch (error) {
      if (uploadedPath)
        await supabase.storage.from("avatars").remove([uploadedPath]);
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="sc-form">
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
            aria-describedby="username-hint"
          />
        </span>
        <small id="username-hint" aria-live="polite">
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
    </form>
  );
}
