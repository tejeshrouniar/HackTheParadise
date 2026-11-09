import "./styles/journey.css";
import React from "react";
import { useAuth } from "./contexts/AuthContext";
import { ProfileProvider } from "./features/profile/ProfileContext";
import { PreferencesProvider } from "./features/settings/PreferencesContext";
import { ProgressProvider } from "./features/learning/ProgressContext";
import { MusicProvider } from "./features/tools/MusicContext";
import { AppShell } from "./layouts/AppShell";
import { Loading } from "./components/ui/Status";
import { AppearanceProvider } from "./features/adventure/AppearanceContext";

// Keep account-scoped providers above the route shell so their state survives navigation.
export const App: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Opening Storicode…" />;
  return (
    <ProfileProvider key={user?.id ?? "guest"}>
      <PreferencesProvider>
        <ProgressProvider>
          <MusicProvider>
            <AppearanceProvider>
              <AppShell />
            </AppearanceProvider>
          </MusicProvider>
        </ProgressProvider>
      </PreferencesProvider>
    </ProfileProvider>
  );
};

export default App;
