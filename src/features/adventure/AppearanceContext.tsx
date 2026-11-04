import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { readLocal, writeLocal } from "../../lib/validation";
import {
  defaultAppearance,
  readAppearance,
  type Appearance,
} from "./appearance";

const guestKey = "storicode_guest_appearance";
const metadataKey = "storicode_character";
const AppearanceContext = createContext({
  appearance: defaultAppearance,
  save: async (_appearance: Appearance) => {},
});

export function AppearanceProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [guest, setGuest] = useState(() =>
    readAppearance(readLocal(guestKey, null)),
  );
  const appearance = user
    ? readAppearance(user.user_metadata[metadataKey])
    : guest;

  async function save(appearance: Appearance) {
    const validated = readAppearance(appearance);
    if (user) {
      if (!supabase) throw new Error("Sign in again to save your character.");
      const { error } = await supabase.auth.updateUser({
        data: { [metadataKey]: validated },
      });
      if (error) throw error;
    } else {
      if (!writeLocal(guestKey, validated))
        throw new Error("This browser could not save your character.");
      setGuest(validated);
    }
  }

  return (
    <AppearanceContext.Provider value={{ appearance, save }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => useContext(AppearanceContext);
