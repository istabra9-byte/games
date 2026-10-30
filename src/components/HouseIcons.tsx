import React from 'react';

/**
 * Miniature 3D Monopoly-style House Icon
 * Features a classic green gable roof, chimney, front door with gold knob, and glowing window.
 */
export const HouseIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg
    viewBox="0 0 16 16"
    className={`${className} flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] filter`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Chimney */}
    <rect x="10.5" y="2.5" width="2" height="3.5" rx="0.4" fill="#15803d" stroke="#14532d" strokeWidth="0.6" />
    {/* Main House Body / Walls */}
    <rect x="2" y="6.5" width="12" height="8" rx="0.5" fill="#22c55e" stroke="#14532d" strokeWidth="0.8" />
    {/* 3D Depth Shading on Right Wall */}
    <path d="M10.5 7 H13.5 V14 H10.5 V7 Z" fill="#16a34a" />
    {/* Gable Roof */}
    <path
      d="M8 1.2 L15 6.5 H1 L8 1.2 Z"
      fill="#15803d"
      stroke="#052e16"
      strokeWidth="0.9"
      strokeLinejoin="round"
    />
    {/* Roof Left Highlight */}
    <path d="M8 2 L2.2 6.2 L2.8 6.5 L8 2.6 Z" fill="#86efac" opacity="0.85" />
    {/* Front Door */}
    <rect x="6.5" y="9" width="3" height="5.5" rx="0.4" fill="#14532d" stroke="#052e16" strokeWidth="0.5" />
    {/* Door Knob */}
    <circle cx="8.8" cy="11.8" r="0.4" fill="#facc15" />
    {/* Front Window */}
    <rect x="3.2" y="8.2" width="2" height="2" rx="0.3" fill="#fef08a" stroke="#14532d" strokeWidth="0.5" />
  </svg>
);

/**
 * Miniature 3D Monopoly-style Luxury Hotel Icon
 * Features a grand red hotel building, central tower, golden "HOTEL" marquee sign, glowing windows, and grand entrance doors.
 */
export const HotelIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 18 16"
    className={`${className} flex-shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] filter`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main Grand Hotel Red Structure */}
    <rect x="1.5" y="4.5" width="15" height="10.5" rx="0.8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
    {/* 3D Side Shading */}
    <rect x="13.5" y="5" width="2.5" height="9.5" rx="0.4" fill="#991b1b" />
    {/* Central Mansard Tower */}
    <rect x="5" y="1.5" width="8" height="13.5" rx="0.7" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.8" />
    {/* Central Roof Peak */}
    <path d="M5.5 1.5 L9 0.3 L12.5 1.5 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="0.6" />
    {/* Golden Spire Finial */}
    <circle cx="9" cy="0.4" r="0.6" fill="#facc15" />
    {/* Golden Hotel Sign Banner */}
    <rect x="3.5" y="5" width="11" height="4" rx="0.5" fill="#7f1d1d" stroke="#facc15" strokeWidth="0.6" />
    <text
      x="9"
      y="8"
      textAnchor="middle"
      fill="#fef08a"
      fontSize="3"
      fontWeight="900"
      fontFamily="sans-serif"
      letterSpacing="0.3"
    >
      HOTEL
    </text>
    {/* Left Windows (Warm glowing yellow) */}
    <rect x="2.5" y="10" width="1.6" height="1.6" rx="0.2" fill="#fef08a" />
    <rect x="2.5" y="12.5" width="1.6" height="1.6" rx="0.2" fill="#fef08a" />
    {/* Right Windows */}
    <rect x="13.8" y="10" width="1.6" height="1.6" rx="0.2" fill="#fef08a" />
    <rect x="13.8" y="12.5" width="1.6" height="1.6" rx="0.2" fill="#fef08a" />
    {/* Grand Entrance Double Doors */}
    <rect x="7.2" y="11" width="3.6" height="4" rx="0.3" fill="#450a0a" stroke="#facc15" strokeWidth="0.5" />
    <line x1="9" y1="11" x2="9" y2="15" stroke="#facc15" strokeWidth="0.4" />
  </svg>
);
