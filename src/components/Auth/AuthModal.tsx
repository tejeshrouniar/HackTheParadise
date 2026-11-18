import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Modal } from "../ui/Modal";
import { ErrorNotice } from "../ui/Status";
import { DEFAULT_PHONE_PREFIX, errorMessage, normalizePhoneNumber } from "../../lib/validation";
import { PhoneNumberField } from "../ui/PhoneNumberField";
import googleSignIn from "../../assets/google-sign-in.png";
type Mode = "signin" | "signup" | "reset" | "new-password";
export function AuthModal({
  isOpen,
  onClose,
  onGuest,
  onAuthenticated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGuest: () => void;
  onAuthenticated: () => void;
}) {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>(() => auth.isPasswordRecovery ? "new-password" : "signin");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(DEFAULT_PHONE_PREFIX);
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (auth.isPasswordRecovery) setMode("new-password");
  }, [auth.isPasswordRecovery]);
  const changeMode = (mode: Mode) => {
    if (busy) return;
    setMode(mode);
    setPhone(DEFAULT_PHONE_PREFIX);
    setPhoneInvalid(false);
    setError("");
    setNotice("");
    setPassword("");
    setConfirm("");
    setShow(false);
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "reset") {
        await auth.resetPassword(email.trim());
        setNotice(
          "If an account exists, you’ll receive a password reset link. Check your inbox.",
        );
        return;
      }
      if (mode === "new-password") {
        if (password !== confirm)
          throw new Error("Those passwords do not match.");
        await auth.setNewPassword(password);
      } else if (mode === "signup") {
        const normalizedPhone = normalizePhoneNumber(phone);
        if (!normalizedPhone) {
          setPhoneInvalid(true);
          return;
        }
        if (!name.trim()) throw new Error("Enter your name.");
        if (!school.trim()) throw new Error("Enter your affiliation.");
        const result = await auth.signUp(name, email.trim(), password, normalizedPhone, school.trim());
        setPhone(DEFAULT_PHONE_PREFIX);
        setSchool("");
        if (result.needsEmailConfirmation) {
          changeMode("signin");
          setNotice(
            "Check your email to confirm your account, then sign in here.",
          );
          return;
        }
      } else await auth.signIn(email.trim(), password);
      setPassword("");
      onClose();
      onAuthenticated();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      setError(errorMessage(error));
      setBusy(false);
    }
  }
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        mode === "signup"
          ? "Create your Hack The Paradise account"
          : mode === "reset"
            ? "Reset your password"
            : mode === "new-password"
              ? "Choose a new password"
              : "Sign in to Hack The Paradise"
      }
      description="Save your progress and Sparks across devices."
      required={busy}
      wide={mode === "signup"}
    >
      {(mode === "signin" || mode === "signup") && (
        <>
          <button
            type="button"
            className="sc-google-sign-in"
            onClick={google}
            disabled={busy || !auth.configured}
          >
            <img src={googleSignIn} width={180} height={40} alt="Sign in with Google" />
          </button>
          <div className="sc-divider">or use email</div>
        </>
      )}
      <form className={`sc-form${mode === "signup" ? " sc-auth-signup" : ""}`} onSubmit={submit}>
        <fieldset className="sc-form-fields" disabled={busy}>
        {mode === "signup" && (
          <label>
            Your name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              maxLength={60}
            />
          </label>
        )}
        {mode !== "new-password" && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
        )}
        {mode === "signup" && (
          <>
            <label>
              Affiliation
              <input
                value={school}
                onChange={(event) => setSchool(event.target.value)}
                autoComplete="organization"
                placeholder="Your organization, school or college"
                required
                maxLength={120}
              />
            </label>
            <PhoneNumberField
              value={phone}
              invalid={phoneInvalid}
              disabled={busy}
              required
              onChange={(value) => {
                setPhone(value);
                setPhoneInvalid(false);
              }}
            />
          </>
        )}
        {mode !== "reset" && (
          <label className="sc-auth-password">
            Password
            <div className="sc-password">
              <input
                type={show ? "text" : "password"}
                minLength={mode === "signin" ? 1 : 8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
              />
              <button
                type="button"
                className="sc-icon-button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode !== "signin" && <small>Use at least 8 characters.</small>}
          </label>
        )}
        {mode === "new-password" && (
          <label>
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
        )}
        {error && <ErrorNotice message={error} />}
        {notice && (
          <p className="sc-info" role="status">
            {notice}
          </p>
        )}
        {!auth.configured && (
          <ErrorNotice message="Sign-in isn’t connected on this installation yet. You can still explore the quests." />
        )}
        <button
          className="sc-button sc-full"
          disabled={busy || !auth.configured}
        >
          {busy ? (
            <LoaderCircle className="animate-spin" size={18} />
          ) : (
            <ArrowRight size={18} />
          )}{" "}
          {mode === "signup"
            ? "Create account"
            : mode === "reset"
              ? "Send reset link"
              : mode === "new-password"
                ? "Save password"
                : "Sign in"}
        </button>
        </fieldset>
      </form>
      <div className="sc-auth-links">
        {mode === "signin" ? (
          <>
            <button disabled={busy} onClick={() => changeMode("signup")}>
              New here? Create an account
            </button>
            <button disabled={busy} onClick={() => changeMode("reset")}>
              Forgot password?
            </button>
          </>
        ) : (
          <button disabled={busy} onClick={() => changeMode("signin")}>Back to sign in</button>
        )}
        <button
          disabled={busy}
          onClick={() => {
            onClose();
            onGuest();
          }}
        >
          Explore as a guest
        </button>
      </div>
    </Modal>
  );
}
