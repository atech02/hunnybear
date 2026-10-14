import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/audio';

export type BearReaction = 
  | 'idle'
  | 'tickle'
  | 'surprise'
  | 'wave-left'
  | 'wave-right'
  | 'tap-left'
  | 'tap-right'
  | 'honey-treat';

interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

interface HunnyBearCharacterProps {
  onInteraction: (zone: string, message: string) => void;
  externalReaction?: BearReaction;
}

export const HunnyBearCharacter: React.FC<HunnyBearCharacterProps> = ({
  onInteraction,
  externalReaction,
}) => {
  const [currentReaction, setCurrentReaction] = useState<BearReaction>('idle');
  const [isBlinking, setIsBlinking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Sync external reaction triggers
  useEffect(() => {
    if (externalReaction && externalReaction !== 'idle') {
      triggerReaction(externalReaction, 0, 0, false);
    }
  }, [externalReaction]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (currentReaction === 'idle') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, [currentReaction]);

  // Add floating reaction particle
  const spawnParticle = (x: number, y: number, symbol: string) => {
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      symbol,
    };
    setParticles((prev) => [...prev.slice(-6), newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1200);
  };

  const triggerReaction = (
    reaction: BearReaction,
    eventX: number,
    eventY: number,
    playSound = true
  ) => {
    setCurrentReaction(reaction);

    let message = '';
    let particleSymbol = '✨';

    switch (reaction) {
      case 'tickle':
        if (playSound) soundEngine.playTickle();
        message = 'Tee-hee! That tickles my tummy so much! 🍯';
        particleSymbol = '😂';
        break;
      case 'surprise':
        if (playSound) soundEngine.playSurprise();
        message = 'Boop! You poked my nose! Peek-a-boo! 👀';
        particleSymbol = '⭐';
        break;
      case 'wave-left':
        if (playSound) soundEngine.playWave();
        message = 'High-five left paw! Hello best friend! 🐾';
        particleSymbol = '👋';
        break;
      case 'wave-right':
        if (playSound) soundEngine.playWave();
        message = 'Warm bear wave! Giving you big cuddles! 💛';
        particleSymbol = '💖';
        break;
      case 'tap-left':
        if (playSound) soundEngine.playFootTap();
        message = 'Tap, tap, tap! My left paw loves to dance! 🎵';
        particleSymbol = '🎶';
        break;
      case 'tap-right':
        if (playSound) soundEngine.playFootTap();
        message = 'Tippy-tap right foot! Ready for an adventure! 🐾';
        particleSymbol = '✨';
        break;
      case 'honey-treat':
        if (playSound) soundEngine.playHoneyCelebration();
        message = 'Mmm, delicious sweet honey! You are the best! 🍯✨';
        particleSymbol = '🍯';
        break;
      default:
        break;
    }

    if (eventX && eventY) {
      spawnParticle(eventX, eventY, particleSymbol);
    } else {
      spawnParticle(180 + (Math.random() * 40 - 20), 160, particleSymbol);
    }

    onInteraction(reaction, message);

    // Reset back to idle after animation finishes
    const duration = reaction === 'tickle' ? 1400 : 900;
    setTimeout(() => {
      setCurrentReaction('idle');
    }, duration);
  };

  // Keyboard accessibility handler
  const handleKeyDown = (e: React.KeyboardEvent, reaction: BearReaction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerReaction(reaction, 180, 200);
    }
  };

  const isTickling = currentReaction === 'tickle';
  const isSurprised = currentReaction === 'surprise';
  const isWavingLeft = currentReaction === 'wave-left';
  const isWavingRight = currentReaction === 'wave-right';
  const isTappingLeft = currentReaction === 'tap-left';
  const isTappingRight = currentReaction === 'tap-right';

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md mx-auto aspect-square select-none touch-manipulation">
      {/* Floating Particles overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${(p.x / 360) * 100}%`, top: `${(p.y / 360) * 100}%` }}
            className="absolute text-2xl sm:text-3xl animate-float-particle pointer-events-none transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
          >
            {p.symbol}
          </div>
        ))}
      </div>

      {/* SVG Character */}
      <svg
        viewBox="0 0 360 380"
        className="w-full h-full drop-shadow-2xl transition-transform duration-300"
        aria-label="Hunny Bear character"
        role="img"
      >
        <defs>
          {/* Fur Gradient */}
          <linearGradient id="bearFur" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Fur Dark Shadow */}
          <linearGradient id="bearShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Tummy Lighter Gradient */}
          <linearGradient id="tummyLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>

          {/* Inner Ear / Muzzle */}
          <linearGradient id="peachSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          {/* Glow filter for interactive highlight */}
          <filter id="honeyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx="180" cy="358" rx="100" ry="14" fill="#000000" opacity="0.12" />

        {/* ================= CHARACTER BODY GROUP ================= */}
        <g className={currentReaction === 'idle' ? 'animate-breathe' : ''}>
          
          {/* 1. LEFT FOOT (Interactive Region) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Tap Hunny Bear's left foot"
            className={`cursor-pointer focus:outline-none transition-all duration-200 ${
              isTappingLeft ? 'animate-tap-left' : 'hover:scale-105'
            }`}
            onClick={() => {
              triggerReaction('tap-left', 120, 330);
            }}
            onKeyDown={(e) => handleKeyDown(e, 'tap-left')}
            onMouseEnter={() => setHoveredZone('left-foot')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <ellipse cx="120" cy="335" rx="34" ry="24" fill="url(#bearShadow)" />
            {/* Paw Pad Main */}
            <ellipse cx="120" cy="336" rx="20" ry="14" fill="url(#peachSkin)" />
            {/* Paw Toes */}
            <circle cx="106" cy="322" r="5" fill="url(#peachSkin)" />
            <circle cx="120" cy="318" r="6" fill="url(#peachSkin)" />
            <circle cx="134" cy="322" r="5" fill="url(#peachSkin)" />
            {hoveredZone === 'left-foot' && (
              <ellipse cx="120" cy="335" rx="36" ry="26" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* 2. RIGHT FOOT (Interactive Region) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Tap Hunny Bear's right foot"
            className={`cursor-pointer focus:outline-none transition-all duration-200 ${
              isTappingRight ? 'animate-tap-right' : 'hover:scale-105'
            }`}
            onClick={() => triggerReaction('tap-right', 240, 330)}
            onKeyDown={(e) => handleKeyDown(e, 'tap-right')}
            onMouseEnter={() => setHoveredZone('right-foot')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <ellipse cx="240" cy="335" rx="34" ry="24" fill="url(#bearShadow)" />
            {/* Paw Pad Main */}
            <ellipse cx="240" cy="336" rx="20" ry="14" fill="url(#peachSkin)" />
            {/* Paw Toes */}
            <circle cx="226" cy="322" r="5" fill="url(#peachSkin)" />
            <circle cx="240" cy="318" r="6" fill="url(#peachSkin)" />
            <circle cx="254" cy="322" r="5" fill="url(#peachSkin)" />
            {hoveredZone === 'right-foot' && (
              <ellipse cx="240" cy="335" rx="36" ry="26" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* 3. MAIN TORSO */}
          <ellipse cx="180" cy="245" rx="78" ry="85" fill="url(#bearFur)" />

          {/* 4. TUMMY (Interactive Region - Ticklish) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Tickle Hunny Bear's tummy"
            className={`cursor-pointer focus:outline-none transition-transform ${
              isTickling ? 'animate-jiggle' : 'hover:scale-102'
            }`}
            onClick={() => triggerReaction('tickle', 180, 245)}
            onKeyDown={(e) => handleKeyDown(e, 'tickle')}
            onMouseEnter={() => setHoveredZone('tummy')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <ellipse
              cx="180"
              cy="252"
              rx="55"
              ry="60"
              fill="url(#tummyLight)"
              stroke="#fbbf24"
              strokeWidth="2"
              className={hoveredZone === 'tummy' ? 'filter drop-shadow-md' : ''}
            />

            {/* Honey Pot Badge on Tummy */}
            <g transform="translate(162, 240) scale(0.9)">
              <path
                d="M 6,5 Q 20,2 34,5 L 36,22 Q 20,32 4,22 Z"
                fill="#d97706"
                stroke="#b45309"
                strokeWidth="1.5"
              />
              {/* Dripping honey on pot */}
              <path
                d="M 8,6 Q 14,14 20,7 Q 26,15 32,6"
                fill="#fbbf24"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              {/* 'HUNNY' text on pot */}
              <text x="20" y="19" fontSize="6.5" fontWeight="bold" fill="#78350f" textAnchor="middle">
                HUNNY
              </text>
            </g>

            {hoveredZone === 'tummy' && (
              <ellipse cx="180" cy="252" rx="58" ry="63" fill="none" stroke="#d97706" strokeWidth="3" strokeDasharray="5 3" />
            )}
          </g>

          {/* 5. LEFT HAND / PAW (Interactive Region - Friendly Wave) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Wave with Hunny Bear's left hand"
            className={`cursor-pointer focus:outline-none transition-transform ${
              isWavingLeft ? 'animate-wave-left' : 'hover:scale-105'
            }`}
            onClick={() => triggerReaction('wave-left', 85, 230)}
            onKeyDown={(e) => handleKeyDown(e, 'wave-left')}
            onMouseEnter={() => setHoveredZone('left-hand')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            {/* Arm */}
            <path
              d="M 125,205 C 95,208 70,230 82,255 C 92,275 115,258 135,235 Z"
              fill="url(#bearFur)"
            />
            {/* Paw circle */}
            <circle cx="86" cy="246" r="20" fill="url(#bearFur)" />
            <circle cx="86" cy="246" r="12" fill="url(#peachSkin)" />
            {hoveredZone === 'left-hand' && (
              <circle cx="86" cy="246" r="23" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* 6. RIGHT HAND / PAW (Interactive Region - Friendly Wave) */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Wave with Hunny Bear's right hand"
            className={`cursor-pointer focus:outline-none transition-transform ${
              isWavingRight ? 'animate-wave-right' : 'hover:scale-105'
            }`}
            onClick={() => triggerReaction('wave-right', 275, 230)}
            onKeyDown={(e) => handleKeyDown(e, 'wave-right')}
            onMouseEnter={() => setHoveredZone('right-hand')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            {/* Arm */}
            <path
              d="M 235,205 C 265,208 290,230 278,255 C 268,275 245,258 225,235 Z"
              fill="url(#bearFur)"
            />
            {/* Paw circle */}
            <circle cx="274" cy="246" r="20" fill="url(#bearFur)" />
            <circle cx="274" cy="246" r="12" fill="url(#peachSkin)" />
            {hoveredZone === 'right-hand' && (
              <circle cx="274" cy="246" r="23" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />
            )}
          </g>

          {/* ================= HEAD & FACE GROUP (Interactive Region) ================= */}
          <g
            tabIndex={0}
            role="button"
            aria-label="Touch Hunny Bear's face or boop nose"
            className={`cursor-pointer focus:outline-none transition-transform ${
              isSurprised ? 'animate-head-turn' : 'hover:scale-102'
            }`}
            onClick={() => triggerReaction('surprise', 180, 110)}
            onKeyDown={(e) => handleKeyDown(e, 'surprise')}
            onMouseEnter={() => setHoveredZone('face')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            {/* Outer Left Ear */}
            <circle cx="106" cy="85" r="34" fill="url(#bearShadow)" className="animate-ear-twitch" />
            {/* Inner Left Ear */}
            <circle cx="106" cy="85" r="20" fill="url(#peachSkin)" />

            {/* Outer Right Ear */}
            <circle cx="254" cy="85" r="34" fill="url(#bearShadow)" />
            {/* Inner Right Ear */}
            <circle cx="254" cy="85" r="20" fill="url(#peachSkin)" />

            {/* Head Circle */}
            <circle cx="180" cy="135" r="75" fill="url(#bearFur)" />

            {/* Cute Little Tuft of Fur on Top */}
            <path
              d="M 174,60 Q 180,50 186,60 Q 180,55 174,60 Z"
              fill="#d97706"
            />

            {/* Muzzle */}
            <ellipse cx="180" cy="155" rx="38" ry="28" fill="url(#peachSkin)" />

            {/* Rosy Blush Cheeks */}
            <circle
              cx="134"
              cy="148"
              r="12"
              fill="#fb7185"
              opacity={isTickling ? '0.85' : '0.5'}
              className="transition-opacity duration-300"
            />
            <circle
              cx="226"
              cy="148"
              r="12"
              fill="#fb7185"
              opacity={isTickling ? '0.85' : '0.5'}
              className="transition-opacity duration-300"
            />

            {/* EYES */}
            {isTickling ? (
              // Happy squinting eyes (^ ^)
              <g stroke="#451a03" strokeWidth="4" strokeLinecap="round" fill="none">
                <path d="M 144,124 Q 155,112 166,124" />
                <path d="M 194,124 Q 205,112 216,124" />
              </g>
            ) : isBlinking ? (
              // Blinking closed eyes
              <g stroke="#451a03" strokeWidth="3.5" strokeLinecap="round">
                <line x1="145" y1="124" x2="165" y2="124" />
                <line x1="195" y1="124" x2="215" y2="124" />
              </g>
            ) : isSurprised ? (
              // Surprised wide eyes (O O)
              <g>
                <circle cx="155" cy="120" r="14" fill="#451a03" />
                <circle cx="158" cy="116" r="5" fill="#ffffff" />
                <circle cx="205" cy="120" r="14" fill="#451a03" />
                <circle cx="208" cy="116" r="5" fill="#ffffff" />
                {/* Surprised arched eyebrows */}
                <path d="M 143,100 Q 155,92 167,100" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 193,100 Q 205,92 217,100" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              // Friendly normal idle eyes
              <g>
                {/* Left Eye */}
                <circle cx="155" cy="122" r="10" fill="#451a03" />
                <circle cx="157" cy="119" r="3.5" fill="#ffffff" />
                <circle cx="153" cy="124" r="1.5" fill="#ffffff" />
                {/* Right Eye */}
                <circle cx="205" cy="122" r="10" fill="#451a03" />
                <circle cx="207" cy="119" r="3.5" fill="#ffffff" />
                <circle cx="203" cy="124" r="1.5" fill="#ffffff" />
                {/* Soft gentle eyebrows */}
                <path d="M 146,108 Q 155,103 164,107" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 196,107 Q 205,103 214,108" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* NOSE */}
            <ellipse cx="180" cy="146" rx="14" ry="10" fill="#451a03" />
            {/* Nose highlight */}
            <ellipse cx="178" cy="144" rx="4" ry="2" fill="#ffffff" opacity="0.6" />

            {/* MOUTH */}
            {isTickling ? (
              // Big laughing open mouth with pink tongue
              <g>
                <path
                  d="M 166,156 Q 180,178 194,156 Z"
                  fill="#7f1d1d"
                  stroke="#451a03"
                  strokeWidth="2"
                />
                <path
                  d="M 172,168 Q 180,162 188,168 Q 180,178 172,168 Z"
                  fill="#f43f5e"
                />
              </g>
            ) : isSurprised ? (
              // Surprised cute small 'o' mouth
              <ellipse cx="180" cy="164" rx="7" ry="9" fill="#7f1d1d" stroke="#451a03" strokeWidth="2" />
            ) : (
              // Warm, gentle teddy smile
              <g stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <line x1="180" y1="154" x2="180" y2="160" />
                <path d="M 168,160 Q 180,172 192,160" />
              </g>
            )}

            {hoveredZone === 'face' && (
              <circle cx="180" cy="135" r="78" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5 3" />
            )}
          </g>
        </g>
      </svg>

      {/* Helpful accessibility tag / indicator */}
      <div className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full shadow-xs mt-2 border border-amber-200">
        💡 Tap nose, tummy, paws, or feet!
      </div>
    </div>
  );
};
