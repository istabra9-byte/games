import React, { useState, useEffect } from 'react';

interface DiceProps {
  values: [number, number];
  isRolling?: boolean;
}

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[28, 23], [72, 23], [28, 50], [72, 50], [28, 77], [72, 77]]
};

export const DiceView: React.FC<DiceProps> = ({ values, isRolling = false }) => {
  const [displayValues, setDisplayValues] = useState<[number, number]>(values);

  // When isRolling is true, rapidly cycle random pips to simulate tumbling across 3D faces
  useEffect(() => {
    if (!isRolling) {
      setDisplayValues(values);
      return;
    }

    const interval = setInterval(() => {
      setDisplayValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 70);

    return () => clearInterval(interval);
  }, [isRolling, values]);

  const renderDie = (val: number, idx: number) => {
    const dots = DOT_POSITIONS[val] || DOT_POSITIONS[1];
    const tumbleClass = isRolling
      ? idx === 0
        ? 'animate-dice-tumble-1'
        : 'animate-dice-tumble-2'
      : '';

    return (
      <div key={idx} className="relative group select-none">
        {/* Soft 3D Contact Shadow beneath Die */}
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3 sm:h-3.5 bg-black/60 rounded-full blur-[4px] transition-all duration-300 pointer-events-none ${
            isRolling ? 'scale-75 opacity-40 blur-[7px]' : 'scale-100 opacity-80'
          }`}
        />

        {/* Realistic 3D Die Body */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[14px] sm:rounded-[18px] relative transition-transform duration-200 cursor-default ${tumbleClass}`}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 45%, #e2e8f0 100%)',
            boxShadow: `
              0 10px 24px -2px rgba(0,0,0,0.65),
              0 4px 8px -2px rgba(0,0,0,0.4),
              inset 0 2px 4px rgba(255,255,255,0.95),
              inset 0 -2.5px 5px rgba(0,0,0,0.18),
              inset -2px 0 3px rgba(0,0,0,0.08)
            `,
            transform: !isRolling
              ? idx === 0
                ? 'rotate(-2deg)'
                : 'rotate(2.5deg)'
              : undefined
          }}
        >
          {/* Subtle Top-Left Specular Sheen */}
          <div className="absolute top-1 left-1.5 right-1.5 h-2 bg-gradient-to-b from-white/80 to-transparent rounded-t-[12px] pointer-events-none" />

          {/* Deep Inset Engraved Dots (Pips) */}
          {dots.map(([left, top], dIdx) => (
            <div
              key={dIdx}
              className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                background: 'radial-gradient(circle at 35% 35%, #2d3748 0%, #111827 75%, #050505 100%)',
                boxShadow: `
                  inset 0 1.5px 2px rgba(0,0,0,0.9),
                  0 0.5px 1px rgba(255,255,255,0.4)
                `
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 py-1">
      {renderDie(displayValues[0], 0)}
      {renderDie(displayValues[1], 1)}
    </div>
  );
};
