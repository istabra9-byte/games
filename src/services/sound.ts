class SoundService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.45;

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
    if (!this.ctx) return;
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

  // 7. Tropical Vacation Island Oasis (Peaceful ocean breeze wind chimes & Major 7th chord)
  public playVacation() {
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

  // 8. Prison / Jail (Somber, deep acoustic cello / resonant gong tone)
  public playPrison() {
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
}

export const sound = new SoundService();
