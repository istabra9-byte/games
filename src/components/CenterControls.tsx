import React, { useEffect, useRef } from 'react';
import { GameRoom, Tile } from '../types/game';
import { DiceView } from './DiceView';
import { Dices, Check, ShoppingCart, ShieldAlert } from 'lucide-react';

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

  const logsContainerRef = useRef<HTMLDivElement>(null);

  if (!turnPlayer) return null;

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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-sm px-2 py-1 select-none gap-2">
      {/* 1. Large 3D Dice in Center */}
      <div className="flex flex-col items-center justify-center">
        <DiceView values={room.dice} isRolling={false} />
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
                    onClick={onRoll}
                    className="px-7 py-2.5 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black text-xs tracking-wider uppercase rounded-2xl shadow-[0_4px_16px_rgba(236,72,153,0.5)] flex items-center gap-2 transition-all cursor-pointer border border-pink-400/50"
                  >
                    <Dices className="w-4 h-4" />
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

      {/* 3. Floating Clean Text Event Logs (Centered, Scrollable, Smooth Fading) */}
      <div className="w-full max-w-[340px] mt-1 flex flex-col items-center">
        <div
          ref={logsContainerRef}
          className="w-full max-h-32 sm:max-h-36 overflow-y-auto space-y-1 px-1 py-1 text-center select-text scroll-smooth"
        >
          {meaningfulLogs.length > 0 ? (
            meaningfulLogs.map((log) => (
              <div
                key={log.id}
                className="text-[11px] text-gray-300 font-medium leading-snug drop-shadow-sm flex items-center justify-center gap-1.5 flex-wrap"
              >
                <span>{log.text}</span>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-gray-500 italic text-center">
              Game started with a randomized players order. Good luck!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
