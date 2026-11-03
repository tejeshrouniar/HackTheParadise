export const normalizeUsername = (value: string) => value.trim().toLowerCase();
export function usernameError(value: string): string {
  return /^[a-z0-9_]{3,36}$/.test(value)
    ? ""
    : "Use 3–36 lowercase letters, numbers or underscores.";
}
export function validLessonIds(value: unknown): number[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is number => Number.isInteger(id) && id >= 1 && id <= 8,
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
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "Something went wrong.";
  if (
    /schema cache|does not exist|could not find.*(table|column|function)/i.test(
      message,
    )
  )
    return "This feature is waiting for the Storicode database update. Learning is still available. Please contact the site owner.";
  if (/fetch|network/i.test(message))
    return "Unable to connect. Check your connection and try again.";
  if (/duplicate|unique|23505/i.test(message))
    return "That username is taken. Try another one.";
  return message;
}
