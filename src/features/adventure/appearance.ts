export const appearanceOptions = {
  skin: ["Peach", "Honey", "Bronze", "Umber"],
  hair: ["Chestnut", "Ink", "Copper", "Silver"],
  cut: ["Short", "Swept", "Long"],
  outfit: ["Fern", "Indigo", "Rust", "Plum", "Ocean"],
  accessory: ["None", "Scarf", "Trail hat"],
} as const;

export type Appearance = {
  [
    Key in keyof typeof appearanceOptions
  ]: (typeof appearanceOptions)[Key][number];
};

export const defaultAppearance: Appearance = {
  skin: "Honey",
  hair: "Chestnut",
  cut: "Swept",
  outfit: "Fern",
  accessory: "Scarf",
};

export function readAppearance(value: unknown): Appearance {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const result = { ...defaultAppearance };
  for (const key of Object.keys(appearanceOptions) as (keyof Appearance)[]) {
    const selection = input[key];
    if (
      typeof selection === "string" &&
      (appearanceOptions[key] as readonly string[]).includes(selection)
    ) {
      Object.assign(result, { [key]: selection });
    }
  }
  return result;
}
