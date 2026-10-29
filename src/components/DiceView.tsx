import React from 'react';

interface DiceProps {
  values: [number, number];
  isRolling?: boolean;
}

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]]
};

export const DiceView: React.FC<DiceProps> = ({ values, isRolling }) => {
  const renderDie = (val: number, idx: number) => {
    const dots = DOT_POSITIONS[val] || DOT_POSITIONS[1];
    return (
      <div
        key={idx}
        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-white via-[#f8fafc] to-[#e2e8f0] rounded-xl sm:rounded-2xl border-2 border-white/90 relative transition-transform duration-300 ${
          isRolling ? 'animate-bounce rotate-12 scale-110' : 'hover:scale-105'
        }`}
        style={{
          boxShadow: '0 8px 20px -3px rgba(0,0,0,0.6), inset 0 3px 6px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.15)'
        }}
      >
        {dots.map(([left, top], dIdx) => (
          <div
            key={dIdx}
            className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-gradient-to-br from-red-500 to-rose-700 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), 0 0.5px 1px rgba(255,255,255,0.4)'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5">
      {renderDie(values[0], 0)}
      {renderDie(values[1], 1)}
    </div>
  );
};
