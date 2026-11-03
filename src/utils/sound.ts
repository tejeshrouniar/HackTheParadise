// Web Audio API Synthesizer & Procedural Lo-Fi Ambient Music Engine for Storicode

export interface BgmTrack {
  id: string;
  name: string;
  emoji: string;
  vibe: string;
  artist?: string;
}

export const BGM_TRACKS: BgmTrack[] = [
 { id: 'twilight', name: 'Twilight Sanctuary', emoji: '✨', vibe: 'Synthesized lo-fi and bells' },
 { id: 'citadel', name: 'Cyber Citadel', emoji: '🏰', vibe: 'Synthesized warm pads' },
 { id: 'meadow', name: 'Arcane Meadow', emoji: '🌿', vibe: 'Synthesized soft harp' },
];

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;

  // Background Music (BGM) Engine State - Independent volume
  private isBgmActive: boolean = false;
  private bgmVolume: number = 0.35; // Quiet initial volume
  private currentTrackId: string = 'twilight';
  private bgmMasterGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;
  private bgmIntervalId: any = null;
  private bgmMelodyIntervalId: any = null;
  private activePadOscs: OscillatorNode[] = [];
  private activePadGains: GainNode[] = [];
  private currentChordIndex: number = 0;
  private currentMelodyStep: number = 0;

  // Track Chords Definition (frequencies in Hz)
  private readonly trackChords: Record<string, number[][]> = {

    // Original Lo-Fi tracks
    twilight: [
      [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
      [110.00, 164.81, 220.00, 261.63, 293.66], // Am9
      [87.31, 174.61, 220.00, 261.63, 369.99],  // Fmaj7#11
      [98.00, 146.83, 196.00, 261.63, 293.66],  // Gsus4
    ],
    citadel: [
      [146.83, 220.00, 277.18, 329.63, 440.00], // Dmaj9
      [123.47, 185.00, 246.94, 293.66, 369.99], // Bm7
      [98.00, 196.00, 246.94, 293.66, 369.99],  // Gmaj7
      [110.00, 164.81, 220.00, 277.18, 329.63], // Aadd9
    ],
    meadow: [
      [174.61, 261.63, 329.63, 392.00, 440.00], // Fmaj9
      [130.81, 196.00, 261.63, 329.63, 392.00], // C/E
      [146.83, 220.00, 261.63, 329.63, 392.00], // Dm7
      [196.00, 246.94, 293.66, 392.00, 440.00], // G6
    ],
  };

  // Generative melody scales
  private readonly melodyHooks: Record<string, number[]> = {

    // Generative scales for ambient tracks
    twilight: [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50],
    citadel: [587.33, 659.25, 739.99, 880.00, 987.77, 1108.73, 1174.66],
    meadow: [698.46, 783.99, 880.00, 1046.50, 1174.66, 1318.51],
  };

  constructor() {
    // Restore saved volume preference or use a quiet default (0.35)
    try {
      const savedVol = localStorage.getItem('spellscript_bgm_volume');
      if (savedVol) {
        this.bgmVolume = Number.isFinite(Number(savedVol)) ? Math.max(0, Math.min(1, Number(savedVol))) : 0.35;
      } else {
        this.bgmVolume = 0.35;
      }
    } catch {
      this.bgmVolume = 0.35;
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEffectsEnabled(enabled: boolean) {
    this.isMuted = !enabled;
    window.dispatchEvent(new Event('storicode:sound'));
  }

  public toggleMute(): boolean {
    this.setEffectsEnabled(this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // ==========================================
  // PROCEDURAL LO-FI BGM SYNTHESIZER ENGINE
  // ==========================================

  public startBgm(trackId?: string) {
    if (trackId && BGM_TRACKS.some((t) => t.id === trackId)) {
      this.currentTrackId = trackId;
    }
    this.initCtx();
    if (!this.ctx) return;

    if (this.isBgmActive) {
      if (this.bgmMasterGain) {
        const target = this.bgmVolume;
        this.bgmMasterGain.gain.setValueAtTime(this.bgmMasterGain.gain.value, this.ctx.currentTime);
        this.bgmMasterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.3);
      }
      return;
    }

    this.isBgmActive = true;

    // Master BGM Gain Node (Boosted for full volume richness)
    this.bgmMasterGain = this.ctx.createGain();
    const initialGain = this.bgmVolume;
    this.bgmMasterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.bgmMasterGain.gain.linearRampToValueAtTime(initialGain, this.ctx.currentTime + 0.6);

    // Warm Lo-Fi Filter (Open at 1450Hz for crisp clarity and presence)
    this.bgmFilter = this.ctx.createBiquadFilter();
    this.bgmFilter.type = 'lowpass';
    this.bgmFilter.frequency.setValueAtTime(1450, this.ctx.currentTime);
    this.bgmFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.bgmFilter.connect(this.bgmMasterGain);
    this.bgmMasterGain.connect(this.ctx.destination);

    // Start chord loop & melody sequence
    this.currentChordIndex = 0;
    this.currentMelodyStep = 0;
    this.playNextChord();

    // Loop chords every 3.2 seconds
    this.bgmIntervalId = setInterval(() => {
      this.playNextChord();
    }, 3200);

    // Play melody hooks every 400ms - 800ms
    this.startMelodySequence();
  }

  public stopBgm() {
    if (this.bgmIntervalId) clearInterval(this.bgmIntervalId);
    if (this.bgmMelodyIntervalId) clearInterval(this.bgmMelodyIntervalId);
    this.bgmIntervalId = null;
    this.bgmMelodyIntervalId = null;
    this.stopPadOscs();
    this.bgmMasterGain?.disconnect();
    this.bgmFilter?.disconnect();
    this.bgmMasterGain = null;
    this.bgmFilter = null;
    this.isBgmActive = false;
  }

  public toggleBgm(): boolean {
    if (this.isBgmActive) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('spellscript_bgm_volume', this.bgmVolume.toString());
    } catch {
      // Ignore
    }
    if (this.bgmMasterGain && this.ctx) {
      this.bgmMasterGain.gain.setValueAtTime(this.bgmMasterGain.gain.value, this.ctx.currentTime);
      this.bgmMasterGain.gain.linearRampToValueAtTime(this.bgmVolume, this.ctx.currentTime + 0.1);
    }
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public isBgmPlaying(): boolean {
    return this.isBgmActive;
  }

  public setTrack(trackId: string) {
    if (this.trackChords[trackId]) {
      this.currentTrackId = trackId;
      this.currentChordIndex = 0;
      this.currentMelodyStep = 0;
      if (this.isBgmActive) {
        this.playNextChord();
      }
    }
  }

  public getCurrentTrack(): BgmTrack {
    return BGM_TRACKS.find((t) => t.id === this.currentTrackId) || BGM_TRACKS[0];
  }

  public getAvailableTracks(): BgmTrack[] {
    return BGM_TRACKS;
  }

  private stopPadOscs() {
    this.activePadOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore
      }
    });
    this.activePadGains.forEach((g) => {
      try {
        g.disconnect();
      } catch {
        // Ignore
      }
    });
    this.activePadOscs = [];
    this.activePadGains = [];
  }

  // Synthesize multi-voice warm chords with boosted fullness
  private playNextChord() {
    if (!this.ctx || !this.bgmFilter) return;

    const chords = this.trackChords[this.currentTrackId] || this.trackChords.twilight;
    const chord = chords[this.currentChordIndex % chords.length];
    this.currentChordIndex++;

    const now = this.ctx.currentTime;
    const chordDuration = 3.4;

    // Fade out previous pad voices
    this.activePadGains.forEach((g) => {
      try {
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.linearRampToValueAtTime(0, now + 0.6);
      } catch {
        // Ignore
      }
    });

    const newOscs: OscillatorNode[] = [];
    const newGains: GainNode[] = [];

    chord.forEach((freq, i) => {
      if (!this.ctx || !this.bgmFilter) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Richer harmonic mix (sine + triangle + saw detune)
      osc.type = i === 0 ? 'triangle' : i === 1 ? 'sine' : 'triangle';
      const detune = (i - 2) * 5;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      // Boosted voice gains for rich volume
      const voiceGain = i === 0 ? 0.16 : 0.09;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(voiceGain, now + 0.5);
      gain.gain.setValueAtTime(voiceGain, now + chordDuration - 0.7);
      gain.gain.linearRampToValueAtTime(0.001, now + chordDuration);

      osc.connect(gain);
      gain.connect(this.bgmFilter);

      osc.start(now);
      osc.stop(now + chordDuration + 0.1);

      newOscs.push(osc);
      newGains.push(gain);
    });

    // Gentle resonant sweep
    const targetFreq = 1200 + Math.sin(this.currentChordIndex) * 350;
    this.bgmFilter.frequency.setValueAtTime(this.bgmFilter.frequency.value, now);
    this.bgmFilter.frequency.linearRampToValueAtTime(targetFreq, now + 3.0);

    setTimeout(() => {
      this.activePadOscs = newOscs;
      this.activePadGains = newGains;
    }, 300);
  }

  // Melodic hook player
  private startMelodySequence() {
    const playNote = () => {
      if (!this.isBgmActive || !this.ctx || !this.bgmMasterGain) return;

      const hook = this.melodyHooks[this.currentTrackId] || this.melodyHooks.twilight;
      const note = hook[this.currentMelodyStep % hook.length];
      this.currentMelodyStep++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pluck / Bell voice
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);

      // Boosted hook note volume
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.bgmMasterGain);

      osc.start(now);
      osc.stop(now + 0.9);
    };

    // Melody tempo: 420ms for BTS upbeat tracks, 750ms for ballads
    const isBallad = this.currentTrackId === 'twilight';
    const tempoMs = isBallad ? 650 : 420;

    this.bgmMelodyIntervalId = setInterval(() => {
      playNote();
    }, tempoMs);
  }

  // ==========================================
  // SHORT SOUND EFFECTS (SFX)
  // ==========================================

  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Silent catch
    }
  }

  public playWandCast() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startTime = this.ctx.currentTime + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + 0.18);

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {
      // Silent catch
    }
  }

  public playFlowerBloom() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Silent catch
    }
  }

  public playCrystalCollect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now);
      osc.frequency.exponentialRampToValueAtTime(2093.0, now + 0.18);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Silent catch
    }
  }

  public playBubble() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Silent catch
    }
  }

  public playDragonStep() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Silent catch
    }
  }

  public playCurseBreak() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Silent catch
    }
  }

  public playError() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.15);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Silent catch
    }
  }

  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [587.33, 880.0];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startTime = this.ctx.currentTime + idx * 0.1;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {
      // Silent catch
    }
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.12 },
        { f: 783.99, d: 0.14 },
        { f: 1046.5, d: 0.35 },
      ];
      let offset = 0;
      const now = this.ctx.currentTime;
      notes.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const startTime = now + offset;
        osc.frequency.setValueAtTime(note.f, startTime);

        gain.gain.setValueAtTime(0.24, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + note.d + 0.05);
        offset += note.d * 0.8;
      });
    } catch {
      // Silent catch
    }
  }

  public playBossHit() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Silent catch
    }
  }

  // Alias: Potion bubble sound (used in potion lab quests)
  public playPotionBubble() {
    this.playBubble();
  }

  // Ambience state accessor (used by Navbar for BGM toggle display)
  public isAmbienceActive(): boolean {
    return this.isBgmActive;
  }

  // Ambience toggle (used by Navbar)
  public toggleAmbience(): boolean {
    if (this.isBgmActive) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.isBgmActive;
  }
}

export const sound = new SoundSystem();
