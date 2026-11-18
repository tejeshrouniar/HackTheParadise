export const normalizeUsername = (value: string) => value.trim().toLowerCase();
export function usernameError(value: string): string {
  return /^[a-z0-9_]{3,36}$/.test(value)
    ? ""
    : "Use 3–36 lowercase letters, numbers or underscores.";
}
export function normalizePhoneNumber(value: string): string | null {
  if (!value.trim()) return "";
  const normalized = value.replace(/[\s().-]/g, "");
  return /^\+[1-9][0-9]{6,14}$/.test(normalized) ? normalized : null;
}
export function validLessonIds(value: unknown): number[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is number => Number.isInteger(id) && id >= 1 && id <= 12,
          ),
        ),
      ].sort((a, b) => a - b)
    : [];
}
export const mergeLessons = (...values: unknown[]) =>
  validLessonIds(values.flatMap(validLessonIds));
export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return;
  }
}
export function messageError(value: string): string {
  if (!value.trim()) return "Write a message first.";
  return value.trim().length > 2000
    ? "Keep messages under 2,000 characters."
    : "";
}
export function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}
export function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function errorMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  if (code === "invalid_credentials") return "Your email or password is incorrect. Check both and try again.";
  if (code === "signup_disabled" || code === "email_provider_disabled") return "Email registration is currently disabled. Please contact the organizer.";
  if (code === "over_email_send_rate_limit") return "The email service has reached its sending limit. Try signing in if you already have an account, or contact the organizer.";
  if (code === "email_not_confirmed") return "This account is awaiting email confirmation. Use the confirmation link or contact the organizer.";
  if (code === "user_already_exists" || code === "email_exists") return "An account already uses this email. Sign in or reset your password.";
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "Something went wrong.";
  if (/invalid login credentials/i.test(message))
    return "Your email or password is incorrect. Check both and try again.";
  if (message === "Enter your phone number and school name to complete your profile.")
    return "Enter your phone number and school or college name to complete your profile.";
  if (
    /schema cache|does not exist|could not find.*(table|column|function)/i.test(
      message,
    )
  )
    return "This feature needs a Hack The Paradise database update. You can still play the coding levels.";
  if (/fetch|network/i.test(message))
    return "Unable to connect. Check your connection and try again.";
  if (/timeout|timed out|aborted/i.test(message))
    return "The request took too long. Check your connection and try again.";
  if (/duplicate|unique|23505/i.test(message))
    return "That username is taken. Try another one.";
  return message;
}
