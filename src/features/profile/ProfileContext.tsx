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
  onboarding_completed: boolean;
}
const Context = createContext<{
  profile: Profile | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}>({ profile: null, loading: false, error: "", refresh: async () => {} });
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
    const { data, error } = await supabase.rpc("get_my_library_profile");
    if (error) {
      setError(errorMessage(error));
      setProfile(null);
    } else setProfile(data);
    setLoading(false);
  }, [user?.id]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <Context.Provider value={{ profile, loading, error, refresh }}>
      {children}
    </Context.Provider>
  );
}
export const useProfile = () => useContext(Context);
