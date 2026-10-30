import React, { useState } from 'react';
import { GameRoom, Player, Tile } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { PlayerAvatar } from './PlayerAvatar';
import { HouseIcon, HotelIcon } from './HouseIcons';
import { Crown, Flag, Plus, ArrowLeftRight, ShieldAlert, Home, DollarSign, X } from 'lucide-react';
import { useCashDeltas } from '../hooks/useCashDeltas';

interface RightSidebarProps {
  room: GameRoom;
  currentPlayerId: string;
  onInitiateTrade: (targetPlayerId: string) => void;
  onOpenTradeModal: () => void;
  onSelectTile: (tile: Tile) => void;
  onDeclareBankruptcy: () => void;
  onGrantTime?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  room,
  currentPlayerId,
  onInitiateTrade,
  onOpenTradeModal,
  onSelectTile,
  onDeclareBankruptcy,
  onGrantTime
}) => {
  const [showBankruptConfirm, setShowBankruptConfirm] = useState(false);
  const currentTurnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
  const myPlayer = room.players[currentPlayerId];

  // Real-time cash balance change tracker (gain/loss notification to the left of player names)
  const cashDeltas = useCashDeltas(room.players);

  // Current player's owned properties
  const myOwnedTiles = room.tiles.filter(t => t.ownerId === currentPlayerId);

  // Active trade involving current player
  const activeTrade = room.activeTrade;
  const isTradeForMe = activeTrade && (activeTrade.receiverId === currentPlayerId || activeTrade.senderId === currentPlayerId);

  return (
    <div className="w-full h-full flex flex-col gap-2.5 overflow-hidden select-none">
      {/* 1. Players List Card */}
      <div className="bg-[#1b142c] border border-purple-900/50 rounded-2xl p-2.5 shadow-lg flex flex-col gap-1.5 flex-shrink-0">
        <div className="flex items-center justify-between px-1 text-gray-400 text-xs font-bold mb-0.5">
          <span>PLAYERS</span>
          <span className="font-mono text-[10px] bg-[#120c1e] px-1.5 py-0.2 rounded border border-purple-950">
            {Object.keys(room.players).length}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
          {room.playerOrder.map((playerId) => {
            const player = room.players[playerId];
            if (!player) return null;

            const isTurn = playerId === currentTurnPlayerId;
            const isMe = playerId === currentPlayerId;

            return (
              <div
                key={player.id}
                className={`relative flex items-center justify-between p-2 rounded-xl transition-all ${
                  isTurn
                    ? 'bg-[#281c43] border border-purple-500/50 shadow-md'
                    : 'bg-[#150e24] border border-purple-950/60'
                } ${player.isBankrupt ? 'opacity-40 grayscale' : ''}`}
              >
                {/* Active turn vertical stripe on left edge (Richup signature design) */}
                {isTurn && !player.isBankrupt && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    style={{ backgroundColor: player.color }}
                  />
                )}

                {/* Left: Cash Delta, Avatar & Name */}
                <div className="flex items-center gap-1.5 min-w-0 pl-1">
                  {/* Cash change notification: simple green or red text (no background), ON THE LEFT OF PLAYER ICON, stays 5 seconds */}
                  {cashDeltas[player.id] && (
                    <span
                      key={cashDeltas[player.id].key}
                      className={`text-xs font-black font-mono select-none flex-shrink-0 animate-in fade-in zoom-in-75 duration-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${
                        cashDeltas[player.id].delta > 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {cashDeltas[player.id].delta > 0
                        ? `+$${cashDeltas[player.id].delta}`
                        : `-$${Math.abs(cashDeltas[player.id].delta)}`}
                    </span>
                  )}

                  <div className="w-7 h-7 relative flex items-center justify-center flex-shrink-0">
                    <PlayerAvatar avatar={player.isBot ? 'navy' : player.avatar} color={player.color} size={28} />
                    {player.isHost && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1 drop-shadow" />
                    )}
                    {/* Vacation Zzz Sleeping Animation on player avatar */}
                    {player.position === 20 && !player.isBankrupt && (
                      <div className="absolute -top-1.5 -right-2 pointer-events-none select-none flex items-center gap-0.5 z-20">
                        <span className="text-[10px] font-black text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] animate-zzz-1">Z</span>
                        <span className="text-[8px] font-bold text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] animate-zzz-2">z</span>
                        <span className="text-[7px] font-semibold text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] animate-zzz-3">z</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col leading-tight min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {player.name}
                      </span>
                    </div>
                    {player.position === 20 && !player.isBankrupt && (
                      <span className="text-[9px] text-amber-300 font-bold flex items-center gap-1">
                        🌴 Vacation <span className="inline-flex gap-0.5 animate-pulse">💤</span>
                      </span>
                    )}
                    {player.inJail && !player.isBankrupt && (
                      <span className="text-[9px] text-orange-400 font-bold flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> In Prison ({player.jailTurns}/3)
                      </span>
                    )}
                    {player.isBankrupt && (
                      <span className="text-[9px] text-red-400 font-bold">
                        Bankrupt
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Cash & Trade Action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-black font-mono text-emerald-400">
                    ${player.cash}
                  </span>

                  {!isMe && !player.isBankrupt && room.status === 'playing' && (
                    <button
                      onClick={() => onInitiateTrade(player.id)}
                      title="Propose Trade"
                      className="p-1 bg-purple-900/40 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg transition-all cursor-pointer border border-purple-800/40"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bankrupt Button (Dedicated Orange Pill Button) */}
      {myPlayer && !myPlayer.isBankrupt && room.status === 'playing' && (
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowBankruptConfirm(true)}
            className="w-full py-2 bg-[#ff5252] hover:bg-[#ff3b3b] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 border border-red-400/50"
          >
            <Flag className="w-3.5 h-3.5 fill-white" />
            <span>Bankrupt</span>
          </button>
        </div>
      )}

      {/* 3. Trades Card */}
      <div className="bg-[#1b142c] border border-purple-900/50 rounded-2xl p-2.5 shadow-lg flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-200">Trades</span>
          {myPlayer && !myPlayer.isBankrupt && room.status === 'playing' && (
            <button
              onClick={onOpenTradeModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold transition-all shadow cursor-pointer active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>Create</span>
            </button>
          )}
        </div>

        {isTradeForMe ? (
          <div
            onClick={onOpenTradeModal}
            className="p-2 bg-[#25193f] border border-purple-500/60 rounded-xl cursor-pointer hover:border-purple-400 transition-all flex items-center justify-between"
          >
            <div className="flex flex-col text-xs">
              <span className="font-bold text-purple-200">Active Trade Offer</span>
              <span className="text-[10px] text-gray-400">Click to view & respond</span>
            </div>
            <ArrowLeftRight className="w-4 h-4 text-pink-400 animate-pulse" />
          </div>
        ) : (
          <div className="text-[11px] text-gray-500 italic text-center py-1">
            No active trades
          </div>
        )}
      </div>

      {/* 4. My Properties Card */}
      <div className="flex-1 min-h-0 bg-[#1b142c] border border-purple-900/50 rounded-2xl p-2.5 shadow-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-1 pb-1.5 border-b border-purple-900/40 flex-shrink-0">
          <span className="text-xs font-bold text-gray-200">
            My properties ({myOwnedTiles.length})
          </span>
          <span className="text-[10px] text-gray-400 font-mono">click to manage</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pt-2 space-y-1.5 pr-1">
          {myOwnedTiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs py-4 text-center">
              <span>You don't own any properties yet.</span>
              <span className="text-[10px] text-gray-600 mt-1">Roll and buy properties to build rent!</span>
            </div>
          ) : (
            myOwnedTiles.map((tile) => {
              const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;

              return (
                <div
                  key={tile.index}
                  onClick={() => onSelectTile(tile)}
                  className={`p-1.5 bg-[#150e24] hover:bg-[#25193f] border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    tile.isMortgaged ? 'border-amber-600/50 opacity-60' : 'border-purple-950 hover:border-purple-600/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-white/30"
                      style={{ backgroundColor: groupMeta?.color || '#888' }}
                    />
                    <span className="text-xs font-bold text-white truncate">
                      {tile.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {tile.houses > 0 && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                        tile.houses === 5
                          ? 'text-red-300 bg-red-950/60 border-red-500/40'
                          : 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                      }`}>
                        {tile.houses === 5 ? (
                          <>
                            <HotelIcon className="w-3 h-3" />
                            <span>Hotel</span>
                          </>
                        ) : (
                          <>
                            <HouseIcon className="w-2.5 h-2.5" />
                            <span>{tile.houses}</span>
                          </>
                        )}
                      </span>
                    )}
                    {tile.isMortgaged && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/40">
                        Mortgaged
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold text-gray-300">
                      ${tile.price}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation Modal for Bankruptcy */}
      {showBankruptConfirm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowBankruptConfirm(false)}
        >
          <div
            className="bg-[#1f1630] border-2 border-red-500/60 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-white relative cursor-default text-center flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center mx-auto text-red-400">
              <Flag className="w-6 h-6 fill-current" />
            </div>

            <h3 className="text-lg font-black font-heading text-red-300">
              Declare Bankruptcy?
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to resign? All your cash and properties will be forfeited to the bank or creditors, and you will be out of the game.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setShowBankruptConfirm(false)}
                className="py-2 bg-[#2a1d45] hover:bg-[#39285d] text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowBankruptConfirm(false);
                  onDeclareBankruptcy();
                }}
                className="py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
