import { BookOpen, Headphones, Menu, Search, UserRound, Zap } from "lucide-react";
import { useHintWallet } from "../learning/useHintWallet";
import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../profile/ProfileContext";
import { Avatar } from "../../components/ui/Avatar";

export function LibraryHeader({ onMenu, onLibrary, onProfile, onAccount, onTools, onSearch, headerRef, title }: {
  onMenu: () => void; onLibrary: () => void; onProfile: () => void; onAccount: () => void;
  onTools: () => void; onSearch: () => void; headerRef: (node: HTMLDivElement | null) => void; title: string;
}) {
  const wallet = useHintWallet();
  const { user } = useAuth();
  const { profile } = useProfile();
  return <header className="sc-library-header">
    <div className="sc-library-header__start">
      <button className="sc-library-header__icon" onClick={onMenu} aria-label="Open library menu"><Menu size={21} /></button>
      <button className="sc-library-header__brand" onClick={onLibrary} aria-label="Storicode bookshelf"><BookOpen size={21} /><span>storicode.</span></button>
    </div>
    <div className="sc-library-header__chapter" ref={headerRef}><span className="sc-library-header__fallback">{title}</span></div>
    <div className="sc-library-header__actions">
      <button className="sc-library-header__icon sc-library-header__search" onClick={onSearch} aria-label="Search quests"><Search size={18} /></button>
      <button className="sc-library-header__icon" onClick={onTools} aria-label="Music and tools"><Headphones size={19} /></button>
      <button className="sc-header-sparks" onClick={onAccount} aria-label={user ? `Open Spark wallet, ${wallet.unlimited ? "unlimited" : wallet.balance ?? "loading"}` : "Sign in to use Sparks"}>
        <Zap size={15} /><span>{!user ? "Sparks" : wallet.unlimited ? "∞ Sparks" : `${wallet.balance ?? "…"} Sparks`}</span>
      </button>
      <button className="sc-header-profile" onClick={onProfile} aria-label={user ? "Open your profile" : "Sign in"}>
        {user ? <Avatar name={profile?.display_name || "Wizard"} url={profile?.avatar_url} /> : <UserRound size={20} />}
      </button>
    </div>
  </header>;
}
