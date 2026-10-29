import React, { useState, useEffect } from 'react';
import { GameRoom } from '../types/game';
import { Gavel, Clock, ArrowUp, X } from 'lucide-react';

interface AuctionModalProps {
  room: GameRoom;
  currentPlayerId: string;
  onBid: (amount: number) => void;
  onPass: () => void;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  room,
  currentPlayerId,
  onBid,
  onPass
}) => {
  const auction = room.auction;
  if (!auction) return null;

  const tile = room.tiles[auction.tileIndex];
  const myPlayer = room.players[currentPlayerId];
  const [remainingSec, setRemainingSec] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      const left = Math.max(0, Math.floor((auction.expiresAt - Date.now()) / 1000));
      setRemainingSec(left);
    }, 500);
    return () => clearInterval(timer);
  }, [auction.expiresAt]);

  const hasPassed = auction.passedPlayerIds.includes(currentPlayerId);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1630] border-2 border-purple-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-white relative">
        <div className="flex items-center gap-2 mb-2 text-amber-400">
          <Gavel className="w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-black font-['Yanone_Kaffeesatz'] tracking-wide uppercase">
            Live Property Auction
          </h2>
        </div>

        {/* Property Card */}
        <div className="bg-[#2a1e42] border border-purple-700/50 rounded-xl p-4 w-full text-center mb-4">
          <span className="text-sm font-bold text-gray-300">Property on Auction:</span>
          <h3 className="text-2xl font-black text-white">{tile.name}</h3>
          <span className="text-xs text-gray-400">Regular Bank Price: ${tile.price}</span>
        </div>

        {/* Current Highest Bid */}
        <div className="flex flex-col items-center mb-5">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Highest Bid
          </span>
          <span className="text-4xl font-mono font-black text-emerald-400">
            ${auction.currentBid}
          </span>
          <span className="text-xs text-purple-300 font-medium mt-1">
            {auction.highestBidderName ? `by ${auction.highestBidderName}` : 'No bids placed yet'}
          </span>
        </div>

        {/* Auction Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/80 border border-purple-600/40 rounded-full mb-6">
          <Clock className="w-4 h-4 text-purple-300" />
          <span className="text-xs font-mono font-bold text-purple-200">
            {remainingSec}s remaining
          </span>
        </div>

        {/* Action Buttons */}
        {!hasPassed && myPlayer && myPlayer.cash > auction.currentBid ? (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 w-full">
              {[10, 50, 100].map((inc) => {
                const nextBid = auction.currentBid + inc;
                const canAfford = myPlayer.cash >= nextBid;
                return (
                  <button
                    key={inc}
                    onClick={() => onBid(nextBid)}
                    disabled={!canAfford}
                    className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>+${inc}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={onPass}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 mt-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Pass on Auction</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic">
            {hasPassed ? 'You have passed this auction.' : 'Insufficient funds to bid.'}
          </div>
        )}
      </div>
    </div>
  );
};
