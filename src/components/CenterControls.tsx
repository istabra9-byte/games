import React from 'react';
import { GameRoom, Tile } from '../types/game';
import { DiceView } from './DiceView';
import { TurnClock } from './TurnClock';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Dices, DollarSign, Palmtree, X, Home, ArrowRight, ShieldAlert } from 'lucide-react';
import stegLogo from '../assets/steg.png';
import sonedeLogo from '../assets/sonede.svg';

interface CenterControlsProps {
  room: GameRoom;
  currentPlayerId: string;
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
  onRoll,
  onBuy,
  onSkip,
  onEndTurn,
  onPayBail,
  onRequestTime,
  onTileClick
}) => {
  const turnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
  const turnPlayer = room.players[turnPlayerId];
  const isMyTurn = turnPlayerId === currentPlayerId;
  const landedTile = turnPlayer ? room.tiles[turnPlayer.position] : null;

  const remainingSec = Math.max(0, Math.floor((room.turnEndsAt - Date.now()) / 1000));

  if (!turnPlayer) return null;

  const groupMeta = landedTile && landedTile.group ? PROPERTY_GROUPS[landedTile.group] : null;

  // Find if current player owns any completed country monopoly that can be upgraded
  const upgradableTiles = room.tiles.filter((t) => {
    if (!t.group || t.group === 'station' || t.group === 'utility' || t.ownerId !== currentPlayerId) return false;
    const groupTiles = room.tiles.filter(tile => tile.group === t.group);
    const ownsAll = groupTiles.every(tile => tile.ownerId === currentPlayerId && !tile.isMortgaged);
    return ownsAll && t.houses < 5;
  });

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-sm px-1 sm:px-2 py-0.5 sm:py-1 select-none">
      {/* Brand Header & Vacation Pot */}
      <div className="flex flex-col items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-heading tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-400 to-purple-400 leading-none">
          RICHUP
        </h1>

        {room.settings.vacationCash && (
          <div className="mt-0.5 sm:mt-1 px-2 py-0.5 bg-emerald-950/70 border border-emerald-500/40 rounded-full flex items-center gap-1 shadow-sm">
            <Palmtree className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span className="text-[9px] sm:text-xs text-emerald-200 font-mono font-bold">
              Pot: ${room.pot}
            </span>
          </div>
        )}
      </div>

      {/* Active Turn Header + Turn Clock */}
      <div className="flex items-center justify-between w-full px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#1a1329]/80 rounded-lg sm:rounded-xl border border-purple-900/40 shadow-sm mt-0.5 sm:mt-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-sm text-white border sm:border-2 border-white/70 shadow flex-shrink-0"
            style={{ backgroundColor: turnPlayer.color }}
          >
            {turnPlayer.avatar || turnPlayer.name[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-sm font-bold text-white leading-tight truncate max-w-[90px] sm:max-w-[140px]">
              {turnPlayer.name} {isMyTurn ? '(You)' : ''}
            </span>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono font-bold">
              ${turnPlayer.cash} Cash
            </span>
          </div>
        </div>

        <TurnClock
          remainingSec={remainingSec}
          totalSec={room.settings.turnTimeLimit}
          isMyTurn={isMyTurn}
          onRequestTime={onRequestTime}
        />
      </div>

      {/* Center Dynamic Area (Dice / Actions / Deed Cards) */}
      <div className="my-auto w-full flex flex-col items-center justify-center py-1 sm:py-2">
        {/* Phase 1: ROLL DICE */}
        {room.turnPhase === 'roll' && (
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <DiceView values={room.dice} isRolling={false} />

            {turnPlayer.inJail && isMyTurn && (
              <button
                onClick={onPayBail}
                disabled={turnPlayer.cash < 50}
                className="px-2.5 py-1 bg-amber-600/90 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all shadow border border-amber-400/40 cursor-pointer"
              >
                <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Pay $50 Bail</span>
              </button>
            )}

            {isMyTurn ? (
              <button
                onClick={onRoll}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:to-red-500 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-[0_4px_15px_rgba(236,72,153,0.4)] flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer border border-pink-400/40"
              >
                <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>ROLL DICE</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-purple-300/80 font-medium italic animate-pulse text-center">
                <span>Waiting for {turnPlayer.name} to roll...</span>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: UNOWNED PROPERTY DECISION (BUY OR SKIP) */}
        {room.turnPhase === 'action' && landedTile && (
          <div className="w-full max-w-[280px] bg-[#1a1228] border-2 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl flex flex-col text-center">
            {/* Deed Header */}
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

            {/* Quick Rent preview */}
            <div className="p-2 space-y-1 text-[10px] font-mono text-gray-300 bg-[#140e21]">
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

            {/* Action Buttons: BUY vs SKIP */}
            {isMyTurn ? (
              <div className="p-2 bg-[#1a1228] border-t border-purple-900/60 flex items-center gap-2">
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
              <div className="p-2 text-xs text-gray-400 italic">
                {turnPlayer.name} is deciding to buy or skip...
              </div>
            )}
          </div>
        )}

        {/* Phase 3: END TURN */}
        {room.turnPhase === 'end' && (
          <div className="flex flex-col items-center gap-2">
            <DiceView values={room.dice} isRolling={false} />

            {isMyTurn ? (
              <button
                onClick={onEndTurn}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs tracking-wider uppercase rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
              >
                <span>END TURN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">
                {turnPlayer.name}'s turn is concluding...
              </span>
            )}
          </div>
        )}

        {/* Monopoly House Upgrade Shortcut */}
        {isMyTurn && upgradableTiles.length > 0 && onTileClick && (
          <button
            onClick={() => onTileClick(upgradableTiles[0])}
            className="mt-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:from-amber-400 hover:to-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg border border-amber-300/40 cursor-pointer animate-pulse"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Upgrade Houses 🏠 ({upgradableTiles.length} available)</span>
          </button>
        )}
      </div>

      {/* Footer Helper */}
      <div className="text-[10px] text-gray-400 font-medium">
        Click any property tile on the board to view mortgage or houses
      </div>
    </div>
  );
};
