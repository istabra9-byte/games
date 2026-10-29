import React from 'react';
import { GameRoom, Player } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Trophy, ShieldAlert, ArrowLeftRight, Crown, Bot } from 'lucide-react';

interface LeaderboardProps {
  room: GameRoom;
  currentPlayerId: string;
  onInitiateTrade: (targetPlayerId: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  room,
  currentPlayerId,
  onInitiateTrade
}) => {
  const currentTurnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];

  // Rank players by net worth descending
  const sortedPlayers = Object.values(room.players).sort((a, b) => {
    if (a.isBankrupt !== b.isBankrupt) return a.isBankrupt ? 1 : -1;
    return b.netWorth - a.netWorth;
  });

  return (
    <div className="flex flex-col h-full bg-[#160f23] border border-purple-900/50 rounded-2xl overflow-hidden shadow-xl text-white select-none">
      {/* Header */}
      <div className="p-3 border-b border-purple-900/60 bg-[#110c1c] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold font-heading tracking-wide uppercase">
            Players & Standings
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          {Object.keys(room.players).length} Players
        </span>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedPlayers.map((player, rank) => {
          const isTurn = player.id === currentTurnPlayerId;
          const isMe = player.id === currentPlayerId;
          const ownedTiles = room.tiles.filter(t => t.ownerId === player.id);

          // Get unique property groups owned
          const ownedGroups = Array.from(new Set(ownedTiles.map(t => t.group).filter(Boolean))) as string[];

          return (
            <div
              key={player.id}
              className={`p-2.5 rounded-xl border transition-all ${
                player.isBankrupt
                  ? 'bg-red-950/20 border-red-900/30 opacity-50'
                  : isTurn
                  ? 'bg-[#271d3f] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/60'
                  : 'bg-[#1b132c] border-purple-900/40 hover:bg-[#231838]'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Rank, Avatar & Name */}
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] font-mono font-bold text-gray-500 w-3">
                    #{rank + 1}
                  </span>
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-white border-2 border-white/70 shadow relative flex-shrink-0"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.avatar || player.name[0]}
                    {player.isHost && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1.5 drop-shadow" />
                    )}
                  </div>

                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="text-xs font-bold flex items-center gap-1 truncate text-white">
                      {player.name} {isMe ? '(You)' : ''}
                      {player.isBot && <Bot className="w-3 h-3 text-cyan-400 flex-shrink-0" />}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {ownedTiles.length} deeds
                    </span>
                  </div>
                </div>

                {/* Right: Cash & Trade Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col text-right font-mono">
                    <span className="text-xs font-bold text-emerald-400">
                      ${player.cash}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      Net: ${player.netWorth}
                    </span>
                  </div>

                  {!isMe && !player.isBankrupt && room.status === 'playing' && (
                    <button
                      onClick={() => onInitiateTrade(player.id)}
                      title="Propose Trade"
                      className="p-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-lg border border-purple-500/30 transition-all cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Property Color Dots */}
              {ownedGroups.length > 0 && (
                <div className="mt-2 flex items-center gap-1 flex-wrap">
                  {ownedGroups.map(grp => {
                    const meta = PROPERTY_GROUPS[grp];
                    return (
                      <div
                        key={grp}
                        className="w-2.5 h-2.5 rounded-full shadow-sm border border-white/40"
                        style={{ backgroundColor: meta ? meta.color : '#888' }}
                        title={`${meta ? meta.name : grp} Group`}
                      />
                    );
                  })}
                </div>
              )}

              {/* Status Badges */}
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                {player.inJail && (
                  <span className="px-1.5 py-0.5 bg-orange-950/80 border border-orange-500/40 text-[9px] font-bold text-orange-300 rounded flex items-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    In Jail ({player.jailTurns}/3)
                  </span>
                )}
                {player.isBankrupt && (
                  <span className="px-1.5 py-0.5 bg-red-950/80 border border-red-500/40 text-[9px] font-bold text-red-300 rounded">
                    Bankrupt
                  </span>
                )}
                {isTurn && !player.isBankrupt && (
                  <span className="px-1.5 py-0.5 bg-purple-900/80 border border-purple-400 text-[9px] font-bold text-purple-200 rounded animate-pulse">
                    Current Turn
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
