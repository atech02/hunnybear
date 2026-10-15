import React, { useState, useEffect, useRef } from 'react';
import type { BodyRegion, AnimationState, MouthShape } from '../types/game';

interface InteractiveHunnyBearProps {
  animationState: AnimationState;
  mouthShape?: MouthShape;
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
  const [particles, setParticles] = useState<TapParticle[]>([]);
  const [isIdleBlinking, setIsIdleBlinking] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Natural spontaneous eye blinking when idle so Hunny Bear feels alive
  useEffect(() => {
    let blinkTimeout: number;
    let isMounted = true;

    const scheduleBlink = () => {
      const delay = 3400 + Math.random() * 2400; // 3.4s - 5.8s
      blinkTimeout = window.setTimeout(() => {
        if (!isMounted) return;
        setIsIdleBlinking(true);
        window.setTimeout(() => {
          if (!isMounted) return;
          setIsIdleBlinking(false);
          scheduleBlink();
        }, 160);
      }, delay);
    };

    scheduleBlink();
    return () => {
      isMounted = false;
      clearTimeout(blinkTimeout);
    };
  }, []);

  // Trigger floating visual tap feedback particle (hearts, sparkles, stars, paws)
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
    e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent,
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
    } else if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    spawnParticle(clientX, clientY, symbol);
    onTapRegion(region);
  };

  const handleKeyDown = (e: React.KeyboardEvent, region: BodyRegion, symbol: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRegionClick(e, region, symbol);
    }
  };

  // Determine organic animation class applied to the whole character
  const getBearAnimationClass = (): string => {
    switch (animationState) {
      case 'leftHandWave':
      case 'wave-left':
        return 'animate-bear-wave-left';
      case 'rightHandWave':
      case 'wave-right':
        return 'animate-bear-wave-right';
      case 'leftFootTap':
      case 'foot-tap-left':
        return 'animate-bear-foot-tap-left';
      case 'rightFootTap':
      case 'foot-tap-right':
        return 'animate-bear-foot-tap-right';
      case 'leftCheekSmile':
      case 'cheek-smile-left':
        return 'animate-bear-cheek-smile-left';
      case 'rightCheekSmile':
      case 'cheek-smile-right':
        return 'animate-bear-cheek-smile-right';
      case 'leftEyeReaction':
      case 'eye-blink-left':
        return 'animate-bear-eye-reaction-left';
      case 'rightEyeReaction':
      case 'eye-blink-right':
        return 'animate-bear-eye-reaction-right';
      case 'leftEarGloomy':
      case 'ear-surprise-left':
        return 'animate-bear-ear-gloomy-left';
      case 'rightEarGloomy':
      case 'ear-surprise-right':
        return 'animate-bear-ear-gloomy-right';
      case 'mouthShock':
      case 'mouth-surprise':
        return 'animate-bear-mouth-shock';
      case 'tummyHappy':
      case 'tummy-love':
      case 'tummy-giggle':
        return 'animate-bear-tummy-happy';
      case 'nose-boop':
        return 'animate-bear-boop';
      case 'head-tilt':
        return 'animate-bear-head-tilt';
      case 'idle':
      default:
        return isSpeaking ? 'animate-bear-speaking' : 'animate-bear-idle';
    }
  };

  // Facial feature states
  const isLeftEyeClosed =
    isIdleBlinking ||
    animationState === 'leftEyeReaction' ||
    animationState === 'eye-blink-left';

  const isRightEyeClosed =
    isIdleBlinking ||
    animationState === 'rightEyeReaction' ||
    animationState === 'eye-blink-right';

  const isEyesSquintingJoy =
    animationState === 'leftCheekSmile' ||
    animationState === 'rightCheekSmile' ||
    animationState === 'tummyHappy' ||
    animationState === 'cheek-smile-left' ||
    animationState === 'cheek-smile-right' ||
    animationState === 'tummy-love';

  const isEyesSurprised =
    animationState === 'mouthShock' ||
    animationState === 'mouth-surprise';

  const isEyebrowsConfused =
    animationState === 'leftEyeReaction' ||
    animationState === 'rightEyeReaction' ||
    animationState === 'eye-blink-left' ||
    animationState === 'eye-blink-right';

  const isGloomyEar =
    animationState === 'leftEarGloomy' ||
    animationState === 'rightEarGloomy' ||
    animationState === 'ear-surprise-left' ||
    animationState === 'ear-surprise-right';

  const isMouthShockO =
    animationState === 'mouthShock' ||
    animationState === 'mouth-surprise';

  const isCheekBlushing = isEyesSquintingJoy;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[480px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-transparent select-none touch-manipulation mx-auto flex items-center justify-center transition-all duration-300"
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* 1. SCENERY BACKGROUND LAYER (Rainbow path, waterfall, stream, trees, mushrooms - NO BEAR) */}
      <img
        src="/image/scenery_background.png"
        alt="Fairytale Scenery by the Rainbow Stream"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none rounded-2xl sm:rounded-3xl"
        draggable={false}
      />

      {/* 2. NATURAL GROUND CONTACT SHADOW (Grounds Hunny Bear onto the rainbow path stones) */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '46%',
          height: '7%',
          background: 'radial-gradient(ellipse at center, rgba(60, 35, 12, 0.32) 0%, rgba(60, 35, 12, 0) 72%)',
          filter: 'blur(3px)',
        }}
      />

      {/* 3. MAIN CHARACTER WRAPPER (Animated seamlessly as one unified, living character) */}
      <div
        className={`relative z-10 w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out ${getBearAnimationClass()}`}
        style={{
          transformOrigin: '50% 86%',
        }}
      >
        {/* Full, pristine transparent character image */}
        <img
          src="/image/hunnybear_character.png"
          alt="Hunny Bear"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
          draggable={false}
        />

        {/* Soft, seamless blush glow on cheeks (blooms gently only on affection/praise) */}
        <div
          className={`absolute pointer-events-none rounded-full bg-rose-400/35 blur-md transition-opacity duration-300 ${
            isCheekBlushing ? 'opacity-90 scale-125' : 'opacity-0'
          }`}
          style={{
            left: '30%',
            top: '26%',
            width: '13%',
            height: '11%',
          }}
        />
        <div
          className={`absolute pointer-events-none rounded-full bg-rose-400/35 blur-md transition-opacity duration-300 ${
            isCheekBlushing ? 'opacity-90 scale-125' : 'opacity-0'
          }`}
          style={{
            left: '56%',
            top: '30%',
            width: '13%',
            height: '11%',
          }}
        />

        {/* 4. SEAMLESS SVG FACIAL OVERLAY & 100% INVISIBLE TOUCH HITBOXES */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-auto"
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* --- A. SEAMLESS FACIAL EXPRESSION OVERLAYS (Eyes, Eyebrows, Mouth) --- */}
          <g className="pointer-events-none select-none">
            {/* Left Eye Expression / Blinking */}
            {isLeftEyeClosed ? (
              <g>
                <ellipse cx="42.5" cy="24.5" rx="5.5" ry="5.5" fill="#E2A654" />
                <path d="M 37.5 24.5 Q 42.5 28 47.5 24.5" fill="none" stroke="#4A2610" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            ) : isEyesSquintingJoy ? (
              <g>
                <ellipse cx="42.5" cy="24.5" rx="5.5" ry="5.5" fill="#E2A654" />
                <path d="M 38 25 Q 42.5 21 47 25" fill="none" stroke="#4A2610" strokeWidth="2.0" strokeLinecap="round" />
              </g>
            ) : isGloomyEar ? (
              <path d="M 38 22 Q 42.5 25 47 22.5" fill="#E2A654" stroke="#4A2610" strokeWidth="1.2" opacity="0.65" />
            ) : isEyesSurprised ? (
              <circle cx="43.8" cy="23.2" r="1.5" fill="#FFFFFF" opacity="0.9" />
            ) : null}

            {/* Right Eye Expression / Blinking */}
            {isRightEyeClosed ? (
              <g>
                <ellipse cx="57.5" cy="26.5" rx="5.5" ry="5.5" fill="#E2A654" />
                <path d="M 52.5 26.5 Q 57.5 30 62.5 26.5" fill="none" stroke="#4A2610" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            ) : isEyesSquintingJoy ? (
              <g>
                <ellipse cx="57.5" cy="26.5" rx="5.5" ry="5.5" fill="#E2A654" />
                <path d="M 53 27 Q 57.5 23 62 27" fill="none" stroke="#4A2610" strokeWidth="2.0" strokeLinecap="round" />
              </g>
            ) : isGloomyEar ? (
              <path d="M 53 24 Q 57.5 27 62 24.5" fill="#E2A654" stroke="#4A2610" strokeWidth="1.2" opacity="0.65" />
            ) : isEyesSurprised ? (
              <circle cx="58.8" cy="25.2" r="1.5" fill="#FFFFFF" opacity="0.9" />
            ) : null}

            {/* Left Eyebrow (Confused, Surprised, Gloomy, Happy) */}
            <path
              d={
                isEyebrowsConfused
                  ? 'M 38 18 Q 42.5 20.5 47 17.5'
                  : isEyesSurprised
                  ? 'M 38 14.5 Q 42.5 12.5 47 15'
                  : isGloomyEar
                  ? 'M 38 19.5 Q 42.5 18 47 20.5'
                  : isEyesSquintingJoy
                  ? 'M 38 17 Q 42.5 15 47 17.5'
                  : 'M 38 18 Q 42.5 16.5 47 18.5'
              }
              fill="none"
              stroke="#5A2E14"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Right Eyebrow (Confused, Surprised, Gloomy, Happy) */}
            <path
              d={
                isEyebrowsConfused
                  ? 'M 53 17.5 Q 57.5 20.5 62 18'
                  : isEyesSurprised
                  ? 'M 53 15 Q 57.5 12.5 62 14.5'
                  : isGloomyEar
                  ? 'M 53 20.5 Q 57.5 18 62 19.5'
                  : isEyesSquintingJoy
                  ? 'M 53 17.5 Q 57.5 15.5 62 18'
                  : 'M 53 18.5 Q 57.5 16.5 62 18'
              }
              fill="none"
              stroke="#5A2E14"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Mouth Expression (Shocked "O", Gloomy Pout, Wide Joy Smile, Speaking Viseme) */}
            {isMouthShockO ? (
              <g className="transition-all duration-200">
                <ellipse cx="49" cy="35" rx="3.8" ry="4.5" fill="#3B180B" stroke="#E2A654" strokeWidth="1.2" />
                <ellipse cx="49" cy="36.8" rx="2.2" ry="1.8" fill="#E86E74" />
              </g>
            ) : isGloomyEar ? (
              <path d="M 45.5 35.5 Q 49 33.5 52.5 35.5" fill="none" stroke="#4E2310" strokeWidth="1.8" strokeLinecap="round" />
            ) : isSpeaking ? (
              <ellipse
                cx="49"
                cy="34.8"
                rx="3.2"
                ry={mouthShape === 'wide-open' ? 3.5 : mouthShape === 'slightly-open' ? 2.2 : 1.0}
                fill="#4E2310"
                opacity="0.85"
              />
            ) : isEyesSquintingJoy || animationState === 'leftHandWave' || animationState === 'rightHandWave' ? (
              <path d="M 44 33.5 Q 49 38.5 54 34" fill="none" stroke="#4E2310" strokeWidth="2.2" strokeLinecap="round" />
            ) : null}
          </g>

          {/* --- B. 100% INVISIBLE TOUCH HITBOXES --- */}
          <ellipse
            cx="49"
            cy="21"
            rx="14"
            ry="13"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch Hunny Bear's head"
            onClick={(e) => handleRegionClick(e, 'head', '✨')}
            onKeyDown={(e) => handleKeyDown(e, 'head', '✨')}
          />

          {/* Left Ear */}
          <ellipse
            cx="36"
            cy="13"
            rx="8.5"
            ry="8.5"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch left ear"
            onClick={(e) => handleRegionClick(e, 'left-ear', '👂')}
            onKeyDown={(e) => handleKeyDown(e, 'left-ear', '👂')}
          />

          {/* Right Ear */}
          <ellipse
            cx="66"
            cy="20"
            rx="8.5"
            ry="9"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch right ear"
            onClick={(e) => handleRegionClick(e, 'right-ear', '👂')}
            onKeyDown={(e) => handleKeyDown(e, 'right-ear', '👂')}
          />

          {/* Left Eye */}
          <ellipse
            cx="42.5"
            cy="24.5"
            rx="5.5"
            ry="6"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch left eye"
            onClick={(e) => handleRegionClick(e, 'left-eye', '👀')}
            onKeyDown={(e) => handleKeyDown(e, 'left-eye', '👀')}
          />

          {/* Right Eye */}
          <ellipse
            cx="57.5"
            cy="27.5"
            rx="5.5"
            ry="6"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch right eye"
            onClick={(e) => handleRegionClick(e, 'right-eye', '👀')}
            onKeyDown={(e) => handleKeyDown(e, 'right-eye', '👀')}
          />

          {/* Nose */}
          <ellipse
            cx="48.5"
            cy="30.5"
            rx="5.5"
            ry="4.5"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch nose"
            onClick={(e) => handleRegionClick(e, 'nose', '👃')}
            onKeyDown={(e) => handleKeyDown(e, 'nose', '👃')}
          />

          {/* Mouth */}
          <ellipse
            cx="47.5"
            cy="35"
            rx="7"
            ry="4.5"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch mouth"
            onClick={(e) => handleRegionClick(e, 'mouth', '😮')}
            onKeyDown={(e) => handleKeyDown(e, 'mouth', '😮')}
          />

          {/* Left Cheek */}
          <ellipse
            cx="36.5"
            cy="29"
            rx="6.5"
            ry="6"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch left cheek"
            onClick={(e) => handleRegionClick(e, 'left-cheek', '🌸')}
            onKeyDown={(e) => handleKeyDown(e, 'left-cheek', '🌸')}
          />

          {/* Right Cheek */}
          <ellipse
            cx="61"
            cy="33.5"
            rx="6.5"
            ry="6"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch right cheek"
            onClick={(e) => handleRegionClick(e, 'right-cheek', '🌸')}
            onKeyDown={(e) => handleKeyDown(e, 'right-cheek', '🌸')}
          />

          {/* Left Hand / Paw */}
          <ellipse
            cx="37.5"
            cy="46"
            rx="9"
            ry="9"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch left paw"
            onClick={(e) => handleRegionClick(e, 'left-hand', '👋')}
            onKeyDown={(e) => handleKeyDown(e, 'left-hand', '👋')}
          />

          {/* Right Hand / Paw */}
          <ellipse
            cx="52.5"
            cy="46.5"
            rx="9"
            ry="9"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch right paw"
            onClick={(e) => handleRegionClick(e, 'right-hand', '👋')}
            onKeyDown={(e) => handleKeyDown(e, 'right-hand', '👋')}
          />

          {/* Stomach / Tummy */}
          <ellipse
            cx="48"
            cy="60"
            rx="14"
            ry="14.5"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch stomach"
            onClick={(e) => handleRegionClick(e, 'stomach', '💖')}
            onKeyDown={(e) => handleKeyDown(e, 'stomach', '💖')}
          />

          {/* Left Foot */}
          <ellipse
            cx="39"
            cy="78"
            rx="9.5"
            ry="7.5"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch left foot"
            onClick={(e) => handleRegionClick(e, 'left-foot', '🐾')}
            onKeyDown={(e) => handleKeyDown(e, 'left-foot', '🐾')}
          />

          {/* Right Foot */}
          <ellipse
            cx="57"
            cy="78"
            rx="9.5"
            ry="7.5"
            fill="transparent"
            stroke="none"
            className="cursor-pointer outline-hidden"
            tabIndex={0}
            role="button"
            aria-label="Gently touch right foot"
            onClick={(e) => handleRegionClick(e, 'right-foot', '🐾')}
            onKeyDown={(e) => handleKeyDown(e, 'right-foot', '🐾')}
          />
        </svg>
      </div>

      {/* 5. FLOATING PARTICLES (Delightful hearts, stars, sparkles that bloom from touched spots) */}
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
