import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/validation";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  phone_number: string | null;
  school_name: string | null;
  leaderboard_visible: boolean;
  onboarding_completed: boolean;
}
type ProfileInput = Pick<Profile, "username" | "display_name" | "bio" | "school_name" | "phone_number" | "avatar_url" | "leaderboard_visible">;
const Context = createContext<{
  profile: Profile | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  saveProfile: (input: ProfileInput) => Promise<void>;
}>({ profile: null, loading: false, error: "", refresh: async () => {}, saveProfile: async () => {} });
export function ProfileProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!user || !supabase) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.rpc("get_my_library_profile");
      if (error) throw error;
      if (!data) throw new Error("Your profile could not be loaded. Try again.");
      setProfile(data);
    } catch (error) {
      setError(errorMessage(error));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  const saveProfile = useCallback(async (input: ProfileInput) => {
    if (!user || !supabase) throw new Error("Sign in to save your profile.");
    const { data, error } = await supabase.rpc("save_library_profile", {
      p_username: input.username,
      p_display_name: input.display_name,
      p_bio: input.bio,
      p_school_name: input.school_name,
      p_phone_number: input.phone_number,
      p_avatar_url: input.avatar_url,
      p_leaderboard_visible: input.leaderboard_visible,
    });
    if (error) throw error;
    if (!data) throw new Error("Your profile save could not be confirmed. Try again.");
    setProfile(data);
    setError("");
  }, [user?.id]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <Context.Provider value={{ profile, loading, error, refresh, saveProfile }}>
      {children}
    </Context.Provider>
  );
}
export const useProfile = () => useContext(Context);
