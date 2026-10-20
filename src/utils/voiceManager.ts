import type { MouthShape } from '../types/game';
import { soundEngine } from './audio';

const PRELOAD_WAV_FILES = [
  '/audio/hunny_bear/hunny_hand_wave.wav',
  '/audio/hunny_bear/hunny_feet_tap.wav',
  '/audio/hunny_bear/hunny_cheeks_smile.wav',
  '/audio/hunny_bear/hunny_eye_hurt.wav',
  '/audio/hunny_bear/hunny_ears_careful.wav',
  '/audio/hunny_bear/hunny_nose_weird.wav',
  '/audio/hunny_bear/hunny_nose_boop.wav',
  '/audio/hunny_bear/hunny_stomach_love.wav',
  '/audio/hunny_bear/hunny_mouth_surprise.wav',
];

class VoiceManager {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private mouthInterval: number | null = null;
  private lastSpokenText: string = '';
  private lastAudioFile: string | undefined = undefined;
  private onMouthChangeCallback: ((shape: MouthShape) => void) | null = null;
  private activeAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.initVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.initVoices();
        }
      }
      this.preloadAudioFiles();
    }
  }

  private preloadAudioFiles() {
    if (typeof Audio === 'undefined') return;
    for (const fileUrl of PRELOAD_WAV_FILES) {
      try {
        const audio = new Audio(fileUrl);
        audio.preload = 'auto';
        this.audioCache.set(fileUrl, audio);
      } catch {
        // Ignore preload errors in non-browser environments
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices.length) return;

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

  private getBoyVoiceParams(text: string): { pitch: number; rate: number } {
    const lower = text.toLowerCase();

    if (lower.includes('weird') || lower.includes('boop') || lower.includes('surprise') || lower.includes('mouth')) {
      return { pitch: 1.60, rate: 1.06 };
    }

    if (lower.includes('love')) {
      return { pitch: 1.44, rate: 0.93 };
    }

    if (lower.includes('funny')) {
      return { pitch: 1.55, rate: 1.04 };
    }

    if (lower.includes('hurts') || lower.includes('ouch')) {
      return { pitch: 1.46, rate: 0.95 };
    }

    if (lower.includes('careful')) {
      return { pitch: 1.42, rate: 0.92 };
    }

    if (lower.includes('hey, you') || lower.includes('tap')) {
      return { pitch: 1.52, rate: 1.02 };
    }

    return { pitch: 1.50, rate: 1.0 };
  }

  public speak(
    text: string,
    onMouthShape?: (shape: MouthShape) => void,
    onComplete?: () => void,
    audioFile?: string
  ) {
    this.lastSpokenText = text;
    this.lastAudioFile = audioFile;
    this.onMouthChangeCallback = onMouthShape || null;

    // Cancel any ongoing audio/speech immediately to prevent overlapping recordings
    this.stop();

    if (this.isMuted) {
      this.simulateMouthMovement(text.length * 55, onMouthShape, onComplete);
      return;
    }

    // Temporarily lower background music volume (ducking) so voice is easy to hear
    soundEngine.duckBGM(true);

    if (audioFile && typeof Audio !== 'undefined') {
      this.playRecordedWav(audioFile, text, onMouthShape, onComplete);
      return;
    }

    this.speakWithSynthesis(text, onMouthShape, onComplete);
  }

  private playRecordedWav(
    audioFile: string,
    fallbackText: string,
    onMouthShape?: (shape: MouthShape) => void,
    onComplete?: () => void
  ) {
    try {
      let audio = this.audioCache.get(audioFile);
      if (!audio) {
        audio = new Audio(audioFile);
        this.audioCache.set(audioFile, audio);
      }

      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0;
      this.activeAudio = audio;
      this.isSpeaking = true;
      this.startMouthSync();

      let handled = false;
      const finishCleanly = () => {
        if (handled) return;
        handled = true;
        audio!.onended = null;
        audio!.onerror = null;
        if (this.activeAudio === audio) {
          this.activeAudio = null;
        }
        this.cleanUpSpeech();
        if (onComplete) onComplete();
      };

      const fallbackOnError = () => {
        if (handled) return;
        handled = true;
        audio!.onended = null;
        audio!.onerror = null;
        if (this.activeAudio === audio) {
          this.activeAudio = null;
        }
        this.cleanUpSpeech();
        this.speakWithSynthesis(fallbackText, onMouthShape, onComplete);
      };

      audio.onended = finishCleanly;
      audio.onerror = fallbackOnError;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackOnError();
        });
      }
    } catch {
      this.cleanUpSpeech();
      this.speakWithSynthesis(fallbackText, onMouthShape, onComplete);
    }
  }

  private speakWithSynthesis(
    text: string,
    onMouthShape?: (shape: MouthShape) => void,
    onComplete?: () => void
  ) {
    if (this.isMuted || !this.synth) {
      this.simulateMouthMovement(text.length * 55, onMouthShape, onComplete);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    const { pitch, rate } = this.getBoyVoiceParams(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = 1.0;

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
    soundEngine.duckBGM(false);
  }

  public stop() {
    if (this.activeAudio) {
      try {
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {
        // Ignore pause errors
      }
      this.activeAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
    this.cleanUpSpeech();
  }

  public repeat(onMouthShape?: (shape: MouthShape) => void, onComplete?: () => void) {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, onMouthShape, onComplete, this.lastAudioFile);
    }
  }
}

export const voiceManager = new VoiceManager();

