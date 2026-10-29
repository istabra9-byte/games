import React from 'react';
import { Tile, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Home, X, DollarSign, Building } from 'lucide-react';

interface PropertyDetailModalProps {
  tile: Tile | null;
  room: GameRoom;
  currentPlayerId: string;
  onClose: () => void;
  onBuildHouse: (tileIndex: number) => void;
  onSellHouse: (tileIndex: number) => void;
  onMortgage: (tileIndex: number) => void;
  onUnmortgage: (tileIndex: number) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  tile,
  room,
  currentPlayerId,
  onClose,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage
}) => {
  if (!tile) return null;

  const isOwner = tile.ownerId === currentPlayerId;
  const owner = tile.ownerId ? room.players[tile.ownerId] : null;
  const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;
  const myPlayer = room.players[currentPlayerId];

  // Check monopoly
  const groupTiles = tile.group ? room.tiles.filter(t => t.group === tile.group) : [];
  const hasMonopoly = groupTiles.length > 0 && groupTiles.every(t => t.ownerId === tile.ownerId);

  const canBuildHouse = isOwner && hasMonopoly && tile.houses < 5 && !tile.isMortgaged && myPlayer && myPlayer.cash >= (tile.houseCost || 0);
  const canSellHouse = isOwner && tile.houses > 0;
  const canMortgage = isOwner && !tile.isMortgaged && tile.houses === 0;
  const canUnmortgage = isOwner && tile.isMortgaged && myPlayer && myPlayer.cash >= Math.floor(tile.mortgageValue * 1.1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1630] border-2 border-purple-500/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-white relative">
        {/* Title & Group Color Strip */}
        <div
          className="p-4 text-center relative"
          style={{ backgroundColor: groupMeta ? groupMeta.color : '#2e214a' }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white p-1 rounded-full bg-black/20"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-black tracking-wide drop-shadow text-white">
            {tile.name}
          </h2>
          <span className="text-xs uppercase font-bold text-white/90 tracking-widest">
            {groupMeta ? groupMeta.name : tile.type.toUpperCase()}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3 text-xs">
          {/* Owner status */}
          <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
            <span className="text-gray-400">Ownership:</span>
            <span className="font-bold flex items-center gap-1.5">
              {owner ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
                  <span>{owner.name} {isOwner ? '(You)' : ''}</span>
                </>
              ) : (
                <span className="text-emerald-400 font-mono">Unowned (${tile.price})</span>
              )}
            </span>
          </div>

          {/* Rent Schedule for properties */}
          {tile.type === 'property' && tile.rent.length >= 6 && (
            <div className="space-y-1 bg-[#191129] p-2.5 rounded-xl border border-purple-900/50 font-mono text-[11px]">
              <div className="flex justify-between text-gray-300">
                <span>Base Rent:</span>
                <span>${tile.rent[0]}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Rent with 1 House:</span>
                <span>${tile.rent[1]}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Rent with 2 Houses:</span>
                <span>${tile.rent[2]}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Rent with 3 Houses:</span>
                <span>${tile.rent[3]}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Rent with 4 Houses:</span>
                <span>${tile.rent[4]}</span>
              </div>
              <div className="flex justify-between text-red-400 font-bold">
                <span>Rent with Hotel:</span>
                <span>${tile.rent[5]}</span>
              </div>
              {tile.houseCost && (
                <div className="pt-1 mt-1 border-t border-purple-950 flex justify-between text-gray-400 text-[10px]">
                  <span>Building Cost:</span>
                  <span>${tile.houseCost} per house</span>
                </div>
              )}
            </div>
          )}

          {/* Mortgage Value */}
          <div className="flex justify-between text-gray-400 text-xs">
            <span>Mortgage Value:</span>
            <span className="font-mono font-bold text-gray-200">${tile.mortgageValue}</span>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="pt-2 space-y-2 border-t border-purple-800/40">
              {/* Build / Sell house buttons */}
              {tile.type === 'property' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBuildHouse(tile.index)}
                    disabled={!canBuildHouse}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Build (${tile.houseCost})</span>
                  </button>

                  <button
                    onClick={() => onSellHouse(tile.index)}
                    disabled={!canSellHouse}
                    className="flex-1 py-1.5 bg-amber-600/80 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                  >
                    <span>Sell (+${Math.floor((tile.houseCost || 0) / 2)})</span>
                  </button>
                </div>
              )}

              {/* Mortgage toggle */}
              <div>
                {!tile.isMortgaged ? (
                  <button
                    onClick={() => onMortgage(tile.index)}
                    disabled={!canMortgage}
                    className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 font-bold text-xs rounded-lg"
                  >
                    Mortgage for ${tile.mortgageValue}
                  </button>
                ) : (
                  <button
                    onClick={() => onUnmortgage(tile.index)}
                    disabled={!canUnmortgage}
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg"
                  >
                    Unmortgage for ${Math.floor(tile.mortgageValue * 1.1)}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
