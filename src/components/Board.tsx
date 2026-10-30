import React, { useState, useEffect, useRef } from 'react';
import { Tile, Player, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Plane, Zap, Droplets, HelpCircle, Gift, AlertTriangle, Shield, Palmtree, ArrowRight, Skull, Gem, Percent, ShoppingCart, Check } from 'lucide-react';
import { sound } from '../services/sound';
import { PlayerAvatar } from './PlayerAvatar';
import stegLogo from '../assets/steg.png';
import sonedeLogo from '../assets/sonede.svg';
import tunisairLogo from '../assets/tunisair.svg';
import qatarLogo from '../assets/qatarairways.svg';
import nouvelairLogo from '../assets/nouvelair.svg';
import emiratesLogo from '../assets/emirates.svg';

interface BoardProps {
  room: GameRoom;
  currentPlayerId?: string;
  onTileClick?: (tile: Tile) => void;
  centerContent?: React.ReactNode | ((props: { isPieceMoving: boolean }) => React.ReactNode);
}

export function getGridPosition(index: number) {
  if (index === 0) {
    return { row: 1, col: 1, isCorner: true, cornerType: 'start' as const, side: 'corner' as const };
  } else if (index >= 1 && index <= 9) {
    return { row: 1, col: index + 1, isCorner: false, side: 'top' as const };
  } else if (index === 10) {
    return { row: 1, col: 11, isCorner: true, cornerType: 'jail' as const, side: 'corner' as const };
  } else if (index >= 11 && index <= 19) {
    return { row: index - 9, col: 11, isCorner: false, side: 'right' as const };
  } else if (index === 20) {
    return { row: 11, col: 11, isCorner: true, cornerType: 'vacation' as const, side: 'corner' as const };
  } else if (index >= 21 && index <= 29) {
    return { row: 11, col: 11 - (index - 20), isCorner: false, side: 'bottom' as const };
  } else if (index === 30) {
    return { row: 11, col: 1, isCorner: true, cornerType: 'go_to_jail' as const, side: 'corner' as const };
  } else {
    return { row: 11 - (index - 30), col: 1, isCorner: false, side: 'left' as const };
  }
}

export const Board: React.FC<BoardProps> = ({ room, currentPlayerId, onTileClick, centerContent }) => {
  const { tiles, players } = room;

  const [visualPositions, setVisualPositions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    Object.values(players).forEach(p => {
      init[p.id] = p.position;
    });
    return init;
  });

  const [movingPlayerIds, setMovingPlayerIds] = useState<Set<string>>(new Set());
  const animTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const currentTurnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
  const isPieceMoving = Boolean(
    movingPlayerIds.has(currentTurnPlayerId) ||
    (currentTurnPlayerId && visualPositions[currentTurnPlayerId] !== undefined && visualPositions[currentTurnPlayerId] !== room.players[currentTurnPlayerId]?.position)
  );

  // Prominent, non-bouncing, high-visibility player token renderer
  const renderPlayerToken = (p: Player, isCorner: boolean = false) => {
    const isMe = p.id === currentPlayerId;
    const isTurn = p.id === currentTurnPlayerId;
    const size = isCorner ? 'clamp(28px, 4.3cqi, 40px)' : 'clamp(26px, 3.8cqi, 36px)';

    return (
      <div
        key={p.id}
        className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-200 pointer-events-auto"
        title={`${p.name} ($${p.cash})`}
        style={{
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 5px ${p.color})`
        }}
      >
        {/* Active turn pulsing halo */}
        {isTurn && (
          <div
            className="absolute -inset-1 rounded-full ring-2 ring-white/90 animate-pulse pointer-events-none"
            style={{ boxShadow: `0 0 10px ${p.color}` }}
          />
        )}

        {/* Clear "YOU" indicator so player never loses their icon */}
        {isMe && (
          <span className="absolute -top-2.5 px-1 py-0.2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-[7.5px] sm:text-[8.5px] rounded-full shadow-lg border border-white tracking-wider leading-none z-40 pointer-events-none">
            YOU
          </span>
        )}

        {/* Large, stable avatar (no bounce) */}
        <PlayerAvatar avatar={p.isBot ? 'navy' : p.avatar} color={p.color} size={size} />
      </div>
    );
  };

  useEffect(() => {
    Object.values(players).forEach(p => {
      const currentVisual = visualPositions[p.id] ?? p.position;
      const targetPos = p.position;

      if (currentVisual !== targetPos) {
        // Direct teleportation to jail
        if (p.inJail && targetPos === 10) {
          if (animTimers.current[p.id]) {
            clearInterval(animTimers.current[p.id]);
            delete animTimers.current[p.id];
          }
          setVisualPositions(prev => ({ ...prev, [p.id]: 10 }));
          setMovingPlayerIds(prev => {
            const next = new Set(prev);
            next.delete(p.id);
            return next;
          });
          return;
        }

        if (!animTimers.current[p.id]) {
          setMovingPlayerIds(prev => new Set(prev).add(p.id));
          let currentStep = currentVisual;
          animTimers.current[p.id] = setInterval(() => {
            currentStep = (currentStep + 1) % 40;
            sound.playStep();
            setVisualPositions(prev => ({ ...prev, [p.id]: currentStep }));

            if (currentStep === targetPos) {
              clearInterval(animTimers.current[p.id]);
              delete animTimers.current[p.id];
              sound.playSelect();
              setMovingPlayerIds(prev => {
                const next = new Set(prev);
                next.delete(p.id);
                return next;
              });
            }
          }, 110);
        }
      }
    });

    return () => {
      Object.values(animTimers.current).forEach(t => clearInterval(t));
      animTimers.current = {};
    };
  }, [players]);

  const playersOnTile: Record<number, Player[]> = {};
  Object.values(players).forEach(p => {
    if (!p.isBankrupt) {
      const pos = visualPositions[p.id] ?? p.position;
      if (!playersOnTile[pos]) playersOnTile[pos] = [];
      playersOnTile[pos].push(p);
    }
  });

  return (
    <div
      className="responsive-board-wrapper relative bg-[#171328] rounded-2xl p-1 sm:p-1.5 md:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-[#261f3e] select-none flex flex-col justify-center m-auto"
    >
      <div
        className="w-full h-full gap-[2px] sm:gap-[3px] bg-[#110d1f] rounded-xl p-0.5 sm:p-1 relative"
        style={{
          display: 'grid',
          gridTemplateColumns: '2.1fr repeat(9, 1fr) 2.1fr',
          gridTemplateRows: '1.53fr repeat(9, 1fr) 1.53fr'
        }}
      >
        {tiles.map((tile) => {
          const { row, col, isCorner, cornerType, side } = getGridPosition(tile.index);
          const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;
          const owner = tile.ownerId ? players[tile.ownerId] : null;
          const playersHere = playersOnTile[tile.index] || [];
          const isOwned = Boolean(owner);
          const isHorizontal = side === 'left' || side === 'right';

          // Corner Tiles (Richup Exact Corners)
          if (isCorner) {
            return (
              <div
                key={tile.index}
                onClick={() => onTileClick && onTileClick(tile)}
                className="relative rounded-lg flex flex-col items-center justify-between overflow-hidden cursor-pointer bg-[#262a4c] border border-purple-900/40 p-1 shadow-inner hover:border-purple-400/60 transition-all select-none"
                style={{ gridRowStart: row, gridColumnStart: col }}
              >
                {/* 0: START */}
                {cornerType === 'start' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center">
                    <span
                      className="font-black tracking-wider text-[#a3e635] font-heading drop-shadow-[0_2px_10px_rgba(163,230,53,0.8)] leading-none"
                      style={{ fontSize: 'clamp(15px, 2.4cqi, 30px)' }}
                    >
                      START
                    </span>
                    <div className="flex items-center justify-center gap-0.5 mt-1 text-[#a3e635]">
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 'clamp(20px, 3.4cqi, 38px)', height: 'clamp(20px, 3.4cqi, 38px)' }}>
                        <polygon points="4 4 12 12 4 20 4 4" />
                        <polygon points="12 4 20 12 12 20 12 4" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 10: PASSING BY / IN PRISON */}
                {cornerType === 'jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-0.5 text-center relative">
                    <div className="flex flex-col items-center">
                      <span
                        className="font-black text-gray-300 uppercase tracking-tight"
                        style={{ fontSize: 'clamp(7.5px, 1.1cqi, 12px)' }}
                      >
                        Passing by
                      </span>
                      {/* Passing by tokens */}
                      {playersHere.filter(p => !p.inJail).length > 0 && (
                        <div className="flex items-center justify-center -space-x-2 mt-0.5 z-20">
                          {playersHere.filter(p => !p.inJail).map(p => renderPlayerToken(p, true))}
                        </div>
                      )}
                    </div>

                    <div className="w-[88%] h-[58%] bg-[#1d192d] rounded border border-purple-500/40 flex flex-col items-center justify-center p-0.5 shadow-inner relative overflow-hidden">
                      {/* Prison Bars Overlay */}
                      <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,#cbd5e1_3px,#cbd5e1_5px)]" />
                      <span
                        className="font-black text-purple-200 uppercase z-10 leading-none drop-shadow"
                        style={{ fontSize: 'clamp(8.5px, 1.25cqi, 14px)' }}
                      >
                        In Prison
                      </span>
                      {/* In Prison tokens */}
                      {playersHere.filter(p => p.inJail).length > 0 && (
                        <div className="flex items-center justify-center -space-x-2 mt-0.5 z-20">
                          {playersHere.filter(p => p.inJail).map(p => renderPlayerToken(p, true))}
                        </div>
                      )}
                    </div>
                    <div className="h-0.5" />
                  </div>
                )}

                {/* 20: VACATION */}
                {cornerType === 'vacation' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center gap-0.5">
                    <div style={{ fontSize: 'clamp(20px, 3.6cqi, 42px)' }}>
                      🏝️
                    </div>
                    <span
                      className="font-black text-white uppercase tracking-wider font-heading leading-tight"
                      style={{ fontSize: 'clamp(11px, 1.6cqi, 18px)' }}
                    >
                      Vacation
                    </span>
                    <span
                      className="font-semibold text-emerald-300 leading-none mt-0.5 font-mono"
                      style={{ fontSize: 'clamp(8px, 1.15cqi, 13px)' }}
                    >
                      ${room.pot || 0} on hold
                    </span>
                  </div>
                )}

                {/* 30: GO TO PRISON */}
                {cornerType === 'go_to_jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center gap-0.5">
                    <Skull
                      className="text-white drop-shadow"
                      style={{ width: 'clamp(20px, 3.4cqi, 38px)', height: 'clamp(20px, 3.4cqi, 38px)' }}
                    />
                    <span
                      className="font-black text-white uppercase font-heading leading-tight tracking-wider"
                      style={{ fontSize: 'clamp(10px, 1.45cqi, 16px)' }}
                    >
                      Go to prison
                    </span>
                  </div>
                )}

                {/* Player Tokens On Corner (Non-Jail) */}
                {cornerType !== 'jail' && playersHere.length > 0 && (
                  <div className="absolute bottom-1 inset-x-0 flex items-center justify-center -space-x-2 z-20 pointer-events-none">
                    {playersHere.map((p) => renderPlayerToken(p, true))}
                  </div>
                )}
              </div>
            );
          }

          // Edge Tiles (Top, Right, Bottom, Left)
          // 1. Outer Edge: Solid Owner Colored Bar OR Translucent Price Pill
          const renderOuterEdge = () => {
            if (isOwned && owner) {
              return (
                <div
                  className={`flex-shrink-0 flex items-center justify-center z-15 relative ${
                    side === 'top'
                      ? 'w-full h-2.5 sm:h-3 rounded-t-[6px]'
                      : side === 'bottom'
                      ? 'w-full h-2.5 sm:h-3 rounded-b-[6px]'
                      : side === 'left'
                      ? 'h-full w-2.5 sm:w-3 rounded-l-[6px]'
                      : 'h-full w-2.5 sm:w-3 rounded-r-[6px]'
                  }`}
                  style={{ backgroundColor: owner.color }}
                >
                  {/* House Cubes (sitting right on the owner bar) */}
                  {tile.houses > 0 && (
                    <div className="flex items-center gap-0.5">
                      {tile.houses < 5 ? (
                        Array.from({ length: tile.houses }).map((_, h) => (
                          <div key={h} className="w-1.5 h-1.5 bg-emerald-300 rounded-[1px] shadow-sm border border-emerald-900" />
                        ))
                      ) : (
                        <div className="w-2.5 h-2 bg-red-500 rounded-[1px] shadow border border-red-900 text-[6px] font-black text-white flex items-center justify-center">
                          H
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Unowned: Translucent price badge
            if (tile.price > 0) {
              return (
                <div className="flex items-center justify-center flex-shrink-0 z-10 p-0.5">
                  <div
                    className="px-1 py-0.5 rounded bg-white/20 text-white font-mono font-bold leading-none shadow-sm"
                    style={{ fontSize: isHorizontal ? 'clamp(7.5px, 1.1cqi, 11.5px)' : 'clamp(8.5px, 1.25cqi, 13px)' }}
                  >
                    {tile.price} $
                  </div>
                </div>
              );
            }

            if (tile.type === 'tax') {
              return (
                <div className="flex items-center justify-center flex-shrink-0 z-10 p-0.5">
                  <div
                    className="px-1 py-0.5 rounded bg-amber-500/30 border border-amber-400/40 text-amber-300 font-mono font-bold leading-none"
                    style={{ fontSize: isHorizontal ? 'clamp(7.5px, 1.05cqi, 11px)' : 'clamp(8px, 1.15cqi, 12px)' }}
                  >
                    {tile.name.includes('Earnings') ? '%10' : '$75'}
                  </div>
                </div>
              );
            }

            return <div className="h-2 flex-shrink-0" />;
          };

          // 2. Circular Flag or Special Space Icon (Inner Edge)
          const renderInnerIcon = () => {
            const iconSizeStyle = {
              width: isHorizontal ? 'clamp(19px, 2.6cqi, 28px)' : 'clamp(22px, 3.2cqi, 34px)',
              height: isHorizontal ? 'clamp(19px, 2.6cqi, 28px)' : 'clamp(22px, 3.2cqi, 34px)'
            };

            return (
              <div className="flex items-center justify-center flex-shrink-0 z-10 p-0.5">
                {tile.countryCode && tile.type === 'property' ? (
                  <div
                    className="rounded-full overflow-hidden border-[1.5px] border-white/90 shadow-md flex items-center justify-center bg-black/40 flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    <img
                      src={`https://flagcdn.com/w40/${tile.countryCode}.png`}
                      alt={tile.name}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      style={
                        tile.countryCode === 'cn'
                          ? { objectPosition: '0% 0%', transform: 'scale(1.4) translate(10%, 10%)' }
                          : tile.countryCode === 'us'
                          ? { objectPosition: '10% 20%', transform: 'scale(1.2)' }
                          : { transform: 'scale(1.15)' }
                      }
                    />
                  </div>
                ) : tile.type === 'railroad' ? (
                  (() => {
                    let airportLogo = null;
                    const uName = tile.name.toUpperCase();
                    if (tile.index === 5 || uName.includes('TUNIS') || uName.includes('CARTHAGE') || uName.includes('MAD')) {
                      airportLogo = tunisairLogo;
                    } else if (tile.index === 15 || uName.includes('QATAR') || uName.includes('MUC')) {
                      airportLogo = qatarLogo;
                    } else if (tile.index === 25 || uName.includes('NOUVELAIR') || uName.includes('CDG')) {
                      airportLogo = nouvelairLogo;
                    } else if (tile.index === 35 || uName.includes('EMIRATES') || uName.includes('JFK')) {
                      airportLogo = emiratesLogo;
                    }

                    return (
                      <div
                        className="rounded-full overflow-hidden border-[1.5px] border-white/90 shadow-md flex items-center justify-center flex-shrink-0 bg-white"
                        style={iconSizeStyle}
                      >
                        {airportLogo ? (
                          <img
                            src={airportLogo}
                            alt={tile.name}
                            className="w-full h-full object-cover select-none pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                            <Plane className="w-[60%] h-[60%] text-sky-200" />
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : tile.type === 'utility' ? (
                  <div
                    className="rounded-full overflow-hidden border-[1.5px] border-white/90 shadow-md flex items-center justify-center flex-shrink-0 bg-white p-0.5"
                    style={iconSizeStyle}
                  >
                    {tile.name.toUpperCase().includes('POWER') || tile.name.toUpperCase().includes('STEG') ? (
                      <img
                        src={stegLogo}
                        alt="STEG"
                        className="w-full h-full object-contain select-none pointer-events-none"
                      />
                    ) : (
                      <img
                        src={sonedeLogo}
                        alt="SONEDE"
                        className="w-full h-full object-contain select-none pointer-events-none"
                      />
                    )}
                  </div>
                ) : tile.type === 'chest' ? (
                  <div
                    className="rounded-full bg-amber-950/80 border-[1.5px] border-amber-500/80 shadow flex items-center justify-center font-bold text-amber-300 flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    🎁
                  </div>
                ) : tile.type === 'chance' ? (
                  <div
                    className="rounded-full bg-pink-950/80 border-[1.5px] border-pink-500/80 shadow flex items-center justify-center font-black text-pink-300 flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    ?
                  </div>
                ) : tile.type === 'tax' ? (
                  <div
                    className="rounded-full bg-amber-950/80 border-[1.5px] border-amber-400/70 shadow flex items-center justify-center flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    {tile.name.includes('Earnings') ? (
                      <Percent className="w-[58%] h-[58%] text-amber-300" />
                    ) : (
                      <Gem className="w-[58%] h-[58%] text-sky-300" />
                    )}
                  </div>
                ) : tile.flag ? (
                  <span style={{ fontSize: 'clamp(16px, 2.4cqi, 28px)' }}>{tile.flag}</span>
                ) : null}
              </div>
            );
          };

          // 3. Title / City Name (Clean, Bold, Upright font matching Richup)
          const nameLabel = (
            <div className="flex-1 flex justify-center items-center text-center z-10 relative min-w-0 px-0.5 w-full overflow-hidden">
              <span
                className="font-heading font-black text-white select-none text-center leading-[1.05] tracking-tight max-w-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: isHorizontal
                    ? 'clamp(10px, 1.4cqi, 15px)'
                    : 'clamp(10.5px, 1.5cqi, 15px)',
                  textRendering: 'optimizeLegibility',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
                title={tile.name}
              >
                {tile.name}
              </span>
            </div>
          );

          return (
            <div
              key={tile.index}
              onClick={() => onTileClick && onTileClick(tile)}
              className="relative rounded-[7px] flex overflow-hidden cursor-pointer transition-all duration-150 select-none bg-[#262a4c] border border-purple-900/40 hover:border-purple-400/60 shadow-sm"
              style={{
                gridRowStart: row,
                gridColumnStart: col,
                ...(isOwned && owner
                  ? {
                      boxShadow: `inset 0 0 25px 2px ${owner.color}35`,
                      borderColor: `${owner.color}60`
                    }
                  : {})
              }}
            >
              {isHorizontal ? (
                /* Horizontal Layout for Left & Right Column Tiles */
                <div className={`w-full h-full flex items-center justify-between z-10 ${
                  side === 'left' ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  {renderOuterEdge()}
                  {nameLabel}
                  {renderInnerIcon()}
                </div>
              ) : (
                /* Vertical Layout for Top & Bottom Row Tiles */
                <div className={`w-full h-full flex items-center justify-between z-10 ${
                  side === 'top' ? 'flex-col' : 'flex-col-reverse'
                }`}>
                  {renderOuterEdge()}
                  {nameLabel}
                  {renderInnerIcon()}
                </div>
              )}

              {/* Mortgaged Overlay */}
              {tile.isMortgaged && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] flex items-center justify-center z-25">
                  <span className="text-[7.5px] sm:text-[9px] font-black text-red-400 uppercase -rotate-12 border border-red-500/80 px-1 py-0.5 rounded bg-red-950/90 shadow">
                    MORTGAGED
                  </span>
                </div>
              )}

              {/* Player Tokens On Tile (Non-bouncing, prominent with "YOU" badge and clean spacing) */}
              {playersHere.length > 0 && (
                <div
                  className={`absolute z-30 pointer-events-none flex items-center justify-center ${
                    side === 'top'
                      ? 'bottom-1 inset-x-0 flex-row -space-x-2'
                      : side === 'bottom'
                      ? 'top-1 inset-x-0 flex-row -space-x-2'
                      : side === 'left'
                      ? 'right-1 inset-y-0 flex-col -space-y-2'
                      : 'left-1 inset-y-0 flex-col -space-y-2'
                  }`}
                >
                  {playersHere.map((p) => renderPlayerToken(p, false))}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Board Stage */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-[#130f1d] rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-inner">
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {typeof centerContent === 'function' ? centerContent({ isPieceMoving }) : centerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
