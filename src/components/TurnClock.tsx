import React from 'react';
import { Clock, Plus } from 'lucide-react';

interface TurnClockProps {
  remainingSec: number;
  totalSec: number;
  isMyTurn: boolean;
  onRequestTime?: () => void;
}

export const TurnClock: React.FC<TurnClockProps> = ({
  remainingSec,
  totalSec,
  isMyTurn,
  onRequestTime
}) => {
  const fraction = Math.max(0, Math.min(1, remainingSec / Math.max(1, totalSec)));
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);
  const isUrgent = remainingSec <= 10;

  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
      isUrgent 
        ? 'bg-red-950/80 border-red-500/50 text-red-200 animate-pulse' 
        : 'bg-[#1b152b]/90 border-purple-500/30 text-purple-200'
    }`}>
      {/* Compact Radial Ring */}
      <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-20"
          />
          <circle
            cx="16"
            cy="16"
            r={radius}
            fill="none"
            stroke={isUrgent ? '#ff3b30' : '#a855f7'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <Clock className={`w-2.5 h-2.5 absolute ${isUrgent ? 'text-red-400' : 'text-purple-400'}`} />
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-[9px] sm:text-[10px] font-mono font-bold leading-tight">
          {remainingSec}s
        </span>
        <span className="text-[6.5px] sm:text-[7.5px] text-gray-400 font-medium leading-none">Turn limit</span>
      </div>

      {isMyTurn && onRequestTime && (
        <button
          onClick={onRequestTime}
          title="Ask for +15s extra time"
          className="ml-0.5 py-0.5 px-1.5 bg-purple-600/50 hover:bg-purple-600/80 border border-purple-400/50 rounded-full transition-colors flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white cursor-pointer shadow-sm active:scale-95 leading-none"
        >
          <span>+ 15s</span>
        </button>
      )}
    </div>
  );
};
