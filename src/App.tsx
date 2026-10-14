import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Download, Sparkles, Smile, RefreshCw } from 'lucide-react';
import { AnimatedHunnyBear } from './components/AnimatedHunnyBear';
import { HappinessMeter } from './components/HappinessMeter';
import { SpeechBubble } from './components/SpeechBubble';
import { EmotionCheckIn } from './components/EmotionCheckIn';
import { HelpModal } from './components/HelpModal';
import type { BodyRegion, EmotionType, AnimationState, MouthShape, FeelingOption } from './types/game';
import { INTERACTION_MAP } from './utils/emotionManager';
import { voiceManager } from './utils/voiceManager';
import { soundEngine } from './utils/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const App: React.FC = () => {
  // Score starts at 50 per Section 7 specification
  const [score, setScore] = useState<number>(50);
  const [scoreChangeDelta, setScoreChangeDelta] = useState<number | null>(null);

  // Animation and character states
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('happy');
  const [spokenText, setSpokenText] = useState<string>("Hello, friend! Gently touch my nose, tummy, or paws to play!");
  const [educationalMessage, setEducationalMessage] = useState<string>("Gentle hands help our friends feel safe and loved.");
  
  // Audio & Modals
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmOn, setIsBgmOn] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // PWA installation support
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Debounce tap cooldown to prevent accidental double scoring
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

  // Main interaction handler for the 8 body parts
  const handleTapRegion = (region: BodyRegion) => {
    if (isCooldownRef.current) return;
    isCooldownRef.current = true;
    setTimeout(() => {
      isCooldownRef.current = false;
    }, 650);

    const feedback = INTERACTION_MAP[region];
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

    // 2. Set Emotion and Messages
    setCurrentEmotion(feedback.emotion);
    setSpokenText(feedback.spokenDialogue);
    setEducationalMessage(feedback.educationalMessage);

    // 3. Play matching sound effect
    switch (feedback.soundType) {
      case 'tickle':
        soundEngine.playTickle();
        break;
      case 'boop':
        soundEngine.playBoop();
        break;
      case 'cheek-gentle':
        soundEngine.playCheekGentle();
        break;
      case 'ear-sensitive':
        soundEngine.playEarSensitive();
        break;
      case 'mouth-space':
        soundEngine.playMouthSpace();
        break;
      case 'wave':
        soundEngine.playWave();
        break;
      case 'foot-tap':
        soundEngine.playFootTap();
        break;
      default:
        break;
    }

    // 4. Trigger character animation
    setAnimationState(feedback.animationState);

    // 5. Trigger spoken voice with mouth lip-sync
    setIsSpeaking(true);
    voiceManager.speak(
      feedback.spokenDialogue,
      (shape) => setMouthShape(shape),
      () => {
        setIsSpeaking(false);
        setMouthShape('closed');
        // Return to idle after animation finishes
        setTimeout(() => {
          setAnimationState('idle');
        }, 500);
      }
    );
  };

  // Repeat spoken message
  const handleRepeatVoice = () => {
    setIsSpeaking(true);
    voiceManager.repeat(
      (shape) => setMouthShape(shape),
      () => {
        setIsSpeaking(false);
        setMouthShape('closed');
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
    setCurrentEmotion(feeling.bearEmotion);
    setSpokenText(feeling.bearResponse);
    setEducationalMessage("All feelings are okay! Sharing our feelings helps us feel understood.");
    
    if (feeling.id === 'calm') {
      soundEngine.playCalmBreath();
      setAnimationState('calm-breath');
    } else {
      soundEngine.playCheekGentle();
      setAnimationState('cheek-gentle');
    }

    setIsSpeaking(true);
    voiceManager.speak(
      feeling.bearResponse,
      (shape) => setMouthShape(shape),
      () => {
        setIsSpeaking(false);
        setMouthShape('closed');
        setTimeout(() => setAnimationState('idle'), 500);
      }
    );
  };

  // Start "Let's Make Hunny Bear Smile!" Challenge
  const handleStartKindnessChallenge = () => {
    setCurrentEmotion('happy');
    setSpokenText("Let's play! Can you give me a gentle touch on my cheek or a high-paw?");
    setEducationalMessage("Gentle touches make Hunny Bear feel happy and comfortable!");
    soundEngine.playWave();
    setAnimationState('wave-left');
    setIsSpeaking(true);
    voiceManager.speak(
      "Let's play! Can you give me a gentle touch on my cheek or a high-paw?",
      (shape) => setMouthShape(shape),
      () => {
        setIsSpeaking(false);
        setMouthShape('closed');
        setTimeout(() => setAnimationState('idle'), 500);
      }
    );
  };

  // Reset Happiness to 50
  const handleResetScore = () => {
    setScore(50);
    setScoreChangeDelta(null);
    setSpokenText("Ready to explore feelings together! Touch any part gently.");
    setEducationalMessage("Gentle touches help our friends feel safe.");
    setCurrentEmotion('calm');
    setAnimationState('idle');
  };

  return (
    <div className="min-h-screen bg-[#FFF8EA] text-[#593A2A] font-sans flex flex-col justify-between items-center px-3 py-2 sm:py-4 select-none touch-manipulation">
      
      {/* 1. TOP AREA: TITLE & HAPPINESS METER */}
      <header className="w-full max-w-xl flex flex-col items-center gap-1.5">
        
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
              className="p-1.5 rounded-xl bg-white text-[#593A2A] hover:bg-amber-100 border border-amber-200 transition-all"
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
        <p className="text-xs sm:text-sm font-bold text-[#A96B3C] text-center mt-0.5">
          “Hello, friend! Gently touch Hunny Bear and discover how he feels!”
        </p>
      </header>

      {/* 2. REACTION SPEECH BUBBLE */}
      <div className="w-full max-w-lg my-1">
        <SpeechBubble
          spokenText={spokenText}
          educationalMessage={educationalMessage}
          currentEmotion={currentEmotion}
          isSpeaking={isSpeaking}
          onRepeatVoice={handleRepeatVoice}
        />
      </div>

      {/* 3. CENTER AREA: FULL ANIMATED CARTOON BEAR */}
      <main className="w-full flex-1 flex flex-col items-center justify-center relative my-0.5">
        <AnimatedHunnyBear
          animationState={animationState}
          mouthShape={mouthShape}
          isSpeaking={isSpeaking}
          onTapRegion={handleTapRegion}
        />
      </main>

      {/* 4. BOTTOM AREA: INSTRUCTION & EMOTIONAL ACTIVITIES */}
      <footer className="w-full max-w-lg flex flex-col items-center gap-1.5 mb-1">
        
        {/* Simple prompt */}
        <p className="text-xs sm:text-sm font-extrabold text-[#593A2A] text-center bg-white/70 px-4 py-1 rounded-full border border-amber-200/60 shadow-xs">
          👉 Touch a part of Hunny Bear to play!
        </p>

        {/* Activity Buttons */}
        <div className="w-full flex items-center justify-center gap-2">
          {/* How Do You Feel Today? */}
          <button
            onClick={() => setShowCheckIn(true)}
            className="flex-1 max-w-xs flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-white hover:bg-amber-50 text-[#593A2A] border-2 border-amber-300 font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
          >
            <Smile className="w-4 h-4 text-[#E9B44C]" />
            <span>How do you feel today?</span>
          </button>

          {/* Kindness Challenge */}
          <button
            onClick={handleStartKindnessChallenge}
            className="flex-1 max-w-xs flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-gradient-to-r from-[#E9B44C] to-[#A96B3C] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
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
