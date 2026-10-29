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

export function getGridPosition(index: number) {
  if (index >= 0 && index <= 10) {
    return { row: 11, col: 11 - index, side: 'bottom' };
  } else if (index >= 11 && index <= 20) {
    return { row: 11 - (index - 10), col: 1, side: 'left' };
  } else if (index >= 21 && index <= 30) {
    return { row: 1, col: index - 20 + 1, side: 'top' };
  } else {
    return { row: index - 30 + 1, col: 11, side: 'right' };
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

  // Animate token movement when player position updates in room
  useEffect(() => {
    Object.values(players).forEach(p => {
      const currentVisual = visualPositions[p.id] ?? p.position;
      const targetPos = p.position;

      if (currentVisual !== targetPos && !animTimers.current[p.id]) {
        // Step one tile by one tile
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

  // Group players by visual position for rendering on tiles
  const playersOnTile: Record<number, Player[]> = {};
  Object.values(players).forEach(p => {
    if (!p.isBankrupt) {
      const pos = visualPositions[p.id] ?? p.position;
      if (!playersOnTile[pos]) playersOnTile[pos] = [];
      playersOnTile[pos].push(p);
    }
  });

  const renderTileIcon = (tile: Tile) => {
    switch (tile.type) {
      case 'start':
        return (
          <div className="flex flex-col items-center justify-center text-emerald-400">
            <span className="text-[10px] sm:text-xs font-black tracking-widest leading-none">START</span>
            <span className="text-[7px] sm:text-[9px] font-mono font-bold text-gray-300">+$200</span>
          </div>
        );
      case 'jail':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
            <span className="text-[7px] sm:text-[8px] font-bold text-orange-300 uppercase leading-tight">In Jail</span>
          </div>
        );
      case 'vacation':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <Palmtree className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="text-[7px] sm:text-[8px] font-bold text-emerald-300 uppercase leading-tight">Vacation</span>
          </div>
        );
      case 'go_to_jail':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
            <span className="text-[7px] sm:text-[8px] font-bold text-red-400 uppercase leading-tight">Go To Jail</span>
          </div>
        );
      case 'railroad':
        return <Plane className="w-3 h-3 sm:w-4 sm:h-4 text-sky-300" />;
      case 'utility':
        return tile.name.includes('Water') ? (
          <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
        ) : (
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
        );
      case 'chance':
        return <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />;
      case 'chest':
        return <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-sky-400" />;
      case 'tax':
        return <span className="text-[8px] sm:text-[9px] font-mono font-bold text-amber-400">TAX</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[760px] max-h-[760px] bg-[#130f1d] rounded-2xl p-1.5 sm:p-2.5 shadow-[0_12px_45px_rgba(0,0,0,0.85)] border border-[#2b1f45] select-none">
      <div className="grid grid-cols-11 grid-rows-11 w-full h-full gap-1 bg-[#100c19] rounded-xl p-0.5 sm:p-1 relative">
        {tiles.map((tile) => {
          const { row, col, side } = getGridPosition(tile.index);
          const isCorner = tile.index === 0 || tile.index === 10 || tile.index === 20 || tile.index === 30;
          const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;
          const owner = tile.ownerId ? players[tile.ownerId] : null;
          const playersHere = playersOnTile[tile.index] || [];

          return (
            <div
              key={tile.index}
              onClick={() => onTileClick && onTileClick(tile)}
              className={`relative rounded-md flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-150 border ${
                isCorner
                  ? 'bg-[#1e162f] border-purple-800/60 shadow-inner'
                  : 'bg-[#181126] hover:bg-[#221836] border-[#291c40] hover:border-purple-500/70'
              }`}
              style={{
                gridRowStart: row,
                gridColumnStart: col
              }}
            >
              {/* Color Bar for Property Tiles - Facing inward to center */}
              {groupMeta && (
                <div
                  className={`w-full flex items-center justify-center gap-0.5 transition-all ${
                    side === 'top'
                      ? 'order-last h-2 sm:h-3 border-t border-black/40'
                      : 'order-first h-2 sm:h-3 border-b border-black/40'
                  }`}
                  style={{ backgroundColor: groupMeta.color }}
                >
                  {/* Houses */}
                  {tile.houses > 0 && tile.houses < 5 && (
                    <div className="flex gap-0.5 items-center justify-center">
                      {Array.from({ length: tile.houses }).map((_, hIdx) => (
                        <div
                          key={hIdx}
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-[2px] shadow-sm border border-emerald-950"
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
              )}

              {/* Owner Indicator Strip (Corner Ribbon) */}
              {owner && (
                <div
                  className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-bl-md shadow-md z-10"
                  style={{ backgroundColor: owner.color }}
                  title={`Owned by ${owner.name}`}
                />
              )}

              {/* Tile Body & Label */}
              <div className="p-0.5 sm:p-1 flex-1 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="mb-0.5">{renderTileIcon(tile)}</div>
                <span className="text-[7.5px] sm:text-[9.5px] font-bold leading-tight line-clamp-2 text-gray-200">
                  {tile.name}
                </span>

                {tile.price > 0 && (
                  <span className="text-[6.5px] sm:text-[8.5px] font-mono font-bold text-emerald-400 mt-0.5">
                    ${tile.price}
                  </span>
                )}
              </div>

              {/* Mortgaged Overlay */}
              {tile.isMortgaged && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <span className="text-[7px] sm:text-[9px] font-black text-red-400 uppercase -rotate-12 border border-red-500/80 px-1 py-0.5 rounded bg-red-950/90 shadow">
                    MORTGAGED
                  </span>
                </div>
              )}

              {/* Player Tokens On Tile */}
              {playersHere.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center gap-1 flex-wrap p-0.5 z-30 pointer-events-none">
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
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-gradient-to-br from-[#160f24] via-[#120c1d] to-[#0c0814] rounded-xl border border-purple-900/40 flex flex-col items-center justify-between p-3 sm:p-5 relative overflow-hidden shadow-inner">
          {/* Subtle Background Watermark */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none">
            <span className="text-8xl sm:text-9xl font-black text-white font-heading tracking-widest">
              RICHUP
            </span>
          </div>

          {/* Embedded Center Content (Controls, Dice, Actions, Cards) */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {centerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
