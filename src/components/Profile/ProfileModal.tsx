import React, { useState } from 'react';
import { WizardProfile } from '../../types';
import {
  AVATAR_OPTIONS,
  HOUSE_OPTIONS,
  WAND_OPTIONS,
  FAMILIAR_OPTIONS,
  ALL_BADGES,
} from '../../data/wizardCustomization';
import { X, Sparkles, Wand2, Shield, Heart, Trophy, Check } from 'lucide-react';
import { sound } from '../../utils/sound';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: WizardProfile;
  onUpdateProfile: (updated: Partial<WizardProfile>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'avatar' | 'house' | 'wand' | 'familiar' | 'badges'>('avatar');
  const [wizardName, setWizardName] = useState(profile.name);

  if (!isOpen) return null;

  const handleNameSave = () => {
    sound.playClick();
    onUpdateProfile({ name: wizardName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-br from-[#241a38] via-[#191228] to-[#0f0b18] border-2 border-magic/60 rounded-3xl shadow-magic-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-magic/30 bg-night-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-magic to-spellPink flex items-center justify-center text-2xl shadow-inner border border-moonCream/20">
              🧙‍♂️
            </div>
            <div>
              <h2 className="font-fantasy font-bold text-lg text-moonCream tracking-wider flex items-center gap-2">
                Wizard Sanctuary & Profile <Sparkles className="w-4 h-4 text-spellPink" />
              </h2>
              <p className="text-xs text-manaMint">Customize Your Arcane Identity & Attunement</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-moonCream/60 hover:text-moonCream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Overview Banner */}
        <div className="p-6 bg-night-950/40 border-b border-magic/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Current Avatar Icon */}
            <div className="w-16 h-16 rounded-2xl bg-magic/20 border-2 border-magic flex items-center justify-center text-4xl shadow-magic">
              {AVATAR_OPTIONS.find((a) => a.id === profile.avatar)?.emoji || '🧙'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={wizardName}
                  onChange={(e) => setWizardName(e.target.value)}
                  onBlur={handleNameSave}
                  className="font-fantasy font-bold text-base text-moonCream bg-night-900/80 px-2 py-0.5 rounded border border-magic/40 focus:border-manaMint focus:outline-none"
                  title="Click to edit name"
                />
                <span className="text-xs text-magic-light font-code">Lvl {profile.level}</span>
              </div>
              <p className="text-xs text-manaMint/90 mt-0.5">
                House of {profile.house} • {profile.wand}
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-night-900/90 border border-manaMint/30 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-moonCream/60 uppercase">Mana</div>
              <div className="text-xs font-bold text-manaMint font-code">{profile.mana} MP</div>
            </div>
            <div className="bg-night-900/90 border border-spellPink/30 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-moonCream/60 uppercase">Cosmic Gems</div>
              <div className="text-xs font-bold text-spellPink font-code">💎 {profile.gems}</div>
            </div>
            <div className="bg-night-900/90 border border-runeAmber/30 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-moonCream/60 uppercase">XP</div>
              <div className="text-xs font-bold text-runeAmber font-code">{profile.xp} XP</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-magic/20 bg-night-900/60 px-6 gap-2 pt-2">
          {[
            { id: 'avatar', label: 'Robes & Avatar' },
            { id: 'house', label: 'Magical House' },
            { id: 'wand', label: 'Wand & Scepter' },
            { id: 'familiar', label: 'Familiar Pet' },
            { id: 'badges', label: 'Achievements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 text-xs font-fantasy font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-spellPink text-spellPink'
                  : 'border-transparent text-moonCream/60 hover:text-moonCream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Avatar Tab */}
          {activeTab === 'avatar' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = profile.avatar === avatar.id;

                return (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      sound.playWandCast();
                      onUpdateProfile({ avatar: avatar.id, title: avatar.title });
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-magic/25 border-magic shadow-magic'
                        : 'bg-night-900/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{avatar.emoji}</span>
                      <div>
                        <div className="font-fantasy font-bold text-xs text-moonCream">
                          {avatar.name}
                        </div>
                        <div className="text-[10px] text-magic-light">{avatar.title}</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-moonCream/70 mt-2 leading-relaxed">
                      {avatar.description}
                    </p>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-magic flex items-center justify-center text-night-950 text-xs font-bold">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* House Tab */}
          {activeTab === 'house' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {HOUSE_OPTIONS.map((house) => {
                const isSelected = profile.house === house.id;

                return (
                  <button
                    key={house.id}
                    onClick={() => {
                      sound.playWandCast();
                      onUpdateProfile({ house: house.id });
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-magic/25 border-magic shadow-magic'
                        : 'bg-night-900/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{house.icon}</span>
                      <div>
                        <div className="font-fantasy font-bold text-sm text-moonCream">
                          {house.name}
                        </div>
                        <div className="text-[10px] text-spellPink italic">"{house.motto}"</div>
                      </div>
                    </div>
                    <p className="text-xs text-moonCream/70 mt-2.5 leading-relaxed">
                      {house.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-spellPink flex items-center justify-center text-night-950 text-xs font-bold">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Wand Tab */}
          {activeTab === 'wand' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {WAND_OPTIONS.map((wand) => {
                const isSelected = profile.wand === wand.name;

                return (
                  <button
                    key={wand.id}
                    onClick={() => {
                      sound.playWandCast();
                      onUpdateProfile({ wand: wand.name });
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-magic/25 border-magic shadow-magic'
                        : 'bg-night-900/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{wand.icon}</span>
                      <div>
                        <div className="font-fantasy font-bold text-sm text-moonCream">
                          {wand.name}
                        </div>
                        <div className="text-[10px] text-manaMint font-bold">{wand.power}</div>
                      </div>
                    </div>
                    <div className="text-xs text-moonCream/60 mt-2 space-y-0.5">
                      <div>Core: {wand.core}</div>
                      <div>Wood: {wand.wood}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-manaMint flex items-center justify-center text-night-950 text-xs font-bold">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Familiar Tab */}
          {activeTab === 'familiar' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {FAMILIAR_OPTIONS.map((familiar) => {
                const isSelected = profile.familiar === familiar.name;

                return (
                  <button
                    key={familiar.id}
                    onClick={() => {
                      sound.playWandCast();
                      onUpdateProfile({ familiar: familiar.name });
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-magic/25 border-magic shadow-magic'
                        : 'bg-night-900/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{familiar.emoji}</span>
                      <div>
                        <div className="font-fantasy font-bold text-sm text-moonCream">
                          {familiar.name} the {familiar.species}
                        </div>
                        <div className="text-[10px] text-runeAmber font-bold">{familiar.trait}</div>
                      </div>
                    </div>
                    <p className="text-xs text-moonCream/70 mt-2 leading-relaxed">
                      {familiar.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-runeAmber flex items-center justify-center text-night-950 text-xs font-bold">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Badges & Achievements Tab */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_BADGES.map((badge) => {
                const isUnlocked = profile.badges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isUnlocked
                        ? 'bg-magic/20 border-magic shadow-sm'
                        : 'bg-night-950/40 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{badge.icon}</span>
                      <div>
                        <div className="font-fantasy font-bold text-xs text-moonCream">
                          {badge.title}
                        </div>
                        <div className="text-[9px] font-bold uppercase text-manaMint">
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-moonCream/70 mt-2 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-magic/20 bg-night-900/90 flex items-center justify-between text-xs text-moonCream/60">
          <span>Storicode Academy Records</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-magic text-night-950 font-bold hover:bg-magic-light transition-colors"
          >
            Save & Return to Academy
          </button>
        </div>
      </div>
    </div>
  );
};

