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

  // All meaningful game event logs (buys, sells, trades, rents, cards, bankruptcies)
  const meaningfulLogs = (room.logs || []).filter(l => Boolean(l && l.text));
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [room.logs?.length]);

  // Dynamic Event Notification Banner (Between top and center of game)
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    text: string;
    playerName: string;
    playerColor: string;
    playerAvatar: string;
    icon: string;
  } | null>(null);

  const lastNotifiedLogIdRef = useRef<string>('');

  useEffect(() => {
    const logs = room.logs || [];
    if (logs.length === 0) return;
    const latestLog = logs[logs.length - 1];

    // Filter to significant events: buy, monopoly, rent, build, tax, vacation, jail, trade
    const isSignificant =
      ['buy', 'rent', 'trade', 'jail', 'card', 'bankrupt'].includes(latestLog.type) ||
      latestLog.text.includes('monopoly') ||
      latestLog.text.includes('owns all states') ||
      latestLog.text.includes('bought') ||
      latestLog.text.includes('upgraded') ||
      latestLog.text.includes('rent') ||
      latestLog.text.includes('tax') ||
      latestLog.text.includes('Vacation');

    if (isSignificant && latestLog.id !== lastNotifiedLogIdRef.current) {
      lastNotifiedLogIdRef.current = latestLog.id;

      // Identify player: from playerId or matching name in text
      const player = latestLog.playerId && room.players[latestLog.playerId]
        ? room.players[latestLog.playerId]
        : Object.values(room.players).find(p => latestLog.text.includes(p.name));

      const color = player ? player.color : '#ec4899';
      const avatar = player ? player.avatar || player.name[0] : '🔔';
      const name = player ? player.name : '';

      // Determine appropriate icon
      let icon = '🔔';
      if (latestLog.text.includes('monopoly') || latestLog.text.includes('owns all states')) icon = '🎉';
      else if (latestLog.text.includes('upgraded') || latestLog.text.includes('HOTEL')) icon = '🏠';
      else if (latestLog.type === 'buy' || latestLog.text.includes('bought')) icon = '🏷️';
      else if (latestLog.text.includes('rent')) icon = '💸';
      else if (latestLog.text.includes('tax') || latestLog.text.includes('Tax')) icon = '💰';
      else if (latestLog.text.includes('Vacation')) icon = '🌴';
      else if (latestLog.type === 'trade') icon = '🤝';
      else if (latestLog.type === 'jail') icon = '⛓️';
      else if (latestLog.type === 'bankrupt') icon = '💥';

      // Clean message by stripping leading emojis from text
      const cleanText = latestLog.text.replace(/^[^\w\s]+/, '').trim();

      setActiveNotification({
        id: latestLog.id,
        text: cleanText,
        playerName: name,
        playerColor: color,
        playerAvatar: avatar,
        icon
      });

      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [room.logs, room.players]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-sm px-1 sm:px-2 py-0.5 sm:py-1 select-none">

      {/* Dynamic Event Notification (Between Top Turn Area and Center Dice) */}
      <div className="w-full flex items-center justify-center min-h-[30px] sm:min-h-[34px] my-0.5 px-1">
        {activeNotification && (
          <div
            key={activeNotification.id}
            className="w-auto max-w-[95%] sm:max-w-[320px] px-2.5 py-1 rounded-full sm:rounded-xl border-2 flex items-center gap-1.5 shadow-xl backdrop-blur-md animate-in slide-in-from-top-1 fade-in duration-300 overflow-hidden"
            style={{
              backgroundColor: `${activeNotification.playerColor}22`,
              borderColor: activeNotification.playerColor,
              boxShadow: `0 0 14px ${activeNotification.playerColor}40, inset 0 0 6px ${activeNotification.playerColor}15`
            }}
          >
            {/* Player Avatar Badge in their color */}
            <div className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center flex-shrink-0">
              <PlayerAvatar avatar={activeNotification.playerAvatar} color={activeNotification.playerColor} size={20} />
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0 text-[8.5px] sm:text-[9.5px] font-bold text-white truncate text-left leading-tight flex items-center gap-1">
              <span className="text-[9.5px] flex-shrink-0">{activeNotification.icon}</span>
              <span className="truncate">{activeNotification.text}</span>
            </div>

            {/* Pulsing colored dot */}
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-ping"
              style={{ backgroundColor: activeNotification.playerColor }}
            />
          </div>
        )}
      </div>

      {/* Center Dynamic Area (Dice / Actions / Deed Cards - Centered) */}
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
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl sm:rounded-2xl shadow-[0_6px_20px_rgba(236,72,153,0.5)] flex items-center gap-2 transition-all cursor-pointer border border-pink-400/50"
              >
                <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
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
            className="mt-2 px-3 py-1 bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:from-amber-400 hover:to-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg border border-amber-300/40 cursor-pointer animate-pulse"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Upgrade Houses 🏠 ({upgradableTiles.length} available)</span>
          </button>
        )}

        {/* Live Activity Text Feed (Scrollable, Exactly Under Roll Dice Button) */}
        <div className="w-full max-w-[290px] sm:max-w-[330px] mt-2.5 flex flex-col items-center">
          <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] text-purple-300 font-mono font-bold uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Activity</span>
            <span className="text-gray-500 text-[8px] font-normal">• scroll up/down to view</span>
          </div>

          <div
            ref={logsContainerRef}
            className="w-full max-h-24 sm:max-h-32 overflow-y-auto space-y-1 px-2.5 py-1.5 text-left bg-black/25 rounded-xl border border-purple-900/30 backdrop-blur-xs select-text shadow-inner"
          >
            {meaningfulLogs.length > 0 ? (
              meaningfulLogs.map((log) => (
                <div
                  key={log.id}
                  className="text-[8.5px] sm:text-[9.5px] text-gray-200 leading-snug flex items-start gap-1.5 break-words"
                >
                  <span className="text-[9px] flex-shrink-0 mt-0.5">
                    {log.type === 'buy' ? '🏠' : log.type === 'trade' ? '🤝' : log.type === 'rent' ? '💸' : log.type === 'jail' ? '⛓️' : '🎲'}
                  </span>
                  <span className="text-gray-300">
                    {log.text}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[8.5px] text-gray-500 italic text-center py-1">
                Roll the dice to start the game!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
