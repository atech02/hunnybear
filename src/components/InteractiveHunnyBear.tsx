import React, { useRef } from 'react';
import type { BodyRegion, AnimationState, MouthShape } from '../types/game';
import { HunnyBear3D } from './HunnyBear3D';

interface InteractiveHunnyBearProps {
  animationState: AnimationState;
  mouthShape?: MouthShape;
  isSpeaking: boolean;
  onTapRegion: (region: BodyRegion) => void;
}

export const InteractiveHunnyBear: React.FC<InteractiveHunnyBearProps> = ({
  animationState,
  mouthShape = 'closed',
  isSpeaking,
  onTapRegion,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handle3DTapRegion = (region: BodyRegion) => {
    onTapRegion(region);
  };

  const handleKeyDown = (e: React.KeyboardEvent, region: BodyRegion) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handle3DTapRegion(region);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[480px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-transparent select-none touch-manipulation mx-auto flex items-center justify-center transition-all duration-300"
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* 1. SCENERY BACKGROUND LAYER (Rainbow path, waterfall, stream, trees, mushrooms - NO STATIC BEAR) */}
      <img
        src="/image/scenery_background.png"
        alt="Fairytale Scenery by the Rainbow Stream"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none rounded-2xl sm:rounded-3xl"
        draggable={false}
      />

      {/* 2. NATURAL GROUND CONTACT SHADOW (Grounds the 3D Bear onto the rainbow path stones) */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: '6.5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '46%',
          height: '8%',
          background:
            'radial-gradient(ellipse at center, rgba(52, 28, 10, 0.42) 0%, rgba(52, 28, 10, 0.16) 48%, rgba(52, 28, 10, 0) 74%)',
          filter: 'blur(3px)',
        }}
      />

      {/* 3. INTERACTIVE 3D HUNNY BEAR (Loads /models/cute_simple_bear_3d_model__rigging.glb + 3D Raycasting) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <HunnyBear3D
          animationState={animationState}
          mouthShape={mouthShape}
          isSpeaking={isSpeaking}
          onTapRegion={handle3DTapRegion}
        />

        {/* 4. KEYBOARD & ASSISTIVE-TOUCH ACCESSIBLE INVISIBLE CONTROLS (pointer-events-none so 3D Raycaster receives canvas clicks/touches) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          aria-label="Hunny Bear 3D Interactive Controls"
        >
          {(
            [
              ['head', 50, 16, 'Gently touch Hunny Bear head'],
              ['left-ear', 34, 12, 'Gently touch left ear'],
              ['right-ear', 66, 12, 'Gently touch right ear'],
              ['left-eye', 43, 26, 'Gently touch left eye'],
              ['right-eye', 57, 26, 'Gently touch right eye'],
              ['nose', 50, 30, 'Gently touch nose'],
              ['mouth', 50, 36, 'Gently touch mouth'],
              ['left-cheek', 36, 33, 'Gently touch left cheek'],
              ['right-cheek', 64, 33, 'Gently touch right cheek'],
              ['left-hand', 26, 62, 'Gently touch left hand'],
              ['right-hand', 74, 62, 'Gently touch right hand'],
              ['stomach', 50, 62, 'Gently touch stomach'],
              ['left-foot', 39, 89, 'Gently touch left foot'],
              ['right-foot', 61, 89, 'Gently touch right foot'],
            ] as Array<[BodyRegion, number, number, string]>
          ).map(([region, cx, cy, label]) => (
            <circle
              key={region}
              cx={cx}
              cy={cy}
              r="5"
              fill="transparent"
              stroke="none"
              tabIndex={0}
              role="button"
              aria-label={label}
              className="outline-hidden"
              onClick={(e) => {
                e.stopPropagation();
                handle3DTapRegion(region);
              }}
              onKeyDown={(e) => handleKeyDown(e, region)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
