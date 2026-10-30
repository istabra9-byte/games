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
  { id: 'clover', name: 'Lucky Clover', color: '#10b981', style: 'clover', price: 190, description: 'Four-leaf charm of golden fortune' },
  { id: 'panda', name: 'Zen Panda', color: '#f8fafc', style: 'panda', price: 210, description: 'Chilled bamboo master' },
  { id: 'robot', name: 'Retro Mecha', color: '#06b6d4', style: 'robot', price: 230, description: 'Vintage 8-bit automaton with glowing antenna' },
  { id: 'skull', name: 'Pirate Skull', color: '#e2e8f0', style: 'skull', price: 260, description: 'Corsair captain with golden tooth' },
  { id: 'phoenix', name: 'Mythic Phoenix', color: '#f97316', style: 'phoenix', price: 320, description: 'Blazing plumage reborn in flames' },
];

// Profile Pictures (Illustrated character portraits) available in the Shop
export const PROFILE_PICTURES: AppearanceOption[] = [
  { id: 'king', name: 'The Sovereign King', color: '#8b5cf6', style: 'king', price: 150, description: 'Golden royal crown & imperial velvet mantle' },
  { id: 'tycoon', name: 'Wall St. Tycoon', color: '#1e293b', style: 'tycoon', price: 150, description: 'Billionaire top hat, monocle & golden bowtie' },
  { id: 'detective', name: 'Secret Agent', color: '#334155', style: 'detective', price: 180, description: 'Shadow fedora & dark sunglasses' },
  { id: 'cyborg', name: 'Cyber 2077', color: '#06b6d4', style: 'cyborg', price: 200, description: 'Futuristic android with neon cyber-visor' },
  { id: 'memecat', name: 'Giga Meme Cat', color: '#6366f1', style: 'memecat', price: 200, description: 'Legendary feline with pixel sunglasses' },
  { id: 'astronaut', name: 'Cosmic Explorer', color: '#f8fafc', style: 'astronaut', price: 220, description: 'Space helmet with reflective gold visor' },
  { id: 'ninja', name: 'Shadow Shinobi', color: '#0f172a', style: 'ninja', price: 240, description: 'Midnight mask with piercing red gaze' },
  { id: 'footballer', name: 'Ballon d\'Or MVP', color: '#3b82f6', style: 'footballer', price: 260, description: 'Champion jersey, captain armband & gold medal' },
  { id: 'wizard', name: 'Crypto Alchemist', color: '#7c3aed', style: 'wizard', price: 280, description: 'Mystic wizard with glowing star hat' },
  { id: 'wolf', name: 'Diamond Wolf', color: '#64748b', style: 'wolf', price: 300, description: 'Sharp suit wolf with diamond sparkle' },
  { id: 'vampire', name: 'Count Dracula', color: '#881337', style: 'vampire', price: 290, description: 'Gothic night aristocrat with scarlet cape' },
  { id: 'samurai', name: 'Ronin Samurai', color: '#dc2626', style: 'samurai', price: 320, description: 'Honor blade master with golden kabuto' },
  { id: 'pharaoh', name: 'King Tutankhamun', color: '#eab308', style: 'pharaoh', price: 350, description: 'Eternal golden ruler with lapis royal nemes' },
];

export const ALL_APPEARANCES: AppearanceOption[] = [
  ...BASE_APPEARANCES,
  ...SHOP_APPEARANCES,
  ...PROFILE_PICTURES
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

      case 'king':
        return (
          <>
            {/* Royal Velvet Cape */}
            <path d="M16 92 C16 66 32 60 50 60 C68 60 84 66 84 92 Z" fill={color || '#7c3aed'} stroke="#5b21b6" strokeWidth="2" />
            {/* Ermine Fur Collar */}
            <path d="M28 66 Q50 78 72 66 Q50 58 28 66" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="38" cy="69" r="1.5" fill="#1e1b4b" />
            <circle cx="50" cy="71" r="1.5" fill="#1e1b4b" />
            <circle cx="62" cy="69" r="1.5" fill="#1e1b4b" />
            {/* Head */}
            <circle cx="50" cy="50" r="28" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            {/* Golden Crown */}
            <path d="M24 34 L30 12 L41 24 L50 8 L59 24 L70 12 L76 34 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="2" strokeLinejoin="round" />
            {/* Crown Jewels */}
            <circle cx="30" cy="14" r="2.5" fill="#ef4444" />
            <circle cx="50" cy="10" r="3" fill="#3b82f6" />
            <circle cx="70" cy="14" r="2.5" fill="#ef4444" />
            <rect x="25" y="31" width="50" height="4" rx="1" fill="#f59e0b" />
            <GooglyEyes x1={41} y1={52} x2={59} y2={52} r={8} pupilR={4.2} look="left" />
          </>
        );

      case 'tycoon':
        return (
          <>
            {/* Tuxedo Body */}
            <path d="M20 92 C20 68 34 62 50 62 C66 62 80 68 80 92 Z" fill="#0f172a" stroke="#020617" strokeWidth="2" />
            {/* White Shirt Collar */}
            <polygon points="42,62 58,62 50,74" fill="#ffffff" />
            {/* Red Bowtie */}
            <polygon points="43,64 57,64 50,68" fill="#ef4444" />
            <polygon points="43,72 57,72 50,68" fill="#ef4444" />
            <circle cx="50" cy="68" r="2" fill="#b91c1c" />
            {/* Head */}
            <circle cx="50" cy="50" r="27" fill={color || '#38bdf8'} stroke="#0284c7" strokeWidth="2" />
            {/* Top Hat Brim */}
            <ellipse cx="50" cy="28" rx="38" ry="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            {/* Top Hat Cylinder */}
            <path d="M28 28 L32 6 L68 6 L72 28 Z" fill="#0f172a" stroke="#020617" strokeWidth="2" />
            {/* Red Silk Ribbon on Hat */}
            <path d="M29 27 L30 22 L70 22 L71 27 Z" fill="#ef4444" />
            {/* Eyes + Golden Monocle on right eye */}
            <GooglyEyes x1={40} y1={52} x2={60} y2={52} r={7.5} pupilR={3.8} look="left" />
            <circle cx="60" cy="52" r="9.5" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <line x1="69" y1="56" x2="78" y2="76" stroke="#fbbf24" strokeWidth="1.5" />
          </>
        );

      case 'detective':
        return (
          <>
            {/* Trench Coat */}
            <path d="M18 92 C18 68 32 62 50 62 C68 62 82 68 82 92 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            {/* Crimson Tie */}
            <polygon points="48,62 52,62 54,78 50,84 46,78" fill="#dc2626" />
            {/* Head */}
            <circle cx="50" cy="52" r="27" fill={color || '#fbbf24'} stroke="#d97706" strokeWidth="2" />
            {/* Fedora Hat Brim */}
            <path d="M14 36 Q50 26 86 36 Q50 32 14 36" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
            {/* Fedora Crown */}
            <path d="M28 32 C30 14 42 12 50 16 C58 12 70 14 72 32 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
            {/* Black Hat Ribbon */}
            <path d="M28 32 Q50 28 72 32 Q50 30 28 32" fill="#0f172a" stroke="#020617" strokeWidth="2" />
            {/* Cool Detective Sunglasses */}
            <rect x="30" y="46" width="18" height="12" rx="3" fill="#0f172a" stroke="#020617" strokeWidth="1.5" />
            <rect x="52" y="46" width="18" height="12" rx="3" fill="#0f172a" stroke="#020617" strokeWidth="1.5" />
            <line x1="48" y1="50" x2="52" y2="50" stroke="#020617" strokeWidth="2" />
            <line x1="32" y1="48" x2="42" y2="48" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
            <line x1="54" y1="48" x2="64" y2="48" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
          </>
        );

      case 'cyborg':
        return (
          <>
            {/* Metallic Head */}
            <circle cx="50" cy="50" r="38" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
            {/* Cyber Circuit Lines */}
            <path d="M20 50 L32 50 L38 38 L44 38" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
            <path d="M80 50 L68 50 L62 62 L56 62" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
            {/* High-tech Neon Visor */}
            <rect x="22" y="42" width="56" height="16" rx="4" fill="#0891b2" stroke="#22d3ee" strokeWidth="2" />
            {/* Visor scan line */}
            <rect x="26" y="48" width="48" height="4" rx="2" fill="#67e8f9" />
            {/* Audio Earpiece / Nodes */}
            <rect x="10" y="44" width="6" height="12" rx="2" fill="#06b6d4" />
            <rect x="84" y="44" width="6" height="12" rx="2" fill="#06b6d4" />
          </>
        );

      case 'memecat':
        return (
          <>
            {/* Cat Ears */}
            <polygon points="26,38 18,12 40,24" fill={color || '#6366f1'} stroke="#4338ca" strokeWidth="2" />
            <polygon points="28,34 22,18 36,26" fill="#f472b6" />
            <polygon points="74,38 82,12 60,24" fill={color || '#6366f1'} stroke="#4338ca" strokeWidth="2" />
            <polygon points="72,34 78,18 64,26" fill="#f472b6" />
            {/* Head */}
            <ellipse cx="50" cy="56" rx="34" ry="28" fill={color || '#6366f1'} stroke="#4338ca" strokeWidth="2" />
            {/* Pixel Thug Life Sunglasses */}
            <rect x="26" y="48" width="22" height="12" fill="#000000" stroke="#ffffff" strokeWidth="1" />
            <rect x="52" y="48" width="22" height="12" fill="#000000" stroke="#ffffff" strokeWidth="1" />
            <line x1="48" y1="52" x2="52" y2="52" stroke="#000000" strokeWidth="3" />
            <rect x="30" y="50" width="4" height="4" fill="#ffffff" />
            <rect x="56" y="50" width="4" height="4" fill="#ffffff" />
            {/* Cute cat nose & mouth */}
            <polygon points="48,68 52,68 50,71" fill="#f43f5e" />
            <path d="M46 72 Q50 76 54 72" fill="none" stroke="#312e81" strokeWidth="1.5" />
          </>
        );

      case 'astronaut':
        return (
          <>
            {/* Helmet Body */}
            <circle cx="50" cy="50" r="38" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
            {/* Gold Reflective Visor */}
            <rect x="22" y="32" width="56" height="36" rx="14" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
            {/* Sun glare reflection */}
            <ellipse cx="36" cy="42" rx="10" ry="4" transform="rotate(-30 36 42)" fill="#ffffff" opacity="0.6" />
            {/* Side Comms Antenna */}
            <rect x="10" y="44" width="4" height="12" rx="2" fill="#64748b" />
            <line x1="12" y1="44" x2="12" y2="28" stroke="#64748b" strokeWidth="2" />
            <circle cx="12" cy="27" r="2.5" fill="#ef4444" />
          </>
        );

      case 'ninja':
        return (
          <>
            {/* Head Silhouette */}
            <circle cx="50" cy="50" r="36" fill="#0f172a" stroke="#020617" strokeWidth="2" />
            {/* Crimson Headband */}
            <rect x="14" y="26" width="72" height="12" rx="2" fill="#dc2626" />
            <rect x="42" y="28" width="16" height="8" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            {/* Eye Slit Opening */}
            <rect x="24" y="44" width="52" height="14" rx="4" fill="#fcd34d" stroke="#020617" strokeWidth="1.5" />
            {/* Fierce Ninja Eyes */}
            <ellipse cx="38" cy="51" rx="6" ry="3" fill="#dc2626" />
            <circle cx="38" cy="51" r="2" fill="#020617" />
            <ellipse cx="62" cy="51" rx="6" ry="3" fill="#dc2626" />
            <circle cx="62" cy="51" r="2" fill="#020617" />
            {/* Lower Face Mask Wrap */}
            <path d="M16 58 Q50 68 84 58 L84 86 C84 86 50 94 16 86 Z" fill="#0f172a" />
          </>
        );

      case 'footballer':
        return (
          <>
            {/* Jersey */}
            <path d="M18 92 C18 68 32 62 50 62 C68 62 82 68 82 92 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
            {/* Jersey Stripes */}
            <rect x="36" y="66" width="6" height="26" fill="#ffffff" />
            <rect x="58" y="66" width="6" height="26" fill="#ffffff" />
            {/* Gold Medal on Ribbon */}
            <line x1="42" y1="62" x2="50" y2="76" stroke="#ef4444" strokeWidth="2" />
            <line x1="58" y1="62" x2="50" y2="76" stroke="#ef4444" strokeWidth="2" />
            <circle cx="50" cy="78" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            {/* Head */}
            <circle cx="50" cy="46" r="26" fill={color || '#f59e0b'} stroke="#b45309" strokeWidth="2" />
            {/* Athletic Headband */}
            <rect x="24" y="30" width="52" height="8" rx="2" fill="#1e293b" />
            <GooglyEyes x1={41} y1={48} x2={59} y2={48} r={7.5} pupilR={3.8} look="left" />
          </>
        );

      case 'wizard':
        return (
          <>
            {/* Robe */}
            <path d="M18 92 C18 66 32 62 50 62 C68 62 82 66 82 92 Z" fill="#6d28d9" stroke="#4c1d95" strokeWidth="2" />
            {/* Head */}
            <circle cx="50" cy="54" r="26" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            {/* Wizard Beard */}
            <path d="M34 62 Q50 90 66 62 Q50 72 34 62" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Wizard Hat Brim */}
            <ellipse cx="50" cy="38" rx="40" ry="8" fill="#4c1d95" stroke="#311042" strokeWidth="2" />
            {/* Wizard Hat Cone */}
            <path d="M26 36 L48 4 Q54 6 56 12 L74 36 Z" fill="#5b21b6" stroke="#311042" strokeWidth="2" />
            {/* Hat Stars & Moon */}
            <circle cx="48" cy="18" r="2" fill="#fbbf24" />
            <circle cx="58" cy="26" r="1.5" fill="#fbbf24" />
            <GooglyEyes x1={41} y1={52} x2={59} y2={52} r={7.5} pupilR={3.8} look="left" />
          </>
        );

      case 'wolf':
        return (
          <>
            {/* Wolf Ears */}
            <polygon points="28,34 16,10 38,22" fill="#64748b" stroke="#334155" strokeWidth="2" />
            <polygon points="30,30 22,16 36,24" fill="#f43f5e" />
            <polygon points="72,34 84,10 62,22" fill="#64748b" stroke="#334155" strokeWidth="2" />
            <polygon points="70,30 78,16 64,24" fill="#f472b6" />
            {/* Wolf Head */}
            <path d="M22 50 C22 36 34 32 50 32 C66 32 78 36 78 50 C78 68 64 78 50 82 C36 78 22 68 22 50 Z" fill="#64748b" stroke="#334155" strokeWidth="2" />
            {/* Wolf Snout */}
            <polygon points="46,62 54,62 50,68" fill="#0f172a" />
            {/* Dark Sunglasses */}
            <rect x="28" y="44" width="20" height="12" rx="3" fill="#0f172a" stroke="#020617" strokeWidth="1.5" />
            <rect x="52" y="44" width="20" height="12" rx="3" fill="#0f172a" stroke="#020617" strokeWidth="1.5" />
            <line x1="48" y1="48" x2="52" y2="48" stroke="#020617" strokeWidth="2" />
            {/* Diamond Hand Pin in lapel */}
            <polygon points="50,76 54,80 50,86 46,80" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
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

      case 'clover':
        return (
          <>
            {/* 4-leaf clover petals */}
            <circle cx="36" cy="36" r="18" fill={color || '#10b981'} stroke="#047857" strokeWidth="2" />
            <circle cx="64" cy="36" r="18" fill={color || '#10b981'} stroke="#047857" strokeWidth="2" />
            <circle cx="36" cy="64" r="18" fill={color || '#10b981'} stroke="#047857" strokeWidth="2" />
            <circle cx="64" cy="64" r="18" fill={color || '#10b981'} stroke="#047857" strokeWidth="2" />
            {/* Center stem */}
            <path d="M50 50 Q50 92 68 96" stroke="#047857" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="50" r="16" fill={color || '#10b981'} />
            <GooglyEyes x1={42} y1={50} x2={58} y2={50} r={7.5} pupilR={3.8} look="left" />
          </>
        );

      case 'panda':
        return (
          <>
            {/* Panda ears */}
            <circle cx="24" cy="24" r="14" fill="#0f172a" stroke="#020617" strokeWidth="2" />
            <circle cx="76" cy="24" r="14" fill="#0f172a" stroke="#020617" strokeWidth="2" />
            {/* White face */}
            <circle cx="50" cy="54" r="38" fill={color || '#ffffff'} stroke="#cbd5e1" strokeWidth="2" />
            {/* Black eye patches */}
            <ellipse cx="36" cy="52" rx="12" ry="10" transform="rotate(-15 36 52)" fill="#0f172a" />
            <ellipse cx="64" cy="52" rx="12" ry="10" transform="rotate(15 64 52)" fill="#0f172a" />
            {/* Cute nose */}
            <ellipse cx="50" cy="68" rx="6" ry="4" fill="#0f172a" />
            <GooglyEyes x1={36} y1={52} x2={64} y2={52} r={7} pupilR={3.5} look="left" />
          </>
        );

      case 'robot':
        return (
          <>
            {/* Antenna */}
            <line x1="50" y1="22" x2="50" y2="10" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="50" cy="8" r="5" fill="#ef4444" className="animate-pulse" />
            {/* Ears/bolts */}
            <rect x="10" y="44" width="6" height="14" rx="2" fill="#64748b" />
            <rect x="84" y="44" width="6" height="14" rx="2" fill="#64748b" />
            {/* Head block */}
            <rect x="16" y="22" width="68" height="58" rx="10" fill={color || '#0891b2'} stroke="#0e7490" strokeWidth="2.5" />
            {/* Visor area */}
            <rect x="24" y="34" width="52" height="26" rx="6" fill="#042f2e" stroke="#14b8a6" strokeWidth="1.5" />
            {/* Speaker mouth */}
            <g fill="#94a3b8">
              <rect x="34" y="66" width="6" height="6" rx="1" />
              <rect x="44" y="66" width="6" height="6" rx="1" />
              <rect x="54" y="66" width="6" height="6" rx="1" />
              <rect x="64" y="66" width="6" height="6" rx="1" />
            </g>
            <GooglyEyes x1={38} y1={47} x2={62} y2={47} r={8} pupilR={4} look="left" />
          </>
        );

      case 'skull':
        return (
          <>
            {/* Skull cranium */}
            <path
              d="M20 46 C20 28 32 14 50 14 C68 14 80 28 80 46 C80 58 74 66 68 70 L68 84 C68 86 64 88 50 88 C36 88 32 86 32 84 L32 70 C26 66 20 58 20 46 Z"
              fill={color || '#f1f5f9'}
              stroke="#94a3b8"
              strokeWidth="2.5"
            />
            {/* Teeth slots */}
            <g fill="#475569">
              <rect x="36" y="74" width="5" height="10" rx="1" />
              <rect x="44" y="74" width="5" height="10" rx="1" />
              <rect x="52" y="74" width="5" height="10" rx="1" fill="#eab308" /> {/* Gold tooth */}
              <rect x="60" y="74" width="5" height="10" rx="1" />
            </g>
            {/* Pirate eye patch over right eye */}
            <circle cx="62" cy="46" r="13" fill="#0f172a" stroke="#020617" strokeWidth="1.5" />
            <line x1="36" y1="28" x2="80" y2="58" stroke="#0f172a" strokeWidth="2.5" />
            {/* Left eye socket with googly eye */}
            <circle cx="38" cy="46" r="11" fill="#0f172a" />
            <GooglyEyes x1={38} y1={46} x2={38} y2={46} r={8.5} pupilR={4.2} look="left" />
          </>
        );

      case 'phoenix':
        return (
          <>
            {/* Fiery wings */}
            <path d="M50 75 C10 65 6 30 18 18 C22 35 34 50 50 60 Z" fill="#ef4444" opacity="0.9" />
            <path d="M50 75 C90 65 94 30 82 18 C78 35 66 50 50 60 Z" fill="#ef4444" opacity="0.9" />
            {/* Body */}
            <path d="M50 14 C32 26 30 68 50 88 C70 68 68 26 50 14 Z" fill={color || '#f97316'} stroke="#c2410c" strokeWidth="2" />
            {/* Flame crown */}
            <polygon points="50,4 56,16 50,14 44,16" fill="#fbbf24" />
            <polygon points="38,8 46,18 40,18" fill="#fbbf24" />
            <polygon points="62,8 54,18 60,18" fill="#fbbf24" />
            <GooglyEyes x1={42} y1={48} x2={58} y2={48} r={8} pupilR={4} look="left" />
          </>
        );

      case 'samurai':
        return (
          <>
            {/* Kabuto Helmet dome */}
            <path d="M18 48 C18 20 32 12 50 12 C68 12 82 20 82 48 Z" fill="#0f172a" stroke="#dc2626" strokeWidth="2" />
            {/* Golden Shikoro Neck Guards */}
            <path d="M14 48 C20 54 22 70 18 84 L28 80 C30 68 28 54 24 48 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M86 48 C80 54 78 70 82 84 L72 80 C70 68 72 54 76 48 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            {/* Golden Maedate Horn Crest */}
            <path d="M50 16 L38 2 Q50 6 50 18 Q50 6 62 2 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Face plate */}
            <rect x="28" y="44" width="44" height="38" rx="6" fill="#1e293b" />
            {/* Menpo mustache mask */}
            <path d="M30 64 Q50 74 70 64 L68 80 Q50 86 32 80 Z" fill="#dc2626" />
            <GooglyEyes x1={40} y1={54} x2={60} y2={54} r={6.5} pupilR={3.2} look="left" />
          </>
        );

      case 'pharaoh':
        return (
          <>
            {/* Striped Nemes Headdress */}
            <path d="M20 50 C20 22 32 14 50 14 C68 14 80 22 80 50 L84 82 L72 82 L70 54 L30 54 L28 82 L16 82 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            {/* Lapis Lazuli Blue Stripes */}
            <path d="M26 30 C34 22 44 20 50 20 C56 20 66 22 74 30" stroke="#1d4ed8" strokeWidth="4" fill="none" />
            <path d="M22 42 C32 36 42 34 50 34 C58 34 68 36 78 42" stroke="#1d4ed8" strokeWidth="4" fill="none" />
            {/* Golden Face */}
            <ellipse cx="50" cy="56" rx="20" ry="24" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Golden Beard */}
            <rect x="46" y="78" width="8" height="16" rx="2" fill="#1d4ed8" stroke="#eab308" strokeWidth="1.5" />
            {/* Cobra Uraeus on forehead */}
            <circle cx="50" cy="18" r="4" fill="#ef4444" stroke="#eab308" strokeWidth="1.5" />
            <GooglyEyes x1={42} y1={56} x2={58} y2={56} r={6.5} pupilR={3.2} look="left" />
          </>
        );

      case 'vampire':
        return (
          <>
            {/* High vampire cape collar */}
            <polygon points="12,18 28,40 16,84" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
            <polygon points="88,18 72,40 84,84" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
            {/* Black cape body */}
            <circle cx="50" cy="54" r="36" fill="#0f172a" stroke="#020617" strokeWidth="2" />
            {/* Pale skin face */}
            <ellipse cx="50" cy="52" rx="24" ry="26" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Widow's peak black hair */}
            <path d="M26 44 C28 28 40 24 50 36 C60 24 72 28 74 44 C72 32 60 28 50 30 C40 28 28 32 26 44 Z" fill="#020617" />
            {/* Vampire Fangs */}
            <polygon points="42,66 45,74 48,66" fill="#ffffff" />
            <polygon points="52,66 55,74 58,66" fill="#ffffff" />
            <GooglyEyes x1={41} y1={52} x2={59} y2={52} r={7.5} pupilR={3.8} look="left" />
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
