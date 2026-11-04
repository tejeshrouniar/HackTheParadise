import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Compass,
  Headphones,
  Home,
  LogIn,
  Menu,
  MessageCircle,
  Search,
  Settings2,
  WandSparkles,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../features/profile/ProfileContext";
import { usePreferences } from "../features/settings/PreferencesContext";
import Dashboard from "../features/learning/Dashboard";
import { AuthModal } from "../components/Auth/AuthModal";
import { Modal } from "../components/ui/Modal";
import { Avatar } from "../components/ui/Avatar";
import { Loading } from "../components/ui/Status";
import { ProfileForm } from "../features/profile/ProfileForm";
import { CODEDEX_LESSONS } from "../data/codedexLessons";
import toast from "react-hot-toast";
import { errorMessage } from "../lib/validation";
import { MiniPlayer } from "../features/tools/MiniPlayer";
import "../styles/adventure.css";
import "../styles/trail.css";
const CharacterStudio = lazy(() =>
  import("../features/adventure/CharacterStudio").then((module) => ({
    default: module.CharacterStudio,
  })),
);
const Quest = lazy(() =>
  import("../components/CodedexView/CodedexApp").then((m) => ({
    default: m.CodedexApp,
  })),
);
const Story = lazy(() => import("../features/story/StoryPage"));
const Chat = lazy(() => import("../features/chat/ChatPage"));
const Settings = lazy(() => import("../features/settings/SettingsPage"));
const Tools = lazy(() => import("../features/tools/ToolsDrawer"));
const Companion = lazy(() => import("../features/story/AetherGuide"));
const Playground = lazy(() =>
  import("../components/CodedexHome/ArcaneTerminalModal").then((m) => ({
    default: m.ArcaneTerminalModal,
  })),
);
const links = [
  { id: "home", label: "Home", Icon: Home },
  { id: "learn", label: "World map", Icon: Compass },
  { id: "story", label: "Storybook", Icon: BookOpen },
  { id: "community", label: "Community", Icon: MessageCircle },
];
const routeFromHash = () =>
  /^#\/(home|learn|story|community|settings|quest\/(?:[1-9]|1[0-2]))$/.test(
    location.hash,
  )
    ? location.hash.slice(2)
    : "home";
export function AppShell() {
  const { user, isPasswordRecovery, signOut } = useAuth();
  const { profile } = useProfile();
  const { preferences } = usePreferences();
  const [small, setSmall] = useState(
    () => window.matchMedia("(max-width:760px)").matches,
  );
  const [route, setRoute] = useState(routeFromHash);
  const [mobile, setMobile] = useState(false);
  const [auth, setAuth] = useState(false);
  const [tools, setTools] = useState(false);
  const [toolsMounted, setToolsMounted] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [companion, setCompanion] = useState(false);
  const [playground, setPlayground] = useState(false);
  const [character, setCharacter] = useState(false);
  const name =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    "Curious learner";
  const avatar = profile?.avatar_url ?? user?.user_metadata?.avatar_url;
  function navigate(next: string) {
    if (location.hash !== `#/${next}`) location.hash = `/${next}`;
    setRoute(next);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const openQuest = (id: number) => navigate(`quest/${id}`);
  useEffect(() => {
    const listener = () => {
      setRoute(routeFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    if (isPasswordRecovery) setAuth(true);
  }, [isPasswordRecovery]);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width:760px)");
    const changed = () => setSmall(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    if (!small || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const sidebar = document.querySelector<HTMLElement>(".sc-sidebar");
    const items = () =>
      Array.from(
        sidebar?.querySelectorAll<HTMLElement>("button,a[href]") ?? [],
      ).filter((e) => e.getClientRects().length);
    items()[0]?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = items(),
        first = list[0],
        last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [small, mobile]);
  const openTools = () => {
    setMobile(false);
    setToolsMounted(true);
    setTools(true);
  };
  const results = CODEDEX_LESSONS.filter((l) =>
    `${l.title} ${l.conceptName}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <MotionConfig
      reducedMotion={preferences.reduced_motion ? "always" : "user"}
    >
      <div
        className={`sc-app sc-adventure-shell ${route === "home" ? "sc-on-home" : ""} ${route.startsWith("quest/") ? "sc-on-quest" : ""}`}
      >
        <a
          className="sc-skip"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
        >
          Skip to content
        </a>
        {mobile && (
          <button
            className="sc-mobile-scrim"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}
        <aside
          className={`sc-sidebar ${mobile ? "open" : ""}`}
          aria-label="Main navigation"
          {...((small && !mobile) || tools ? { inert: "" } : {})}
        >
          <div className="sc-brand">
            <span>
              <WandSparkles size={23} />
            </span>
            <strong>
              storicode<span>.</span>
            </strong>
          </div>
          <button
            className="sc-mobile-close sc-icon-button"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>

          <nav>
            {links.map(({ id, label, Icon }) => (
              <button
                key={id}
                aria-current={
                  route === id || (id === "learn" && route.startsWith("quest/"))
                    ? "page"
                    : undefined
                }
                className={
                  route === id || (id === "learn" && route.startsWith("quest/"))
                    ? "active"
                    : ""
                }
                onClick={() => navigate(id)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="sc-sidebar-bottom">
            <button
              className="sc-sidebar-profile"
              onClick={() => navigate("settings")}
              aria-current={route === "settings" ? "page" : undefined}
            >
              {user ? (
                <Avatar name={String(name)} url={avatar} />
              ) : (
                <Settings2 size={20} />
              )}
              <span>
                <strong>{user ? name : "Settings"}</strong>
                {user && <small>Account & settings</small>}
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </aside>
        <div
          className="sc-workspace"
          {...((small && mobile) || tools ? { inert: "" } : {})}
        >
          <header className="sc-topbar">
            <div className="sc-topbar-location">
              <button
                className="sc-mobile-menu sc-icon-button"
                aria-label="Open navigation"
                aria-expanded={mobile}
                onClick={() => setMobile(!mobile)}
              >
                <Menu size={22} />
              </button>
              <span className="sc-breadcrumb">
                <strong>
                  {route.startsWith("quest/")
                    ? "Coding quest"
                    : route === "settings"
                      ? "Settings"
                      : links.find((l) => l.id === route)?.label}
                </strong>
              </span>
            </div>
            <div className="sc-topbar-actions">
              <button
                className="sc-search-trigger"
                aria-label="Search quests"
                onClick={() => setSearch(true)}
              >
                <Search size={17} />
                <span>Search</span>
              </button>
              <button
                className="sc-tools-trigger"
                aria-label="Open tools"
                onClick={openTools}
              >
                <Headphones size={18} />
                <span>Tools</span>
              </button>
              {!user && (
                <button
                  className="sc-button sc-signin"
                  onClick={() => setAuth(true)}
                >
                  <LogIn size={16} />
                  <span>Sign in</span>
                </button>
              )}
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            <Suspense fallback={<Loading label="Opening your workspace…" />}>
              {route.startsWith("quest/") ? (
                <Quest
                  key={route}
                  initialLessonId={Number(route.split("/")[1])}
                  onExit={() => navigate("learn")}
                  onLessonChange={openQuest}
                />
              ) : route === "story" ? (
                <Story onQuest={openQuest} />
              ) : route === "community" ? (
                <Chat onSignIn={() => setAuth(true)} />
              ) : route === "settings" ? (
                <Settings
                  onSignIn={() => setAuth(true)}
                  onCharacter={() => setCharacter(true)}
                />
              ) : (
                <Dashboard
                  catalog={route === "learn"}
                  onQuest={openQuest}
                  onCompanion={() => setCompanion(true)}
                  onTerminal={() => setPlayground(true)}
                  onMap={() => navigate("learn")}
                  onCharacter={() => setCharacter(true)}
                />
              )}
            </Suspense>
          </main>
          <footer className="sc-site-footer"><strong>Storicode</strong><span>© 2026 Storicode</span><a href="https://github.com/tejeshrouniar/StoriCode" target="_blank" rel="noreferrer">Repository</a><a href="https://github.com/tejeshrouniar/StoriCode/issues" target="_blank" rel="noreferrer">Contact / feedback</a></footer>
        </div>
        <AuthModal
          isOpen={auth}
          onClose={() => setAuth(false)}
          onGuest={() => {}}
          onAuthenticated={() => setAuth(false)}
        />
        {!tools &&
          !auth &&
          !search &&
          !companion &&
          !playground &&
          !character &&
          !(small && mobile) && <MiniPlayer onOpen={openTools} />}
        <Modal
          open={
            !!profile && !profile.onboarding_completed && !isPasswordRecovery
          }
          onClose={() => {}}
          title="Make your first introduction."
          description="Choose how fellow learners will know you. You can change this later in your profile."
          required
        >
          <ProfileForm key={profile?.id} onboarding />
          <button
            className="sc-link sc-onboarding-signout"
            onClick={() =>
              void signOut().catch((error) => toast.error(errorMessage(error)))
            }
          >
            Sign out instead
          </button>
        </Modal>
        <Modal
          open={search}
          onClose={() => setSearch(false)}
          title="Find your next discovery"
          description="Search quests by topic or title."
        >
          <label className="sc-search-form">
            <Search size={19} />
            <input
              autoFocus
              aria-label="Search quests"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try movement, loops, functions…"
            />
          </label>
          <div className="sc-search-results">
            {results.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSearch(false);
                  openQuest(l.id);
                }}
              >
                <span className="sc-search-number">{l.id}</span>
                <span>
                  <strong>{l.title}</strong>
                  <small>{l.conceptName}</small>
                </span>
                <ArrowIcon />
              </button>
            ))}
            {!results.length && (
              <p>No quests match that search. Try another topic.</p>
            )}
          </div>
        </Modal>
        <Suspense fallback={null}>
          {toolsMounted && (
            <Tools open={tools} onClose={() => setTools(false)} />
          )}{" "}
          {companion && (
            <Companion isOpen={companion} onClose={() => setCompanion(false)} />
          )}
          {character && <CharacterStudio onClose={() => setCharacter(false)} />}
          {playground && (
            <Playground
              isOpen={playground}
              onClose={() => setPlayground(false)}
              onOpenQuest={(id) => openQuest(id ?? 1)}
              isDarkMode
            />
          )}
        </Suspense>
      </div>
    </MotionConfig>
  );
}
function ArrowIcon() {
  return <ChevronRight size={17} />;
}
