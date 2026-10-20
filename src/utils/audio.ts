// Web Audio API Sound Synthesizer & Persistent Background Music Manager for Hunny Bear

const BGM_TRACK_FILENAME = 'massobeats - chamomile (freetouse.com).mp3';
const BGM_TRACK_URL = encodeURI(`/audio/songs/${BGM_TRACK_FILENAME}`);

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Persistent single HTMLAudioElement for background music
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmEnabled: boolean = true;
  private isBgmPlaying: boolean = false;
  private isDucked: boolean = false;
  private volumeFadeTimer: number | null = null;
  private unlockListenersBound: boolean = false;
  private bgmStateListeners: Set<(enabled: boolean, playing: boolean) => void> = new Set();

  public readonly BGM_BASE_VOLUME = 0.2; // 20% volume so spoken voice lines are always clear
  public readonly BGM_DUCKED_VOLUME = 0.05; // 5% ducked volume while Hunny Bear speaks

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignore resume errors prior to user gesture
      });
    }
    return this.ctx;
  }

  private ensureBgmAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    if (!this.bgmAudio) {
      try {
        const audio = new Audio(BGM_TRACK_URL);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = this.isDucked ? this.BGM_DUCKED_VOLUME : this.BGM_BASE_VOLUME;

        audio.addEventListener('play', () => {
          this.isBgmPlaying = true;
          this.notifyBgmListeners();
        });

        audio.addEventListener('pause', () => {
          this.isBgmPlaying = false;
          this.notifyBgmListeners();
        });

        audio.addEventListener('error', () => {
          console.warn('[AG-Debug] Background music failed to load:', BGM_TRACK_URL);
          this.isBgmPlaying = false;
          this.notifyBgmListeners();
        });

        this.bgmAudio = audio;
      } catch (err) {
        console.warn('[AG-Debug] Could not initialize background music audio:', err);
        return null;
      }
    }
    return this.bgmAudio;
  }

  private notifyBgmListeners() {
    const activeState = this.isBgmEnabled && !this.isMuted;
    this.bgmStateListeners.forEach((cb) => cb(activeState, this.isBgmPlaying));
  }

  public onBgmStateChange(cb: (enabled: boolean, playing: boolean) => void): () => void {
    this.bgmStateListeners.add(cb);
    return () => {
      this.bgmStateListeners.delete(cb);
    };
  }

  private bindAutoplayUnlockListeners() {
    if (this.unlockListenersBound || typeof window === 'undefined') return;
    this.unlockListenersBound = true;

    const handleUserGesture = () => {
      if (!this.isBgmEnabled || this.isMuted) return;
      const audio = this.ensureBgmAudio();
      if (audio && audio.paused) {
        audio.volume = this.isDucked ? this.BGM_DUCKED_VOLUME : this.BGM_BASE_VOLUME;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.isBgmPlaying = true;
              this.notifyBgmListeners();
              removeGestureListeners();
            })
            .catch(() => {
              // Keep listener if gesture did not unlock audio yet
            });
        }
      } else if (audio && !audio.paused) {
        removeGestureListeners();
      }
    };

    const removeGestureListeners = () => {
      if (!this.unlockListenersBound) return;
      this.unlockListenersBound = false;
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('click', handleUserGesture);
    };

    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });
    window.addEventListener('click', handleUserGesture, { passive: true });
  }

  public initBGM() {
    this.ensureBgmAudio();
    this.bindAutoplayUnlockListeners();
    if (this.isBgmEnabled && !this.isMuted) {
      this.startBGM();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.bgmAudio && !this.bgmAudio.paused) {
        this.bgmAudio.pause();
      }
      this.isBgmPlaying = false;
    } else if (this.isBgmEnabled) {
      this.startBGM();
    }
    this.notifyBgmListeners();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleBGM(forceState?: boolean): boolean {
    const target = forceState !== undefined ? forceState : !this.isBgmEnabled;
    this.isBgmEnabled = target;
    if (target) {
      if (this.isMuted) {
        this.isMuted = false;
      }
      this.startBGM();
    } else {
      this.stopBGM();
    }
    this.notifyBgmListeners();
    return this.isBgmEnabled;
  }

  public getBgmPlaying(): boolean {
    return this.isBgmEnabled && !this.isMuted;
  }

  public isBgmAudioElementPlaying(): boolean {
    return Boolean(this.bgmAudio && !this.bgmAudio.paused);
  }

  public getBgmVolume(): number {
    return this.bgmAudio ? Number(this.bgmAudio.volume.toFixed(3)) : this.BGM_BASE_VOLUME;
  }

  public getBgmCurrentTime(): number {
    return this.bgmAudio ? this.bgmAudio.currentTime : 0;
  }

  public getBgmTrackUrl(): string {
    return BGM_TRACK_URL;
  }

  private rampVolumeTo(targetVolume: number, durationMs: number) {
    if (this.volumeFadeTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.volumeFadeTimer);
      this.volumeFadeTimer = null;
    }

    const audio = this.bgmAudio;
    if (!audio || typeof window === 'undefined') return;

    const startVolume = audio.volume;
    const diff = targetVolume - startVolume;
    if (Math.abs(diff) < 0.005 || durationMs <= 0) {
      audio.volume = Math.max(0, Math.min(1, targetVolume));
      return;
    }

    const stepMs = 25;
    const totalSteps = Math.max(1, Math.round(durationMs / stepMs));
    let currentStep = 0;

    this.volumeFadeTimer = window.setInterval(() => {
      currentStep++;
      const progress = Math.min(1, currentStep / totalSteps);
      audio.volume = Math.max(0, Math.min(1, startVolume + diff * progress));
      if (progress >= 1 && this.volumeFadeTimer !== null) {
        window.clearInterval(this.volumeFadeTimer);
        this.volumeFadeTimer = null;
      }
    }, stepMs);
  }

  public duckBGM(duck: boolean) {
    this.isDucked = duck;
    if (!this.bgmAudio) return;
    if (duck) {
      this.rampVolumeTo(this.BGM_DUCKED_VOLUME, 100);
    } else {
      this.rampVolumeTo(this.BGM_BASE_VOLUME, 350);
    }
  }

  public startBGM() {
    this.isBgmEnabled = true;
    if (this.isMuted) return;

    const audio = this.ensureBgmAudio();
    if (!audio) return;

    // Never restart or reset currentTime if already playing
    if (!audio.paused) {
      this.isBgmPlaying = true;
      return;
    }

    audio.volume = this.isDucked ? this.BGM_DUCKED_VOLUME : this.BGM_BASE_VOLUME;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isBgmPlaying = true;
          this.notifyBgmListeners();
        })
        .catch(() => {
          // Browser blocked autoplay until first user gesture; listener will unlock on first tap
          this.isBgmPlaying = false;
          this.bindAutoplayUnlockListeners();
          this.notifyBgmListeners();
        });
    }
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.volumeFadeTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.volumeFadeTimer);
      this.volumeFadeTimer = null;
    }
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
    this.notifyBgmListeners();
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
    osc.frequency.setValueAtTime(261.63, now);
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 2.5);

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
}

export const soundEngine = new SoundEngine();
