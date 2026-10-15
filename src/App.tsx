import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Download, Sparkles, Smile, RefreshCw } from 'lucide-react';
import { HunnyBear3D } from './components/HunnyBear3D';
import { HappinessMeter } from './components/HappinessMeter';
import { EmotionCheckIn } from './components/EmotionCheckIn';
import { HelpModal } from './components/HelpModal';
import type { BodyRegion, AnimationState, MouthShape, FeelingOption } from './types/game';
import { getInteractionFeedback } from './utils/emotionManager';
import { voiceManager } from './utils/voiceManager';
import { soundEngine } from './utils/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const App: React.FC = () => {
  // Score starts at 50 per specification
  const [score, setScore] = useState<number>(50);
  const [scoreChangeDelta, setScoreChangeDelta] = useState<number | null>(null);

  // 3D Animation and character states
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');
  
  // Audio & Modals
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmOn, setIsBgmOn] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // PWA installation support
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Tap cooldown to ensure smooth coordinated animation transitions
  const isCooldownRef = useRef<boolean>(false);

  // PWA capture
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  // Main interaction handler for 3D body parts
  const handleTapRegion = (region: BodyRegion) => {
    if (isCooldownRef.current) return;
    isCooldownRef.current = true;
    setTimeout(() => {
      isCooldownRef.current = false;
    }, 600);

    const feedback = getInteractionFeedback(region);
    if (!feedback) return;

    // 1. Update score clamped strictly between 0 and 100
    if (feedback.scoreChange !== 0) {
      setScore((prev) => {
        const nextScore = Math.max(0, Math.min(100, prev + feedback.scoreChange));
        if (nextScore === 100 && prev < 100) {
          // 100% Celebration confetti!
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#E9B44C', '#A96B3C', '#F4C7B5', '#CDE8F6', '#CDE7CF'],
          });
          soundEngine.playCelebrate();
        }
        return nextScore;
      });
      setScoreChangeDelta(feedback.scoreChange);
    }

    // 2. Play matching child-friendly synthesized sound effect
    switch (feedback.soundType) {
      case 'tummy-love':
        soundEngine.playTummyLove();
        break;
      case 'giggle':
        soundEngine.playTickle();
        break;
      case 'boop':
        soundEngine.playBoop();
        break;
      case 'sweet':
        soundEngine.playCheekGentle();
        break;
      case 'ear-surprise':
        soundEngine.playEarSensitive();
        break;
      case 'eye-gentle':
        soundEngine.playEarSensitive();
        break;
      case 'surprise':
        soundEngine.playMouthSpace();
        break;
      case 'wave':
        soundEngine.playWave();
        break;
      case 'foot-tap':
        soundEngine.playFootTap();
        break;
      case 'head-tilt':
        soundEngine.playHeadTilt();
        break;
      default:
        break;
    }

    // 3. Trigger 3D coordinated animation
    setAnimationState(feedback.animationState);

    // 4. Trigger spoken voice (Audio only — NO SUBTITLES ON SCREEN per requirements)
    setIsSpeaking(true);
    voiceManager.speak(
      feedback.spokenDialogue,
      (shape) => setMouthShape(shape),
      () => {
        setIsSpeaking(false);
        setMouthShape('closed');
        setTimeout(() => {
          setAnimationState('idle');
        }, 450);
      }
    );
  };

  // Sound Controls
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
    voiceManager.setMuted(next);
    if (next) setIsBgmOn(false);
  };

  const toggleBgm = () => {
    if (isMuted) {
      setIsMuted(false);
      soundEngine.setMuted(false);
      voiceManager.setMuted(false);
    }
    const state = soundEngine.toggleBGM();
    setIsBgmOn(state);
  };

  // Feeling Check-In Selection
  const handleSelectFeeling = (feeling: FeelingOption) => {
    setShowCheckIn(false);
    
    if (feeling.id === 'calm') {
      soundEngine.playCalmBreath();
      setAnimationState('head-tilt');
    } else {
      soundEngine.playCheekGentle();
      setAnimationState('cheek-smile-right');
    }

    setIsSpeaking(true);
    voiceManager.speak(
      feeling.bearResponse,
      (shape) => setMouthShape(shape),
      () => {
        setIsSpeaking(false);
        setMouthShape('closed');
        setTimeout(() => setAnimationState('idle'), 450);
      }
    );
  };

  // Start "Let's Make Hunny Bear Smile!" Challenge
  const handleStartKindnessChallenge = () => {
    soundEngine.playWave();
    setAnimationState('wave-left');
    setIsSpeaking(true);
    voiceManager.speak(
      "Let's play! Can you give me a gentle touch on my cheek, tummy, or paws?",
      (shape) => setMouthShape(shape),
      () => {
        setIsSpeaking(false);
        setMouthShape('closed');
        setTimeout(() => setAnimationState('idle'), 450);
      }
    );
  };

  // Reset Happiness to 50
  const handleResetScore = () => {
    setScore(50);
    setScoreChangeDelta(null);
    setAnimationState('idle');
    soundEngine.playHeadTilt();
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#FFF8EA] text-[#593A2A] font-sans flex flex-col justify-between items-center px-3 py-2 sm:py-3 select-none touch-manipulation">
      
      {/* 1. TOP AREA: TITLE & HAPPINESS METER */}
      <header className="w-full max-w-xl flex flex-col items-center gap-1.5 shrink-0 z-10">
        
        {/* Title Bar */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9B44C] flex items-center justify-center text-lg shadow-sm">
              🐻
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#593A2A] font-heading">
              Hunny Bear: Feelings & Friends
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {/* PWA Install Button */}
            {deferredPrompt && !isInstalled && (
              <button
                onClick={handleInstallClick}
                aria-label="Install App"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#E9B44C] hover:bg-[#A96B3C] text-white rounded-full shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {/* Reset Score Button */}
            <button
              onClick={handleResetScore}
              aria-label="Reset Happiness Score"
              className="p-1.5 rounded-xl bg-white text-[#593A2A] hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
              title="Reset score to 50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Happiness Meter with Sound Controls */}
        <HappinessMeter
          score={score}
          scoreChangeDelta={scoreChangeDelta}
          isMuted={isMuted}
          isBgmOn={isBgmOn}
          onToggleMute={toggleMute}
          onToggleBgm={toggleBgm}
          onOpenHelp={() => setShowHelpModal(true)}
        />

        {/* Child-friendly Top Instruction */}
        <p className="text-xs sm:text-sm font-bold text-[#A96B3C] text-center">
          “Hello, friend! Gently touch Hunny Bear and discover how he feels!”
        </p>
      </header>

      {/* 2. CENTER AREA: FULL ANIMATED 3D CARTOON BEAR (Clean visual focus, zero subtitles) */}
      <main className="w-full flex-1 flex flex-col items-center justify-center relative my-0.5 overflow-hidden">
        <HunnyBear3D
          animationState={animationState}
          mouthShape={mouthShape}
          isSpeaking={isSpeaking}
          onTapRegion={handleTapRegion}
        />
      </main>

      {/* 3. BOTTOM AREA: INSTRUCTION & EMOTIONAL ACTIVITIES */}
      <footer className="w-full max-w-lg flex flex-col items-center gap-1.5 mb-1 shrink-0 z-10">
        
        {/* Simple prompt */}
        <p className="text-xs sm:text-sm font-extrabold text-[#593A2A] text-center bg-white/80 px-4 py-1 rounded-full border border-amber-200/60 shadow-xs">
          👉 Gently touch Hunny Bear to play!
        </p>

        {/* Activity Buttons */}
        <div className="w-full flex items-center justify-center gap-2">
          {/* How Do You Feel Today? */}
          <button
            onClick={() => setShowCheckIn(true)}
            className="flex-1 max-w-xs flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-white hover:bg-amber-50 text-[#593A2A] border-2 border-amber-300 font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Smile className="w-4 h-4 text-[#E9B44C]" />
            <span>How do you feel today?</span>
          </button>

          {/* Kindness Challenge */}
          <button
            onClick={handleStartKindnessChallenge}
            className="flex-1 max-w-xs flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-gradient-to-r from-[#E9B44C] to-[#A96B3C] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Make Bear Smile! 🌟</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      {showCheckIn && (
        <EmotionCheckIn
          onSelectFeeling={handleSelectFeeling}
          onClose={() => setShowCheckIn(false)}
        />
      )}

      {showHelpModal && (
        <HelpModal
          onClose={() => setShowHelpModal(false)}
          onStartKindnessChallenge={handleStartKindnessChallenge}
        />
      )}
    </div>
  );
};

export default App;
