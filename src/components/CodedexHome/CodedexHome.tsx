import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Search,
  Moon,
  Sun,
  ChevronDown,
  Trophy,
  BookOpen,
  Star,
  Compass,
  ArrowRight,
  X,
  Lock,
  Mail,
  User,
  Check,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import { CODEDEX_LESSONS, CodedexLesson } from '../../data/codedexLessons';
import { HTML_CSS_LESSONS } from '../../data/htmlCssLessons';
import homeBg from '../../assets/home-bg-sharp.png';
import { ArcaneTerminalModal } from './ArcaneTerminalModal';
import { SparkyCompanionModal } from './SparkyCompanionModal';
import { AuthModal } from '../Auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';

export interface CodedexHomeProps {
  onStartAdventure: (lessonId?: number) => void;
}

export const CodedexHome: React.FC<CodedexHomeProps> = ({ onStartAdventure }) => {
  // Always dark fantasy theme
  const isDarkMode = true;
  const { user, signOut, isPasswordRecovery } = useAuth();

  // Mascot Modal state
  const [isSparkyOpen, setIsSparkyOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);

  // Nav Dropdowns
  const [isLearnOpen, setIsLearnOpen] = useState<boolean>(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState<boolean>(false);

  // Search Modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sign Up Modal state
  const [isSignUpOpen, setIsSignUpOpen] = useState<boolean>(false);
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'Python' | 'JavaScript' | 'SpellScript'>('Python');
  const [selectedTrack, setSelectedTrack] = useState<'python' | 'htmlcss'>('python');
  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);

  // Close dropdowns on outside click or escape
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsLearnOpen(false);
        setIsPracticeOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLearnOpen(false);
        setIsPracticeOpen(false);
        setIsSearchOpen(false);
        setIsSignUpOpen(false);
        setIsTerminalOpen(false);
        setIsSparkyOpen(false);
      }
      // Quick search shortcut "/" or "Cmd+K" / "Ctrl+K"
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && !isSearchOpen && !isSignUpOpen) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, isSignUpOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Combined all lessons for search
  const allLessons = [...CODEDEX_LESSONS, ...HTML_CSS_LESSONS];

  // Search filter across lessons
  const filteredLessons = allLessons.filter((lesson) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lesson.title.toLowerCase().includes(q) ||
      lesson.chapter.toLowerCase().includes(q) ||
      lesson.conceptName.toLowerCase().includes(q) ||
      lesson.whatIsThisBody.toLowerCase().includes(q) ||
      lesson.stageType.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-body selection:bg-[#9274D8] selection:text-white overflow-x-hidden relative transition-colors duration-300 ${
        isDarkMode ? 'bg-[#120c22] text-[#FFF7ED]' : 'bg-[#F8F6FD] text-[#231238]'
      }`}
    >
      {/* 1. TOP NAVBAR */}
      <nav
        ref={navRef}
        className={`w-full px-4 md:px-8 py-3 sticky top-0 z-50 transition-colors backdrop-blur-md border-b ${
          isDarkMode
            ? 'bg-[#120c22]/85 border-[#8B5CF6]/30 shadow-lg shadow-black/20'
            : 'bg-[#FFFFFF]/90 border-[#DDD6FE] shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => {
              sound.playClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            {/* Magic Purple pixel coin badge */}
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] border-2 border-[#6D28D9] shadow-[0_3px_0_#4C1D95] flex items-center justify-center font-pixel text-[#FFF7ED] font-black text-base group-hover:scale-105 transition-transform">
              🪄
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`font-pixelify font-black text-2xl tracking-wide drop-shadow-sm transition-colors ${
                  isDarkMode ? 'text-[#FFF7ED]' : 'text-[#231238]'
                }`}
              >
                Storicode
              </span>
            </div>
          </div>

          {/* Middle Nav Links */}
          <div className="flex-1" />

          {/* Right actions: Search and Sign up button */}
          <div className="flex items-center gap-2.5">
            {/* Search Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsSearchOpen(true);
              }}
              className="p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold border-[#8B5CF6]/30 bg-[#1A1230]/60 text-[#EDE9FE] hover:text-white hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/10 cursor-pointer"
              title="Search spells and chapters (Press / or Cmd+K)"
            >
              <Search className="w-4 h-4 text-[#F472B6]" />
              <span className="hidden sm:inline opacity-80">Search</span>
              <kbd className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded font-code border bg-black/40 border-white/10 text-white/60">
                /
              </kbd>
            </button>

            {user ? (
              <div className="flex items-center gap-2 rounded-xl border border-[#5EEAD4]/25 bg-[#5EEAD4]/[.07] px-2 py-1.5">
                {user.user_metadata.avatar_url ? <img src={user.user_metadata.avatar_url} alt="" className="h-7 w-7 rounded-lg object-cover" /> : <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#5EEAD4]/15 text-xs font-bold text-[#5EEAD4]">{(user.user_metadata.display_name || user.email || 'S').slice(0, 1).toUpperCase()}</span>}
                <span className="hidden max-w-28 truncate text-xs font-semibold text-[#D6FFF7] sm:block">{user.user_metadata.display_name || user.email?.split('@')[0]}</span>
                <button onClick={() => void signOut()} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-white/50 transition hover:bg-white/10 hover:text-white" title="Sign out">Sign out</button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playWandCast();
                  setIsSignUpOpen(true);
                }}
                className="rounded-xl border-2 border-[#6D28D9] bg-[#8B5CF6] px-4 py-2 font-pixel text-xs font-bold uppercase tracking-wider text-[#FFF7ED] shadow-[0_3px_0_#4C1D95] transition-all hover:translate-y-[1px] hover:bg-[#9B6DF7] hover:shadow-[0_2px_0_#4C1D95] active:translate-y-[3px] active:shadow-none"
              >
                Join free
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 2. THE HERO SECTION: ULTRA-CRISP ENCHANTED CYBER CITADEL */}
      <section className="relative w-full overflow-hidden min-h-[88vh] md:min-h-[92vh] pt-16 pb-20 md:pt-20 md:pb-28 flex flex-col items-center justify-center text-center">
        {/* Crisp Background Image Container (No muddy radial haze) */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
          <img
            src={homeBg}
            alt="Storicode Enchanted Cyber Citadel"
            className="w-full h-full object-cover object-center select-none pointer-events-none"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              filter: isDarkMode
                ? 'contrast(1.05) brightness(1.02)'
                : 'contrast(1.08) brightness(1.15) saturate(1.05)',
            }}
          />

          {/* Crisp, clean edge transitions only — leaves center 85% razor sharp */}
          <div
            className={`absolute inset-x-0 top-0 h-28 pointer-events-none transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-b from-[#120c22]/80 via-[#120c22]/30 to-transparent'
                : 'bg-gradient-to-b from-[#F8F6FD]/80 via-[#F8F6FD]/30 to-transparent'
            }`}
          />
          <div
            className={`absolute inset-x-0 bottom-0 h-36 pointer-events-none transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-t from-[#120c22] via-[#120c22]/70 to-transparent'
                : 'bg-gradient-to-t from-[#F8F6FD] via-[#F8F6FD]/70 to-transparent'
            }`}
          />
        </div>

        {/* Ambient Magical Floating Light Points */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#5EEAD4] shadow-[0_0_12px_#5EEAD4] animate-pulse" />
          <div
            className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#F472B6] shadow-[0_0_12px_#F472B6] animate-pulse"
            style={{ animationDelay: '1.2s' }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-[#A78BFA] shadow-[0_0_10px_#A78BFA] animate-ping"
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* 🐲 Sparky Dragon Mascot Companion Button */}
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-14 z-20 flex items-end drop-shadow-2xl">
          <div className="flex flex-col items-center gap-1 group">
            <div
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0 pointer-events-none whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-pixel font-bold shadow-lg border bg-[#120C22]/95 border-[#F472B6]/50 text-[#F472B6]"
            >
              🐲 Talk to Sparky!
            </div>
            <button
              onClick={() => {
                sound.playWandCast();
                setIsSparkyOpen(true);
              }}
              className="cursor-pointer select-none transition-all duration-200 hover:scale-125 active:scale-100 group-hover:drop-shadow-[0_0_18px_rgba(244,114,182,0.8)] focus:outline-none focus:ring-2 focus:ring-[#F472B6] rounded-full"
              title="Talk to Sparky! Your Dragon Familiar 🐲"
              aria-label="Open Sparky Companion Sanctuary"
            >
              <span
                className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] animate-bounce block"
                style={{ animationDuration: '2.5s' }}
              >
                🐲
              </span>
            </button>
          </div>
        </div>

        {/* HERO TITLE & TEXT */}
        <div className="relative z-20 w-full max-w-6xl px-4 mx-auto space-y-4 translate-y-4 sm:translate-y-5">
          {/* Small Pixel Sub-Heading */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-lg font-pixel text-[11px] sm:text-xs font-black tracking-widest uppercase transition-colors ${
              isDarkMode
                ? 'bg-[#120c22]/80 border border-[#8B5CF6]/60 text-[#5EEAD4]'
                : 'bg-white/90 border border-[#8B5CF6]/40 text-[#0F766E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
            <span>START YOUR</span>
          </div>

          {/* HUGE CHUNKY 3D TITLE: "Coding Adventure" */}
          <h1 className="w-full font-pixelify font-extrabold text-[clamp(2rem,8.5vw,6rem)] tracking-tight leading-[1.3] select-none">
            <span
              className={`inline-block px-1 py-2 transition-transform bg-clip-text text-transparent ${
                isDarkMode
                  ? 'bg-gradient-to-b from-[#FFFFFF] via-[#F472B6] to-[#A78BFA] filter drop-shadow-[0_4px_0_#3B1D66] drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]'
                  : 'bg-gradient-to-b from-[#1E1B4B] via-[#701A75] to-[#4338CA] filter drop-shadow-[0_4px_0_#DDD6FE] drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]'
              }`}
            >
              Coding
            </span>{' '}
            <span
              className={`inline-block px-1 py-2 transition-transform bg-clip-text text-transparent ${
                isDarkMode
                  ? 'bg-gradient-to-b from-[#6EE7B7] via-[#38BDF8] to-[#818CF8] filter drop-shadow-[0_4px_0_#1E3A8A] drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]'
                  : 'bg-gradient-to-b from-[#0F766E] via-[#2563EB] to-[#4F46E5] filter drop-shadow-[0_4px_0_#DDD6FE] drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]'
              }`}
            >
              Adventure
            </span>
          </h1>

          {/* Tagline with crisp readability */}
          <p
            className={`text-sm sm:text-base md:text-lg font-bold max-w-xl mx-auto leading-relaxed pt-2 transition-colors ${
              isDarkMode
                ? 'text-[#FFFBEB] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]'
                : 'text-[#1E1B4B] drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]'
            }`}
          >
            The most fun and beginner-friendly way to learn to code. <span className="text-[#F472B6]">✦</span>
          </p>

          {/* Big Magic Purple CTA Button */}
          <div className="pt-4">
            <button
              onClick={() => {
                sound.playVictoryFanfare();
                onStartAdventure(1);
              }}
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-[#8B5CF6] hover:bg-[#9B6DF7] text-[#FFF7ED] font-pixel font-black text-sm sm:text-base uppercase tracking-wider border-4 border-[#4C1D95] shadow-[0_6px_0_#2E1065,0_12px_28px_rgba(139,92,246,0.45)] hover:translate-y-[2px] hover:shadow-[0_4px_0_#2E1065,0_8px_16px_rgba(139,92,246,0.45)] active:translate-y-[6px] active:shadow-none transition-all cursor-pointer inline-flex items-center gap-2.5 group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Get started</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. BOTTOM SECTION: Chapter Cards */}
      <section
        className={`w-full pt-14 pb-24 px-4 md:px-8 relative z-20 border-t transition-colors duration-300 ${
          isDarkMode ? 'bg-[#120c22] border-[#8B5CF6]/30' : 'bg-[#F8F6FD] border-[#DDD6FE]'
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-pixel uppercase transition-colors ${
                isDarkMode
                  ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#F472B6]'
                  : 'bg-purple-100 border border-purple-200 text-[#7C3AED]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Interactive Arcane Curriculum
            </div>
            <h2
              className={`font-pixelify font-black text-3xl sm:text-4xl md:text-5xl tracking-wide transition-colors ${
                isDarkMode ? 'text-[#FFF7ED]' : 'text-[#231238]'
              }`}
            >
              {selectedTrack === 'python'
                ? 'Explore 8 Magical Python Realms'
                : 'Explore 12 HTML & CSS Web Quests'}
            </h2>
            <p
              className={`text-sm max-w-xl mx-auto leading-relaxed transition-colors ${
                isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'
              }`}
            >
              {selectedTrack === 'python'
                ? 'Master algorithms, variables, loops, and functions through hands-on fantasy quests with live cause-and-effect!'
                : 'Weave web scrolls and style enchantments from HTML skeletons to CSS Flexbox, Grid, and responsive illusion mirrors!'}
            </p>

            {/* Language Track Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedTrack('python');
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-pixel font-bold uppercase transition-all flex items-center gap-2 border-2 ${
                  selectedTrack === 'python'
                    ? 'bg-[#8B5CF6] text-white border-[#6D28D9] shadow-lg shadow-purple-900/40 scale-105'
                    : isDarkMode
                    ? 'bg-[#1A1230] border-white/10 text-gray-400 hover:text-white'
                    : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                <span>🐍 Python Spellcraft (8 Quests)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedTrack('htmlcss');
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-pixel font-bold uppercase transition-all flex items-center gap-2 border-2 ${
                  selectedTrack === 'htmlcss'
                    ? 'bg-[#EC4899] text-white border-[#BE185D] shadow-lg shadow-pink-900/40 scale-105'
                    : isDarkMode
                    ? 'bg-[#1A1230] border-white/10 text-gray-400 hover:text-white'
                    : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                <span>🌐 HTML & CSS Enchanter (12 Quests)</span>
              </button>
            </div>
          </div>

          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedTrack === 'python' ? CODEDEX_LESSONS : HTML_CSS_LESSONS).map((l) => (
              <div
                key={l.id}
                onClick={() => {
                  sound.playWandCast();
                  onStartAdventure(l.id);
                }}
                className={`group relative rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl flex flex-col justify-between border-2 ${
                  isDarkMode
                    ? 'bg-[#1A1230]/90 backdrop-blur-md border-[#8B5CF6]/30 hover:border-[#F472B6] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]'
                    : 'bg-white/90 backdrop-blur-md border-[#DDD6FE] hover:border-[#8B5CF6] hover:shadow-xl'
                }`}
              >
                <div>
                  <div
                    className={`flex items-center justify-between pb-3 border-b mb-3 ${
                      isDarkMode ? 'border-white/10' : 'border-gray-100'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-pixel uppercase ${
                        isDarkMode ? 'text-[#5EEAD4]' : 'text-[#0F766E]'
                      }`}
                    >
                      {l.chapter}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-inner ${
                        isDarkMode ? 'bg-black/40' : 'bg-purple-100/60'
                      }`}
                    >
                      {l.stageType === 'dragon'
                        ? '🐲'
                        : l.stageType === 'potion'
                        ? '⚗️'
                        : l.stageType === 'garden'
                        ? '🌸'
                        : l.stageType === 'bridge'
                        ? '🔮'
                        : l.stageType === 'curse'
                        ? '⚡'
                        : l.stageType === 'stargate'
                        ? '🌌'
                        : l.stageType === 'chrono'
                        ? '⏳'
                        : l.stageType === 'boss'
                        ? '🏆'
                        : l.stageType === 'webpage'
                        ? '📜'
                        : l.stageType === 'styler'
                        ? '🎨'
                        : l.stageType === 'layout'
                        ? '🏛️'
                        : '✨'}
                    </span>
                  </div>

                  <h3
                    className={`font-pixelify font-bold text-2xl transition-colors ${
                      isDarkMode
                        ? 'text-[#FFF7ED] group-hover:text-[#F472B6]'
                        : 'text-[#231238] group-hover:text-[#7C3AED]'
                    }`}
                  >
                    {l.title}
                  </h3>

                  <div
                    className={`text-xs font-semibold mt-1 ${
                      isDarkMode ? 'text-[#DDD6FE]' : 'text-[#6D28D9]'
                    }`}
                  >
                    {l.conceptName}
                  </div>

                  <p
                    className={`text-xs mt-3 leading-relaxed line-clamp-2 ${
                      isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'
                    }`}
                  >
                    {l.taskObjective}
                  </p>
                </div>

                <div
                  className={`mt-6 pt-3 border-t flex items-center justify-between text-xs ${
                    isDarkMode ? 'border-white/10' : 'border-gray-100'
                  }`}
                >
                  <span
                    className={`text-[11px] font-code ${
                      isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
                    }`}
                  >
                    Interactive Quest
                  </span>
                  <span
                    className={`font-pixel text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform ${
                      isDarkMode ? 'text-[#5EEAD4]' : 'text-[#0F766E]'
                    }`}
                  >
                    <span>Start Quest</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Start Banner */}
          <div
            className={`p-8 rounded-3xl border-2 shadow-2xl flex flex-wrap items-center justify-between gap-6 transition-colors ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#1A1230] via-[#2A184C] to-[#140B28] border-[#8B5CF6]/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                : 'bg-gradient-to-r from-[#EDE9FE] via-[#F3E8FF] to-[#E0E7FF] border-[#A78BFA] shadow-lg'
            }`}
          >
            <div className="space-y-1">
              <h3
                className={`font-pixelify font-bold text-2xl sm:text-3xl transition-colors ${
                  isDarkMode ? 'text-[#FFF7ED]' : 'text-[#231238]'
                }`}
              >
                Ready to inscribe your first spell?
              </h3>
              <p
                className={`text-xs sm:text-sm transition-colors ${
                  isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'
                }`}
              >
                Join thousands of apprentice wizards learning Python through play.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playVictoryFanfare();
                onStartAdventure(1);
              }}
              className="px-6 py-3 rounded-2xl bg-[#8B5CF6] hover:bg-[#9B6DF7] text-[#FFF7ED] font-pixel font-bold text-xs uppercase border-2 border-[#6D28D9] shadow-[0_4px_0_#4C1D95] hover:translate-y-[1px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Jump into Chapter 1</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. MAGICAL SPOTLIGHT SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-2xl rounded-3xl border-2 p-6 shadow-2xl backdrop-blur-2xl animate-scaleUp relative flex flex-col max-h-[80vh] ${
              isDarkMode
                ? 'bg-[#1A1230]/95 border-[#8B5CF6]/60 text-[#FFF7ED] shadow-[0_0_50px_rgba(139,92,246,0.3)]'
                : 'bg-white/95 border-[#DDD6FE] text-[#231238] shadow-2xl'
            }`}
          >
            {/* Header / Input */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <Search className="w-5 h-5 text-[#F472B6]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quests, spells, variables, loops, dragons..."
                className={`flex-1 bg-transparent border-none outline-none font-medium text-base placeholder:text-gray-400 ${
                  isDarkMode ? 'text-white' : 'text-[#231238]'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`p-1.5 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                ESC
              </button>
            </div>

            {/* Quick Suggestion Tags */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto text-xs">
              <span className="text-[10px] font-pixel uppercase opacity-50">Filter:</span>
              {['All', 'Dragon', 'Potion', 'Loops', 'Bridge', 'Curse'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag === 'All' ? '' : tag.toLowerCase())}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                    (tag === 'All' && !searchQuery) || searchQuery.toLowerCase().includes(tag.toLowerCase())
                      ? 'bg-[#8B5CF6] text-white border-[#6D28D9]'
                      : isDarkMode
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                      : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2">
              {filteredLessons.length === 0 ? (
                <div className="text-center py-12 space-y-2 opacity-70">
                  <div className="text-4xl">🔍</div>
                  <div className="font-bold text-base">No magical records found</div>
                  <p className="text-xs">Try searching for "dragon", "variables", "potion", or "loops"</p>
                </div>
              ) : (
                filteredLessons.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      sound.playWandCast();
                      setIsSearchOpen(false);
                      onStartAdventure(l.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                      isDarkMode
                        ? 'border-white/10 bg-white/5 hover:bg-[#8B5CF6]/20 hover:border-[#8B5CF6]/60'
                        : 'border-gray-200 bg-purple-50/40 hover:bg-purple-100/60 hover:border-[#8B5CF6]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {l.stageType === 'dragon'
                          ? '🐲'
                          : l.stageType === 'potion'
                          ? '⚗️'
                          : l.stageType === 'garden'
                          ? '🌸'
                          : l.stageType === 'bridge'
                          ? '🔮'
                          : l.stageType === 'curse'
                          ? '⚡'
                          : l.stageType === 'stargate'
                          ? '🌌'
                          : l.stageType === 'chrono'
                          ? '⏳'
                          : l.stageType === 'boss'
                          ? '🏆'
                          : '✨'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-pixel uppercase ${isDarkMode ? 'text-[#5EEAD4]' : 'text-[#0F766E]'}`}>
                            {l.chapter}
                          </span>
                        </div>
                        <h4 className="font-pixelify font-bold text-lg">{l.title}</h4>
                        <p className={`text-xs line-clamp-1 ${isDarkMode ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>
                          {l.conceptName} • {l.whatIsThisBody}
                        </p>
                      </div>
                    </div>
                    <span className="font-pixel text-xs text-[#F472B6] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Jump</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onGuest={() => {
          setIsSignUpOpen(false);
          onStartAdventure(1);
        }}
        onAuthenticated={() => {
          sound.playVictoryFanfare();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }}
      />

      {/* 6. ARCANE TERMINAL SANDBOX MODAL */}
      <ArcaneTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onOpenQuest={onStartAdventure}
        isDarkMode={isDarkMode}
      />

      {/* 7. SPARKY COMPANION SANCTUARY MODAL */}
      <SparkyCompanionModal
        isOpen={isSparkyOpen}
        onClose={() => setIsSparkyOpen(false)}
        onOpenQuest={onStartAdventure}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
