import React from 'react';

export interface AppearanceOption {
  id: string;
  name: string;
  color: string;
  style: string;
  price: number;
  description?: string;
}

// Default free appearances available in lobby
export const BASE_APPEARANCES: AppearanceOption[] = [
  { id: 'navy', name: 'Navy', color: '#2563eb', style: 'navy', price: 0 }
];

// Appearances available exclusively in the Shop for coins
export const SHOP_APPEARANCES: AppearanceOption[] = [
  { id: 'cloud', name: 'Cloud', color: '#e2e8f0', style: 'cloud', price: 80, description: 'Fluffy & dreamy cloud' },
  { id: 'lilac', name: 'Lilac', color: '#c48df5', style: 'lilac', price: 80, description: 'Charming pastel blossom' },
  { id: 'bomb', name: 'Bomb', color: '#3c3836', style: 'bomb', price: 90, description: 'Sparks ready to detonate' },
  { id: 'apple', name: 'Apple', color: '#48bb35', style: 'apple', price: 90, description: 'Fresh & crunchy green apple' },
  { id: 'poop', name: 'Poop', color: '#7c441c', style: 'poop', price: 90, description: 'Cheeky & funny swirl' },
  { id: 'strawberry', name: 'Strawberry', color: '#e11d48', style: 'strawberry', price: 100, description: 'Sweet dotted berry' },
  { id: 'fire', name: 'Fire', color: '#ff4500', style: 'fire', price: 130, description: 'Blazing hot flame' },
  { id: 'lemon', name: 'Lemon', color: '#facc15', style: 'lemon', price: 180, description: 'Sour & zesty citrus' },
  { id: 'ghost', name: 'Ghost', color: '#00d2d3', style: 'ghost', price: 200, description: 'Spooky neon phantom' },
  { id: 'heart', name: 'Heart', color: '#f43f5e', style: 'heart', price: 200, description: 'Romantic ruby heart' },
  { id: 'star', name: 'Star', color: '#f59e0b', style: 'star', price: 220, description: 'Shining celestial star' },
  { id: 'cat', name: 'Cat', color: '#4f46e5', style: 'cat', price: 250, description: 'Curious feline with whiskers' },
  { id: 'alien', name: 'Alien', color: '#10b981', style: 'alien', price: 280, description: 'Visitor from deep space' },
  { id: 'donut', name: 'Donut', color: '#ec4899', style: 'donut', price: 300, description: 'Glazed with colorful sprinkles' },
];

export const ALL_APPEARANCES: AppearanceOption[] = [
  ...BASE_APPEARANCES,
  ...SHOP_APPEARANCES
];

// For lobby selection: only base appearances unless unlocked
export const PLAYER_APPEARANCES: AppearanceOption[] = BASE_APPEARANCES;

export interface PlayerColorOption {
  id: string;
  name: string;
  hex: string;
}

// Exactly 8 distinct, high-contrast, non-black player colors
export const PLAYER_COLORS: PlayerColorOption[] = [
  { id: 'blue', name: 'Royal Blue', hex: '#2563eb' },
  { id: 'red', name: 'Crimson Red', hex: '#dc2626' },
  { id: 'green', name: 'Emerald Green', hex: '#16a34a' },
  { id: 'yellow', name: 'Golden Yellow', hex: '#eab308' },
  { id: 'purple', name: 'Electric Purple', hex: '#9333ea' },
  { id: 'cyan', name: 'Turquoise Cyan', hex: '#06b6d4' },
  { id: 'pink', name: 'Hot Pink', hex: '#ec4899' },
  { id: 'orange', name: 'Tangerine Orange', hex: '#ea580c' },
];

export const COLOR_HEXES = PLAYER_COLORS.map(c => c.hex);
export const EXTRA_COLORS = COLOR_HEXES;

// Reusable Googly Eyes component with signature cartoon look
interface GooglyEyesProps {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  r?: number;
  pupilR?: number;
  look?: 'left' | 'center' | 'right';
}

export const GooglyEyes: React.FC<GooglyEyesProps> = ({
  x1 = 38,
  y1 = 58,
  x2 = 62,
  y2 = 58,
  r = 10,
  pupilR = 4.8,
  look = 'left'
}) => {
  const pupilOffsetX = look === 'left' ? -2.2 : look === 'right' ? 2.2 : 0;
  const pupilOffsetY = 0.5;

  return (
    <g className="googly-eyes">
      {/* Left Sclera */}
      <circle cx={x1} cy={y1} r={r} fill="#ffffff" stroke="#120c1d" strokeWidth="1.2" />
      {/* Left Pupil */}
      <circle cx={x1 + pupilOffsetX} cy={y1 + pupilOffsetY} r={pupilR} fill="#111111" />
      {/* Left Specular Shine */}
      <circle cx={x1 + pupilOffsetX - 1.5} cy={y1 + pupilOffsetY - 1.5} r={pupilR * 0.38} fill="#ffffff" />

      {/* Right Sclera */}
      <circle cx={x2} cy={y2} r={r} fill="#ffffff" stroke="#120c1d" strokeWidth="1.2" />
      {/* Right Pupil */}
      <circle cx={x2 + pupilOffsetX} cy={y2 + pupilOffsetY} r={pupilR} fill="#111111" />
      {/* Right Specular Shine */}
      <circle cx={x2 + pupilOffsetX - 1.5} cy={y2 + pupilOffsetY - 1.5} r={pupilR * 0.38} fill="#ffffff" />
    </g>
  );
};

interface PlayerAvatarProps {
  avatar?: string; // style id or legacy emoji
  color?: string;
  size?: number | string;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar = 'navy',
  color = '#2945b5',
  size = 32,
  className = ''
}) => {
  // Normalize style identifier
  const styleId = (avatar || 'navy').toLowerCase();

  const renderShape = () => {
    switch (styleId) {
      case 'cloud':
        return (
          <>
            <path
              d="M26 72 C14 72 8 62 8 50 C8 39 16 32 26 31 C28 20 38 12 50 12 C62 12 72 20 74 31 C84 32 92 39 92 50 C92 62 86 72 74 72 Z"
              fill={color || '#e2e8f0'}
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            <GooglyEyes x1={40} y1={52} x2={60} y2={52} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'lilac':
        return (
          <>
            <g fill={color || '#c48df5'} stroke="#7e22ce" strokeWidth="2">
              <circle cx="34" cy="34" r="21" />
              <circle cx="66" cy="34" r="21" />
              <circle cx="34" cy="66" r="21" />
              <circle cx="66" cy="66" r="21" />
              <circle cx="50" cy="50" r="23" />
            </g>
            <GooglyEyes x1={40} y1={50} x2={60} y2={50} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'bomb':
        return (
          <>
            {/* Fuse */}
            <path d="M50 24 C50 14 62 14 68 8" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
            {/* Golden Spark */}
            <path d="M68 8 L72 3 L70 8 L75 9 L70 10 L72 15 L68 11 L64 14 L66 9 L61 8 L66 7 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
            {/* Bomb Neck */}
            <rect x="44" y="22" width="12" height="6" rx="2" fill="#292524" />
            {/* Bomb Spherical Body */}
            <circle cx="50" cy="55" r="37" fill={color || '#3c3836'} stroke="#1c1917" strokeWidth="2" />
            {/* Highlight */}
            <ellipse cx="36" cy="36" rx="8" ry="4" transform="rotate(-30 36 36)" fill="white" opacity="0.2" />
            <GooglyEyes x1={40} y1={62} x2={60} y2={62} r={9} pupilR={4.5} look="left" />
          </>
        );

      case 'apple':
        return (
          <>
            {/* Stem */}
            <path d="M50 25 C50 15 56 10 60 7" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            {/* Leaf */}
            <path d="M52 18 C64 12 70 18 68 24 C58 24 54 20 52 18 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            {/* Apple body */}
            <path
              d="M50 30 C38 24 18 26 14 44 C8 66 28 88 50 85 C72 88 92 66 86 44 C82 26 62 24 50 30 Z"
              fill={color || '#48bb35'}
              stroke="#15803d"
              strokeWidth="2"
            />
            {/* Soft shine */}
            <ellipse cx="34" cy="42" rx="7" ry="4" transform="rotate(-25 34 42)" fill="white" opacity="0.25" />
            <GooglyEyes x1={40} y1={58} x2={60} y2={58} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'poop':
        return (
          <>
            <path
              d="M50 14 C52 14 56 18 53 22 C49 26 44 28 50 32 C62 32 72 38 72 46 C72 50 68 53 62 55 C74 56 84 62 84 72 C84 82 72 88 50 88 C28 88 16 82 16 72 C16 62 26 56 38 55 C32 53 28 50 28 46 C28 38 38 32 50 32 C56 28 51 26 47 22 C44 18 48 14 50 14 Z"
              fill={color || '#7c441c'}
              stroke="#451a03"
              strokeWidth="2"
            />
            <GooglyEyes x1={41} y1={62} x2={59} y2={62} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'strawberry':
        return (
          <>
            {/* Strawberry body */}
            <path
              d="M50 90 C32 78 14 56 16 38 C18 24 34 22 50 26 C66 22 82 24 84 38 C86 56 68 78 50 90 Z"
              fill={color || '#e11d48'}
              stroke="#9f1239"
              strokeWidth="2"
            />
            {/* Seeds */}
            <g fill="#fef08a" opacity="0.85">
              <circle cx="34" cy="40" r="1.5" />
              <circle cx="66" cy="40" r="1.5" />
              <circle cx="30" cy="54" r="1.5" />
              <circle cx="70" cy="54" r="1.5" />
              <circle cx="50" cy="74" r="1.5" />
              <circle cx="40" cy="80" r="1.5" />
              <circle cx="60" cy="80" r="1.5" />
            </g>
            {/* Calyx Leaf Top */}
            <path
              d="M50 24 C44 12 30 18 26 22 C34 26 40 28 50 28 C60 28 66 26 74 22 C70 18 56 12 50 24 Z"
              fill="#16a34a"
              stroke="#14532d"
              strokeWidth="1.5"
            />
            <GooglyEyes x1={41} y1={58} x2={59} y2={58} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'fire':
        return (
          <>
            {/* Outer flame */}
            <path
              d="M50 10 C54 24 68 34 76 48 C86 64 80 82 66 90 C56 96 44 96 34 90 C20 82 14 64 24 48 C32 34 46 24 50 10 Z"
              fill={color || '#ff4500'}
              stroke="#c2410c"
              strokeWidth="2"
            />
            {/* Inner golden flame */}
            <path
              d="M50 38 C54 46 62 54 64 64 C68 74 62 82 50 84 C38 82 32 74 36 64 C38 54 46 46 50 38 Z"
              fill="#fbbf24"
              opacity="0.9"
            />
            <GooglyEyes x1={41} y1={66} x2={59} y2={66} r={8} pupilR={4} look="left" />
          </>
        );

      case 'lemon':
        return (
          <g transform="rotate(-15 50 50)">
            {/* Leaf */}
            <path d="M52 14 C62 8 68 12 66 18 C58 18 54 16 52 14 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
            {/* Lemon body */}
            <path
              d="M20 50 C14 50 12 47 10 50 C12 53 14 50 20 50 C26 28 74 28 80 50 C86 50 88 53 90 50 C88 47 86 50 80 50 C74 72 26 72 20 50 Z"
              fill={color || '#facc15'}
              stroke="#ca8a04"
              strokeWidth="2"
            />
            <GooglyEyes x1={42} y1={52} x2={58} y2={52} r={8} pupilR={4} look="left" />
          </g>
        );

      case 'ghost':
        return (
          <>
            <path
              d="M50 14 C28 14 20 30 20 54 L20 84 C26 80 32 84 38 80 C44 84 50 80 56 84 C62 80 68 84 74 80 C80 84 80 80 80 54 C80 30 72 14 50 14 Z"
              fill={color || '#00d2d3'}
              stroke="#0891b2"
              strokeWidth="2"
            />
            <GooglyEyes x1={41} y1={46} x2={59} y2={46} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'heart':
        return (
          <>
            <path
              d="M50 84 C48 82 16 58 16 38 C16 22 28 16 38 16 C44 16 48 20 50 24 C52 20 56 16 62 16 C72 16 84 22 84 38 C84 58 52 82 50 84 Z"
              fill={color || '#f43f5e'}
              stroke="#be123c"
              strokeWidth="2"
            />
            <GooglyEyes x1={40} y1={46} x2={60} y2={46} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'star':
        return (
          <>
            <path
              d="M50 10 L61 34 L88 38 L68 56 L73 82 L50 69 L27 82 L32 56 L12 38 L39 34 Z"
              fill={color || '#f59e0b'}
              stroke="#b45309"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <GooglyEyes x1={41} y1={50} x2={59} y2={50} r={7.5} pupilR={3.8} look="left" />
          </>
        );

      case 'cat':
        return (
          <>
            <path
              d="M26 34 L20 12 L40 24 C44 22 56 22 60 24 L80 12 L74 34 C84 44 86 58 82 70 C76 84 64 90 50 90 C36 90 24 84 18 70 C14 58 16 44 26 34 Z"
              fill={color || '#4f46e5'}
              stroke="#312e81"
              strokeWidth="2"
            />
            <GooglyEyes x1={40} y1={56} x2={60} y2={56} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'alien':
        return (
          <>
            {/* Antenna */}
            <line x1="50" y1="26" x2="50" y2="12" stroke="#15803d" strokeWidth="2.5" />
            <circle cx="50" cy="10" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            {/* Head */}
            <ellipse cx="50" cy="56" rx="38" ry="32" fill={color || '#10b981'} stroke="#047857" strokeWidth="2" />
            <GooglyEyes x1={39} y1={56} x2={61} y2={56} r={9.5} pupilR={4.8} look="left" />
          </>
        );

      case 'donut':
        return (
          <>
            <circle cx="50" cy="50" r="40" fill="#d97706" stroke="#92400e" strokeWidth="2" />
            <path
              d="M50 14 C68 14 84 28 84 46 C84 56 76 58 74 62 C72 68 78 72 74 76 C70 80 64 76 60 80 C56 84 50 82 46 84 C40 86 34 80 30 82 C24 84 20 78 18 74 C16 70 20 66 18 60 C16 54 14 46 16 40 C18 24 32 14 50 14 Z"
              fill={color || '#f472b6'}
            />
            <circle cx="50" cy="50" r="14" fill="#130f1d" stroke="#92400e" strokeWidth="2" />
            <line x1="30" y1="28" x2="36" y2="28" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="64" y1="28" x2="70" y2="32" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="72" y1="52" x2="78" y2="52" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="52" x2="28" y2="56" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <GooglyEyes x1={42} y1={36} x2={58} y2={36} r={6.5} pupilR={3.2} look="left" />
          </>
        );

      case 'navy':
      default:
        // Default Navy / Color Blob
        return (
          <>
            <circle cx="50" cy="50" r="42" fill={color || '#2945b5'} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
            <GooglyEyes x1={39} y1={62} x2={61} y2={62} r={9.5} pupilR={4.6} look="left" />
          </>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`inline-block select-none overflow-visible flex-shrink-0 ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size
      }}
    >
      {renderShape()}
    </svg>
  );
};
