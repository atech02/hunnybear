import React from 'react';
import { FEELING_OPTIONS } from '../utils/emotionManager';
import type { FeelingOption } from '../types/game';

interface EmotionCheckInProps {
  onSelectFeeling: (feeling: FeelingOption) => void;
  onClose: () => void;
}

export const EmotionCheckIn: React.FC<EmotionCheckInProps> = ({
  onSelectFeeling,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-200 text-center flex flex-col items-center">
        
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl mb-2">
          🐻
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-heading mb-1">
          How do you feel today?
        </h3>
        
        <p className="text-xs sm:text-sm text-amber-800 font-medium mb-4">
          Every feeling is okay! Tap how you are feeling inside:
        </p>

        {/* 4 Illustrated Emotion Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mb-4">
          {FEELING_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectFeeling(f)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 transition-all active:scale-95 shadow-xs"
            >
              <span className="text-3xl mb-1">{f.emoji}</span>
              <span className="font-extrabold text-sm text-amber-950">{f.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-xs font-bold text-amber-700 hover:text-amber-900 py-1 px-3 rounded-lg hover:bg-amber-50"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
