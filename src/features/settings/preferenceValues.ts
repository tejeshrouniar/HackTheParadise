export interface Preferences {
  sound_effects: boolean;
  music_volume: number;
  focus_minutes: number;
  gender: string;
}

export const defaultPreferences: Preferences = {
  sound_effects: true,
  music_volume: 0.35,
  focus_minutes: 25,
  gender: "",
};
const genders = ["", "woman", "man", "nonbinary", "self-described", "prefer-not-to-say"];

export function readPreferences(value: unknown): Preferences {
  const saved = value && typeof value === "object" ? value as Partial<Preferences> : {};
  return {
    sound_effects: typeof saved.sound_effects === "boolean" ? saved.sound_effects : defaultPreferences.sound_effects,
    music_volume: typeof saved.music_volume === "number" && Number.isFinite(saved.music_volume)
      ? Math.max(0, Math.min(1, saved.music_volume)) : defaultPreferences.music_volume,
    focus_minutes: typeof saved.focus_minutes === "number" && Number.isInteger(saved.focus_minutes)
      ? Math.max(1, Math.min(120, saved.focus_minutes)) : defaultPreferences.focus_minutes,
    gender: typeof saved.gender === "string" && genders.includes(saved.gender) ? saved.gender : "",
  };
}
