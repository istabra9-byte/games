import React, { useState, useEffect, useRef } from 'react';
import { Tile, Player, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Plane, Zap, Droplets, HelpCircle, Gift, AlertTriangle, Shield, Palmtree, ArrowRight } from 'lucide-react';
import { sound } from '../services/sound';

interface BoardProps {
  room: GameRoom;
  onTileClick?: (tile: Tile) => void;
  centerContent?: React.ReactNode;
}

// Exact Richup tile placement:
// Tile 0: Top-Left (START)
// Tiles 1..9: Top Row (left to right)
// Tile 10: Top-Right (JAIL)
// Tiles 11..19: Right Column (top to bottom)
// Tile 20: Bottom-Right (VACATION)
// Tiles 21..29: Bottom Row (right to left)
// Tile 30: Bottom-Left (GO TO JAIL)
// Tiles 31..39: Left Column (bottom to top back to START)
export function getGridPosition(index: number) {
  if (index === 0) {
    return { row: 1, col: 1, isCorner: true, cornerType: 'start' };
  } else if (index >= 1 && index <= 9) {
    return { row: 1, col: index + 1, isCorner: false, side: 'top' };
  } else if (index === 10) {
    return { row: 1, col: 11, isCorner: true, cornerType: 'jail' };
  } else if (index >= 11 && index <= 19) {
    return { row: index - 9, col: 11, isCorner: false, side: 'right' };
  } else if (index === 20) {
    return { row: 11, col: 11, isCorner: true, cornerType: 'vacation' };
  } else if (index >= 21 && index <= 29) {
    return { row: 11, col: 11 - (index - 20), isCorner: false, side: 'bottom' };
  } else if (index === 30) {
    return { row: 11, col: 1, isCorner: true, cornerType: 'go_to_jail' };
  } else {
    return { row: 11 - (index - 30), col: 1, isCorner: false, side: 'left' };
  }
}

export const Board: React.FC<BoardProps> = ({ room, onTileClick, centerContent }) => {
  const { tiles, players } = room;

  // Animated positions for smooth stepping movement
  const [visualPositions, setVisualPositions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    Object.values(players).forEach(p => {
      init[p.id] = p.position;
    });
    return init;
  });

  const animTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Animate token movement when player position updates
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

  // Group players by visual position
  const playersOnTile: Record<number, Player[]> = {};
  Object.values(players).forEach(p => {
    if (!p.isBankrupt) {
      const pos = visualPositions[p.id] ?? p.position;
      if (!playersOnTile[pos]) playersOnTile[pos] = [];
      playersOnTile[pos].push(p);
    }
  });

  return (
    <div className="relative w-full aspect-square max-w-[780px] max-h-[780px] bg-[#171226] rounded-2xl p-1.5 sm:p-2.5 shadow-[0_12px_45px_rgba(0,0,0,0.85)] border border-[#2b1f45] select-none">
      <div className="grid grid-cols-11 grid-rows-11 w-full h-full gap-1 bg-[#100c1b] rounded-xl p-1 relative">
        {tiles.map((tile) => {
          const { row, col, isCorner, cornerType } = getGridPosition(tile.index);
          const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;
          const owner = tile.ownerId ? players[tile.ownerId] : null;
          const playersHere = playersOnTile[tile.index] || [];

          // Render Corner Tiles
          if (isCorner) {
            return (
              <div
                key={tile.index}
                onClick={() => onTileClick && onTileClick(tile)}
                className="relative rounded-lg flex flex-col items-center justify-between overflow-hidden cursor-pointer bg-gradient-to-br from-[#241c38] to-[#1c152d] border border-purple-850/60 p-1 shadow-inner hover:border-purple-500/60 transition-all"
                style={{ gridRowStart: row, gridColumnStart: col }}
              >
                {cornerType === 'start' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-0.5 text-center">
                    <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                      Collect $200
                    </span>
                    <div className="flex items-center justify-center gap-1 text-emerald-400">
                      <span className="text-[11px] sm:text-xs font-black tracking-widest font-heading">START</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-300">
                      +$200
                    </span>
                  </div>
                )}

                {cornerType === 'jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-0.5 text-center relative">
                    <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase">Just</span>
                    <div className="w-4/5 h-3/5 bg-[#2d3748] rounded border border-orange-500/50 flex flex-col items-center justify-center p-0.5 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#fff_4px,#fff_6px)]" />
                      <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400 z-10" />
                      <span className="text-[7px] sm:text-[8px] font-bold text-orange-300 uppercase z-10 leading-none">
                        In Jail
                      </span>
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase">Visiting</span>
                  </div>
                )}

                {cornerType === 'vacation' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-0.5 text-center">
                    <span className="text-[7px] sm:text-[8px] font-bold text-emerald-300 uppercase">Rest</span>
                    <Palmtree className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span className="text-[8px] sm:text-[9.5px] font-black text-emerald-300 uppercase font-heading">
                      Vacation
                    </span>
                  </div>
                )}

                {cornerType === 'go_to_jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-between p-0.5 text-center">
                    <span className="text-[7px] sm:text-[8px] font-bold text-red-400 uppercase">Police</span>
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse" />
                    <span className="text-[7.5px] sm:text-[9px] font-black text-red-400 uppercase font-heading leading-tight">
                      Go To Jail
                    </span>
                  </div>
                )}

                {/* Tokens on corner */}
                {playersHere.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-20 pointer-events-none ">
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

          // Render Normal Tiles (Properties, Airports, Utilities, Taxes, Bonus Cards)
          return (
            <div
              key={tile.index}
              onClick={() => onTileClick && onTileClick(tile)}
              className="relative rounded-md flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-150 border bg-gradient-to-br from-[#262a4c] to-[#1f223f] hover:from-[#2e3359] hover:to-[#262a4c] border-[#1d203b] hover:border-purple-500/70"
              style={{ gridRowStart: row, gridColumnStart: col }}
            >
              {/* Property Color Banner at Top of Tile */}
              {groupMeta ? (
                <div
                  className="w-full h-2.5 sm:h-3.5 flex items-center justify-center gap-0.5 border-b border-black/30 flex-shrink-0"
                  style={{ backgroundColor: groupMeta.color }}
                >
                  {/* Houses */}
                  {tile.houses > 0 && tile.houses < 5 && (
                    <div className="flex gap-0.5 items-center justify-center">
                      {Array.from({ length: tile.houses }).map((_, hIdx) => (
                        <div
                          key={hIdx}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-300 rounded-[2px] shadow-sm border border-emerald-950"
                          title={`${tile.houses} Houses`}
                        />
                      ))}
                    </div>
                  )}
                  {/* Hotel */}
                  {tile.houses === 5 && (
                    <div
                      className="w-3.5 h-2 sm:w-4 sm:h-2.5 bg-red-600 rounded-[2px] flex items-center justify-center text-[7px] font-black text-white shadow-sm border border-red-950"
                      title="Hotel"
                    >
                      H
                    </div>
                  )}
                </div>
              ) : (
                /* Non-property top icon spacer */
                <div className="pt-1 flex items-center justify-center flex-shrink-0">
                  {tile.type === 'railroad' && <Plane className="w-3.5 h-3.5 text-sky-300" />}
                  {tile.type === 'utility' && (
                    tile.name.includes('Water') ? (
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    )
                  )}
                  {tile.type === 'chance' && <HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
                  {tile.type === 'chest' && <Gift className="w-3.5 h-3.5 text-sky-400" />}
                  {tile.type === 'tax' && <span className="text-[8px] font-mono font-bold text-amber-400">TAX</span>}
                </div>
              )}

              {/* Owner Indicator Strip (Corner Ribbon) */}
              {owner && (
                <div
                  className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-bl-md shadow-md z-10"
                  style={{ backgroundColor: owner.color }}
                  title={`Owned by ${owner.name}`}
                />
              )}

              {/* Tile Label */}
              <div className="px-0.5 py-0 flex-1 flex flex-col items-center justify-center text-center overflow-hidden">
                <span className="text-[6.5px] sm:text-[7.5px] md:text-[8.5px] font-bold leading-none sm:leading-tight line-clamp-2 text-gray-100">
                  {tile.name}
                </span>
              </div>

              {/* Price Tag at Bottom */}
              {tile.price > 0 && (
                <div className="pb-0.5 text-center flex-shrink-0">
                  <span className="text-[7px] sm:text-[8.5px] font-mono font-bold text-emerald-400">
                    ${tile.price}
                  </span>
                </div>
              )}

              {/* Mortgaged Overlay */}
              {tile.isMortgaged && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <span className="text-[7px] sm:text-[8.5px] font-black text-red-400 uppercase -rotate-12 border border-red-500/80 px-1 py-0.5 rounded bg-red-950/90 shadow">
                    MORTGAGED
                  </span>
                </div>
              )}

              {/* Player Tokens On Tile */}
              {playersHere.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-30 pointer-events-none ">
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

        {/* Center Board Stage: row 2 to 10, col 2 to 10 */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-gradient-to-br from-[#151023] via-[#120c1d] to-[#0c0814] rounded-xl border border-purple-900/40 flex flex-col items-center justify-between p-2 sm:p-4 relative overflow-hidden shadow-inner">
          {/* Subtle Background Watermark */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none">
            <span className="text-8xl sm:text-9xl font-black text-white font-heading tracking-widest">
              RICHUP
            </span>
          </div>

          {/* Center Interactive Content (Dice, Controls, Deed Cards) */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {centerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
