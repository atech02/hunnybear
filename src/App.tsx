import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Music,
  Download,
  Sparkles,
  Heart,
  Smile,
  Hand,
  RotateCcw,
  Info,
} from 'lucide-react';
import { HunnyBearCharacter, type BearReaction } from './components/HunnyBearCharacter';
import { soundEngine } from './utils/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const App: React.FC = () => {
  const [speechMessage, setSpeechMessage] = useState<string>(
    "Hi there! I'm Hunny Bear! Tap my nose, tickle my tummy, or give me a high-paw! 🍯✨"
  );
  const [happiness, setHappiness] = useState<number>(30);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmOn, setIsBgmOn] = useState<boolean>(false);
  const [externalReaction, setExternalReaction] = useState<BearReaction>('idle');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Capture PWA beforeinstallprompt event
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
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleBearInteraction = (_reaction: string, message: string) => {
    setSpeechMessage(message);
    setHappiness((prev) => {
      const next = Math.min(100, prev + 12);
      if (next === 100 && prev < 100) {
        // Trigger celebration confetti when happiness reaches 100%!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#38bdf8'],
        });
        soundEngine.playHoneyCelebration();
        setTimeout(() => {
          setSpeechMessage("Hooray! Hunny Bear is super-duper happy! You are the sweetest! 🌟🎉");
        }, 1500);
      }
      return next;
    });
  };

  const triggerAction = (reaction: BearReaction) => {
    setExternalReaction(reaction);
    setTimeout(() => setExternalReaction('idle'), 100);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    if (nextMuted) {
      setIsBgmOn(false);
    }
  };

  const toggleMusic = () => {
    if (isMuted) {
      setIsMuted(false);
      soundEngine.setMuted(false);
    }
    const state = soundEngine.toggleBGM();
    setIsBgmOn(state);
  };

  const resetGame = () => {
    setHappiness(20);
    setSpeechMessage("Ready for another round of fun and cuddles! 🍯");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-amber-50 to-orange-100 flex flex-col justify-between items-center px-4 py-3 sm:py-6 text-amber-950 font-sans">
      
      {/* 1. TOP HEADER & CONTROLS */}
      <header className="w-full max-w-xl flex items-center justify-between pb-2 border-b border-amber-200/60">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 shadow-md flex items-center justify-center text-xl shadow-amber-500/30">
            🍯
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-900 leading-none">
              Hunny Bear
            </h1>
            <p className="text-xs font-medium text-amber-700/80">
              Interactive Companion
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* PWA Install Button */}
          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstallClick}
              aria-label="Install Hunny Bear App"
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-sm transition-all transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            aria-label={isBgmOn ? "Mute Background Music" : "Play Background Music"}
            className={`p-2 rounded-xl transition-all ${
              isBgmOn
                ? 'bg-amber-400 text-amber-950 shadow-inner'
                : 'bg-white/80 text-amber-800 hover:bg-white shadow-xs'
            }`}
          >
            <Music className={`w-4 h-4 ${isBgmOn ? 'animate-pulse' : ''}`} />
          </button>

          {/* Master Sound Toggle */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute All Sounds" : "Mute All Sounds"}
            className="p-2 rounded-xl bg-white/80 text-amber-800 hover:bg-white shadow-xs transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Info Modal Button */}
          <button
            onClick={() => setShowInfoModal(true)}
            aria-label="Game Info and How to Play"
            className="p-2 rounded-xl bg-white/80 text-amber-800 hover:bg-white shadow-xs transition-all"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Reset Happiness */}
          <button
            onClick={resetGame}
            aria-label="Reset game"
            className="p-2 rounded-xl bg-white/80 text-amber-800 hover:bg-white shadow-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. HAPPINESS METER */}
      <div className="w-full max-w-md my-2">
        <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1 px-1">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            Hunny's Happiness
          </span>
          <span className="bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-900">
            {happiness}%
          </span>
        </div>
        <div className="w-full h-3.5 bg-amber-200/70 rounded-full p-0.5 shadow-inner overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-400 rounded-full transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${happiness}%` }}
          />
        </div>
      </div>

      {/* 3. BEAR SPEECH BUBBLE */}
      <div className="relative w-full max-w-md my-1.5 z-20">
        <div className="bg-white/95 backdrop-blur-xs border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-lg text-center transition-all">
          <p className="text-sm sm:text-base font-semibold text-amber-950">
            {speechMessage}
          </p>
        </div>
        {/* Little speech tail pointing down to the bear */}
        <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-amber-300 transform rotate-45 mx-auto -mt-2 shadow-xs" />
      </div>

      {/* 4. CENTRAL INTERACTIVE CHARACTER */}
      <main className="w-full flex-1 flex flex-col items-center justify-center my-1 relative">
        <HunnyBearCharacter
          onInteraction={handleBearInteraction}
          externalReaction={externalReaction}
        />
      </main>

      {/* 5. QUICK REACTION ACTION BAR (Accessible Buttons) */}
      <footer className="w-full max-w-lg mb-2">
        <div className="bg-white/90 backdrop-blur-xs border border-amber-200/80 rounded-2xl p-2.5 shadow-md">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            
            {/* Boop Nose */}
            <button
              onClick={() => triggerAction('surprise')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 active:scale-95 transition-transform"
              title="Boop nose"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 mb-0.5" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-900">Boop</span>
            </button>

            {/* Tickle Tummy */}
            <button
              onClick={() => triggerAction('tickle')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 active:scale-95 transition-transform"
              title="Tickle tummy"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mb-0.5" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-900">Tickle</span>
            </button>

            {/* Wave Paw */}
            <button
              onClick={() => triggerAction('wave-left')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 active:scale-95 transition-transform"
              title="High five paw"
            >
              <Hand className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 mb-0.5" />
              <span className="text-[10px] sm:text-xs font-bold text-amber-900">Wave</span>
            </button>

            {/* Tap Feet */}
            <button
              onClick={() => triggerAction('tap-left')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 active:scale-95 transition-transform"
              title="Tap feet"
            >
              <span className="text-base sm:text-lg mb-0.5 leading-none">🐾</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-900">Tap Feet</span>
            </button>

            {/* Honey Treat */}
            <button
              onClick={() => triggerAction('honey-treat')}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-xs active:scale-95 transition-transform"
              title="Feed sweet honey treat"
            >
              <span className="text-base sm:text-lg mb-0.5 leading-none">🍯</span>
              <span className="text-[10px] sm:text-xs font-bold text-white">Treat</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 6. INFO MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-200 text-left">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-amber-900 flex items-center gap-2">
                <span>🍯</span> About Hunny Bear
              </h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="text-xs sm:text-sm text-amber-800 space-y-2.5">
              <p>
                <strong>Hunny Bear</strong> is a responsive interactive game designed for mobile, tablet, and desktop.
              </p>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                <p className="font-bold text-amber-900">Interactive Areas:</p>
                <p>• <strong>Face / Nose:</strong> Surprised reaction and boop chirp</p>
                <p>• <strong>Tummy:</strong> Ticklish laugh and jiggling giggles</p>
                <p>• <strong>Paws:</strong> Friendly high-five waves</p>
                <p>• <strong>Feet:</strong> Playful foot-tapping dance</p>
                <p>• <strong>Honey Treat:</strong> Sweet celebration</p>
              </div>
              <p className="text-[11px] text-amber-600">
                PWA ready with offline service worker. Web Audio synthesized in real-time without external network requests.
              </p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-white text-sm shadow-md"
            >
              Got it, let's play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
