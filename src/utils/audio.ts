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

  // 1. Tickle Giggle Reaction (Joyful bubbly laughter)
  public playTickle() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const notes = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 880.0, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const start = now + idx * 0.07;
      const end = start + 0.11;

      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, end);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // Tummy Love Chime (Warm, affectionate, sweet melody for "I love you!")
  public playTummyLove() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const loveNotes = [440.0, 554.37, 659.25, 880.0]; // A major arpeggio
    loveNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const start = now + idx * 0.09;
      const end = start + 0.45;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // Friendly Head Tilt / Hello Chime
  public playHeadTilt() {
    this.playWave();
  }

  // 2. Nose Boop / Soft Sneeze Tickle
  public playBoop() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.12);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Backward-compatible aliases
  public playSurprise() {
    this.playBoop();
  }

  public playHoneyCelebration() {
    this.playCelebrate();
  }

  // 3. Gentle Cheek Touch Sparkle
  public playCheekGentle() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // Sweet glockenspiel sparkle (C6, E6, G6)
    const sparkleNotes = [1046.5, 1318.51, 1567.98];
    sparkleNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const start = now + i * 0.08;
      const end = start + 0.4;

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

  // 4. Ear Sensitive Swish
  public playEarSensitive() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(330, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // 5. Mouth Space Caution Sound
  public playMouthSpace() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    // Soft two-tone gentle prompt
    [392.0, 329.63].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const start = now + i * 0.12;
      const end = start + 0.22;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // 6. Friendly Wave Chime
  public playWave() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

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

  // 7. Playful Foot Tap (rhythmic percussion tap)
  public playFootTap() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    [0, 0.11, 0.22].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const isFinal = idx === 2;
      osc.type = isFinal ? 'triangle' : 'sine';
      const freq = isFinal ? 698.46 : 280 + idx * 40;

      const start = now + delay;
      const end = start + (isFinal ? 0.3 : 0.08);

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // 8. Calm Breath In & Out
  public playCalmBreath() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 1.2); // E4
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 2.5); // C4

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.7);
  }

  // 9. Celebration Fanfare
  public playCelebrate() {
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

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, end);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(end);
    });
  }

  // 10. Background Music Lullaby
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

    const melody = [
      { f: 523.25, d: 0.3 },
      { f: 659.25, d: 0.3 },
      { f: 783.99, d: 0.3 },
      { f: 659.25, d: 0.3 },
      { f: 880.00, d: 0.4 },
      { f: 783.99, d: 0.4 },
      { f: 659.25, d: 0.4 },
      { f: 587.33, d: 0.5 },
      { f: 523.25, d: 0.4 },
      { f: 659.25, d: 0.4 },
      { f: 587.33, d: 0.4 },
      { f: 523.25, d: 0.8 },
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

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
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
