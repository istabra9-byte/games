import React, { useState } from 'react';
import { GameRoom, TradeOffer, Player } from '../types/game';
import { ArrowLeftRight, Check, X, DollarSign } from 'lucide-react';

interface TradeModalProps {
  room: GameRoom;
  currentPlayerId: string;
  initialPartnerId?: string;
  onSendTrade: (trade: TradeOffer) => void;
  onAcceptTrade: () => void;
  onDeclineTrade: () => void;
  onClose: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  room,
  currentPlayerId,
  initialPartnerId,
  onSendTrade,
  onAcceptTrade,
  onDeclineTrade,
  onClose
}) => {
  const myPlayer = room.players[currentPlayerId];
  const activeTrade = room.activeTrade;

  const otherPlayers = Object.values(room.players).filter(
    p => p.id !== currentPlayerId && !p.isBankrupt
  );

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    initialPartnerId && room.players[initialPartnerId]
      ? initialPartnerId
      : otherPlayers[0]?.id || ''
  );
  const [offeredTileIndices, setOfferedTileIndices] = useState<number[]>([]);
  const [requestedTileIndices, setRequestedTileIndices] = useState<number[]>([]);
  const [offeredCash, setOfferedCash] = useState<number>(0);
  const [requestedCash, setRequestedCash] = useState<number>(0);

  const partnerPlayer = room.players[selectedPartnerId];

  const myProperties = room.tiles.filter(t => t.ownerId === currentPlayerId);
  const partnerProperties = room.tiles.filter(t => t.ownerId === selectedPartnerId);

  // If there's an incoming trade for me to review:
  const isIncomingTradeForMe = activeTrade && activeTrade.receiverId === currentPlayerId;
  const isOutgoingTradeFromMe = activeTrade && activeTrade.senderId === currentPlayerId;

  if (activeTrade && (isIncomingTradeForMe || isOutgoingTradeFromMe)) {
    const sender = room.players[activeTrade.senderId];
    const receiver = room.players[activeTrade.receiverId];

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1f1630] border-2 border-purple-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white relative">
          <div className="flex items-center justify-between mb-4 border-b border-purple-800/60 pb-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold font-['Yanone_Kaffeesatz']">
                {isIncomingTradeForMe ? 'Trade Proposal Received' : 'Active Trade Proposal'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Sender side */}
            <div className="bg-[#2a1d45] p-3 rounded-xl border border-purple-800/40">
              <span className="text-xs font-bold text-purple-300 mb-1 block">
                {sender?.name} Offers:
              </span>
              <div className="text-emerald-400 font-mono font-bold text-sm mb-2">
                Cash: ${activeTrade.senderCash}
              </div>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {activeTrade.senderTileIndices.map(idx => (
                  <span key={idx} className="text-xs bg-purple-900/60 px-2 py-1 rounded">
                    {room.tiles[idx].name}
                  </span>
                ))}
              </div>
            </div>

            {/* Receiver side */}
            <div className="bg-[#2a1d45] p-3 rounded-xl border border-purple-800/40">
              <span className="text-xs font-bold text-purple-300 mb-1 block">
                {receiver?.name} Gives:
              </span>
              <div className="text-emerald-400 font-mono font-bold text-sm mb-2">
                Cash: ${activeTrade.receiverCash}
              </div>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {activeTrade.receiverTileIndices.map(idx => (
                  <span key={idx} className="text-xs bg-purple-900/60 px-2 py-1 rounded">
                    {room.tiles[idx].name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {isIncomingTradeForMe ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onAcceptTrade}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Accept Trade</span>
              </button>
              <button
                onClick={onDeclineTrade}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow"
              >
                <X className="w-4 h-4" />
                <span>Decline Trade</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 italic">Waiting for {receiver?.name} to respond...</span>
              <button
                onClick={onDeclineTrade}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-xs font-bold rounded-xl"
              >
                Cancel Proposal
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create new trade dialog:
  const handleToggleOffer = (idx: number) => {
    setOfferedTileIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleToggleRequest = (idx: number) => {
    setRequestedTileIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = () => {
    if (!selectedPartnerId) return;
    onSendTrade({
      senderId: currentPlayerId,
      receiverId: selectedPartnerId,
      senderCash: Math.min(myPlayer.cash, Math.max(0, offeredCash)),
      receiverCash: Math.min(partnerPlayer?.cash || 0, Math.max(0, requestedCash)),
      senderTileIndices: offeredTileIndices,
      receiverTileIndices: requestedTileIndices,
      status: 'pending'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1630] border-2 border-purple-500/50 rounded-2xl w-full max-w-xl p-6 shadow-2xl text-white relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-purple-800/60 pb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold font-['Yanone_Kaffeesatz']">
              Propose Trade
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Partner Select */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1">Trade With Player:</label>
          <div className="flex items-center gap-2 flex-wrap">
            {otherPlayers.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPartnerId(p.id);
                  setRequestedTileIndices([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  selectedPartnerId === p.id 
                    ? 'bg-purple-600 border-purple-400 text-white' 
                    : 'bg-[#291e42] border-purple-800/60 text-gray-300 hover:bg-[#342754]'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name}</span>
                <span className="font-mono text-emerald-400 font-normal">(${p.cash})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trade Columns */}
        <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto mb-4 p-1">
          {/* Your Offer */}
          <div className="bg-[#261b3d] p-3 rounded-xl border border-purple-800/40 flex flex-col">
            <span className="text-xs font-bold text-purple-300 mb-2">You Offer:</span>
            
            {/* Cash offer input */}
            <div className="flex items-center gap-1 mb-3 bg-[#1a122b] p-1.5 rounded-lg border border-purple-900">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="number"
                min="0"
                max={myPlayer.cash}
                value={offeredCash}
                onChange={e => setOfferedCash(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none"
                placeholder="Cash offer"
              />
            </div>

            <span className="text-[11px] text-gray-400 font-semibold mb-1">Your Properties:</span>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-40">
              {myProperties.map(t => (
                <button
                  key={t.index}
                  onClick={() => handleToggleOffer(t.index)}
                  className={`px-2 py-1 rounded text-left text-xs font-bold border transition-all flex items-center justify-between ${
                    offeredTileIndices.includes(t.index)
                      ? 'bg-emerald-800/60 border-emerald-500 text-white'
                      : 'bg-[#1b132c] border-purple-900/60 text-gray-300 hover:bg-[#251940]'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[10px] text-gray-400">${t.price}</span>
                </button>
              ))}
              {myProperties.length === 0 && (
                <span className="text-[11px] text-gray-500 italic">No properties owned yet</span>
              )}
            </div>
          </div>

          {/* You Request */}
          <div className="bg-[#261b3d] p-3 rounded-xl border border-purple-800/40 flex flex-col">
            <span className="text-xs font-bold text-purple-300 mb-2">You Request:</span>

            {/* Cash request input */}
            <div className="flex items-center gap-1 mb-3 bg-[#1a122b] p-1.5 rounded-lg border border-purple-900">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <input
                type="number"
                min="0"
                max={partnerPlayer?.cash || 0}
                value={requestedCash}
                onChange={e => setRequestedCash(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none"
                placeholder="Cash request"
              />
            </div>

            <span className="text-[11px] text-gray-400 font-semibold mb-1">{partnerPlayer?.name}'s Properties:</span>
            <div className="flex flex-col gap-1 overflow-y-auto max-h-40">
              {partnerProperties.map(t => (
                <button
                  key={t.index}
                  onClick={() => handleToggleRequest(t.index)}
                  className={`px-2 py-1 rounded text-left text-xs font-bold border transition-all flex items-center justify-between ${
                    requestedTileIndices.includes(t.index)
                      ? 'bg-purple-700 border-purple-400 text-white'
                      : 'bg-[#1b132c] border-purple-900/60 text-gray-300 hover:bg-[#251940]'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[10px] text-gray-400">${t.price}</span>
                </button>
              ))}
              {partnerProperties.length === 0 && (
                <span className="text-[11px] text-gray-500 italic">No properties owned yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <button
          onClick={handleSubmit}
          disabled={!selectedPartnerId || (offeredTileIndices.length === 0 && requestedTileIndices.length === 0 && offeredCash === 0 && requestedCash === 0)}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow transition-all cursor-pointer"
        >
          Send Trade Proposal
        </button>
      </div>
    </div>
  );
};
