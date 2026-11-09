import React, { useState } from 'react';
import { WizardProfile } from '../../types';
import {
  Wand2,
  Sparkles,
  Map,
  BookOpen,
  User,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../../utils/sound';

export interface NavbarProps {
  currentTab: 'home' | 'map' | 'lab';
  onSelectTab: (tab: 'home' | 'map' | 'lab') => void;
  onOpenGrimoire: () => void;
  onOpenProfile: () => void;
  onOpenGuide: () => void;
  profile: WizardProfile;
  onResetProgress: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenGrimoire,
  onOpenProfile,
  onOpenGuide,
  profile,
  onResetProgress,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isAmbience, setIsAmbience] = useState(sound.isAmbienceActive());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleAmbience = () => {
    const active = sound.toggleAmbience();
    setIsAmbience(active);
  };

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.maxXp) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-night-950/85 backdrop-blur-md border-b border-magic/30 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => {
            sound.playClick();
            onSelectTab('home');
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-magic via-spellPink to-manaMint p-0.5 shadow-magic group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-night-950 rounded-2xl flex items-center justify-center text-xl">
              🪄
            </div>
          </div>
          <div>
            <div className="font-fantasy font-black text-lg md:text-xl text-moonCream tracking-wider flex items-center gap-1.5 group-hover:text-spellPink transition-colors">
              Storicode <Sparkles className="w-4 h-4 text-spellPink animate-pulse" />
            </div>
            <div className="text-[10px] text-magic-light font-code">Programming Through Magic</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-night-900/80 p-1 rounded-2xl border border-magic/20">
          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('home');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-fantasy font-bold transition-all ${
              currentTab === 'home'
                ? 'bg-magic text-night-950 shadow-sm'
                : 'text-moonCream/70 hover:text-moonCream hover:bg-white/5'
            }`}
          >
            🏰 Academy
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('map');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-fantasy font-bold transition-all ${
              currentTab === 'map'
                ? 'bg-magic text-night-950 shadow-sm'
                : 'text-moonCream/70 hover:text-moonCream hover:bg-white/5'
            }`}
          >
            🗺️ Realm Map
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onSelectTab('lab');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-fantasy font-bold transition-all ${
              currentTab === 'lab'
                ? 'bg-magic text-night-950 shadow-sm'
                : 'text-moonCream/70 hover:text-moonCream hover:bg-white/5'
            }`}
          >
            🧪 Spell Lab
          </button>
        </nav>

        {/* Right Section: Guide, Grimoire, Audio, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Step-by-Step Guide Button */}
          <button
            onClick={() => {
              sound.playWandCast();
              onOpenGuide();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-night-900/80 hover:bg-night-800 border border-manaMint/40 text-manaMint text-xs font-fantasy font-bold shadow-sm transition-all hover:scale-105"
            title="Interactive Step-by-Step Guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-manaMint animate-pulse" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Grimoire Button */}
          <button
            onClick={() => {
              sound.playWandCast();
              onOpenGrimoire();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-night-900/80 hover:bg-night-800 border border-spellPink/30 text-spellPink text-xs font-fantasy font-bold shadow-sm transition-all hover:scale-105"
            title="Open Arcane Grimoire"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grimoire</span>
          </button>

          {/* Sound Controls */}
          <div className="flex items-center bg-night-900/80 rounded-xl border border-white/10 p-1">
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg transition-colors ${
                isMuted ? 'text-red-400 hover:bg-red-500/10' : 'text-moonCream/70 hover:text-moonCream'
              }`}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleToggleAmbience}
              className={`p-1.5 rounded-lg transition-colors ${
                isAmbience ? 'text-manaMint bg-manaMint/20' : 'text-moonCream/50 hover:text-moonCream'
              }`}
              title={isAmbience ? 'Stop Ambient Synth Drone' : 'Play Ambient Synth Drone'}
            >
              <Music className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Player Profile Widget */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2.5 bg-gradient-to-r from-night-900 to-[#231a38] hover:border-magic/60 border border-magic/30 p-1.5 pr-3 rounded-2xl transition-all shadow-sm group"
          >
            <div className="w-7 h-7 rounded-xl bg-magic/20 border border-magic/40 flex items-center justify-center text-base">
              🧙‍♂️
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-fantasy font-bold text-moonCream leading-tight flex items-center gap-1.5">
                <span>{profile.name}</span>
                <span className="text-[9px] text-manaMint font-code">Lvl {profile.level}</span>
              </div>
              {/* Mini XP progress bar */}
              <div className="w-16 h-1 bg-night-950 rounded-full overflow-hidden mt-1 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-spellPink to-magic transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

