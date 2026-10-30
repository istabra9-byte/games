import React, { useState, useEffect } from 'react';
import { GameRoom, Player } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Trophy, ShieldAlert, ArrowLeftRight, Crown, Bot, X, Palmtree } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import { TurnClock } from './TurnClock';

interface LeaderboardProps {
  room: GameRoom;
  currentPlayerId: string;
  onInitiateTrade: (targetPlayerId: string) => void;
  onRequestTime?: () => void;
  onClose?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  room,
  currentPlayerId,
  onInitiateTrade,
  onRequestTime,
  onClose
}) => {
  const currentTurnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];

  // Live timer tick for turn countdown
  const [remainingSec, setRemainingSec] = useState(() =>
    Math.max(0, Math.floor((room.turnEndsAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSec(Math.max(0, Math.floor((room.turnEndsAt - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(timer);
  }, [room.turnEndsAt]);

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
        <div className="flex items-center gap-2">
          {room.settings.vacationCash && (
            <div className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 rounded-full flex items-center gap-1 text-[10px] font-bold text-emerald-300 font-mono shadow-sm">
              <Palmtree className="w-3 h-3 text-emerald-400" />
              <span>Pot: ${room.pot}</span>
            </div>
          )}
          <span className="text-[11px] text-gray-400 font-mono">
            {Object.keys(room.players).length} Players
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Standings"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
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
                  <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center relative flex-shrink-0">
                    <PlayerAvatar avatar={player.isBot ? 'navy' : player.avatar} color={player.color} size={30} />
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
                      ${player.cash} Cash
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
                  <div className="mt-2 pt-2 border-t border-purple-800/40 flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider font-mono">
                        Current Turn
                      </span>
                    </div>
                    <TurnClock
                      remainingSec={remainingSec}
                      totalSec={room.settings.turnTimeLimit}
                      isMyTurn={isMe}
                      onRequestTime={isMe ? onRequestTime : undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
