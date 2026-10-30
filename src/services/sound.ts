import { SOUND_EVENTS_REGISTRY, SoundEventId, ALL_REGISTERED_SOUND_FILES } from '../config/soundEvents';

class SoundService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private memeSoundsEnabled: boolean = typeof window !== 'undefined'
    ? localStorage.getItem('richup_meme_sounds') !== '0'
    : true;
  private volume: number = 0.45;
  private memeAudioCache: Record<string, HTMLAudioElement> = {};
  private currentAudio: HTMLAudioElement | null = null;
  private lastAudioStartTime: number = 0;

  public stopCurrentSound() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
  }

  public isSoundPlaying(): boolean {
    return Boolean(this.currentAudio && !this.currentAudio.paused && !this.currentAudio.ended);
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isMuted(): boolean {
    return !this.enabled;
  }

  // Helper to create a smooth, warm sine tone with gentle attack and release
  private playWarmTone(freq: number, startTime: number, duration: number, gainPeak: number, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.enabled) return;
    // Suppress loud synth beeps/fanfares when a voice/meme sound is actively playing
    if (this.isSoundPlaying() && gainPeak > 0.25) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Soft attack to prevent click, smooth exponential decay for relaxing acoustic feel
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak * this.volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // 1. Soft Kalimba Step sound (very relaxing tap as pieces move)
  public playStep() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    this.playWarmTone(523.25, time, 0.06, 0.18, 'sine'); // C5
  }

  // Quick UI Select Click sound
  public playSelect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.playWarmTone(659.25, this.ctx.currentTime, 0.08, 0.22, 'sine');
  }

  // 2. Gentle Wooden Dice Roll (soft, muted clicks)
  public playDiceRoll() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const pitches = [180, 240, 160, 210];
    pitches.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.07;
      this.playWarmTone(freq, time, 0.05, 0.35, 'triangle');
    });
  }

  // 3. Relaxing Turn Chime (clear gentle airport / meditation chime)
  public playTurnChime() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 987.77]; // E5, B5 (relaxing fifth interval)
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.14;
      this.playWarmTone(freq, time, 0.45, 0.32, 'sine');
    });
  }

  // 4. Relaxing Buy Property (gentle acoustic harp arpeggio)
  public playBuy() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.07;
      this.playWarmTone(freq, time, 0.4, 0.3, 'sine');
    });
  }

  // 5. Monopoly Completion (Triumphant yet gentle brass/bell chord)
  public playMonopoly() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Major 9th celebration chord
    const notes = [392.00, 493.88, 587.33, 739.99, 987.77]; // G4, B4, D5, F#5, B5
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.09;
      this.playWarmTone(freq, time, 0.65, 0.38, 'sine');
    });
  }

  // 6. House / Hotel Upgrade (Delicate glockenspiel sparkle)
  public playUpgrade() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [783.99, 1046.50, 1318.51, 1567.98]; // G5, C6, E6, G6
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.06;
      this.playWarmTone(freq, time, 0.5, 0.28, 'sine');
    });
  }

  // 7. Tropical Vacation Island Oasis (Peaceful ocean breeze wind chimes & Major 7th chord synth fallback)
  public playVacationSynth() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // F# Major 7th harp arpeggio: F#4, A#4, C#5, F5, G#5, C#6
    const notes = [369.99, 466.16, 554.37, 698.46, 830.61, 1108.73];
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.1;
      this.playWarmTone(freq, time, 0.8, 0.35, 'sine');
    });
  }

  // 8. Prison / Jail (Somber, deep acoustic cello / resonant gong tone synth fallback)
  public playPrisonSynth() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    // Deep resonant gong (110Hz -> 82Hz) with subtle harmonic overtone
    this.playWarmTone(110, time, 0.85, 0.45, 'triangle');
    this.playWarmTone(82.41, time + 0.05, 1.1, 0.4, 'sine');
  }

  // Backward compatibility alias for playJail
  public playJail() {
    this.playPrison();
  }

  // 9. Rent Payment (Gentle double coin tap)
  public playRent() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [587.33, 440]; // D5 -> A4
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.08;
      this.playWarmTone(freq, time, 0.3, 0.25, 'sine');
    });
  }

  // 10. Tax Payment (Muted mellow descending chime)
  public playTax() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [493.88, 392.00]; // B4 -> G4
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.1;
      this.playWarmTone(freq, time, 0.4, 0.28, 'sine');
    });
  }

  // 11. Friendly Trade Handshake (Warm marimba triad)
  public playTrade() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [349.23, 440, 523.25, 698.46]; // F4, A4, C5, F5
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.08;
      this.playWarmTone(freq, time, 0.45, 0.3, 'sine');
    });
  }

  // 12. Cash / Salary Collection
  public playCash() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.05;
      this.playWarmTone(freq, time, 0.32, 0.28, 'sine');
    });
  }

  // 13. Auction Bid
  public playBid() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    this.playWarmTone(440, time, 0.12, 0.25, 'sine');
  }

  // 14. Chat Message Pop (Soft delicate water droplet)
  public playChatPop() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    this.playWarmTone(880, time, 0.07, 0.22, 'sine');
  }

  // 15. Victory Fanfare (Gentle, warm melodic bells)
  public playWinFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const time = this.ctx!.currentTime + idx * 0.12;
      this.playWarmTone(freq, time, 0.8, 0.35, 'sine');
    });
  }

  private lastPlayed: Record<string, string> = {};

  // Helper to resolve sound assets cleanly across dev, relative, and GitHub Pages
  private getSoundUrl(soundFile: string): string {
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${cleanBase}sounds/${soundFile}`;
  }

  private pickRandomFromPool(eventId: SoundEventId, pool: string[]): string {
    if (!pool || pool.length === 0) return '';
    if (pool.length === 1) return pool[0];

    const last = this.lastPlayed[eventId];
    const available = pool.filter(s => s !== last);
    const chosen = available[Math.floor(Math.random() * available.length)] || pool[0];
    this.lastPlayed[eventId] = chosen;
    return chosen;
  }

  // 16. Meme Soundboard Engine (Ultra-low latency HTML5 Audio with graceful synth fallback)
  private playMemeAudio(soundFile: string, fallbackSynth?: () => void, volumeMultiplier: number = 1.15) {
    if (!this.enabled || !this.memeSoundsEnabled) {
      if (fallbackSynth) fallbackSynth();
      return;
    }

    try {
      // Ensure two sounds never play simultaneously - cleanly stop any active audio before starting the next
      if (this.currentAudio) {
        this.stopCurrentSound();
      }

      const url = this.getSoundUrl(soundFile);
      if (!this.memeAudioCache[soundFile]) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.memeAudioCache[soundFile] = audio;
      }

      const audio = this.memeAudioCache[soundFile];
      audio.volume = Math.max(0, Math.min(1, this.volume * volumeMultiplier));
      audio.currentTime = 0;
      this.currentAudio = audio;
      this.lastAudioStartTime = Date.now();

      const clearPlaying = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
      };
      audio.onended = clearPlaying;
      audio.onpause = clearPlaying;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
          if (fallbackSynth) fallbackSynth();
        });
      }
    } catch (e) {
      this.currentAudio = null;
      if (fallbackSynth) fallbackSynth();
    }
  }

  // Unified trigger method for any registered sound event
  public trigger(eventId: SoundEventId, fallbackSynth?: () => void) {
    const config = SOUND_EVENTS_REGISTRY[eventId];
    if (!config || !config.files || config.files.length === 0) {
      if (fallbackSynth) fallbackSynth();
      return;
    }

    const chosenFile = this.pickRandomFromPool(eventId, config.files);
    if (chosenFile) {
      const volMultiplier = config.volumeMultiplier ?? 1.15;
      this.playMemeAudio(chosenFile, fallbackSynth, volMultiplier);
    } else if (fallbackSynth) {
      fallbackSynth();
    }
  }

  // Preload all registered sound files on first user interaction so no repeated network requests happen during gameplay
  public preloadMemeSounds() {
    if (typeof window === 'undefined') return;
    ALL_REGISTERED_SOUND_FILES.forEach(s => {
      try {
        const url = this.getSoundUrl(s);
        if (!this.memeAudioCache[s]) {
          const audio = new Audio(url);
          audio.preload = 'auto';
          this.memeAudioCache[s] = audio;
        }
      } catch (e) {}
    });
  }

  public isMemeSoundsEnabled(): boolean {
    return this.memeSoundsEnabled;
  }

  public toggleMemeSounds(): boolean {
    this.memeSoundsEnabled = !this.memeSoundsEnabled;
    try {
      localStorage.setItem('richup_meme_sounds', this.memeSoundsEnabled ? '1' : '0');
    } catch (e) {}
    return this.memeSoundsEnabled;
  }

  // 17. Semantic Event Triggers (Single, clean entry points)
  private lastWelcomeTime = 0;
  public playWelcome() {
    const now = Date.now();
    if (now - this.lastWelcomeTime < 2500) return;
    this.lastWelcomeTime = now;
    this.trigger('WELCOME', () => this.playWinFanfare());
  }

  public playEarningsTax() {
    this.trigger('EARNINGS_TAX', () => this.playTax());
  }

  public playPremiumTax() {
    this.trigger('PREMIUM_TAX', () => this.playTax());
  }

  public playPrison() {
    this.trigger('PRISON', () => this.playPrisonSynth());
  }

  public playPrisonEscape() {
    this.trigger('PRISON_ESCAPE', () => this.playUpgrade());
  }

  public playPrisonEscapeFirstRoll() {
    this.trigger('PRISON_ESCAPE_FIRST_ROLL', () => this.playUpgrade());
  }

  public playVacation() {
    this.trigger('VACATION', () => this.playVacationSynth());
  }

  public playLandOnStart() {
    this.trigger('LAND_ON_START', () => this.playCash());
  }

  public playChinaNearMonopoly() {
    this.trigger('CHINA_NEAR_MONOPOLY', () => this.playBuy());
  }

  public playChinaFullMonopoly() {
    this.trigger('CHINA_FULL_MONOPOLY', () => this.playMonopoly());
  }

  public playChina3Houses() {
    this.trigger('CHINA_3_HOUSES', () => this.playUpgrade());
  }

  public playArabAirport() {
    this.trigger('ARAB_AIRPORT', () => this.playBuy());
  }

  public playTradeOneWayCash() {
    this.trigger('TRADE_ONE_WAY_CASH', () => this.playTrade());
  }

  public playNegativeBalance() {
    this.trigger('NEGATIVE_BALANCE', () => this.playTax());
  }

  public playDebtCleared() {
    this.trigger('DEBT_CLEARED', () => this.playCash());
  }

  public playBadSurprise() {
    this.trigger('BAD_SURPRISE', () => this.playSelect());
  }

  public playBigLoss() {
    this.trigger('BIG_LOSS_500', () => this.playTax());
  }

  public playBigRentCollect() {
    this.trigger('BIG_RENT_COLLECT_400', () => this.playCash());
  }

  public playBankrupt() {
    this.trigger('BANKRUPT', () => this.playPrison());
  }

  public playWinner() {
    this.trigger('WINNER', () => this.playWinFanfare());
  }

  // Backward compatibility aliases
  public playMemeWelcome() { this.playWelcome(); }
  public playMemeTax() { this.playEarningsTax(); }
  public playMemeEarningsTax() { this.playEarningsTax(); }
  public playMemePrison() { this.playPrison(); }
  public playMemeSurprise() { this.playBadSurprise(); }
  public playMemeTreasure() { this.playCash(); }
  public playMemeAirport() { this.playTurnChime(); }
  public playMemeBankrupt() { this.playBankrupt(); }
}

export const sound = new SoundService();
