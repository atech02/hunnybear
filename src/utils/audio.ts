// Web Audio API Sound Synthesizer for Hunny Bear
// 100% offline, zero external file dependencies, high performance on mobile & desktop

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isBgmPlaying) {
      this.stopBGM();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // 1. Tickle Giggle Reaction (Playful rapid bubble oscillations)
  public playTickle() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5, 880, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const start = now + idx * 0.08;
      const end = start + 0.12;

      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, end);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // 2. Surprised Boop / Pop Reaction
  public playSurprise() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 3. Friendly Waving Chime
  public playWave() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // Major 7th arpeggio (C5 - E5 - G5 - B5)
    const chords = [523.25, 659.25, 783.99, 987.77];
    chords.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const start = now + i * 0.07;
      const end = start + 0.35;

      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // 4. Playful Foot Tap Reaction
  public playFootTap() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // 3 quick rhythmic wood taps with cute bell finish
    [0, 0.12, 0.24].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const isFinal = idx === 2;
      osc.type = isFinal ? 'triangle' : 'sine';
      const freq = isFinal ? 698.46 : 280 + idx * 40;

      const start = now + delay;
      const end = start + (isFinal ? 0.3 : 0.08);

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // 5. Honey Treat / Celebration chime
  public playHoneyCelebration() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    fanfare.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const start = now + i * 0.09;
      const end = start + 0.45;

      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // 6. Gentle Music-Box Background Melody
  public toggleBGM(forceState?: boolean): boolean {
    const target = forceState !== undefined ? forceState : !this.isBgmPlaying;
    if (target) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return this.isBgmPlaying;
  }

  public getBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  private startBGM() {
    if (this.isBgmPlaying || this.isMuted) return;
    const ctx = this.initContext();
    this.isBgmPlaying = true;

    // Peaceful, sweet music-box notes sequence
    const melody = [
      { f: 523.25, d: 0.3 }, // C5
      { f: 659.25, d: 0.3 }, // E5
      { f: 783.99, d: 0.3 }, // G5
      { f: 659.25, d: 0.3 }, // E5
      { f: 880.00, d: 0.4 }, // A5
      { f: 783.99, d: 0.4 }, // G5
      { f: 659.25, d: 0.4 }, // E5
      { f: 587.33, d: 0.5 }, // D5
      { f: 523.25, d: 0.4 }, // C5
      { f: 659.25, d: 0.4 }, // E5
      { f: 587.33, d: 0.4 }, // D5
      { f: 523.25, d: 0.8 }, // C5
    ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isBgmPlaying || this.isMuted) return;
      const note = melody[noteIdx];
      noteIdx = (noteIdx + 1) % melody.length;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(note.f, now);

      // Soft music box envelope
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.d * 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + note.d * 1.5);
    };

    playNextNote();
    this.bgmInterval = window.setInterval(playNextNote, 600);
  }

  private stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
