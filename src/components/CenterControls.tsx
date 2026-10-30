import React, { useState, useEffect, useRef } from 'react';
import { GameRoom, Tile } from '../types/game';
import { DiceView } from './DiceView';
import { PlayerAvatar } from './PlayerAvatar';
import { Dices, Check, ShoppingCart, ShieldAlert } from 'lucide-react';
import { sound } from '../services/sound';

interface CenterControlsProps {
  room: GameRoom;
  currentPlayerId: string;
  isPieceMoving?: boolean;
  onRoll: () => void;
  onBuy: () => void;
  onSkip: () => void;
  onEndTurn: () => void;
  onPayBail: () => void;
  onRequestTime: () => void;
  onTileClick?: (tile: Tile) => void;
}

export const CenterControls: React.FC<CenterControlsProps> = ({
  room,
  currentPlayerId,
  isPieceMoving = false,
  onRoll,
  onBuy,
  onSkip,
  onEndTurn,
  onPayBail
}) => {
  const turnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
  const turnPlayer = room.players[turnPlayerId];
  const isMyTurn = turnPlayerId === currentPlayerId;
  const landedTile = turnPlayer ? room.tiles[turnPlayer.position] : null;

  const [isRolling, setIsRolling] = useState(false);
  const prevDiceRef = useRef(room.dice);

  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Trigger 3D tumble shake animation when dice change (e.g. Bot or other player rolls)
  useEffect(() => {
    if (
      prevDiceRef.current[0] !== room.dice[0] ||
      prevDiceRef.current[1] !== room.dice[1]
    ) {
      prevDiceRef.current = room.dice;
      setIsRolling(true);
      const timer = setTimeout(() => setIsRolling(false), 650);
      return () => clearTimeout(timer);
    }
  }, [room.dice]);

  const handleRollClick = () => {
    if (isRolling) return;
    setIsRolling(true);
    sound.playDiceRoll();
    setTimeout(() => {
      onRoll();
      setTimeout(() => setIsRolling(false), 300);
    }, 450);
  };

  // Find the latest notable game action (buy, sell, rent, tax, trade, mortgage, jail, bankrupt)
  const latestActionLog = [...(room.logs || [])].reverse().find(log => {
    const text = log.text.toLowerCase();
    return (
      log.type === 'buy' ||
      log.type === 'trade' ||
      log.type === 'rent' ||
      log.type === 'bankrupt' ||
      log.type === 'jail' ||
      text.includes('bought') ||
      text.includes('sold') ||
      text.includes('trade') ||
      text.includes('paid $') ||
      text.includes('rent') ||
      text.includes('tax') ||
      text.includes('mortgag') ||
      text.includes('built a house') ||
      text.includes('bankrupt')
    );
  });

  const actionPlayer = latestActionLog?.playerId
    ? room.players[latestActionLog.playerId]
    : Object.values(room.players).find(p => latestActionLog?.text.includes(p.name));

  // Filter out noisy timer-tick logs
  const meaningfulLogs = (room.logs || []).filter(l => 
    !l.text.includes('Turn limit expired') && 
    !l.text.includes('time has expired')
  );

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [meaningfulLogs.length]);

  if (!turnPlayer) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-sm px-2 py-1 select-none gap-2">
      {/* 0. Top Action Notification Banner (On Top of Dominos) */}
      <div className="min-h-[34px] flex items-center justify-center w-full">
        {latestActionLog ? (
          <div
            key={latestActionLog.id}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1e1333]/95 hover:bg-[#281a44] border border-purple-500/40 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur-md max-w-[340px] sm:max-w-[380px] transition-all animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {actionPlayer ? (
              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-black/40 border border-white/30">
                <PlayerAvatar avatar={actionPlayer.isBot ? 'navy' : actionPlayer.avatar} color={actionPlayer.color} size={18} />
              </div>
            ) : (
              <span className="text-xs flex-shrink-0">🔔</span>
            )}
            <span className="text-[11px] sm:text-xs font-semibold text-purple-100 truncate tracking-wide">
              {latestActionLog.text.replace(/^[^\w\s]+/, '').trim()}
            </span>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* 1. Large 3D Dice with Realistic Shake & Tumble in Center */}
      <div className="flex flex-col items-center justify-center">
        <DiceView values={room.dice} isRolling={isRolling} />
      </div>

      {/* 2. Turn Status / Action Controls (Directly Under Dice) */}
      <div className="flex flex-col items-center justify-center min-h-[48px]">
        {isPieceMoving ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/30 rounded-full border border-purple-500/30">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 animate-ping"
              style={{ backgroundColor: turnPlayer.color }}
            />
            <span className="text-xs font-bold text-purple-200">
              {turnPlayer.name} is moving...
            </span>
          </div>
        ) : (
          <>
            {/* Phase 1: ROLL DICE */}
            {room.turnPhase === 'roll' && (
              <div className="flex flex-col items-center gap-1.5">
                {turnPlayer.inJail && isMyTurn && (
                  <button
                    onClick={onPayBail}
                    disabled={turnPlayer.cash < 50}
                    className="px-2.5 py-1 bg-amber-600/90 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow border border-amber-400/40 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Pay $50 Bail</span>
                  </button>
                )}

                {isMyTurn ? (
                  <button
                    onClick={handleRollClick}
                    disabled={isRolling}
                    className="px-7 py-2.5 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs tracking-wider uppercase rounded-2xl shadow-[0_4px_16px_rgba(236,72,153,0.5)] flex items-center gap-2 transition-all cursor-pointer border border-pink-400/50"
                  >
                    <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                    <span>Roll dice</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/25 rounded-full border border-purple-900/40">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 animate-ping"
                      style={{ backgroundColor: turnPlayer.color }}
                    />
                    <span className="text-xs font-bold text-gray-200">
                      {turnPlayer.name} is playing...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Phase 2: UNOWNED PROPERTY DECISION (Exact Richup 2 Side-by-Side Pill Buttons) */}
            {room.turnPhase === 'action' && landedTile && (
              <div className="flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                {isMyTurn ? (
                  <>
                    <button
                      onClick={onSkip}
                      className="px-5 py-2.5 bg-[#4c3e72] hover:bg-[#5d4d8a] active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow border border-purple-500/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>End turn</span>
                    </button>

                    <button
                      onClick={onBuy}
                      disabled={turnPlayer.cash < landedTile.price}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg border border-purple-400/50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Buy for ${landedTile.price}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/25 rounded-full border border-purple-900/40">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 animate-ping"
                      style={{ backgroundColor: turnPlayer.color }}
                    />
                    <span className="text-xs font-bold text-gray-200">
                      {turnPlayer.name} is playing...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Phase 3: END TURN */}
            {room.turnPhase === 'end' && (
              <div className="flex flex-col items-center gap-2 animate-in fade-in duration-200">
                {isMyTurn ? (
                  <button
                    onClick={onEndTurn}
                    className="px-6 py-2.5 bg-[#4c3e72] hover:bg-[#5d4d8a] active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow border border-purple-500/30"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>End turn</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/25 rounded-full border border-purple-900/40">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 animate-ping"
                      style={{ backgroundColor: turnPlayer.color }}
                    />
                    <span className="text-xs font-bold text-gray-200">
                      {turnPlayer.name} is playing...
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Live Activity Feed (Under Buttons with Smooth Scroll) */}
      <div className="w-full max-w-xs mt-1 flex flex-col">
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
              Live Activity
            </span>
          </div>
          <span className="text-[9px] text-gray-500 font-mono">buys • sells • trades</span>
        </div>

        <div
          ref={logsContainerRef}
          className="h-16 overflow-y-auto pr-1 space-y-1 text-[11px] leading-tight text-gray-300 font-sans border-t border-purple-900/30 pt-1"
        >
          {meaningfulLogs.slice(-15).map((log) => {
            const isBuy = log.type === 'buy';
            const isRent = log.type === 'rent';
            const isJail = log.type === 'jail';

            return (
              <div
                key={log.id}
                className={`flex items-start gap-1 py-0.5 px-1 rounded transition-colors ${
                  isBuy ? 'text-emerald-300 bg-emerald-950/20' :
                  isRent ? 'text-amber-300 bg-amber-950/20' :
                  isJail ? 'text-red-300 bg-red-950/20' : 'text-gray-300'
                }`}
              >
                <span className="flex-shrink-0 opacity-70">
                  {isBuy ? '🏠' : isRent ? '💰' : isJail ? '⚖️' : '◀'}
                </span>
                <span className="break-words line-clamp-2">
                  {log.text.replace(/^[^\w\s]+/, '').trim()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
