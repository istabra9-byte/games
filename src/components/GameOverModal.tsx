import React from 'react';
import { GameRoom, Player } from '../types/game';
import { Trophy, Crown, Sparkles, ShoppingBag, RotateCcw, Home, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import { sound } from '../services/sound';

interface GameOverModalProps {
  room: GameRoom;
  currentPlayerId: string;
  earnedCoins?: number;
  onPlayAgain: () => void;
  onReturnHome: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  room,
  currentPlayerId,
  earnedCoins = 0,
  onPlayAgain,
  onReturnHome,
  onOpenShop
}) => {
  const winner = room.winnerId ? room.players[room.winnerId] : null;
  const isWinner = room.winnerId === currentPlayerId;

  // Calculate sorted rankings by Net Worth
  const allPlayers = Object.values(room.players || {}).sort((a, b) => {
    // Winner always 1st
    if (a.id === room.winnerId) return -1;
    if (b.id === room.winnerId) return 1;
    // Active players above bankrupt players
    if (!a.isBankrupt && b.isBankrupt) return -1;
    if (a.isBankrupt && !b.isBankrupt) return 1;
    // By net worth
    return (b.netWorth || b.cash) - (a.netWorth || a.cash);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-[#1b122c] via-[#140c22] to-[#0f0919] border-2 border-amber-500/60 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white relative flex flex-col items-center">
        {/* Shimmering top banner */}
        <div className="absolute -top-6 px-5 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-purple-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5 border border-yellow-200">
          <Crown className="w-4 h-4 fill-purple-950" />
          <span>Match Concluded</span>
          <Crown className="w-4 h-4 fill-purple-950" />
        </div>

        {/* Winner Hero Podium */}
        <div className="flex flex-col items-center mt-3 mb-4 text-center">
          <div className="relative mb-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-amber-400/30 to-purple-600/20 p-1.5 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.5)]">
              {winner && (
                <PlayerAvatar
                  avatar={winner.isBot ? 'navy' : winner.avatar}
                  color={winner.color}
                  size={72}
                />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-purple-950 p-1.5 rounded-full shadow-md">
              <Trophy className="w-4 h-4 fill-purple-950" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
            {isWinner ? '🎉 VICTORY! YOU WON!' : `👑 ${winner?.name || 'Player'} is the Champion!`}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isWinner ? 'You dominated the board and bankrupt all rivals.' : 'Great game! Better luck in the next round.'}
          </p>
        </div>

        {/* Coins Reward Notification */}
        {earnedCoins > 0 && (
          <div className="w-full bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-pink-500/20 border border-amber-400/50 rounded-2xl p-3 flex items-center justify-between mb-4 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none">🪙</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-amber-300">
                  +{earnedCoins} Free Coins Awarded!
                </span>
                <span className="text-[10.5px] text-gray-300">
                  {isWinner ? 'Championship Victory Prize' : 'Match Runner-up Participation Prize'}
                </span>
              </div>
            </div>
            <button
              onClick={onOpenShop}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-purple-950 font-black text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop</span>
            </button>
          </div>
        )}

        {/* Final Standings Leaderboard */}
        <div className="w-full bg-[#120a1c] border border-purple-900/60 rounded-2xl p-3 mb-4 space-y-1.5 max-h-[160px] overflow-y-auto">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-1 border-b border-purple-950 flex items-center justify-between">
            <span>Standings</span>
            <span>Net Worth</span>
          </div>

          {allPlayers.map((p, idx) => {
            const isFirst = idx === 0;
            const isMe = p.id === currentPlayerId;
            const ownedPropsCount = (room.tiles || []).filter(t => t.ownerId === p.id).length;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-colors ${
                  isFirst
                    ? 'bg-amber-500/10 border-amber-400/40 text-amber-200'
                    : isMe
                    ? 'bg-purple-900/30 border-purple-500/40 text-purple-200'
                    : 'bg-[#181024] border-purple-950/40 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black w-4 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                  </span>
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-black/40 border border-white/20">
                    <PlayerAvatar avatar={p.isBot ? 'navy' : p.avatar} color={p.color} size={22} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-none truncate max-w-[120px] sm:max-w-[150px]">
                      {p.name} {isMe && <span className="text-[9px] text-purple-400 font-mono">(You)</span>}
                    </span>
                    <span className="text-[9.5px] text-gray-400 mt-0.5">
                      {p.isBankrupt ? 'Bankrupt' : `${ownedPropsCount} properties`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs font-mono font-black text-emerald-400">
                    ${p.isBankrupt ? 0 : (p.netWorth || p.cash)}
                  </span>
                  <span className="text-[9.5px] text-gray-400">
                    ${p.cash} cash
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="w-full flex items-center gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-purple-400/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onReturnHome}
            className="py-2.5 px-4 bg-[#231738] hover:bg-[#2d1e47] border border-purple-800/60 text-gray-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
