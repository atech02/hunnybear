import React, { useState, useEffect } from 'react';
import type { BodyRegion, AnimationState, MouthShape } from '../types/game';

interface AnimatedHunnyBearProps {
  animationState: AnimationState;
  mouthShape: MouthShape;
  isSpeaking: boolean;
  onTapRegion: (region: BodyRegion, eventX?: number, eventY?: number) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

export const AnimatedHunnyBear: React.FC<AnimatedHunnyBearProps> = ({
  animationState,
  mouthShape,
  isSpeaking,
  onTapRegion,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Periodic natural idle blinking
  useEffect(() => {
    const interval = setInterval(() => {
      if (animationState === 'idle') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }
    }, 3600);
    return () => clearInterval(interval);
  }, [animationState]);

  // Floating reaction particles (hearts, stars, notes, giggles, dust puffs)
  const spawnParticle = (x: number, y: number, symbol: string) => {
    const id = Date.now() + Math.random();
    setParticles((prev) => [...prev.slice(-6), { id, x, y, symbol }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  const handleRegionClick = (
    e: React.MouseEvent | React.TouchEvent,
    region: BodyRegion,
    defaultX: number,
    defaultY: number,
    particle: string
  ) => {
    e.stopPropagation();
    spawnParticle(defaultX, defaultY, particle);
    onTapRegion(region, defaultX, defaultY);
  };

  const handleKeyDown = (e: React.KeyboardEvent, region: BodyRegion, defaultX: number, defaultY: number, particle: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      spawnParticle(defaultX, defaultY, particle);
      onTapRegion(region, defaultX, defaultY);
    }
  };

  // State checks for animations
  const isEyeHurt = animationState === 'eye-hurt';
  const isNoseWiggle = animationState === 'nose-wiggle';
  const isEarSensitive = animationState === 'ear-sensitive';
  const isMouthSurprise = animationState === 'mouth-surprise';
  const isCheekGentle = animationState === 'cheek-gentle';
  const isTummyLaugh = animationState === 'tummy-laugh';
  const isWaveLeft = animationState === 'wave-left';
  const isWaveRight = animationState === 'wave-right';
  const isTapLeft = animationState === 'foot-tap-left';
  const isTapRight = animationState === 'foot-tap-right';
  const isCalmBreath = animationState === 'calm-breath';

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[420px] mx-auto aspect-square select-none touch-manipulation">
      
      {/* Floating Particle Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${(p.x / 360) * 100}%`, top: `${(p.y / 380) * 100}%` }}
            className="absolute text-2xl sm:text-3xl animate-float-particle pointer-events-none transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
          >
            {p.symbol}
          </div>
        ))}
      </div>

      {/* SVG Cartoon Character */}
      <svg
        viewBox="0 0 360 380"
        className="w-full h-full drop-shadow-xl transition-transform duration-300"
        aria-label="Interactive Hunny Bear Character"
        role="img"
      >
        <defs>
          {/* Fur Gradients */}
          <linearGradient id="bearFur" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f6be56" />
            <stop offset="100%" stopColor="#E9B44C" />
          </linearGradient>

          <linearGradient id="bearShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E9B44C" />
            <stop offset="100%" stopColor="#A96B3C" />
          </linearGradient>

          <linearGradient id="creamTummy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#FFF8EA" />
          </linearGradient>

          <linearGradient id="creamMuzzle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="100%" stopColor="#FCEFD8" />
          </linearGradient>

          {/* Glow effect on hover */}
          <filter id="touchGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#E9B44C" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx="180" cy="358" rx="100" ry="14" fill="#000000" opacity="0.10" />

        {/* ================= MAIN CHARACTER BODY GROUP ================= */}
        <g
          className={`transition-all duration-300 ${
            animationState === 'idle'
              ? 'animate-breathe'
              : isTummyLaugh
              ? 'animate-jiggle'
              : isCalmBreath
              ? 'animate-breathe'
              : ''
          }`}
        >

          {/* 1. LEFT FOOT (Interactive Region) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Hunny Bear's left foot"
            className={`cursor-pointer focus:outline-none transition-all duration-200 ${
              isTapLeft ? 'animate-tap-left' : 'hover:scale-105'
            }`}
            onClick={(e) => handleRegionClick(e, 'left-foot', 120, 330, '🐾')}
            onKeyDown={(e) => handleKeyDown(e, 'left-foot', 120, 330, '🐾')}
            onMouseEnter={() => setHoveredRegion('left-foot')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <ellipse cx="120" cy="335" rx="34" ry="24" fill="url(#bearShadow)" />
            {/* Paw Pad Main */}
            <ellipse cx="120" cy="336" rx="20" ry="14" fill="url(#creamMuzzle)" />
            {/* Paw Toes */}
            <circle cx="106" cy="322" r="5" fill="url(#creamMuzzle)" />
            <circle cx="120" cy="318" r="6" fill="url(#creamMuzzle)" />
            <circle cx="134" cy="322" r="5" fill="url(#creamMuzzle)" />
            {/* Motion dust puffs when tapping */}
            {isTapLeft && (
              <g opacity="0.8">
                <circle cx="95" cy="340" r="4" fill="#CDE8F6" />
                <circle cx="85" cy="345" r="3" fill="#CDE8F6" />
                <path d="M 85 348 Q 95 342 105 348" stroke="#A96B3C" strokeWidth="2" fill="none" />
              </g>
            )}
            {hoveredRegion === 'left-foot' && (
              <ellipse cx="120" cy="335" rx="36" ry="26" fill="none" stroke="#E9B44C" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* 2. RIGHT FOOT (Interactive Region) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Hunny Bear's right foot"
            className={`cursor-pointer focus:outline-none transition-all duration-200 ${
              isTapRight ? 'animate-tap-right' : 'hover:scale-105'
            }`}
            onClick={(e) => handleRegionClick(e, 'right-foot', 240, 330, '🐾')}
            onKeyDown={(e) => handleKeyDown(e, 'right-foot', 240, 330, '🐾')}
            onMouseEnter={() => setHoveredRegion('right-foot')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <ellipse cx="240" cy="335" rx="34" ry="24" fill="url(#bearShadow)" />
            {/* Paw Pad Main */}
            <ellipse cx="240" cy="336" rx="20" ry="14" fill="url(#creamMuzzle)" />
            {/* Paw Toes */}
            <circle cx="226" cy="322" r="5" fill="url(#creamMuzzle)" />
            <circle cx="240" cy="318" r="6" fill="url(#creamMuzzle)" />
            <circle cx="254" cy="322" r="5" fill="url(#creamMuzzle)" />
            {isTapRight && (
              <g opacity="0.8">
                <circle cx="265" cy="340" r="4" fill="#CDE8F6" />
                <circle cx="275" cy="345" r="3" fill="#CDE8F6" />
                <path d="M 255 348 Q 265 342 275 348" stroke="#A96B3C" strokeWidth="2" fill="none" />
              </g>
            )}
            {hoveredRegion === 'right-foot' && (
              <ellipse cx="240" cy="335" rx="36" ry="26" fill="none" stroke="#E9B44C" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* 3. MAIN TORSO */}
          <ellipse cx="180" cy="245" rx="78" ry="85" fill="url(#bearFur)" />

          {/* 4. TUMMY (Interactive Region - Ticklish) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Hunny Bear's tummy - tickle gently"
            className={`cursor-pointer focus:outline-none transition-transform ${
              isTummyLaugh ? 'animate-jiggle' : 'hover:scale-102'
            }`}
            onClick={(e) => handleRegionClick(e, 'tummy', 180, 245, '😂')}
            onKeyDown={(e) => handleKeyDown(e, 'tummy', 180, 245, '😂')}
            onMouseEnter={() => setHoveredRegion('tummy')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <ellipse
              cx="180"
              cy="252"
              rx="55"
              ry="60"
              fill="url(#creamTummy)"
              stroke="#E9B44C"
              strokeWidth="2.5"
            />

            {/* Honey Pot Badge on Tummy */}
            <g transform="translate(162, 240) scale(0.9)">
              <path
                d="M 6,5 Q 20,2 34,5 L 36,22 Q 20,32 4,22 Z"
                fill="#E9B44C"
                stroke="#A96B3C"
                strokeWidth="1.5"
              />
              <path
                d="M 8,6 Q 14,14 20,7 Q 26,15 32,6"
                fill="#FFF8EA"
                stroke="#E9B44C"
                strokeWidth="1"
              />
              <text x="20" y="19" fontSize="6.5" fontWeight="bold" fill="#593A2A" textAnchor="middle" fontFamily="Fredoka, Nunito, sans-serif">
                HUNNY
              </text>
            </g>

            {hoveredRegion === 'tummy' && (
              <ellipse cx="180" cy="252" rx="58" ry="63" fill="none" stroke="#A96B3C" strokeWidth="3" strokeDasharray="5 3" />
            )}
          </g>

          {/* 5. LEFT HAND / PAW (Interactive Region - Friendly Wave) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Hunny Bear's left hand - give a high paw"
            className={`cursor-pointer focus:outline-none transition-transform ${
              isWaveLeft ? 'animate-wave-left' : isTummyLaugh ? 'scale-95 translate-x-2 -translate-y-2' : 'hover:scale-105'
            }`}
            onClick={(e) => handleRegionClick(e, 'left-hand', 85, 230, '👋')}
            onKeyDown={(e) => handleKeyDown(e, 'left-hand', 85, 230, '👋')}
            onMouseEnter={() => setHoveredRegion('left-hand')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M 125,205 C 95,208 70,230 82,255 C 92,275 115,258 135,235 Z"
              fill="url(#bearFur)"
            />
            <circle cx="86" cy="246" r="20" fill="url(#bearFur)" />
            <circle cx="86" cy="246" r="12" fill="url(#creamMuzzle)" />
            {hoveredRegion === 'left-hand' && (
              <circle cx="86" cy="246" r="23" fill="none" stroke="#E9B44C" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* 6. RIGHT HAND / PAW (Interactive Region - Friendly Wave) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Hunny Bear's right hand - give a high paw"
            className={`cursor-pointer focus:outline-none transition-transform ${
              isWaveRight ? 'animate-wave-right' : isTummyLaugh ? 'scale-95 -translate-x-2 -translate-y-2' : 'hover:scale-105'
            }`}
            onClick={(e) => handleRegionClick(e, 'right-hand', 275, 230, '💖')}
            onKeyDown={(e) => handleKeyDown(e, 'right-hand', 275, 230, '💖')}
            onMouseEnter={() => setHoveredRegion('right-hand')}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <path
              d="M 235,205 C 265,208 290,230 278,255 C 268,275 245,258 225,235 Z"
              fill="url(#bearFur)"
            />
            <circle cx="274" cy="246" r="20" fill="url(#bearFur)" />
            <circle cx="274" cy="246" r="12" fill="url(#creamMuzzle)" />
            {hoveredRegion === 'right-hand' && (
              <circle cx="274" cy="246" r="23" fill="none" stroke="#E9B44C" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* ================= HEAD & FACE GROUP ================= */}
          <g
            className={`transition-all duration-300 origin-bottom ${
              isCheekGentle
                ? 'rotate-3 translate-x-1'
                : isEyeHurt
                ? '-rotate-4 -translate-y-2'
                : isEarSensitive
                ? 'rotate-6 translate-x-2'
                : isMouthSurprise
                ? '-translate-y-2'
                : ''
            }`}
          >

            {/* LEFT EAR (Interactive Region) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's left ear - touch gently"
              className={`cursor-pointer focus:outline-none transition-transform ${
                isEarSensitive ? '-rotate-15' : 'hover:scale-105'
              }`}
              onClick={(e) => handleRegionClick(e, 'left-ear', 106, 85, '👂')}
              onKeyDown={(e) => handleKeyDown(e, 'left-ear', 106, 85, '👂')}
              onMouseEnter={() => setHoveredRegion('left-ear')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <circle cx="106" cy="85" r="34" fill="url(#bearShadow)" className={animationState === 'idle' ? 'animate-ear-twitch' : ''} />
              <circle cx="106" cy="85" r="20" fill="url(#creamMuzzle)" />
              {hoveredRegion === 'left-ear' && (
                <circle cx="106" cy="85" r="36" fill="none" stroke="#E9B44C" strokeWidth="3" strokeDasharray="4 2" />
              )}
            </g>

            {/* RIGHT EAR (Interactive Region) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's right ear - touch gently"
              className={`cursor-pointer focus:outline-none transition-transform ${
                isEarSensitive ? 'rotate-15' : 'hover:scale-105'
              }`}
              onClick={(e) => handleRegionClick(e, 'right-ear', 254, 85, '👂')}
              onKeyDown={(e) => handleKeyDown(e, 'right-ear', 254, 85, '👂')}
              onMouseEnter={() => setHoveredRegion('right-ear')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <circle cx="254" cy="85" r="34" fill="url(#bearShadow)" />
              <circle cx="254" cy="85" r="20" fill="url(#creamMuzzle)" />
              {hoveredRegion === 'right-ear' && (
                <circle cx="254" cy="85" r="36" fill="none" stroke="#E9B44C" strokeWidth="3" strokeDasharray="4 2" />
              )}
            </g>

            {/* Head Base */}
            <circle cx="180" cy="135" r="75" fill="url(#bearFur)" />

            {/* Top Fur Tuft */}
            <path d="M 174,60 Q 180,48 186,60 Q 180,54 174,60 Z" fill="#E9B44C" />

            {/* Muzzle */}
            <ellipse cx="180" cy="155" rx="38" ry="28" fill="url(#creamMuzzle)" />

            {/* LEFT CHEEK (Interactive Region) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's left cheek - gentle touch"
              className="cursor-pointer focus:outline-none"
              onClick={(e) => handleRegionClick(e, 'left-cheek', 134, 150, '💖')}
              onKeyDown={(e) => handleKeyDown(e, 'left-cheek', 134, 150, '💖')}
              onMouseEnter={() => setHoveredRegion('left-cheek')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <circle
                cx="134"
                cy="148"
                r="14"
                fill="#F4C7B5"
                opacity={isCheekGentle ? '0.95' : '0.55'}
                className="transition-all duration-300"
              />
              {hoveredRegion === 'left-cheek' && (
                <circle cx="134" cy="148" r="16" fill="none" stroke="#E9B44C" strokeWidth="2" strokeDasharray="3 2" />
              )}
            </g>

            {/* RIGHT CHEEK (Interactive Region) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's right cheek - gentle touch"
              className="cursor-pointer focus:outline-none"
              onClick={(e) => handleRegionClick(e, 'right-cheek', 226, 150, '💖')}
              onKeyDown={(e) => handleKeyDown(e, 'right-cheek', 226, 150, '💖')}
              onMouseEnter={() => setHoveredRegion('right-cheek')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <circle
                cx="226"
                cy="148"
                r="14"
                fill="#F4C7B5"
                opacity={isCheekGentle ? '0.95' : '0.55'}
                className="transition-all duration-300"
              />
              {hoveredRegion === 'right-cheek' && (
                <circle cx="226" cy="148" r="16" fill="none" stroke="#E9B44C" strokeWidth="2" strokeDasharray="3 2" />
              )}
            </g>

            {/* EYEBROWS */}
            {isEyeHurt ? (
              // Sad / Hurt eyebrows angled up inwards
              <g stroke="#593A2A" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 144,110 Q 155,102 165,107" />
                <path d="M 195,107 Q 205,102 216,110" />
              </g>
            ) : isMouthSurprise ? (
              // Surprised arched eyebrows
              <g stroke="#593A2A" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 143,98 Q 155,88 167,98" />
                <path d="M 193,98 Q 205,88 217,98" />
              </g>
            ) : isEarSensitive ? (
              // Curious / mildly concerned eyebrows
              <g stroke="#593A2A" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 145,104 Q 155,98 165,104" />
                <path d="M 195,106 Q 205,104 215,102" />
              </g>
            ) : (
              // Gentle, friendly calm eyebrows
              <g stroke="#593A2A" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 146,108 Q 155,102 164,107" />
                <path d="M 196,107 Q 205,102 214,108" />
              </g>
            )}

            {/* LEFT EYE (Interactive Region) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's left eye - delicate, be gentle"
              className="cursor-pointer focus:outline-none"
              onClick={(e) => handleRegionClick(e, 'left-eye', 155, 122, '💧')}
              onKeyDown={(e) => handleKeyDown(e, 'left-eye', 155, 122, '💧')}
              onMouseEnter={() => setHoveredRegion('left-eye')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {isTummyLaugh ? (
                // Happy laugh crescent
                <path d="M 144,124 Q 155,112 166,124" stroke="#593A2A" strokeWidth="4" strokeLinecap="round" fill="none" />
              ) : isBlinking || isEyeHurt ? (
                // Closed/Hurt closed eye
                <g stroke="#593A2A" strokeWidth="3.5" strokeLinecap="round">
                  <line x1="145" y1="124" x2="165" y2="124" />
                  {isEyeHurt && <circle cx="148" cy="132" r="3" fill="#CDE8F6" />}
                </g>
              ) : isMouthSurprise ? (
                // Wide surprised eye
                <g>
                  <circle cx="155" cy="120" r="14" fill="#593A2A" />
                  <circle cx="158" cy="116" r="5" fill="#ffffff" />
                  <circle cx="153" cy="122" r="2" fill="#ffffff" />
                </g>
              ) : (
                // Friendly standard eye
                <g>
                  <circle cx="155" cy="122" r="11" fill="#593A2A" />
                  <circle cx="157" cy="119" r="4" fill="#ffffff" />
                  <circle cx="153" cy="124" r="1.5" fill="#ffffff" />
                </g>
              )}
              {hoveredRegion === 'left-eye' && (
                <circle cx="155" cy="122" r="18" fill="none" stroke="#E9B44C" strokeWidth="2" strokeDasharray="3 2" />
              )}
            </g>

            {/* RIGHT EYE (Interactive Region) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's right eye - delicate, be gentle"
              className="cursor-pointer focus:outline-none"
              onClick={(e) => handleRegionClick(e, 'right-eye', 205, 122, '💧')}
              onKeyDown={(e) => handleKeyDown(e, 'right-eye', 205, 122, '💧')}
              onMouseEnter={() => setHoveredRegion('right-eye')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {isTummyLaugh ? (
                <path d="M 194,124 Q 205,112 216,124" stroke="#593A2A" strokeWidth="4" strokeLinecap="round" fill="none" />
              ) : isBlinking || isEyeHurt ? (
                <g stroke="#593A2A" strokeWidth="3.5" strokeLinecap="round">
                  <line x1="195" y1="124" x2="215" y2="124" />
                  {isEyeHurt && <circle cx="212" cy="132" r="3" fill="#CDE8F6" />}
                </g>
              ) : isMouthSurprise ? (
                <g>
                  <circle cx="205" cy="120" r="14" fill="#593A2A" />
                  <circle cx="208" cy="116" r="5" fill="#ffffff" />
                  <circle cx="203" cy="122" r="2" fill="#ffffff" />
                </g>
              ) : (
                <g>
                  <circle cx="205" cy="122" r="11" fill="#593A2A" />
                  <circle cx="207" cy="119" r="4" fill="#ffffff" />
                  <circle cx="203" cy="124" r="1.5" fill="#ffffff" />
                </g>
              )}
              {hoveredRegion === 'right-eye' && (
                <circle cx="205" cy="122" r="18" fill="none" stroke="#E9B44C" strokeWidth="2" strokeDasharray="3 2" />
              )}
            </g>

            {/* NOSE (Interactive Region) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's nose - tap to boop"
              className={`cursor-pointer focus:outline-none transition-transform ${
                isNoseWiggle ? 'animate-bounce' : 'hover:scale-110'
              }`}
              onClick={(e) => handleRegionClick(e, 'nose', 180, 146, '👃')}
              onKeyDown={(e) => handleKeyDown(e, 'nose', 180, 146, '👃')}
              onMouseEnter={() => setHoveredRegion('nose')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <ellipse cx="180" cy="146" rx="14" ry="10" fill="#593A2A" />
              {/* Highlight */}
              <ellipse cx="178" cy="144" rx="4" ry="2.2" fill="#ffffff" opacity="0.65" />
              {hoveredRegion === 'nose' && (
                <ellipse cx="180" cy="146" rx="17" ry="13" fill="none" stroke="#E9B44C" strokeWidth="2" strokeDasharray="3 2" />
              )}
            </g>

            {/* MOUTH & LIPS (Interactive Region with Lip-Sync animation) */}
            <g
              tabIndex={0}
              role="button"
              aria-label="Hunny Bear's mouth - personal space"
              className="cursor-pointer focus:outline-none"
              onClick={(e) => handleRegionClick(e, 'mouth', 180, 166, '👄')}
              onKeyDown={(e) => handleKeyDown(e, 'mouth', 180, 166, '👄')}
              onMouseEnter={() => setHoveredRegion('mouth')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {/* Philtrum line */}
              <line x1="180" y1="156" x2="180" y2="162" stroke="#593A2A" strokeWidth="2" strokeLinecap="round" />

              {/* Dynamic Mouth Shape */}
              {isEyeHurt || mouthShape === 'frown' ? (
                // Sad small frown
                <path d="M 172,168 Q 180,161 188,168" stroke="#593A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : isMouthSurprise || mouthShape === 'surprise-o' ? (
                // Surprised 'O' shape
                <ellipse cx="180" cy="166" rx="8" ry="10" fill="#593A2A" stroke="#593A2A" strokeWidth="2" />
              ) : isTummyLaugh || mouthShape === 'wide-open' ? (
                // Joyful wide laugh with pink tongue
                <g>
                  <path d="M 166,162 Q 180,184 194,162 Z" fill="#593A2A" stroke="#593A2A" strokeWidth="2" />
                  <path d="M 172,174 Q 180,168 188,174 Q 180,184 172,174 Z" fill="#F4C7B5" />
                </g>
              ) : isSpeaking && mouthShape === 'slightly-open' ? (
                // Animated speech mouth (slightly open)
                <ellipse cx="180" cy="165" rx="7" ry="5" fill="#593A2A" stroke="#593A2A" strokeWidth="1.5" />
              ) : (
                // Friendly warm teddy smile
                <path d="M 168,162 Q 180,174 192,162" stroke="#593A2A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
              )}

              {hoveredRegion === 'mouth' && (
                <circle cx="180" cy="165" r="16" fill="none" stroke="#E9B44C" strokeWidth="2" strokeDasharray="3 2" />
              )}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
