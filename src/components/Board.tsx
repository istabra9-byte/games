import React, { useState, useEffect, useRef } from 'react';
import { Tile, Player, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Plane, Zap, Droplets, HelpCircle, Gift, AlertTriangle, Shield, Palmtree, ArrowRight, Skull, Gem, Percent } from 'lucide-react';
import { sound } from '../services/sound';

interface BoardProps {
  room: GameRoom;
  onTileClick?: (tile: Tile) => void;
  centerContent?: React.ReactNode;
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

export const Board: React.FC<BoardProps> = ({ room, onTileClick, centerContent }) => {
  const { tiles, players } = room;

  const [visualPositions, setVisualPositions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    Object.values(players).forEach(p => {
      init[p.id] = p.position;
    });
    return init;
  });

  const animTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    Object.values(players).forEach(p => {
      const currentVisual = visualPositions[p.id] ?? p.position;
      const targetPos = p.position;

      if (currentVisual !== targetPos && !animTimers.current[p.id]) {
        let currentStep = currentVisual;
        animTimers.current[p.id] = setInterval(() => {
          currentStep = (currentStep + 1) % 40;
          sound.playStep();
          setVisualPositions(prev => ({ ...prev, [p.id]: currentStep }));

          if (currentStep === targetPos) {
            clearInterval(animTimers.current[p.id]);
            delete animTimers.current[p.id];
          }
        }, 110);
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
      className="relative aspect-square max-h-full max-w-full bg-[#120d1f] rounded-2xl p-1 sm:p-2 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-[#2b1f45] select-none flex flex-col justify-center"
      style={{
        height: '100%',
        width: 'auto',
        maxHeight: 'min(100%, calc(100vh - 4.25rem), 880px)',
        maxWidth: 'min(100%, calc(100vh - 4.25rem), 880px)',
        aspectRatio: '1 / 1'
      }}
    >
      <div
        className="w-full h-full gap-[2px] sm:gap-[3px] bg-[#0c0816] rounded-xl p-0.5 sm:p-1 relative"
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
                className="relative rounded-lg flex flex-col items-center justify-between overflow-hidden cursor-pointer bg-gradient-to-br from-[#241c38] to-[#1c152d] border border-purple-800/40 p-1 shadow-inner hover:border-purple-500/70 transition-all"
                style={{ gridRowStart: row, gridColumnStart: col }}
              >
                {/* 0: START */}
                {cornerType === 'start' && (
                  <div className="w-full h-full flex flex-col items-center justify-start p-1.5 text-center">
                    <span className="text-[15px] sm:text-lg font-black tracking-wider text-[#a8ff3e] font-heading drop-shadow-[0_2px_10px_rgba(168,255,62,0.7)]">
                      START
                    </span>
                  </div>
                )}

                {/* 10: PASSING BY / IN PRISON */}
                {cornerType === 'jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-1 text-center relative">
                    <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                      Passing by
                    </span>
                    <div className="w-4/5 h-3/5 bg-[#252a38] rounded-md border border-orange-500/40 flex flex-col items-center justify-center p-0.5 shadow-inner relative overflow-hidden">
                      {/* Prison Bars Overlay */}
                      <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#94a3b8_4px,#94a3b8_6px)]" />
                      <span className="text-[8px] sm:text-[9px] font-black text-orange-300 uppercase z-10">
                        In Prison
                      </span>
                    </div>
                    <div className="h-1" />
                  </div>
                )}

                {/* 20: VACATION */}
                {cornerType === 'vacation' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-1 text-center">
                    <div className="text-2xl sm:text-3xl drop-shadow">
                      🏝️
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-emerald-300 uppercase tracking-wider font-heading drop-shadow">
                      Vacation
                    </span>
                  </div>
                )}

                {/* 30: GO TO PRISON */}
                {cornerType === 'go_to_jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-1 text-center">
                    <Skull className="w-6 h-6 sm:w-7 sm:h-7 text-gray-200 drop-shadow mt-1" />
                    <span className="text-[9px] sm:text-[10.5px] font-black text-gray-200 uppercase font-heading leading-tight tracking-wider">
                      Go to prison
                    </span>
                  </div>
                )}

                {/* Player Tokens On Corner */}
                {playersHere.length > 0 && (
                  <div className="absolute bottom-1 inset-x-0 flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-20 pointer-events-none">
                    {playersHere.map((p) => (
                      <div
                        key={p.id}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[11px] font-black border-2 border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                        style={{ backgroundColor: p.color }}
                        title={`${p.name} ($${p.cash})`}
                      >
                        {p.avatar || p.name[0]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Edge Tiles (Top, Right, Bottom, Left)
          const isHorizontal = side === 'left' || side === 'right';

          return (
            <div
              key={tile.index}
              onClick={() => onTileClick && onTileClick(tile)}
              className={`relative rounded-md flex overflow-hidden cursor-pointer transition-all duration-150 border border-[#221a38] bg-gradient-to-br from-[#201934] to-[#171226] hover:from-[#2a2145] hover:to-[#201934] hover:border-purple-500/70 ${
                isHorizontal
                  ? side === 'left'
                    ? 'flex-row' // Outer price on left, flag on right
                    : 'flex-row-reverse' // Outer price on right, flag on left
                  : side === 'top'
                    ? 'flex-col' // Outer price on top, flag on bottom
                    : 'flex-col-reverse' // Outer price on bottom, flag on top
              }`}
              style={{ gridRowStart: row, gridColumnStart: col }}
            >
              {/* Outer Price / Special Icon Pill */}
              <div className={`flex items-center justify-center flex-shrink-0 p-0.5 z-10 ${
                isHorizontal ? (side === 'left' ? 'pl-0.5 sm:pl-1' : 'pr-0.5 sm:pr-1') : (side === 'top' ? 'pt-0.5 sm:pt-1' : 'pb-0.5 sm:pb-1')
              }`}>
                {tile.price > 0 ? (
                  <div className={`px-1 sm:px-1.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[7px] sm:text-[8px] md:text-[9px] font-mono font-bold text-white shadow-sm leading-none flex items-center justify-center ${
                    side === 'left' ? 'rotate-90' : side === 'right' ? '-rotate-90' : ''
                  }`}>
                    {tile.price}$
                  </div>
                ) : tile.type === 'tax' ? (
                  <div className={`px-1 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[7px] sm:text-[8px] font-mono font-bold text-amber-300 shadow-sm leading-none ${
                    side === 'left' ? 'rotate-90' : side === 'right' ? '-rotate-90' : ''
                  }`}>
                    {tile.name.includes('Earnings') ? '%10' : '$75'}
                  </div>
                ) : null}
              </div>

              {/* Middle Section: City Name & Special Center Graphics */}
              <div className="flex-1 flex flex-col justify-center items-center text-center z-10 relative overflow-visible min-w-0">
                {/* Special Icons */}
                {tile.type === 'chest' && (
                  <div className={`text-xl sm:text-2xl drop-shadow mb-0.5 ${
                    isHorizontal ? (side === 'left' ? '-rotate-90' : 'rotate-90') : ''
                  }`}>
                    📦
                  </div>
                )}
                {tile.type === 'chance' && (
                  <div className={`text-xl sm:text-2xl drop-shadow text-pink-400 font-black mb-0.5 ${
                    isHorizontal ? (side === 'left' ? '-rotate-90' : 'rotate-90') : ''
                  }`}>
                    ❓
                  </div>
                )}
                {tile.type === 'railroad' && (
                  <Plane className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-300 drop-shadow mb-0.5 ${
                    isHorizontal ? (side === 'left' ? '-rotate-90' : 'rotate-90') : ''
                  }`} />
                )}
                {tile.type === 'utility' && (
                  tile.name.includes('Water') ? (
                    <div className="text-lg sm:text-xl drop-shadow mb-0.5">🚰</div>
                  ) : (
                    <Zap className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-400 drop-shadow fill-amber-400 mb-0.5 ${
                      isHorizontal ? (side === 'left' ? '-rotate-90' : 'rotate-90') : ''
                    }`} />
                  )
                )}
                {tile.type === 'tax' && (
                  tile.name.includes('Earnings') ? (
                    <Percent className="w-3.5 h-3.5 text-amber-300 mb-0.5" />
                  ) : (
                    <Gem className="w-3.5 h-3.5 text-sky-300 mb-0.5" />
                  )
                )}

                {/* Tile Name */}
                <span
                  className={`font-black text-white drop-shadow select-none text-center ${
                    isHorizontal
                      ? 'tracking-tight leading-none'
                      : 'text-[7.5px] sm:text-[8.5px] md:text-[9.5px] leading-tight'
                  }`}
                  style={
                    isHorizontal
                      ? {
                          writingMode: 'vertical-rl',
                          transform: side === 'left' ? 'rotate(180deg)' : undefined,
                          fontSize: tile.name.length > 11 ? '8px' : '9px',
                          maxHeight: '48px',
                          display: 'inline-block'
                        }
                      : undefined
                  }
                >
                  {tile.name}
                </span>
              </div>

              {/* Inner Edge: Round Circular Country Flag */}
              <div className={`flex items-center justify-center flex-shrink-0 p-0.5 z-10 ${
                isHorizontal ? (side === 'left' ? 'pr-0.5 sm:pr-1' : 'pl-0.5 sm:pl-1') : (side === 'top' ? 'pb-0.5 sm:pb-1' : 'pt-0.5 sm:pt-1')
              }`}>
                {tile.countryCode ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-white/70 shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center bg-black/40">
                    <img
                      src={`https://flagcdn.com/w40/${tile.countryCode}.png`}
                      alt={tile.name}
                      className="w-full h-full object-cover select-none pointer-events-none scale-125"
                      loading="lazy"
                    />
                  </div>
                ) : tile.flag && tile.type === 'property' ? (
                  <span className="text-xs sm:text-sm drop-shadow">{tile.flag}</span>
                ) : null}
              </div>

              {/* House Indicators on Tile (Richup Green Houses / Red Hotel) */}
              {tile.houses > 0 && (
                <div className={`absolute z-20 flex gap-0.5 items-center justify-center pointer-events-none ${
                  isHorizontal
                    ? 'top-1 bottom-1 flex-col justify-center ' + (side === 'left' ? 'left-1' : 'right-1')
                    : 'left-1 right-1 flex-row justify-center ' + (side === 'top' ? 'top-1' : 'bottom-1')
                }`}>
                  {tile.houses < 5 ? (
                    Array.from({ length: tile.houses }).map((_, hIdx) => (
                      <div
                        key={hIdx}
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-sm shadow-md border border-emerald-950 flex items-center justify-center text-[6px] font-black text-emerald-950"
                        title={`${tile.houses} Houses`}
                      >
                        ▲
                      </div>
                    ))
                  ) : (
                    <div
                      className="px-1 py-0.5 bg-rose-600 rounded-sm shadow-lg border border-red-950 text-[7px] font-black text-white flex items-center gap-0.5"
                      title="Hotel"
                    >
                      🏨 H
                    </div>
                  )}
                </div>
              )}

              {/* Owner Indicator Strip (Corner Ribbon with player color) */}
              {owner && (
                <div
                  className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-bl shadow-md z-15"
                  style={{ backgroundColor: owner.color }}
                  title={`Owned by ${owner.name}`}
                />
              )}

              {/* Mortgaged Overlay */}
              {tile.isMortgaged && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] flex items-center justify-center z-25">
                  <span className="text-[7px] sm:text-[8px] font-black text-red-400 uppercase -rotate-12 border border-red-500/80 px-1 py-0.5 rounded bg-red-950/90 shadow">
                    MORTGAGED
                  </span>
                </div>
              )}

              {/* Player Tokens On Tile */}
              {playersHere.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-30 pointer-events-none">
                  {playersHere.map((p) => (
                    <div
                      key={p.id}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[11px] font-black border-2 border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.8)] transform hover:scale-125 transition-transform"
                      style={{ backgroundColor: p.color }}
                      title={`${p.name} ($${p.cash})`}
                    >
                      {p.avatar || p.name[0]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Board Stage */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-gradient-to-br from-[#151023] via-[#120c1d] to-[#0c0814] rounded-xl border border-purple-900/40 flex flex-col items-center justify-between p-2 sm:p-3 relative overflow-hidden shadow-inner">
          {/* Subtle Background Watermark */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none">
            <span className="text-8xl sm:text-9xl font-black text-white font-heading tracking-widest">
              RICHUP
            </span>
          </div>

          {/* Center Interactive Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {centerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
