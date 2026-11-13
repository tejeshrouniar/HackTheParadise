import { BookOpen, Search, UserRound, Zap } from "lucide-react";
import { useHintWallet } from "../learning/useHintWallet";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { Avatar } from "../../components/ui/Avatar";
import bookmarkArt from "../../assets/library/cover-tools-bookmark.webp";

export function ToolsBookmark({ open, onClick }: { open: boolean; onClick: (trigger: HTMLButtonElement) => void }) {
  return (
    <button type="button" className="htp-tools-bookmark" aria-label="Open tools and settings bookmark" aria-haspopup="dialog" aria-expanded={open} onClick={event => onClick(event.currentTarget)}>
      <img src={bookmarkArt} alt="" draggable={false} />
    </button>
  );
}

export function LibraryBookmarks({ onLibrary, onProfile, onAccount, onTools, onSearch, chapterRef, toolsOpen }: {
  onLibrary: () => void;
  onProfile: () => void;
  onAccount: () => void;
  onTools: (trigger: HTMLButtonElement) => void;
  onSearch: () => void;
  chapterRef: (node: HTMLDivElement | null) => void;
  toolsOpen: boolean;
}) {
  const wallet = useHintWallet();
  const { user } = useAuth();
  const { profile } = useProfile();
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
      </nav>
      <div className="htp-chapter-bookmark" ref={chapterRef} />
      <nav className="htp-bookmark-actions" aria-label="Tools and account">
        <button type="button" className="htp-page-tag" onClick={onSearch} aria-label="Search quests" title="Search quests"><Search size={17} /></button>
        <button type="button" className="htp-page-tag htp-page-tag--sparks" onClick={onAccount} aria-label={user ? `Open Spark wallet, ${wallet.unlimited ? "unlimited" : wallet.balance ?? "loading"}` : "Sign in to use Sparks"}>
          <Zap size={15} /><span>{!user ? "Sparks" : wallet.unlimited ? "∞" : wallet.balance ?? "…"}</span>
        </button>
        <button type="button" className="htp-page-tag" onClick={onProfile} aria-label={user ? "Open your profile" : "Sign in"} title={user ? "Profile" : "Sign in"}>
          {user ? <Avatar name={profile?.display_name || "Wizard"} url={profile?.avatar_url} /> : <UserRound size={18} />}
        </button>
        <ToolsBookmark open={toolsOpen} onClick={onTools} />
      </nav>
    </div>
  );
}
