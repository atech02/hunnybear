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

    // Prefer cheerful, clear, friendly English voices
    const preferredVoices = [
      'Google US English',
      'Samantha',
      'Victoria',
      'Karen',
      'Zira',
      'Jenny',
      'Microsoft Zira',
      'en-US',
      'en-GB',
    ];

    for (const name of preferredVoices) {
      const match = voices.find(
        (v) => v.name.toLowerCase().includes(name.toLowerCase()) || v.lang.startsWith(name)
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

  public speak(
    text: string,
    onMouthShape?: (shape: MouthShape) => void,
    onComplete?: () => void
  ) {
    this.lastSpokenText = text;
    this.onMouthChangeCallback = onMouthShape || null;

    if (this.isMuted || !this.synth) {
      // Simulate brief mouth movement even if muted or no speech API
      this.simulateMouthMovement(text.length * 50, onMouthShape, onComplete);
      return;
    }

    // Cancel any ongoing utterance to avoid overlapping voices
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Child-friendly warm acoustic parameters
    utterance.rate = 0.92; // slightly relaxed pace for comprehension
    utterance.pitch = 1.18; // warm, gentle, friendly pitch
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
    }, 140);
  }

  private simulateMouthMovement(
    durationMs: number,
    onMouthShape?: (shape: MouthShape) => void,
    onComplete?: () => void
  ) {
    if (!onMouthShape) {
      if (onComplete) setTimeout(onComplete, Math.min(durationMs, 1200));
      return;
    }

    const shapes: MouthShape[] = ['slightly-open', 'wide-open', 'slightly-open', 'smile'];
    let count = 0;
    const maxSteps = Math.min(Math.floor(durationMs / 140), 8);

    const interval = setInterval(() => {
      onMouthShape(shapes[count % shapes.length]);
      count++;
      if (count >= maxSteps) {
        clearInterval(interval);
        onMouthShape('closed');
        if (onComplete) onComplete();
      }
    }, 140);
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
