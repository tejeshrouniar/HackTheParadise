import { BookOpen, LogIn, Search, Trophy, UserRound, Zap } from "lucide-react";
import { useHintWallet } from "../learning/useHintWallet";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { Avatar } from "../../components/ui/Avatar";
import bookmarkArt from "../../assets/library/cover-tools-bookmark.webp";
import { LEADERBOARD_ROUTE } from "../../content/library";

export function LeaderboardBookmark({ current, onClick }: { current?: boolean; onClick: () => void }) {
  return <a className="htp-page-tag htp-page-tag--leaderboard" href={`#/${LEADERBOARD_ROUTE}`}
    aria-label="Leaderboard" title="Leaderboard" aria-current={current ? "page" : undefined} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      onClick();
    }}>
    <Trophy size={16} aria-hidden="true" /> <span>Leaderboard</span>
  </a>;
}

export function ProfileBookmark({ current, onClick }: { current?: boolean; onClick: () => void }) {
  const { profile } = useProfile();
  const { user } = useAuth();
  return <button type="button" className="htp-page-tag htp-page-tag--profile" onClick={onClick}
    aria-label="Open profile" title="Profile" aria-current={current ? "page" : undefined}>
    {user ? <Avatar name={profile?.display_name || "Wizard"} url={profile?.avatar_url} /> : <UserRound size={16} aria-hidden="true" />}
    <span>Profile</span>
  </button>;
}

export function AccountBookmark({ onAccount, onSignIn }: { onAccount: () => void; onSignIn: () => void }) {
  const { user } = useAuth();
  return <button type="button" className="htp-page-tag htp-page-tag--account" onClick={user ? onAccount : onSignIn}
    aria-label={user ? "Open account" : "Sign in or create an account"} title={user ? "Account" : "Sign in or create an account"}>
    <LogIn size={16} aria-hidden="true" /> <span>{user ? "Account" : "Sign in"}</span>
  </button>;
}

export function ToolsBookmark({ open, onClick }: { open: boolean; onClick: (trigger: HTMLButtonElement) => void }) {
  return (
    <button type="button" className="htp-tools-bookmark" aria-label="Open tools and settings bookmark" aria-haspopup="dialog" aria-expanded={open} onClick={event => onClick(event.currentTarget)}>
      <img src={bookmarkArt} alt="" draggable={false} />
    </button>
  );
}

export function LibraryBookmarks({ onLibrary, onLeaderboard, leaderboardOpen, onProfile, profileOpen, onAccount, onSignIn, onTools, onSearch, chapterRef, toolsOpen }: {
  onLibrary: () => void;
  onLeaderboard: () => void;
  leaderboardOpen: boolean;
  onProfile: () => void;
  profileOpen: boolean;
  onAccount: () => void;
  onSignIn: () => void;
  onTools: (trigger: HTMLButtonElement) => void;
  onSearch: () => void;
  chapterRef: (node: HTMLDivElement | null) => void;
  toolsOpen: boolean;
}) {
  const wallet = useHintWallet();
  const { user } = useAuth();
  return (
    <div className="htp-page-bookmarks" {...(toolsOpen ? { inert: "" } : {})}>
      <nav className="htp-bookmark-links" aria-label="Library shortcuts">
        <a className="htp-page-tag htp-page-tag--shelf" href="#/bookshelf" aria-label="Back to bookshelf" onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onLibrary();
        }}>
          <BookOpen size={16} aria-hidden="true" /> <span>Bookshelf</span>
        </a>
        <LeaderboardBookmark current={leaderboardOpen} onClick={onLeaderboard} />
      </nav>
      <div className="htp-chapter-bookmark" ref={chapterRef} />
      <nav className="htp-bookmark-actions" aria-label="Tools and account">
        <button type="button" className="htp-page-tag" onClick={onSearch} aria-label="Search quests" title="Search quests"><Search size={17} /></button>
        <button type="button" className="htp-page-tag htp-page-tag--sparks" onClick={onAccount} aria-label={user ? `Open Spark wallet, ${wallet.unlimited ? "unlimited" : wallet.balance ?? "loading"}` : "Sign in to use Sparks"}>
          <Zap size={15} /><span>{!user ? "Sparks" : wallet.unlimited ? "∞" : wallet.balance ?? "…"}</span>
        </button>
        <ProfileBookmark current={profileOpen} onClick={onProfile} />
        <AccountBookmark onAccount={onAccount} onSignIn={onSignIn} />
        <ToolsBookmark open={toolsOpen} onClick={onTools} />
      </nav>
    </div>
  );
}
