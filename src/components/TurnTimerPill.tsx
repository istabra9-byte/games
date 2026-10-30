import React, { useState, useEffect } from 'react';
import { TurnTimerState } from '../types/game';
import { Plus, Clock } from 'lucide-react';

interface TurnTimerPillProps {
  timer: TurnTimerState;
  onGrantTime?: () => void;
  canGrantTime?: boolean;
  className?: string;
}

export const TurnTimerPill: React.FC<TurnTimerPillProps> = ({
  timer,
  onGrantTime,
  canGrantTime = true,
  className = ''
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = Math.max(0, timer.expiresAt - now);
  const totalSec = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const totalDuration = timer.totalDuration || (timer.situation === 'roll' ? 20000 : 180000);
  const fraction = Math.max(0, Math.min(1, remainingMs / totalDuration));

  // Progress ring dimensions matching photo
  const radius = 8.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);

  // Grant time option appears in last 20 seconds
  const showGrantOption = totalSec <= 20 && totalSec > 0;
  const grantLabel = timer.situation === 'roll' ? '+30s' : '+1m';

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* 1. Authentic Timer Pill (Exact match to screenshot) */}
      <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1730] border border-purple-900/60 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
        {/* Radial Progress Ring */}
        <div className="relative w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
          <svg className="w-[18px] h-[18px] -rotate-90" viewBox="0 0 24 24">
            {/* Background Track Circle */}
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="none"
              stroke="#3d3356"
              strokeWidth="3.2"
            />
            {/* Dynamic Amber Progress Arc */}
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-200"
            />
          </svg>
        </div>

        {/* Amber Countdown Text */}
        <span className="font-mono font-bold text-xs sm:text-[13px] text-amber-400 tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {formattedTime}
        </span>
      </div>

      {/* 2. Grant Time Option: Appears in the last 20 seconds of either situation */}
      {showGrantOption && onGrantTime && canGrantTime && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGrantTime();
          }}
          title={timer.situation === 'roll' ? 'Grant +30 seconds' : 'Grant +1 minute'}
          className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-95 text-white font-black text-[11px] rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-400/60 flex items-center gap-1 cursor-pointer transition-all animate-pulse flex-shrink-0"
        >
          <Plus className="w-3 h-3 text-amber-200" />
          <span>{grantLabel}</span>
        </button>
      )}
    </div>
  );
};
