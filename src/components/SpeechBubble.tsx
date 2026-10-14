import React from 'react';
import { Volume2 } from 'lucide-react';
import type { EmotionType } from '../types/game';
import { EMOTION_BADGES } from '../utils/emotionManager';

interface SpeechBubbleProps {
  spokenText: string;
  educationalMessage: string;
  currentEmotion: EmotionType;
  isSpeaking: boolean;
  onRepeatVoice: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  spokenText,
  educationalMessage,
  currentEmotion,
  isSpeaking,
  onRepeatVoice,
}) => {
  const badge = EMOTION_BADGES[currentEmotion] || EMOTION_BADGES.happy;

  return (
    <div className="relative w-full max-w-lg mx-auto z-20 flex flex-col items-center">
      {/* Main Rounded Speech Bubble */}
      <div className="w-full bg-white/95 backdrop-blur-xs border-2 border-amber-300 rounded-3xl p-3 sm:p-4 shadow-lg text-center transition-all flex flex-col items-center gap-1.5">
        
        {/* Top Emotion Badge & Repeat Voice button */}
        <div className="w-full flex items-center justify-between border-b border-amber-100 pb-1.5">
          {/* Emotion Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-black ${badge.bg} ${badge.text}`}>
            <span className="text-sm">{badge.icon}</span>
            <span>{badge.label}</span>
          </div>

          {/* Repeat Spoken Voice Button */}
          <button
            onClick={onRepeatVoice}
            aria-label="Repeat spoken message"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all active:scale-95"
            title="Hear Hunny Bear speak again"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-amber-600' : ''}`} />
            <span>Hear again</span>
          </button>
        </div>

        {/* Spoken Dialogue Text */}
        <p className="text-base sm:text-lg font-extrabold text-amber-950 leading-snug">
          "{spokenText}"
        </p>

        {/* Educational Kindness Message */}
        {educationalMessage && (
          <div className="w-full mt-1 pt-1.5 border-t border-amber-100/70 text-xs sm:text-sm font-semibold text-amber-800/90 flex items-center justify-center gap-1.5">
            <span>💡</span>
            <span>{educationalMessage}</span>
          </div>
        )}
      </div>

      {/* Little Speech Bubble Tail */}
      <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-amber-300 transform rotate-45 -mt-2 shadow-xs" />
    </div>
  );
};
