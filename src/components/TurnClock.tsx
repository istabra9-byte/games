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
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);
  const isUrgent = remainingSec <= 10;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
      isUrgent 
        ? 'bg-red-950/80 border-red-500/50 text-red-200 animate-pulse' 
        : 'bg-[#1b152b]/90 border-purple-500/30 text-purple-200'
    }`}>
      {/* Radial Ring */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-20"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={isUrgent ? '#ff3b30' : '#a855f7'}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <Clock className={`w-3.5 h-3.5 absolute ${isUrgent ? 'text-red-400' : 'text-purple-400'}`} />
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-mono font-bold leading-none">
          {remainingSec}s
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Turn limit</span>
      </div>

      {isMyTurn && onRequestTime && (
        <button
          onClick={onRequestTime}
          title="Ask for +15s extra time"
          className="ml-1 p-1 bg-purple-600/40 hover:bg-purple-600/70 border border-purple-500/40 rounded-full transition-colors flex items-center gap-0.5 text-[10px] font-bold text-white px-2"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>15s</span>
        </button>
      )}
    </div>
  );
};
