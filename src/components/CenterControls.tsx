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

// Country code mappings for crisp PNG flags
const COUNTRY_FLAG_MAP: Record<string, string> = {
  spain: 'es',
  brazil: 'br',
  italy: 'it',
  germany: 'de',
  china: 'cn',
  france: 'fr',
  'united kingdom': 'gb',
  uk: 'gb',
  'united states': 'us',
  usa: 'us',
  tunisia: 'tn',
  qatar: 'qa',
  uae: 'ae',
  emirates: 'ae',
  es: 'es',
  br: 'br',
  it: 'it',
  de: 'de',
  cn: 'cn',
  fr: 'fr',
  gb: 'gb',
  us: 'us',
  tn: 'tn',
  qa: 'qa',
  ae: 'ae'
};

// Helper to render log text with real PNG flag images instead of failing emoji glyphs on Windows
export const renderLogContent = (rawText: string, stripLeadingIcon: boolean = false): React.ReactNode => {
  let text = rawText;
  if (stripLeadingIcon) {
    text = text.replace(/^(?:[^\w\s\uD83C-\uDBFF\uDC00-\uDFFF]|🏠|💰|⚖️|🏛️|💥|🚨|💸|🌴|📜)\s*/u, '').trim();
  }

  // Regex matches:
  // 1. Unicode Regional Indicator flag pairs (e.g. 🇮🇹, 🇪🇸)
  // 2. Parenthesized countries: (Spain), (Italy), etc.
  // 3. [flag:xx] tags
  // 4. Raw 2-letter uppercase codes before known cities (e.g. "IT Venice", "ES Barcelona")
  const flagRegex = /([\u{1F1E6}-\u{1F1FF}]{2}|\((?:Spain|Brazil|Italy|Germany|China|France|United Kingdom|UK|United States|USA|Tunisia|Qatar|UAE|Emirates)\)|\[flag:[a-z]{2}\]|\b(?:IT|ES|BR|DE|CN|FR|GB|US|TN|QA|AE)\b(?=\s+[A-Z]))/giu;

  const parts = text.split(flagRegex);
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;

        // 1. Check Unicode Regional Indicator flag
        const codePoints = Array.from(part).map(c => c.codePointAt(0) || 0);
        if (
          codePoints.length === 2 &&
          codePoints[0] >= 0x1F1E6 && codePoints[0] <= 0x1F1FF &&
          codePoints[1] >= 0x1F1E6 && codePoints[1] <= 0x1F1FF
        ) {
          const c1 = String.fromCharCode(65 + codePoints[0] - 0x1F1E6);
          const c2 = String.fromCharCode(65 + codePoints[1] - 0x1F1E6);
          const countryCode = (c1 + c2).toLowerCase();
          return (
            <img
              key={index}
              src={`${cleanBase}/flags/${countryCode}.png`}
              alt={countryCode}
              className="inline-block w-[17px] h-[12px] object-cover rounded-[2px] mx-1 shadow-sm align-middle flex-shrink-0"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          );
        }

        // 2. Check parenthesized country names
        const parenMatch = part.match(/^\((Spain|Brazil|Italy|Germany|China|France|United Kingdom|UK|United States|USA|Tunisia|Qatar|UAE|Emirates)\)$/i);
        if (parenMatch) {
          const countryName = parenMatch[1].toLowerCase();
          const countryCode = COUNTRY_FLAG_MAP[countryName] || 'tn';
          return (
            <img
              key={index}
              src={`${cleanBase}/flags/${countryCode}.png`}
              alt={countryCode}
              className="inline-block w-[17px] h-[12px] object-cover rounded-[2px] mx-1 shadow-sm align-middle flex-shrink-0"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          );
        }

        // 3. Check [flag:xx]
        const tagMatch = part.match(/^\[flag:([a-z]{2})\]$/i);
        if (tagMatch) {
          const countryCode = tagMatch[1].toLowerCase();
          return (
            <img
              key={index}
              src={`${cleanBase}/flags/${countryCode}.png`}
              alt={countryCode}
              className="inline-block w-[17px] h-[12px] object-cover rounded-[2px] mx-1 shadow-sm align-middle flex-shrink-0"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          );
        }

        // 4. Check raw 2-letter uppercase codes matching countries
        const codeUpper = part.trim().toLowerCase();
        if (COUNTRY_FLAG_MAP[codeUpper] && part.trim().length === 2 && part === part.toUpperCase()) {
          const countryCode = COUNTRY_FLAG_MAP[codeUpper];
          return (
            <img
              key={index}
              src={`${cleanBase}/flags/${countryCode}.png`}
              alt={countryCode}
              className="inline-block w-[17px] h-[12px] object-cover rounded-[2px] mx-1 shadow-sm align-middle flex-shrink-0"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

export const formatLogText = renderLogContent;

// Helper to render notification banner with player name in their chosen color
const renderNotificationText = (rawText: string, players: Record<string, any>): React.ReactNode => {
  let text = rawText.replace(/^(?:[^\w\s\uD83C-\uDBFF\uDC00-\uDFFF]|🏠|💰|⚖️|🏛️|💥|🚨|💸|🌴|📜)\s*/u, '').trim();

  // Find all players sorted by name length descending
  const playerList = Object.values(players)
    .filter((p: any) => Boolean(p && p.name))
    .sort((a: any, b: any) => b.name.length - a.name.length);

  if (playerList.length === 0) {
    return renderLogContent(text, false);
  }

  // Create regex matching any player name
  const escapedNames = playerList.map((p: any) => p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const playerRegex = new RegExp(`(${escapedNames.join('|')})`, 'g');

  const parts = text.split(playerRegex);

  return (
    <>
      {parts.map((part, idx) => {
        const matchedPlayer = playerList.find((p: any) => p.name === part);
        if (matchedPlayer) {
          return (
            <span
              key={idx}
              className="font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] mr-1 flex-shrink-0"
              style={{ color: matchedPlayer.color || '#a855f7' }}
            >
              {matchedPlayer.name}
            </span>
          );
        }
        return <React.Fragment key={idx}>{renderLogContent(part, false)}</React.Fragment>;
      })}
    </>
  );
};

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
  const [isRollDismissed, setIsRollDismissed] = useState(false);
  const prevDiceRef = useRef(room.dice);

  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Trigger 3D tumble shake animation when dice change (e.g. Bot or other player rolls)
  useEffect(() => {
    if (
      prevDiceRef.current[0] !== room.dice[0] ||
      prevDiceRef.current[1] !== room.dice[1]
    ) {
      prevDiceRef.current = room.dice;
      setIsRollDismissed(true);
      setIsRolling(true);
      const timer = setTimeout(() => setIsRolling(false), 650);
      return () => clearTimeout(timer);
    }
  }, [room.dice]);

  // Reset roll dismissal once piece movement has finished so post-landing notifications can show
  useEffect(() => {
    if (!isPieceMoving && !isRolling) {
      setIsRollDismissed(false);
    }
  }, [isPieceMoving, isRolling, room.logs?.length]);

  const handleRollClick = () => {
    if (isRolling) return;
    // Disappear the top player notification banner the EXACT MOMENT the roll dice button is hit
    setIsRollDismissed(true);
    setIsRolling(true);
    sound.playDiceRoll();
    setTimeout(() => {
      onRoll();
      setTimeout(() => setIsRolling(false), 300);
    }, 450);
  };

  // Only consider logs from the current roll onwards (prior turn notifications disappear when next player rolls)
  const currentRollLogs = room.lastRollLogIndex !== undefined && room.lastRollLogIndex >= 0
    ? (room.logs || []).slice(room.lastRollLogIndex)
    : (room.logs || []);

  const shouldShowNotification = !isRollDismissed && !isRolling && !isPieceMoving;

  // Find the latest notable game action (buy, sell, rent, tax, trade, mortgage, jail, bankrupt)
  const latestActionLog = shouldShowNotification ? [...currentRollLogs].reverse().find(log => {
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
  }) : null;

  const actionPlayer = latestActionLog?.playerId
    ? room.players[latestActionLog.playerId]
    : Object.values(room.players).find(p => latestActionLog?.text.includes(p.name));

  // Filter out noisy roll, turn-announcement, and timer-tick logs per user request
  const meaningfulLogs = (room.logs || []).filter(l => {
    const text = l.text.toLowerCase();
    if (l.type === 'roll' || text.includes(' rolled ')) return false;
    if (text.includes("'s turn") || text.includes('turn of') || text.startsWith("it's now ")) return false;
    if (text.includes('turn limit expired') || text.includes('time has expired')) return false;
    return true;
  });

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [meaningfulLogs.length]);

  if (!turnPlayer) return null;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-sm sm:max-w-md px-2 pt-1 pb-0.5 select-none relative">
      {/* 0. Top Action Notification Banner (Elevated Higher to Top of Center Stage) */}
      <div className="w-full flex items-center justify-center min-h-[36px] flex-shrink-0 pt-0.5 mb-0.5">
        {latestActionLog ? (
          <div
            key={latestActionLog.id}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#1e1333]/95 hover:bg-[#281a44] border border-purple-500/40 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.65)] backdrop-blur-md max-w-[340px] sm:max-w-[380px] transition-all animate-in fade-in slide-in-from-top-3 duration-300"
          >
            {actionPlayer ? (
              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-black/40 border border-white/30">
                <PlayerAvatar avatar={actionPlayer.isBot ? 'navy' : actionPlayer.avatar} color={actionPlayer.color} size={18} />
              </div>
            ) : (
              <span className="text-xs flex-shrink-0">🔔</span>
            )}
            <span className="text-[11.5px] sm:text-xs font-semibold text-purple-100 truncate tracking-wide inline-flex items-center">
              {renderNotificationText(latestActionLog.text, room.players)}
            </span>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* 1. Large 3D Dice with Realistic Shake & Tumble + Turn Action Controls */}
      <div className="flex flex-col items-center justify-center my-auto gap-1.5 flex-shrink-0 py-1">
        <div className="flex flex-col items-center justify-center">
          <DiceView values={room.dice} isRolling={isRolling} />
        </div>

        {/* 2. Turn Status / Action Controls (Directly Under Dice) */}
        <div className="flex flex-col items-center justify-center min-h-[46px]">
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
      </div>

      {/* 3. Activity Feed Logs (Appears from under the action button down into the border of the bottom tiles) */}
      <div
        ref={logsContainerRef}
        className="w-full max-w-[340px] sm:max-w-[400px] flex-1 min-h-[85px] max-h-[175px] overflow-y-auto px-2.5 py-1.5 space-y-1 text-[11px] leading-tight text-gray-300 font-sans bg-black/35 rounded-xl border border-purple-900/40 shadow-inner mt-1 mb-0.5 no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {meaningfulLogs.slice(-20).map((log) => {
          const isBuy = log.type === 'buy';
          const isRent = log.type === 'rent';
          const isJail = log.type === 'jail';

          return (
            <div
              key={log.id}
              className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded transition-colors ${
                isBuy ? 'text-emerald-300 bg-emerald-950/25' :
                isRent ? 'text-amber-300 bg-amber-950/25' :
                isJail ? 'text-red-300 bg-red-950/25' : 'text-gray-300'
              }`}
            >
              <span className="flex-shrink-0 opacity-70 text-[10px]">
                {isBuy ? '🏠' : isRent ? '💰' : isJail ? '⚖️' : '◀'}
              </span>
              <span className="break-words line-clamp-2 inline-flex items-center flex-wrap">
                {renderNotificationText(log.text, room.players)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
