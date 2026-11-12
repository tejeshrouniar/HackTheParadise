import { Grimoire, GrimoireHeaderSlot, PageTurnProvider } from "../features/library/Grimoire";
import { LibraryHeader } from "../features/library/LibraryHeader";
import { LibraryEntrance } from "../features/library/LibraryEntrance";
import type { CSSProperties } from "react";
import { MagicalBookshelf } from "../features/library/MagicalBookshelf";
import { LibraryUtilityPage } from "../features/library/LibraryUtilityPage";
import { LIBRARY } from "../content/library";
import { useProgress } from "../features/learning/ProgressContext";
import { canEnterLevel, journeyProgress } from "../features/learning/journeyProgress";
import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Headphones,
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
import { BookNotice, Loading } from "../components/ui/Status";
import { ProfileForm } from "../features/profile/ProfileForm";
import { CODEDEX_LESSONS } from "../data/codedexLessons";
import toast from "react-hot-toast";
import { errorMessage } from "../lib/validation";
import { MiniPlayer } from "../features/tools/MiniPlayer";
import { STORY_BOOKS } from "../content/storyBooks";
import { readLocal, writeLocal } from "../lib/validation";
import "../styles/adventure.css";
import "../styles/trail.css";
import "../styles/storybooks.css";
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
const BookHub = lazy(() => import("../features/story/BookHubPage").then((module) => ({ default: module.BookHubPage })));
const BookLevel = lazy(() => import("../features/learning/BookLevelPage").then((module) => ({ default: module.BookLevelPage })));
const Chat = lazy(() => import("../features/chat/ChatPage"));
const Settings = lazy(() => import("../features/settings/SettingsPage"));
const Tools = lazy(() => import("../features/tools/ToolsDrawer"));
const Journal = lazy(() => import("../features/story/PlayerJournal"));
const Playground = lazy(() =>
  import("../components/CodedexHome/ArcaneTerminalModal").then((m) => ({
    default: m.ArcaneTerminalModal,
  })),
);
const links = [
  { id: "story", label: "Bookshelf", Icon: BookOpen },
  { id: "community", label: "Community", Icon: MessageCircle },
];
// Hash routes keep direct links working on static hosting without server rewrites.
const routeFromHash = () => {
  const route = location.hash.slice(2);
  if (route === "home" || !route) return "story";
  const bookRoute = route.match(/^book(?:-story)?\/([a-z0-9-]+)$/);
  const knownBookRoute = bookRoute && STORY_BOOKS.some((book) => book.id === bookRoute[1]);
  if (knownBookRoute || /^library\/(theme|lore|profile|account|contact)$/.test(route)) return route;
  return /^(entrance|learn|story|community|settings|quest\/(?:[1-9]|1[0-2])|book-level\/[a-z0-9-]+)$/.test(route)
    ? route
    : "story";
};
const levelRoutes = [
  ...Array.from({ length: 12 }, (_, index) => `quest/${index + 1}`),
  ...STORY_BOOKS.flatMap(book => book.kind === "coding" ? book.chapters.map(chapter => `book-level/${chapter.chapterId}`) : []),
];
export function AppShell() {
  const { user, isPasswordRecovery, signOut } = useAuth();
  const { completed } = useProgress();
  const { profile } = useProfile();
  const { preferences } = usePreferences();
  const [small, setSmall] = useState(
    () => window.matchMedia("(max-width:760px)").matches,
  );
  const [{ route, previousRoute }, setRouteState] = useState(() => ({ route: routeFromHash(), previousRoute: "" }));
  const previousLevel = levelRoutes.indexOf(previousRoute);
  const currentLevel = levelRoutes.indexOf(route);
  const levelTurn = previousLevel >= 0 && currentLevel >= 0 ? (currentLevel < previousLevel ? "previous" : "next") : undefined;
  function setRoute(next: string) {
    setRouteState(current => current.route === next ? current : { route: next, previousRoute: current.route });
  }
  const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    const routeMatch = routeFromHash().match(/^book(?:-story)?\/([a-z0-9-]+)$/);
    const routeBook = routeMatch && STORY_BOOKS.find((book) => book.id === routeMatch[1]);
    if (routeBook) return routeBook.id;
    const saved = readLocal("storicode-active-book-v2", "harry-potter");
    return STORY_BOOKS.some((book) => book.id === saved) ? saved : "harry-potter";
  });
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [auth, setAuth] = useState(false);
  const [tools, setTools] = useState(false);
  const [toolsMounted, setToolsMounted] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [journal, setJournal] = useState(false);
  const [playground, setPlayground] = useState(false);
  const [character, setCharacter] = useState(false);
  const name =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    "Curious learner";
  const avatar = profile?.avatar_url ?? user?.user_metadata?.avatar_url;
  const selectedBook = STORY_BOOKS.find((book) => book.id === selectedBookId) ?? STORY_BOOKS[0];
  useEffect(() => {
    writeLocal("storicode-active-book-v2", selectedBookId);
  }, [selectedBookId]);
  useEffect(() => {
    if (route.startsWith("quest/")) setSelectedBookId("cinder");
    const levelBook = STORY_BOOKS.find((book) => book.kind === "coding" && book.chapters.some((chapter) => `book-level/${chapter.chapterId}` === route));
    if (levelBook) setSelectedBookId(levelBook.id);
    const match = route.match(/^book(?:-story)?\/([a-z0-9-]+)$/);
    if (match && STORY_BOOKS.some((book) => book.id === match[1])) setSelectedBookId(match[1]);
  }, [route]);
  function navigate(next: string) {
    if (location.hash !== `#/${next}`) location.hash = `/${next}`;
    setRoute(next);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const openQuest = (id: number) => {
    if (canEnterLevel(id, completed)) { setSelectedBookId("cinder"); navigate(`quest/${id}`); }
    else toast("Finish the earlier levels to unlock this part of the story.");
  };
  const openBookChapter = (bookId: string, chapterId: string) => {
    setSelectedBookId(bookId);
    setSelectedChapterId(chapterId);
    navigate(bookId === "cinder" ? "book-story/cinder" : `book-level/${chapterId}`);
  };
  const openBookMovie = (bookId: string, chapterId: string) => {
    setSelectedBookId(bookId);
    setSelectedChapterId(chapterId);
    navigate(`book-story/${bookId}`);
  };
  const openBookLevel = (bookId: string, chapterId: string) => {
    setSelectedBookId(bookId);
    setSelectedChapterId(chapterId);
    navigate(`book-level/${chapterId}`);
  };
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
        className={`sc-app sc-adventure-shell sc-magical-app ${route === "learn" ? "sc-on-home sc-on-map" : ""} ${route === "story" ? "sc-on-story" : ""} ${route.startsWith("quest/") || route.startsWith("book-level/") ? "sc-on-quest" : ""} ${route.startsWith("book-level/") ? "sc-on-book-level" : ""}`}
        data-book-theme={selectedBook.theme}
        style={{ "--book-cover": selectedBook.palette.primary, "--book-secondary": selectedBook.palette.secondary, "--book-background": selectedBook.palette.background, "--paper": selectedBook.palette.paper, "--paper-ink": selectedBook.palette.text, "--gold-rim": selectedBook.palette.accent } as CSSProperties}
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
        <PageTurnProvider routeDirection={levelTurn}><GrimoireHeaderSlot.Provider value={headerSlot}>
        <LibraryHeader
          onMenu={() => setMobile(true)} onLibrary={() => navigate("story")}
          onProfile={() => user ? navigate("library/profile") : setAuth(true)}
          onAccount={() => navigate("library/account")} onTools={openTools} onSearch={() => setSearch(true)}
          headerRef={setHeaderSlot}
          title={route === "story" ? "THE MAGICAL LIBRARY" : route.startsWith("library/") ? LIBRARY.find((book) => book.route === route)?.title ?? "Library" : selectedBook.title}
        />
        <div className="sc-workspace" {...(tools ? { inert: "" } : {})}>
          <main id="main-content" className="sc-route-turn" data-level-turn={levelTurn} key={route} tabIndex={-1}>
            <Suspense fallback={<BookNotice title="Turning the page"><Loading label="Opening your book…" /></BookNotice>}>
              {route.startsWith("book-level/") ? (
                <BookLevel
                  bookId={selectedBookId}
                  chapterId={route.slice("book-level/".length)}
                  onLevels={() => navigate("learn")}
                  onStoryFilm={openBookMovie}
                  onChapterChange={(id) => {
                    setSelectedChapterId(id);
                    navigate(`book-level/${id}`);
                  }}
                />
              ) : route.startsWith("quest/") && !canEnterLevel(Number(route.split("/")[1]), completed) ? (
                <div className="sc-page"><Grimoire label="A page yet to be written" left={<><h1>This level is still locked</h1><p>Follow the story in order to reach this place.</p></>} right={<><h2>Your next page</h2><button className="sc-button" onClick={() => openQuest(journeyProgress(completed).next)}>Continue your story</button></>} /></div>
              ) : route.startsWith("quest/") ? (
                <Quest
                  key={route}
                  initialLessonId={Number(route.split("/")[1])}
                  onExit={() => navigate("learn")}
                  onLessonChange={openQuest}
                />
              ) : route === "entrance" ? (
                <LibraryEntrance force onEnter={() => navigate("story")} />
              ) : route === "story" ? (
                <LibraryEntrance><MagicalBookshelf onTools={openTools} onSignIn={() => setAuth(true)} onOpen={(book) => {
                  if (book.storyId) { setSelectedBookId(book.storyId); setSelectedChapterId(null); }
                  navigate(book.route);
                }} /></LibraryEntrance>
              ) : route.startsWith("library/") ? (
                <LibraryUtilityPage id={route.slice("library/".length)} onNavigate={navigate} onSignIn={() => setAuth(true)} onCharacter={() => setCharacter(true)} onTools={openTools} />
              ) : route.startsWith("book/") ? (
                <BookHub
                  bookId={route.slice("book/".length)}
                  onShelf={() => navigate("story")}
                  onPlayLevels={() => navigate("learn")}
                  onReadStory={(chapterId) => {
                    setSelectedChapterId(chapterId ?? null);
                    navigate(`book-story/${route.slice("book/".length)}`);
                  }}
                />
              ) : route.startsWith("book-story/") ? (
                <Story
                  mode="reader"
                  selectedBookId={selectedBookId}
                  chapterId={selectedChapterId}
                  onBookOpen={(id) => navigate(`book/${id}`)}
                  onBookHome={() => navigate(`book/${selectedBookId}`)}
                  onChapterChange={setSelectedChapterId}
                  onPlayLevels={() => navigate("learn")}
                  onCodeLevel={openBookLevel}
                />
              ) : route === "community" ? (
                <Chat onSignIn={() => setAuth(true)} />
              ) : route === "settings" ? (
                <Settings
                  onSignIn={() => setAuth(true)}
                  onCharacter={() => setCharacter(true)}
                />
              ) : (
                <Dashboard
                  bookId={selectedBookId}
                  onQuest={openQuest}
                  onOpenBookChapter={openBookChapter}
                  onBack={() => navigate(`book/${selectedBookId}`)}
                />
              )}
            </Suspense>
          </main>
          <footer className="sc-site-footer"><strong>Hack The Paradise</strong><span>© 2026 Hack The Paradise</span><a href="https://github.com/tejeshrouniar/HackTheParadise" target="_blank" rel="noreferrer">Repository</a><a href="https://github.com/tejeshrouniar/HackTheParadise/issues" target="_blank" rel="noreferrer">Contact / feedback</a></footer>
        </div>
        </GrimoireHeaderSlot.Provider></PageTurnProvider>
        <Modal open={mobile} onClose={() => setMobile(false)} title="Your library" description="Choose a book or a place to explore.">
          <nav className="sc-library-menu" aria-label="Library navigation">
            <button onClick={() => navigate("story")}><BookOpen size={18} /> Bookshelf</button>
            <button onClick={() => navigate("entrance")}>Landing page</button>
            {LIBRARY.map((book) => <button key={book.id} onClick={() => { if (book.storyId) setSelectedBookId(book.storyId); navigate(book.route); }}>{book.title}</button>)}
            <button onClick={() => { setMobile(false); setSearch(true); }}><Search size={18} /> Search quests</button>
          </nav>
        </Modal>
        <AuthModal
          isOpen={auth}
          onClose={() => setAuth(false)}
          onGuest={() => {}}
          onAuthenticated={() => setAuth(false)}
        />
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
          {journal && (
            <Journal isOpen={journal} onClose={() => setJournal(false)} />
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
