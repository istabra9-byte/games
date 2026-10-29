import React, { useState, useEffect, useRef } from 'react';
import { Tile, Player, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Plane, Zap, Droplets, HelpCircle, Gift, AlertTriangle, Shield, Palmtree, ArrowRight, Skull, Gem, Percent } from 'lucide-react';
import { sound } from '../services/sound';
import { PlayerAvatar } from './PlayerAvatar';
import stegLogo from '../assets/steg.png';
import sonedeLogo from '../assets/sonede.svg';

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
        <PlayerAvatar avatar={p.avatar} color={p.color} size={size} />
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
      className="responsive-board-wrapper relative bg-[#120d1f] rounded-xl sm:rounded-2xl p-1 sm:p-1.5 md:p-2 shadow-[0_15px_45px_rgba(0,0,0,0.85)] border border-[#2b1f45] select-none flex flex-col justify-center m-auto"
    >
      <div
        className="w-full h-full gap-[1px] sm:gap-[2px] md:gap-[3px] bg-[#0c0816] rounded-lg sm:rounded-xl p-0.5 sm:p-1 relative"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.45fr repeat(9, 1fr) 1.45fr',
          gridTemplateRows: '1.45fr repeat(9, 1fr) 1.45fr'
        }}
      >
        {tiles.map((tile) => {
          const { row, col, isCorner, cornerType, side } = getGridPosition(tile.index);
          const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;
          const owner = tile.ownerId ? players[tile.ownerId] : null;
          const playersHere = playersOnTile[tile.index] || [];

          // Corner Tiles (Richup Exact Corners)
          if (isCorner) {
            return (
              <div
                key={tile.index}
                onClick={() => onTileClick && onTileClick(tile)}
                className="relative rounded sm:rounded-lg flex flex-col items-center justify-between overflow-hidden cursor-pointer bg-gradient-to-br from-[#241c38] to-[#1c152d] border border-purple-800/40 p-0.5 sm:p-1.5 shadow-inner hover:border-purple-500/70 transition-all select-none"
                style={{ gridRowStart: row, gridColumnStart: col }}
              >
                {/* 0: START */}
                {cornerType === 'start' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center">
                    <span
                      className="font-black tracking-wider text-[#a8ff3e] font-heading drop-shadow-[0_2px_8px_rgba(168,255,62,0.8)] leading-none"
                      style={{ fontSize: 'clamp(13px, 2.2cqi, 26px)' }}
                    >
                      START
                    </span>
                    <span className="mt-1" style={{ fontSize: 'clamp(18px, 3.2cqi, 38px)' }}>
                      🚀
                    </span>
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

                    <div className="w-[88%] h-[58%] bg-[#252a38] rounded border border-orange-500/50 flex flex-col items-center justify-center p-0.5 shadow-inner relative overflow-hidden">
                      {/* Prison Bars Overlay */}
                      <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,#94a3b8_3px,#94a3b8_5px)]" />
                      <span
                        className="font-black text-orange-300 uppercase z-10 leading-none"
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
                    <div style={{ fontSize: 'clamp(18px, 3.4cqi, 40px)' }}>
                      🏝️
                    </div>
                    <span
                      className="font-black text-emerald-300 uppercase tracking-wider font-heading leading-tight"
                      style={{ fontSize: 'clamp(10px, 1.5cqi, 17px)' }}
                    >
                      Vacation
                    </span>
                    <span
                      className="font-semibold text-emerald-200/90 leading-none mt-0.5"
                      style={{ fontSize: 'clamp(7.5px, 1.1cqi, 12px)' }}
                    >
                      ${room.pot || 0} on hold
                    </span>
                  </div>
                )}

                {/* 30: GO TO PRISON */}
                {cornerType === 'go_to_jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center gap-0.5">
                    <Skull
                      className="text-gray-200"
                      style={{ width: 'clamp(18px, 3.2cqi, 36px)', height: 'clamp(18px, 3.2cqi, 36px)' }}
                    />
                    <span
                      className="font-black text-gray-200 uppercase font-heading leading-tight tracking-wider"
                      style={{ fontSize: 'clamp(9px, 1.35cqi, 15px)' }}
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
          const isHorizontal = side === 'left' || side === 'right';
          const isOwned = Boolean(owner);

          // Price Pill Element
          const pricePill = (
            <div className="flex items-center justify-center flex-shrink-0 z-10">
              {tile.price > 0 ? (
                <div
                  className={`px-1 sm:px-1.5 py-0.5 rounded-full font-mono font-black shadow-sm leading-none flex items-center justify-center transition-all ${
                    isOwned && owner
                      ? 'text-white border border-white/60 font-black'
                      : 'bg-white/15 border border-white/25 text-white'
                  }`}
                  style={{
                    fontSize: 'clamp(8.5px, 1.25cqi, 13px)',
                    ...(isOwned && owner
                      ? { backgroundColor: owner.color, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }
                      : {})
                  }}
                >
                  {tile.price}$
                </div>
              ) : tile.type === 'tax' ? (
                <div
                  className="px-1 sm:px-1.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/50 font-mono font-black text-amber-300 shadow-sm leading-none"
                  style={{ fontSize: 'clamp(8px, 1.15cqi, 12px)' }}
                >
                  {tile.name.includes('Earnings') ? '%10' : '100$'}
                </div>
              ) : null}
            </div>
          );

          // Circular Flag or Special Icon Badge
          const iconBadge = (
            <div className="flex items-center justify-center flex-shrink-0 z-10">
              {tile.countryCode && tile.type === 'property' ? (
                <div
                  className="rounded-full overflow-hidden border-[1.5px] border-white/85 shadow-md flex items-center justify-center bg-black/40 flex-shrink-0"
                  style={{ width: 'clamp(21px, 3.2cqi, 38px)', height: 'clamp(21px, 3.2cqi, 38px)' }}
                >
                  <img
                    src={`https://flagcdn.com/w40/${tile.countryCode}.png`}
                    alt={tile.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={
                      tile.countryCode === 'cn'
                        ? { objectPosition: '0% 0%', transform: 'scale(1.4) translate(10%, 10%)', imageRendering: '-webkit-optimize-contrast' as any }
                        : tile.countryCode === 'us'
                        ? { objectPosition: '10% 20%', transform: 'scale(1.2)', imageRendering: '-webkit-optimize-contrast' as any }
                        : { transform: 'scale(1.15)', imageRendering: '-webkit-optimize-contrast' as any }
                    }
                    loading="lazy"
                  />
                </div>
              ) : tile.type === 'railroad' ? (
                <div
                  className="rounded-full bg-slate-900 border-[1.5px] border-sky-400/70 shadow-md flex items-center justify-center flex-shrink-0"
                  style={{ width: 'clamp(21px, 3.2cqi, 38px)', height: 'clamp(21px, 3.2cqi, 38px)' }}
                >
                  <Plane className="w-[58%] h-[58%] text-sky-200" />
                </div>
              ) : tile.type === 'utility' ? (
                tile.name.toUpperCase().includes('STEG') ? (
                  <div
                    className="rounded-full bg-slate-950 border-[1.5px] border-blue-400/80 shadow-md p-0.5 flex items-center justify-center flex-shrink-0"
                    style={{ width: 'clamp(23px, 3.5cqi, 40px)', height: 'clamp(23px, 3.5cqi, 40px)' }}
                  >
                    <img src={stegLogo} alt="STEG" className="w-full h-full object-contain" />
                  </div>
                ) : tile.name.toUpperCase().includes('SONEDE') ? (
                  <div
                    className="rounded-full bg-slate-950 border-[1.5px] border-cyan-400/80 shadow-md p-0.5 flex items-center justify-center flex-shrink-0"
                    style={{ width: 'clamp(23px, 3.5cqi, 40px)', height: 'clamp(23px, 3.5cqi, 40px)' }}
                  >
                    <img src={sonedeLogo} alt="SONEDE" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="rounded-full bg-amber-950/80 border-[1.5px] border-amber-400/70 shadow-md flex items-center justify-center flex-shrink-0"
                    style={{ width: 'clamp(21px, 3.2cqi, 38px)', height: 'clamp(21px, 3.2cqi, 38px)' }}
                  >
                    <Zap className="w-[58%] h-[58%] text-amber-300" />
                  </div>
                )
              ) : tile.type === 'chest' ? (
                <div
                  className="rounded-full bg-amber-950/80 border-[1.5px] border-amber-500/80 shadow-md flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 'clamp(21px, 3.2cqi, 38px)',
                    height: 'clamp(21px, 3.2cqi, 38px)',
                    fontSize: 'clamp(11.5px, 1.7cqi, 19px)'
                  }}
                >
                  🎁
                </div>
              ) : tile.type === 'chance' ? (
                <div
                  className="rounded-full bg-pink-950/80 border-[1.5px] border-pink-500/80 shadow-md flex items-center justify-center font-black text-pink-300 flex-shrink-0"
                  style={{
                    width: 'clamp(21px, 3.2cqi, 38px)',
                    height: 'clamp(21px, 3.2cqi, 38px)',
                    fontSize: 'clamp(13px, 1.9cqi, 21px)'
                  }}
                >
                  ?
                </div>
              ) : tile.type === 'tax' ? (
                <div
                  className="rounded-full bg-amber-950/80 border-[1.5px] border-amber-400/70 shadow-md flex items-center justify-center flex-shrink-0"
                  style={{ width: 'clamp(21px, 3.2cqi, 38px)', height: 'clamp(21px, 3.2cqi, 38px)' }}
                >
                  {tile.name.includes('Earnings') ? (
                    <Percent className="w-[58%] h-[58%] text-amber-300" />
                  ) : (
                    <Gem className="w-[58%] h-[58%] text-sky-300" />
                  )}
                </div>
              ) : tile.flag ? (
                <span style={{ fontSize: 'clamp(15px, 2.3cqi, 28px)' }}>{tile.flag}</span>
              ) : null}
            </div>
          );

          // Clean, Sharp Tile Name Element (No Ellipsis, Upright & Crisp)
          const hasSpace = tile.name.includes(' ');
          const nameLabel = (
            <div className="flex-1 flex justify-center items-center text-center z-10 relative min-w-0 px-0.5 w-full">
              <span
                className="font-black text-white select-none text-center leading-[1.08] tracking-tight max-w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: isHorizontal
                    ? (tile.name.length > 12 ? 'clamp(9.5px, 1.35cqi, 14px)' : tile.name.length > 9 ? 'clamp(10.5px, 1.45cqi, 15px)' : 'clamp(11.5px, 1.6cqi, 16.5px)')
                    : (tile.name.length >= 8 ? 'clamp(9px, 1.3cqi, 13.5px)' : 'clamp(10.5px, 1.45cqi, 15px)'),
                  whiteSpace: hasSpace ? 'normal' : 'nowrap',
                  textRendering: 'optimizeLegibility'
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
              className={`relative rounded-md flex overflow-hidden cursor-pointer transition-all duration-200 select-none ${
                isOwned
                  ? 'border-2 shadow-lg'
                  : 'border border-[#281f3d] bg-gradient-to-br from-[#1d162d] to-[#140f21] hover:from-[#261d3b] hover:to-[#1b142c] hover:border-purple-500/60'
              }`}
              style={{
                gridRowStart: row,
                gridColumnStart: col,
                ...(isOwned && owner
                  ? {
                      background: `linear-gradient(135deg, ${owner.color}3d 0%, ${owner.color}1f 50%, #130e1f 100%)`,
                      borderColor: owner.color,
                      boxShadow: `0 0 10px ${owner.color}45, inset 0 0 6px ${owner.color}20`
                    }
                  : {})
              }}
            >
              {isHorizontal ? (
                /* Horizontal Tiles (Left & Right Sides): Wide Rectangle Layout */
                <div className="w-full h-full flex flex-col justify-between items-center p-0.5 sm:p-1 gap-0.5">
                  <div className={`w-full flex items-center justify-between z-10 ${side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
                    {pricePill}
                    {iconBadge}
                  </div>
                  {nameLabel}
                </div>
              ) : (
                /* Vertical Tiles (Top & Bottom Rows): Tall Rectangle Layout */
                <div className={`w-full h-full flex items-center justify-between p-0.5 sm:p-1 gap-0.5 ${
                  side === 'top' ? 'flex-col' : 'flex-col-reverse'
                }`}>
                  {pricePill}
                  {nameLabel}
                  {iconBadge}
                </div>
              )}

              {/* House Indicators on Tile (Richup Green Houses / Red Hotel) */}
              {tile.houses > 0 && (
                <div className={`absolute z-20 flex gap-0.5 items-center justify-center pointer-events-none ${
                  isHorizontal
                    ? (side === 'left' ? 'left-3 sm:left-3.5 top-1 bottom-1 flex-col' : 'right-3 sm:right-3.5 top-1 bottom-1 flex-col')
                    : (side === 'top' ? 'top-3 sm:top-3.5 left-1 right-1 flex-row' : 'bottom-3 sm:bottom-3.5 left-1 right-1 flex-row')
                }`}>
                  {tile.houses < 5 ? (
                    Array.from({ length: tile.houses }).map((_, hIdx) => (
                      <div
                        key={hIdx}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-[2px] shadow-sm border border-emerald-950"
                        title={`${tile.houses} Houses`}
                      />
                    ))
                  ) : (
                    <div
                      className="px-1 py-0.5 bg-gradient-to-t from-rose-600 to-red-500 rounded-[2px] shadow border border-red-950 text-[6px] sm:text-[7px] font-black text-white leading-none tracking-tight"
                      title="Hotel"
                    >
                      HOTEL
                    </div>
                  )}
                </div>
              )}

              {/* Owner Indicator Strip & Badge */}
              {owner && (
                <div
                  className="absolute top-0 right-0 z-20 flex items-center justify-center rounded-bl px-0.5 py-0.5 shadow-md border-b border-l border-white/30"
                  style={{ backgroundColor: `${owner.color}dd` }}
                  title={`Owned by ${owner.name}`}
                >
                  <PlayerAvatar avatar={owner.avatar} color={owner.color} size={15} />
                </div>
              )}

              {/* Mortgaged Overlay */}
              {tile.isMortgaged && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] flex items-center justify-center z-25">
                  <span className="text-[7px] sm:text-[8px] font-black text-red-400 uppercase -rotate-12 border border-red-500/80 px-1 py-0.5 rounded bg-red-950/90 shadow">
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
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-gradient-to-br from-[#151023] via-[#120c1d] to-[#0c0814] rounded-xl border border-purple-900/40 flex flex-col items-center justify-between p-2 sm:p-3 relative overflow-hidden shadow-inner">
          {/* Center Interactive Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {typeof centerContent === 'function' ? centerContent({ isPieceMoving }) : centerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
