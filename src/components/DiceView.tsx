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
        className={`w-14 h-14 bg-gradient-to-br from-white to-gray-200 rounded-xl shadow-lg border-2 border-gray-300 relative transition-transform duration-300 ${
          isRolling ? 'animate-bounce rotate-12 scale-110' : 'hover:scale-105'
        }`}
        style={{
          boxShadow: '0 8px 16px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)'
        }}
      >
        {dots.map(([left, top], dIdx) => (
          <div
            key={dIdx}
            className="absolute w-2.5 h-2.5 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner"
            style={{ left: `${left}%`, top: `${top}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {renderDie(values[0], 0)}
      {renderDie(values[1], 1)}
    </div>
  );
};
