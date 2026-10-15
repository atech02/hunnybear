import React, { useEffect, useState } from 'react';
import { Heart, Volume2, VolumeX, Music, HelpCircle } from 'lucide-react';

interface HappinessMeterProps {
  score: number;
  scoreChangeDelta: number | null;
  isMuted: boolean;
  isBgmOn: boolean;
  onToggleMute: () => void;
  onToggleBgm: () => void;
  onOpenHelp: () => void;
}

export const HappinessMeter: React.FC<HappinessMeterProps> = ({
  score,
  scoreChangeDelta,
  isMuted,
  isBgmOn,
  onToggleMute,
  onToggleBgm,
  onOpenHelp,
}) => {
  const [floatingIndicator, setFloatingIndicator] = useState<{ id: number; text: string; positive: boolean } | null>(null);

  useEffect(() => {
    if (scoreChangeDelta !== null && scoreChangeDelta !== 0) {
      const positive = scoreChangeDelta > 0;
      const text = positive ? `+${scoreChangeDelta}` : `${scoreChangeDelta}`;
      const id = Date.now();
      setFloatingIndicator({ id, text, positive });
      const timer = setTimeout(() => {
        setFloatingIndicator(null);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [scoreChangeDelta]);

  // Determine emotional level label
  const getLevelLabel = (val: number): { text: string; color: string } => {
    if (val <= 20) return { text: 'Needs some kindness 💛', color: 'text-amber-800' };
    if (val <= 40) return { text: 'Feeling a little sad 💙', color: 'text-blue-700' };
    if (val <= 60) return { text: 'Feeling okay 🌿', color: 'text-emerald-700' };
    if (val <= 80) return { text: 'Feeling happy! 😊', color: 'text-amber-700' };
    return { text: 'Feeling super happy! 🌟', color: 'text-amber-600' };
  };

  const level = getLevelLabel(score);

  return (
    <div className="w-full max-w-lg bg-white/80 backdrop-blur-md border border-amber-100/60 rounded-2xl px-3.5 py-1.5 shadow-xs flex flex-col gap-1 font-sans">
      <div className="flex items-center justify-between">
        
        {/* Heart + Happiness Label */}
        <div className="flex items-center gap-1.5 relative">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
          <span className="font-extrabold text-xs sm:text-sm text-amber-950 font-heading">
            Happiness:
          </span>
          <span className="font-black text-xs sm:text-sm text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
            {score}%
          </span>

          {/* Floating +2 / -2 Score Indicator */}
          {floatingIndicator && (
            <span
              key={floatingIndicator.id}
              className={`absolute -top-3 left-32 font-black text-sm sm:text-base animate-bounce ${
                floatingIndicator.positive ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              {floatingIndicator.text}
            </span>
          )}
        </div>

        {/* Emotion Stage Description */}
        <span className={`text-xs sm:text-sm font-bold ${level.color} hidden xs:inline`}>
          {level.text}
        </span>

        {/* Sound & Help Controls */}
        <div className="flex items-center gap-1.5">
          {/* Lullaby BGM Toggle */}
          <button
            onClick={onToggleBgm}
            aria-label={isBgmOn ? "Mute Background Music" : "Play Gentle Background Music"}
            className={`p-1.5 rounded-xl transition-all ${
              isBgmOn
                ? 'bg-amber-300 text-amber-950 shadow-inner'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
            title="Music Box Lullaby"
          >
            <Music className={`w-4 h-4 ${isBgmOn ? 'animate-pulse' : ''}`} />
          </button>

          {/* Master Sound Toggle */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all"
            title={isMuted ? "Unmute All Sounds" : "Mute Sounds"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Teacher / Parent Help Modal Button */}
          <button
            onClick={onOpenHelp}
            aria-label="Parent & Teacher Guide"
            className="p-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all"
            title="Parent & Teacher Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 sm:h-2.5 bg-amber-100/70 rounded-full overflow-hidden shadow-inner border border-amber-200/40">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-amber-400 via-amber-500 to-rose-400"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
