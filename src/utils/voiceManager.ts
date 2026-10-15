import type { MouthShape } from '../types/game';

class VoiceManager {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private mouthInterval: number | null = null;
  private lastSpokenText: string = '';
  private onMouthChangeCallback: ((shape: MouthShape) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices.length) return;

    // Search for young, playful, boy-like or childlike English voices
    const preferredVoices = [
      'child',
      'kid',
      'boy',
      'junior',
      'oliver',
      'george',
      'daniel',
      'david',
      'google us english',
      'google uk english male',
      'en-us-x-sfg#male',
      'en-gb',
      'samantha',
      'victoria',
      'karen',
      'en-US',
    ];

    for (const pattern of preferredVoices) {
      const match = voices.find(
        (v) =>
          v.name.toLowerCase().includes(pattern.toLowerCase()) ||
          v.lang.toLowerCase().startsWith(pattern.toLowerCase())
      );
      if (match) {
        this.selectedVoice = match;
        break;
      }
    }

    if (!this.selectedVoice) {
      this.selectedVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getLastSpokenText(): string {
    return this.lastSpokenText;
  }

  /**
   * Calculate Little Boy voice acoustic parameters based on emotional tone:
   * - Surprised / bouncy phrases: higher, playful intonation (pitch ~1.58)
   * - Affectionate phrases ("I love you!"): warm, gentle, sweet pitch (~1.42)
   * - Cheerful greetings: energetic boyish pitch (~1.48)
   */
  private getBoyVoiceParams(text: string): { pitch: number; rate: number } {
    const lower = text.toLowerCase();

    // Shocked / surprised phrase: "Huh? Weird!" or "Boop!"
    if (lower.includes('weird') || lower.includes('boop') || lower.includes('surprise')) {
      return { pitch: 1.60, rate: 1.06 };
    }

    // Affectionate phrase: "I love you!"
    if (lower.includes('love')) {
      return { pitch: 1.44, rate: 0.93 };
    }

    // Giggly cheerful phrase: "You're funny!"
    if (lower.includes('funny')) {
      return { pitch: 1.55, rate: 1.04 };
    }

    // Gentle boundary warning for sensitive eye touch: "That hurts!"
    if (lower.includes('hurts')) {
      return { pitch: 1.46, rate: 0.95 };
    }

    // Gentle gloomy/cautious warning for ear touch: "No, careful!"
    if (lower.includes('careful')) {
      return { pitch: 1.42, rate: 0.92 };
    }

    // Playful greeting for foot tap: "Hey, you!"
    if (lower.includes('hey, you') || lower.includes('tap')) {
      return { pitch: 1.52, rate: 1.02 };
    }

    // Default friendly boy voice for hand wave: "Hi, friend!"
    return { pitch: 1.50, rate: 1.0 };
  }

  public speak(
    text: string,
    onMouthShape?: (shape: MouthShape) => void,
    onComplete?: () => void
  ) {
    this.lastSpokenText = text;
    this.onMouthChangeCallback = onMouthShape || null;

    if (this.isMuted || !this.synth) {
      // Gracefully simulate brief mouth visemes if muted or speech API unavailable
      this.simulateMouthMovement(text.length * 55, onMouthShape, onComplete);
      return;
    }

    // Cancel any ongoing speech to prevent overlap
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Apply sweet, playful little boy voice acoustic profile
    const { pitch, rate } = this.getBoyVoiceParams(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1.0;

    // Synchronize mouth animation during speech
    utterance.onstart = () => {
      this.isSpeaking = true;
      this.startMouthSync();
    };

    utterance.onend = () => {
      this.cleanUpSpeech();
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      this.cleanUpSpeech();
      if (onComplete) onComplete();
    };

    try {
      this.synth.speak(utterance);
    } catch {
      this.cleanUpSpeech();
      if (onComplete) onComplete();
    }
  }

  private startMouthSync() {
    if (this.mouthInterval) clearInterval(this.mouthInterval);
    const shapes: MouthShape[] = ['slightly-open', 'wide-open', 'slightly-open', 'smile'];
    let idx = 0;

    this.mouthInterval = window.setInterval(() => {
      if (!this.isSpeaking) return;
      if (this.onMouthChangeCallback) {
        this.onMouthChangeCallback(shapes[idx % shapes.length]);
      }
      idx++;
    }, 130);
  }

  private simulateMouthMovement(
    durationMs: number,
    onMouthShape?: (shape: MouthShape) => void,
    onComplete?: () => void
  ) {
    if (!onMouthShape) {
      if (onComplete) setTimeout(onComplete, Math.min(durationMs, 1000));
      return;
    }

    const shapes: MouthShape[] = ['slightly-open', 'wide-open', 'slightly-open', 'smile'];
    let count = 0;
    const maxSteps = Math.min(Math.floor(durationMs / 130), 8);

    const interval = setInterval(() => {
      onMouthShape(shapes[count % shapes.length]);
      count++;
      if (count >= maxSteps) {
        clearInterval(interval);
        onMouthShape('closed');
        if (onComplete) onComplete();
      }
    }, 130);
  }

  private cleanUpSpeech() {
    this.isSpeaking = false;
    if (this.mouthInterval) {
      clearInterval(this.mouthInterval);
      this.mouthInterval = null;
    }
    if (this.onMouthChangeCallback) {
      this.onMouthChangeCallback('closed');
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.cleanUpSpeech();
  }

  public repeat(onMouthShape?: (shape: MouthShape) => void, onComplete?: () => void) {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, onMouthShape, onComplete);
    }
  }
}

export const voiceManager = new VoiceManager();
