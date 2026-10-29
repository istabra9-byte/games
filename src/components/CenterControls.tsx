import React, { useState, useEffect, useRef } from 'react';
import { GameRoom, Tile } from '../types/game';
import { DiceView } from './DiceView';
import { PlayerAvatar } from './PlayerAvatar';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Dices, DollarSign, X, Home, ArrowRight, ShieldAlert } from 'lucide-react';
import stegLogo from '../assets/steg.png';
import sonedeLogo from '../assets/sonede.svg';

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
  onPayBail,
  onTileClick
}) => {
  const turnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
  const turnPlayer = room.players[turnPlayerId];
  const isMyTurn = turnPlayerId === currentPlayerId;
  const landedTile = turnPlayer ? room.tiles[turnPlayer.position] : null;

  const logsContainerRef = useRef<HTMLDivElement>(null);

  if (!turnPlayer) return null;

  // Filter out redundant logs
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

      {/* 2. Turn Status / Action Control (Right Under Dice) */}
      <div className="flex flex-col items-center justify-center min-h-[46px]">
        {isPieceMoving ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-black/30 rounded-full border border-purple-500/30">
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
                    className="px-6 sm:px-8 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl sm:rounded-2xl shadow-[0_4px_16px_rgba(236,72,153,0.5)] flex items-center gap-2 transition-all cursor-pointer border border-pink-400/50"
                  >
                    <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>ROLL DICE</span>
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

            {/* Phase 2: UNOWNED PROPERTY DECISION (BUY OR SKIP) */}
            {room.turnPhase === 'action' && landedTile && (
              <div className="w-full max-w-[270px] bg-[#1a1228] border-2 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl flex flex-col text-center animate-in zoom-in-95 fade-in duration-200">
                <div
                  className="py-1 px-3 text-white font-bold text-xs uppercase tracking-wide flex items-center justify-between"
                  style={{
                    backgroundColor: landedTile.ownerId && room.players[landedTile.ownerId]
                      ? room.players[landedTile.ownerId].color
                      : '#2a1e45'
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {landedTile.name.toUpperCase().includes('STEG') ? (
                      <img src={stegLogo} alt="STEG" className="w-5 h-4 object-contain rounded-[2px]" />
                    ) : landedTile.name.toUpperCase().includes('SONEDE') ? (
                      <img src={sonedeLogo} alt="SONEDE" className="w-5 h-4 object-contain rounded-[2px]" />
                    ) : landedTile.countryCode ? (
                      <img
                        src={`https://flagcdn.com/w40/${landedTile.countryCode}.png`}
                        alt={landedTile.name}
                        className="w-5 h-3.5 rounded-[2px] shadow object-cover"
                      />
                    ) : landedTile.flag ? (
                      <span className="text-base leading-none">{landedTile.flag}</span>
                    ) : null}
                    <span>{landedTile.name}</span>
                  </div>
                  <span className="font-mono">${landedTile.price}</span>
                </div>

                <div className="p-1.5 space-y-0.5 text-[10px] font-mono text-gray-300 bg-[#140e21]">
                  <div className="flex justify-between">
                    <span>Base Rent:</span>
                    <span className="text-emerald-400">${landedTile.rent[0]}</span>
                  </div>
                  {landedTile.rent.length >= 6 && (
                    <div className="flex justify-between text-red-400 font-bold">
                      <span>Hotel Rent:</span>
                      <span>${landedTile.rent[5]}</span>
                    </div>
                  )}
                </div>

                {isMyTurn ? (
                  <div className="p-1.5 bg-[#1a1228] border-t border-purple-900/60 flex items-center gap-2">
                    <button
                      onClick={onBuy}
                      disabled={turnPlayer.cash < landedTile.price}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all shadow cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Buy (${landedTile.price})</span>
                    </button>

                    <button
                      onClick={onSkip}
                      className="flex-1 py-1.5 px-2 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-all shadow cursor-pointer border border-gray-500/40"
                    >
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      <span>Skip</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-1.5 text-xs text-gray-400 italic">
                    {turnPlayer.name} is deciding to buy or skip...
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
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
                  >
                    <span>END TURN</span>
                    <ArrowRight className="w-4 h-4" />
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

      {/* 3. Floating Clean Text Event Logs (Directly under turn action, scrollable up & down) */}
      <div className="w-full max-w-[310px] sm:max-w-[340px] mt-1 flex flex-col items-center">
        <div
          ref={logsContainerRef}
          className="w-full max-h-24 sm:max-h-28 overflow-y-auto space-y-1 px-2 py-1 text-center select-text scroll-smooth"
        >
          {meaningfulLogs.length > 0 ? (
            meaningfulLogs.map((log) => (
              <div
                key={log.id}
                className="text-[10px] sm:text-[11px] text-gray-300 font-medium leading-snug drop-shadow-sm"
              >
                {log.text}
              </div>
            ))
          ) : (
            <div className="text-[10px] text-gray-500 italic text-center">
              Game started! Good luck!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
