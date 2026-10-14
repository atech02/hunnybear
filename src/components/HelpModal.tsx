import React from 'react';
import { X, Heart, Shield, Sparkles } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
  onStartKindnessChallenge: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  onClose,
  onStartKindnessChallenge,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-200 text-left flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍯</span>
            <h3 className="text-lg sm:text-xl font-black text-amber-950 font-heading">
              Parent & Teacher Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Educational Purpose */}
        <div className="space-y-3 text-xs sm:text-sm text-amber-900">
          <p className="font-semibold">
            <strong>Hunny Bear: Feelings & Friends</strong> teaches preschool and early-grade children emotional awareness, boundaries, and gentle touch through interactive cartoon play.
          </p>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
              <Shield className="w-4 h-4 text-amber-700" />
              Gentle Touch & Boundaries:
            </h4>
            <p>• <strong>Eyes:</strong> Delicate area. Touching eyes teaches empathy ("Ouch, please be gentle with my eyes").</p>
            <p>• <strong>Ears & Mouth:</strong> Sensitive areas teaching personal space ("Different parts of our bodies feel sensitive").</p>
            <p>• <strong>Cheeks, Tummy, Paws, Feet:</strong> Warm, gentle positive interactions that bring joy and giggles!</p>
          </div>

          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-950">
              <Heart className="w-4 h-4 text-emerald-700" />
              Happiness Meter:
            </h4>
            <p>Scores range from 0 to 100. Positive interactions add +2 points. Sensitive touches gently reduce -2 points without shame, guiding the child toward gentleness.</p>
          </div>

          {/* Kindness Challenge Button */}
          <button
            onClick={() => {
              onClose();
              onStartKindnessChallenge();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            <span>Play "Let's Make Hunny Bear Smile!"</span>
          </button>
        </div>
      </div>
    </div>
  );
};
