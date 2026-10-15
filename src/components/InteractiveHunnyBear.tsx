import React, { useState, useEffect, useRef } from 'react';
import type { BodyRegion, AnimationState, MouthShape } from '../types/game';

interface InteractiveHunnyBearProps {
  animationState: AnimationState;
  mouthShape: MouthShape;
  isSpeaking: boolean;
  onTapRegion: (region: BodyRegion) => void;
}

interface TapParticle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

export const InteractiveHunnyBear: React.FC<InteractiveHunnyBearProps> = ({
  animationState,
  mouthShape,
  isSpeaking,
  onTapRegion,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [activePawWave, setActivePawWave] = useState<'left' | 'right' | null>(null);
  const [activeFootTap, setActiveFootTap] = useState<'left' | 'right' | null>(null);
  const [particles, setParticles] = useState<TapParticle[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Periodic natural idle blinking (every 3.6s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (animationState === 'idle') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 180);
      }
    }, 3600);
    return () => clearInterval(timer);
  }, [animationState]);

  // Synchronize limb reaction states with animationState
  useEffect(() => {
    if (animationState === 'wave-left') {
      setActivePawWave('left');
    } else if (animationState === 'wave-right') {
      setActivePawWave('right');
    } else {
      setActivePawWave(null);
    }

    if (animationState === 'foot-tap-left') {
      setActiveFootTap('left');
    } else if (animationState === 'foot-tap-right') {
      setActiveFootTap('right');
    } else {
      setActiveFootTap(null);
    }
  }, [animationState]);

  // Trigger floating visual tap feedback particle (hearts, sparkles, music notes)
  const spawnParticle = (clientX: number, clientY: number, symbol: string) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const id = Date.now() + Math.random();

    setParticles((prev) => [...prev.slice(-6), { id, x, y, symbol }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1100);
  };

  const handleRegionClick = (
    e: React.MouseEvent | React.TouchEvent,
    region: BodyRegion,
    symbol: string
  ) => {
    e.stopPropagation();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    spawnParticle(clientX, clientY, symbol);
    onTapRegion(region);
  };

  // Determine dynamic animation CSS classes
  const isHeadTilting = animationState === 'head-tilt';
  const isNoseBooping = animationState === 'nose-boop';
  const isEarLeftSurprise = animationState === 'ear-surprise-left';
  const isEarRightSurprise = animationState === 'ear-surprise-right';
  const isEyeBlinkLeft = animationState === 'eye-blink-left';
  const isEyeBlinkRight = animationState === 'eye-blink-right';
  const isCheekSmileLeft = animationState === 'cheek-smile-left';
  const isCheekSmileRight = animationState === 'cheek-smile-right';
  const isMouthSurprise = animationState === 'mouth-surprise';
  const isTummyLove = animationState === 'tummy-love' || animationState === 'tummy-giggle';

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-200/90 bg-[#FFF8EA] select-none touch-manipulation mx-auto"
      style={{
        boxShadow: '0 18px 40px -10px rgba(89, 58, 42, 0.3), 0 0 24px rgba(233, 180, 76, 0.25)',
      }}
    >
      {/* 1. BASE BACKGROUND & CHARACTER SCENE (The user's authentic Whimsical Bear image) */}
      <img
        src="/image/Whimsical Bear by the Rainbow Stream.png"
        alt="Hunny Bear by the Rainbow Stream"
        className={`w-full h-full object-cover pointer-events-none transition-transform duration-700 ease-out ${
          animationState === 'idle' ? 'animate-gentle-breathe' : ''
        }`}
      />

      {/* 2. LAYERED ANIMATED SPRITES FROM THE USER'S ASSET */}

      {/* Head Layer (Idle breathing bob, Head tilt, Nose boop recoil, Ear surprise tilt) */}
      <div
        className={`absolute pointer-events-none transition-transform duration-500 ease-out ${
          isHeadTilting
            ? 'rotate-8 translate-x-1 -translate-y-1 scale-102'
            : isNoseBooping
            ? '-translate-y-4 scale-97'
            : isEarLeftSurprise
            ? '-rotate-7 -translate-x-2'
            : isEarRightSurprise
            ? 'rotate-7 translate-x-2'
            : isCheekSmileLeft
            ? 'rotate-5 -translate-x-1'
            : isCheekSmileRight
            ? '-rotate-5 translate-x-1'
            : animationState === 'idle'
            ? 'animate-head-bob'
            : ''
        }`}
        style={{
          left: '28.71%',
          top: '13.56%',
          width: '44.66%',
          height: '41.47%',
          transformOrigin: '50% 85%',
        }}
      >
        <img
          src="/image/sprites/head.png"
          alt=""
          className="w-full h-full object-contain"
        />

        {/* Wiggling Nose Overlay on Head */}
        <div
          className={`absolute transition-transform duration-150 ${
            isNoseBooping ? 'animate-wiggle-fast scale-110' : ''
          }`}
          style={{
            left: '33.9%',
            top: '49.0%',
            width: '21.4%',
            height: '18.3%',
          }}
        >
          <img
            src="/image/sprites/nose.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Left Ear Overlay on Head */}
        <div
          className={`absolute transition-transform duration-300 ${
            isEarLeftSurprise ? 'rotate-12 -translate-y-1' : ''
          }`}
          style={{
            left: '14.3%',
            top: '3.8%',
            width: '32.1%',
            height: '34.6%',
            transformOrigin: '70% 80%',
          }}
        >
          <img
            src="/image/sprites/left_ear.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right Ear Overlay on Head */}
        <div
          className={`absolute transition-transform duration-300 ${
            isEarRightSurprise ? '-rotate-12 -translate-y-1' : ''
          }`}
          style={{
            left: '67.8%',
            top: '23.0%',
            width: '32.1%',
            height: '36.5%',
            transformOrigin: '30% 80%',
          }}
        >
          <img
            src="/image/sprites/right_ear.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Blinking Eyelid Overlays on Eyes */}
        {(isBlinking || isEyeBlinkLeft || isEyeBlinkRight || isNoseBooping) && (
          <>
            {/* Left Eyelid */}
            <div
              className={`absolute bg-[#9D633C] rounded-full transition-all duration-100 ${
                isBlinking || isEyeBlinkLeft || isNoseBooping
                  ? 'h-7 opacity-95'
                  : 'h-0 opacity-0'
              }`}
              style={{
                left: '26.8%',
                top: '38.5%',
                width: '18.5%',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
            {/* Right Eyelid */}
            <div
              className={`absolute bg-[#9D633C] rounded-full transition-all duration-100 ${
                isBlinking || isEyeBlinkRight || isNoseBooping
                  ? 'h-7 opacity-95'
                  : 'h-0 opacity-0'
              }`}
              style={{
                left: '53.6%',
                top: '46.0%',
                width: '19.6%',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}
            />
          </>
        )}

        {/* Rosy Cheek Blush Glow */}
        <div
          className={`absolute rounded-full bg-rose-400/40 blur-xs transition-opacity duration-300 pointer-events-none ${
            isCheekSmileLeft || isTummyLove ? 'opacity-90 scale-125' : 'opacity-0'
          }`}
          style={{
            left: '11.5%',
            top: '46.0%',
            width: '21.4%',
            height: '23.0%',
          }}
        />
        <div
          className={`absolute rounded-full bg-rose-400/40 blur-xs transition-opacity duration-300 pointer-events-none ${
            isCheekSmileRight || isTummyLove ? 'opacity-90 scale-125' : 'opacity-0'
          }`}
          style={{
            left: '59.8%',
            top: '55.8%',
            width: '23.2%',
            height: '23.0%',
          }}
        />

        {/* Mouth Overlay (Speaking visemes / Surprised "O" shape) */}
        <div
          className={`absolute transition-transform duration-150 ${
            isSpeaking
              ? 'animate-mouth-speak'
              : isMouthSurprise
              ? 'scale-y-140 scale-x-75'
              : mouthShape === 'smile'
              ? 'scale-105'
              : ''
          }`}
          style={{
            left: '31.2%',
            top: '59.6%',
            width: '26.8%',
            height: '21.1%',
            transformOrigin: '50% 30%',
          }}
        >
          <img
            src="/image/sprites/mouth.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Tummy Layer (Soft breathing expansion, bouncy tummy love reaction) */}
      <div
        className={`absolute pointer-events-none transition-transform duration-500 ease-out ${
          isTummyLove ? 'animate-tummy-hug scale-108' : 'animate-tummy-idle'
        }`}
        style={{
          left: '35.89%',
          top: '51.83%',
          width: '26.32%',
          height: '27.91%',
          transformOrigin: '50% 60%',
        }}
      >
        <img
          src="/image/sprites/tummy.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* Left Paw / Arm (Waving hand, tummy hug, or mouth raise) */}
      <div
        className={`absolute pointer-events-none transition-all duration-400 ease-out ${
          activePawWave === 'left'
            ? 'animate-paw-wave z-20'
            : isTummyLove
            ? 'translate-x-3 translate-y-3 rotate-12 scale-105 z-20'
            : isEyeBlinkLeft || isMouthSurprise
            ? '-translate-y-8 translate-x-2 -rotate-15 z-20'
            : 'animate-paw-rest'
        }`}
        style={{
          left: '31.5%',
          top: '45.85%',
          width: '16.35%',
          height: '16.35%',
          transformOrigin: '30% 40%',
        }}
      >
        <img
          src="/image/sprites/left_paw.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* Right Paw / Arm (Waving hand or tummy hug) */}
      <div
        className={`absolute pointer-events-none transition-all duration-400 ease-out ${
          activePawWave === 'right'
            ? 'animate-paw-wave-right z-20'
            : isTummyLove
            ? '-translate-x-3 translate-y-3 -rotate-12 scale-105 z-20'
            : 'animate-paw-rest'
        }`}
        style={{
          left: '45.45%',
          top: '46.25%',
          width: '16.35%',
          height: '16.35%',
          transformOrigin: '70% 40%',
        }}
      >
        <img
          src="/image/sprites/right_paw.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* Left Foot (Foot tap lifting and stamping on rainbow path) */}
      <div
        className={`absolute pointer-events-none transition-transform duration-300 ease-out ${
          activeFootTap === 'left' ? 'animate-foot-stamp z-10' : ''
        }`}
        style={{
          left: '33.49%',
          top: '76.55%',
          width: '15.55%',
          height: '13.16%',
          transformOrigin: '50% 20%',
        }}
      >
        <img
          src="/image/sprites/left_foot.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* Right Foot (Foot tap lifting and stamping on rainbow path) */}
      <div
        className={`absolute pointer-events-none transition-transform duration-300 ease-out ${
          activeFootTap === 'right' ? 'animate-foot-stamp-right z-10' : ''
        }`}
        style={{
          left: '50.64%',
          top: '76.95%',
          width: '16.35%',
          height: '13.16%',
          transformOrigin: '50% 20%',
        }}
      >
        <img
          src="/image/sprites/right_foot.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

      {/* 3. INTERACTIVE TOUCH HITBOXES (Mapped directly over the 10 distinct body parts) */}

      {/* Head */}
      <button
        onClick={(e) => handleRegionClick(e, 'head', '✨')}
        aria-label="Gently touch Hunny Bear's head"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/15 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '43%',
          top: '16%',
          width: '18%',
          height: '16%',
        }}
      />

      {/* Left Ear */}
      <button
        onClick={(e) => handleRegionClick(e, 'left-ear', '👂')}
        aria-label="Gently touch left ear"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/15 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '34%',
          top: '15%',
          width: '14%',
          height: '14%',
        }}
      />

      {/* Right Ear */}
      <button
        onClick={(e) => handleRegionClick(e, 'right-ear', '👂')}
        aria-label="Gently touch right ear"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/15 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '59%',
          top: '23%',
          width: '14%',
          height: '14%',
        }}
      />

      {/* Left Eye */}
      <button
        onClick={(e) => handleRegionClick(e, 'left-eye', '👀')}
        aria-label="Gently touch left eye"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/15 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '39%',
          top: '28%',
          width: '11%',
          height: '11%',
        }}
      />

      {/* Right Eye */}
      <button
        onClick={(e) => handleRegionClick(e, 'right-eye', '👀')}
        aria-label="Gently touch right eye"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/15 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '52%',
          top: '32%',
          width: '11%',
          height: '11%',
        }}
      />

      {/* Nose */}
      <button
        onClick={(e) => handleRegionClick(e, 'nose', '👃')}
        aria-label="Gently touch nose"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/20 focus:outline-hidden active:scale-90 transition-all"
        style={{
          left: '43.5%',
          top: '34%',
          width: '11%',
          height: '8%',
        }}
      />

      {/* Mouth */}
      <button
        onClick={(e) => handleRegionClick(e, 'mouth', '😮')}
        aria-label="Gently touch mouth"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '42.5%',
          top: '39%',
          width: '13%',
          height: '8%',
        }}
      />

      {/* Left Cheek */}
      <button
        onClick={(e) => handleRegionClick(e, 'left-cheek', '🌸')}
        aria-label="Gently touch left cheek"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-rose-300/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '33%',
          top: '33%',
          width: '10%',
          height: '11%',
        }}
      />

      {/* Right Cheek */}
      <button
        onClick={(e) => handleRegionClick(e, 'right-cheek', '🌸')}
        aria-label="Gently touch right cheek"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-rose-300/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '56%',
          top: '37%',
          width: '11%',
          height: '11%',
        }}
      />

      {/* Left Hand / Paw */}
      <button
        onClick={(e) => handleRegionClick(e, 'left-hand', '👋')}
        aria-label="Gently touch left paw"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '32%',
          top: '46%',
          width: '15%',
          height: '15%',
        }}
      />

      {/* Right Hand / Paw */}
      <button
        onClick={(e) => handleRegionClick(e, 'right-hand', '👋')}
        aria-label="Gently touch right paw"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '46%',
          top: '46.5%',
          width: '15%',
          height: '15%',
        }}
      />

      {/* Stomach / Tummy */}
      <button
        onClick={(e) => handleRegionClick(e, 'stomach', '💖')}
        aria-label="Gently touch stomach"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '37%',
          top: '55%',
          width: '24%',
          height: '21%',
        }}
      />

      {/* Left Foot */}
      <button
        onClick={(e) => handleRegionClick(e, 'left-foot', '🐾')}
        aria-label="Gently touch left foot"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '33%',
          top: '77%',
          width: '16%',
          height: '13%',
        }}
      />

      {/* Right Foot */}
      <button
        onClick={(e) => handleRegionClick(e, 'right-foot', '🐾')}
        aria-label="Gently touch right foot"
        className="absolute z-30 cursor-pointer rounded-full hover:bg-amber-400/20 focus:outline-hidden active:scale-95 transition-all"
        style={{
          left: '50%',
          top: '77%',
          width: '17%',
          height: '13%',
        }}
      />

      {/* 4. FLOATING PARTICLES ON TAP (Stars, hearts, paws) */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none text-2xl sm:text-3xl animate-float-fade z-40 select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
};
