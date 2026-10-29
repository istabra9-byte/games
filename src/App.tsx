import React, { useState, useEffect } from 'react';
import { GameRoom, Player, Tile, TradeOffer } from './types/game';
import { 
  createInitialRoom, 
  startGame, 
  rollDice, 
  buyCurrentProperty, 
  startAuctionForCurrentTile, 
  placeAuctionBid, 
  finishAuction, 
  endTurn 
} from './services/gameEngine';
import { multiplayer } from './services/firebase';
import { sound } from './services/sound';
import { Board } from './components/Board';
import { CenterControls } from './components/CenterControls';
import { Lobby } from './components/Lobby';
import { Leaderboard } from './components/Leaderboard';
import { ChatAndLogs } from './components/ChatAndLogs';
import { AuctionModal } from './components/AuctionModal';
import { TradeModal } from './components/TradeModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { Volume2, VolumeX, Flame, LogOut, MessageSquare, Users, Dices } from 'lucide-react';
import confetti from 'canvas-confetti';

// Generate random 5-letter alphanumeric code matching Richup
function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const App: React.FC = () => {
  // Current user credentials
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('richup_player');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const newId = `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      id: newId,
      name: `Player_${Math.floor(Math.random() * 900 + 100)}`,
      avatar: '🎩',
      color: '#ff253a',
      cash: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      isBankrupt: false,
      isHost: true,
      isBot: false,
      connected: true,
      netWorth: 1500
    };
  });

  const [roomId, setRoomId] = useState<string>(() => {
    // Check hash e.g. #/room/s5zwl or #room=s5zwl
    const hashMatch = window.location.hash.match(/room[=/]([a-zA-Z0-9]+)/);
    if (hashMatch) return hashMatch[1];
    // Check query e.g. ?room=s5zwl
    const searchMatch = window.location.search.match(/room=([a-zA-Z0-9]+)/);
    if (searchMatch) return searchMatch[1];
    // Check pathname
    const pathMatch = window.location.pathname.match(/\/room\/([a-zA-Z0-9]+)/);
    if (pathMatch) return pathMatch[1];
    return 's5zwl';
  });

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showTradeModal, setShowTradeModal] = useState<boolean>(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(multiplayer.isUsingFirebase());
  const [mobileTab, setMobileTab] = useState<'board' | 'chat' | 'players'>('board');

  // Keep URL hash updated with active room id
  useEffect(() => {
    window.location.hash = `/room/${roomId}`;
  }, [roomId]);

  // Listen to external hash changes
  useEffect(() => {
    const handleHash = () => {
      const match = window.location.hash.match(/room[=/]([a-zA-Z0-9]+)/);
      if (match && match[1] !== roomId) {
        setRoomId(match[1]);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [roomId]);

  // Save current player info locally
  useEffect(() => {
    localStorage.setItem('richup_player', JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  // Subscribe to room updates
  useEffect(() => {
    const unsub = multiplayer.subscribeToRoom(roomId, (updatedRoom) => {
      if (!updatedRoom) return;

      // Auto-register peer player in lobby if not already in room
      if (updatedRoom.status === 'lobby' && !updatedRoom.players[currentPlayer.id]) {
        const isFirst = Object.keys(updatedRoom.players).length === 0;
        const playerToAdd: Player = {
          ...currentPlayer,
          isHost: isFirst || updatedRoom.hostId === currentPlayer.id
        };
        const nextRoom = { ...updatedRoom };
        if (isFirst) {
          nextRoom.hostId = currentPlayer.id;
        }
        nextRoom.players = { ...nextRoom.players, [currentPlayer.id]: playerToAdd };
        if (!nextRoom.playerOrder.includes(currentPlayer.id)) {
          nextRoom.playerOrder = [...nextRoom.playerOrder, currentPlayer.id];
        }
        nextRoom.logs = [
          ...(nextRoom.logs || []),
          {
            id: `join_${Date.now()}`,
            text: `${currentPlayer.name} joined the room`,
            timestamp: Date.now(),
            type: 'system'
          }
        ];
        multiplayer.updateRoom(nextRoom);
        setRoom(nextRoom);
        return;
      }

      setRoom(updatedRoom);
      if (updatedRoom.winnerId && updatedRoom.status === 'ended') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    });

    // If room doesn't exist yet, initialize it after short delay
    const initTimer = setTimeout(() => {
      setRoom(prev => {
        if (!prev) {
          const newRoom = createInitialRoom(roomId, currentPlayer);
          multiplayer.updateRoom(newRoom);
          return newRoom;
        }
        return prev;
      });
    }, 350);

    return () => {
      unsub();
      clearTimeout(initTimer);
    };
  }, [roomId, currentPlayer.id]);

  // Sync turn timer countdown
  useEffect(() => {
    if (!room || room.status !== 'playing') return;

    const timer = setInterval(() => {
      const left = Math.floor((room.turnEndsAt - Date.now()) / 1000);
      if (left <= 0) {
        // Auto-advance turn if timer expires
        const isCurrentTurn = room.playerOrder[room.currentTurnPlayerIndex] === currentPlayer.id;
        const isHost = room.hostId === currentPlayer.id;
        if (isCurrentTurn || isHost) {
          if (room.turnPhase === 'roll') {
            handleRoll();
          } else if (room.turnPhase === 'action') {
            if (room.settings.auction) {
              handleAuction();
            } else {
              handleEndTurn();
            }
          } else {
            handleEndTurn();
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [room, currentPlayer.id]);

  // AI Bot player executor
  useEffect(() => {
    if (!room || room.status !== 'playing') return;
    const currentTurnId = room.playerOrder[room.currentTurnPlayerIndex];
    const turnPlayer = room.players[currentTurnId];

    if (turnPlayer && turnPlayer.isBot && !turnPlayer.isBankrupt) {
      const botTimer = setTimeout(() => {
        if (room.turnPhase === 'roll') {
          const nextRoom = rollDice(room, turnPlayer.id);
          multiplayer.updateRoom(nextRoom);
        } else if (room.turnPhase === 'action') {
          const landed = room.tiles[turnPlayer.position];
          if (landed && landed.ownerId === null && turnPlayer.cash >= landed.price + 100) {
            const nextRoom = buyCurrentProperty(room, turnPlayer.id);
            multiplayer.updateRoom(nextRoom);
          } else {
            const nextRoom = startAuctionForCurrentTile(room, turnPlayer.id);
            multiplayer.updateRoom(nextRoom);
          }
        } else if (room.turnPhase === 'end') {
          const nextRoom = endTurn(room);
          multiplayer.updateRoom(nextRoom);
        }
      }, 1500);

      return () => clearTimeout(botTimer);
    }
  }, [room]);

  // Actions
  const handleRoll = () => {
    if (!room) return;
    const updated = rollDice(room, currentPlayer.id);
    multiplayer.updateRoom(updated);
  };

  const handleBuy = () => {
    if (!room) return;
    const updated = buyCurrentProperty(room, currentPlayer.id);
    multiplayer.updateRoom(updated);
  };

  const handleAuction = () => {
    if (!room) return;
    const updated = startAuctionForCurrentTile(room, currentPlayer.id);
    multiplayer.updateRoom(updated);
  };

  const handleEndTurn = () => {
    if (!room) return;
    const updated = endTurn(room);
    multiplayer.updateRoom(updated);
  };

  const handlePayBail = () => {
    if (!room) return;
    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    const p = newRoom.players[currentPlayer.id];
    if (p && p.inJail && p.cash >= 50) {
      p.cash -= 50;
      newRoom.pot += 50;
      p.inJail = false;
      p.jailTurns = 0;
      newRoom.logs.push({
        id: `bail_${Date.now()}`,
        text: `${p.name} paid $50 bail and was released!`,
        timestamp: Date.now(),
        type: 'jail'
      });
      sound.playBuy();
      multiplayer.updateRoom(newRoom);
    }
  };

  const handleRequestTime = () => {
    if (!room) return;
    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    newRoom.turnEndsAt += 15000;
    newRoom.logs.push({
      id: `time_${Date.now()}`,
      text: `⏱️ Extra 15 seconds granted to turn clock.`,
      timestamp: Date.now(),
      type: 'system'
    });
    sound.playTurnChime();
    multiplayer.updateRoom(newRoom);
  };

  const handleAddBot = () => {
    if (!room) return;
    const botNum = Object.keys(room.players).length + 1;
    const botId = `bot_${Date.now()}`;
    const botColors = ['#00d2d3', '#5f27cd', '#ff9f43', '#10ac84', '#ee5253'];
    const botAvatars = ['🤖', '👾', '🦾', '🧠', '⚙️'];

    const newBot: Player = {
      id: botId,
      name: `AI_Bot_${botNum}`,
      avatar: botAvatars[(botNum - 1) % botAvatars.length],
      color: botColors[(botNum - 1) % botColors.length],
      cash: room.settings.startingCash,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      isBankrupt: false,
      isHost: false,
      isBot: true,
      connected: true,
      netWorth: room.settings.startingCash
    };

    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    newRoom.players[botId] = newBot;
    newRoom.playerOrder.push(botId);
    newRoom.logs.push({
      id: `join_${Date.now()}`,
      text: `${newBot.name} joined the room`,
      timestamp: Date.now(),
      type: 'system'
    });
    multiplayer.updateRoom(newRoom);
  };

  const handleStartGame = () => {
    if (!room) return;
    const started = startGame(room);
    multiplayer.updateRoom(started);
  };

  const handleSendMessage = (text: string) => {
    if (!room) return;
    multiplayer.sendChatMessage(room.id, {
      id: `msg_${Date.now()}`,
      senderId: currentPlayer.id,
      senderName: currentPlayer.name,
      senderColor: currentPlayer.color,
      text,
      timestamp: Date.now()
    });
  };

  const handleSendTrade = (offer: TradeOffer) => {
    if (!room) return;
    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    newRoom.activeTrade = offer;
    newRoom.logs.push({
      id: `trade_off_${Date.now()}`,
      text: `🤝 ${currentPlayer.name} proposed a trade to ${room.players[offer.receiverId]?.name}!`,
      timestamp: Date.now(),
      type: 'trade'
    });
    sound.playTurnChime();
    multiplayer.updateRoom(newRoom);
    setShowTradeModal(false);
  };

  const handleAcceptTrade = () => {
    if (!room || !room.activeTrade) return;
    const trade = room.activeTrade;
    const sender = room.players[trade.senderId];
    const receiver = room.players[trade.receiverId];
    if (!sender || !receiver) return;

    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    newRoom.players[trade.senderId].cash -= trade.senderCash;
    newRoom.players[trade.receiverId].cash += trade.senderCash;
    newRoom.players[trade.receiverId].cash -= trade.receiverCash;
    newRoom.players[trade.senderId].cash += trade.receiverCash;

    trade.senderTileIndices.forEach(idx => {
      newRoom.tiles[idx].ownerId = trade.receiverId;
    });
    trade.receiverTileIndices.forEach(idx => {
      newRoom.tiles[idx].ownerId = trade.senderId;
    });

    newRoom.logs.push({
      id: `trade_done_${Date.now()}`,
      text: `✅ Trade completed between ${sender.name} and ${receiver.name}!`,
      timestamp: Date.now(),
      type: 'trade'
    });
    sound.playCash();
    newRoom.activeTrade = null;
    multiplayer.updateRoom(newRoom);
  };

  const handleDeclineTrade = () => {
    if (!room) return;
    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    newRoom.logs.push({
      id: `trade_decl_${Date.now()}`,
      text: `❌ Trade proposal was declined.`,
      timestamp: Date.now(),
      type: 'trade'
    });
    newRoom.activeTrade = null;
    multiplayer.updateRoom(newRoom);
  };

  if (!room) {
    return (
      <div className="w-screen h-screen bg-[#130f1d] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xl font-bold font-heading tracking-widest text-purple-200">
          Loading Richup...
        </span>
      </div>
    );
  }

  // Lobby Status
  if (room.status === 'lobby') {
    return (
      <div className="w-screen h-screen bg-[#130f1d] flex flex-col justify-between overflow-y-auto">
        <Lobby
          room={room}
          currentPlayer={currentPlayer}
          onUpdatePlayer={(name, avatar, color) => {
            setCurrentPlayer(prev => ({ ...prev, name, avatar, color }));
            if (room.players[currentPlayer.id]) {
              const updated = JSON.parse(JSON.stringify(room));
              updated.players[currentPlayer.id].name = name;
              updated.players[currentPlayer.id].avatar = avatar;
              updated.players[currentPlayer.id].color = color;
              multiplayer.updateRoom(updated);
            }
          }}
          onUpdateSettings={(settings) => {
            const updated = JSON.parse(JSON.stringify(room));
            updated.settings = settings;
            multiplayer.updateRoom(updated);
          }}
          onAddBot={handleAddBot}
          onStartGame={handleStartGame}
          onOpenFirebaseConfig={() => setShowFirebaseModal(true)}
          isFirebaseActive={isFirebaseActive}
        />

        {showFirebaseModal && (
          <FirebaseConfigModal
            onClose={() => setShowFirebaseModal(false)}
            onConfigSaved={() => setIsFirebaseActive(true)}
          />
        )}
      </div>
    );
  }

  // Playing / Ended Game Screen
  return (
    <div className="w-screen h-screen bg-[#130f1d] flex flex-col overflow-hidden text-white font-sans select-none">
      {/* Top Header Navigation */}
      <header className="h-12 border-b border-purple-900/40 bg-[#160f25] px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-400">
            RICHUP
          </h1>
          <span className="text-[11px] text-purple-300 font-mono bg-[#21163b] px-2 py-0.5 rounded-md border border-purple-800/60">
            Room: {room.id}
          </span>
        </div>

        {/* Mobile Navigation Pills */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            onClick={() => setMobileTab(mobileTab === 'board' ? 'chat' : 'board')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-colors ${
              mobileTab === 'chat'
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-[#21163b] text-purple-200 border-purple-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setMobileTab(mobileTab === 'players' ? 'board' : 'players')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-colors ${
              mobileTab === 'players'
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-[#21163b] text-purple-200 border-purple-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Players</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => setIsMuted(sound.toggleMute())}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg bg-[#21163b] hover:bg-[#2e1f52] border border-purple-800/60 text-purple-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Leave game */}
          <button
            onClick={() => {
              if (confirm('Leave current game?')) {
                setRoomId(generateRoomId());
              }
            }}
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main Game Screen (3-Pane Layout) */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-3 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-3 overflow-hidden relative">
        {/* Left Pane: Chat & Action Activity Logs */}
        <div className={`w-full lg:w-80 h-full flex-col flex-shrink-0 ${
          mobileTab === 'chat'
            ? 'fixed inset-0 top-12 z-40 bg-[#130f1d] p-3 flex'
            : 'hidden lg:flex'
        }`}>
          <ChatAndLogs
            chat={room.chat || []}
            logs={room.logs || []}
            currentPlayer={currentPlayer}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Center: The Game Board with Embedded Center Controls */}
        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
          <Board
            room={room}
            onTileClick={(tile) => setSelectedTile(tile)}
            centerContent={
              <CenterControls
                room={room}
                currentPlayerId={currentPlayer.id}
                onRoll={handleRoll}
                onBuy={handleBuy}
                onAuction={handleAuction}
                onEndTurn={handleEndTurn}
                onPayBail={handlePayBail}
                onRequestTime={handleRequestTime}
              />
            }
          />
        </div>

        {/* Right Pane: Players Leaderboard */}
        <div className={`w-full lg:w-80 h-full flex-col flex-shrink-0 ${
          mobileTab === 'players'
            ? 'fixed inset-0 top-12 z-40 bg-[#130f1d] p-3 flex'
            : 'hidden lg:flex'
        }`}>
          <Leaderboard
            room={room}
            currentPlayerId={currentPlayer.id}
            onInitiateTrade={(targetId) => setShowTradeModal(true)}
          />
        </div>
      </div>

      {/* Modals */}
      {room.auction && (
        <AuctionModal
          room={room}
          currentPlayerId={currentPlayer.id}
          onBid={(amount) => {
            const updated = placeAuctionBid(room, currentPlayer.id, amount);
            multiplayer.updateRoom(updated);
          }}
          onPass={() => {
            const updated = JSON.parse(JSON.stringify(room));
            if (updated.auction) {
              updated.auction.passedPlayerIds.push(currentPlayer.id);
              if (updated.auction.passedPlayerIds.length >= Object.keys(updated.players).length) {
                const finished = finishAuction(updated);
                multiplayer.updateRoom(finished);
                return;
              }
              multiplayer.updateRoom(updated);
            }
          }}
        />
      )}

      {(showTradeModal || room.activeTrade) && (
        <TradeModal
          room={room}
          currentPlayerId={currentPlayer.id}
          onSendTrade={handleSendTrade}
          onAcceptTrade={handleAcceptTrade}
          onDeclineTrade={handleDeclineTrade}
          onClose={() => setShowTradeModal(false)}
        />
      )}

      {selectedTile && (
        <PropertyDetailModal
          tile={selectedTile}
          room={room}
          currentPlayerId={currentPlayer.id}
          onClose={() => setSelectedTile(null)}
          onBuildHouse={(idx) => {
            const updated: GameRoom = JSON.parse(JSON.stringify(room));
            const t = updated.tiles[idx];
            const p = updated.players[currentPlayer.id];
            if (!t || !p || !t.houseCost || p.cash < t.houseCost || t.houses >= 5 || t.isMortgaged) return;

            // Check full monopoly
            if (t.group) {
              const groupTiles = updated.tiles.filter(tile => tile.group === t.group);
              const ownsAll = groupTiles.every(tile => tile.ownerId === currentPlayer.id && !tile.isMortgaged);
              if (!ownsAll) return;
            }

            p.cash -= t.houseCost;
            t.houses += 1;
            updated.logs.push({
              id: `build_${Date.now()}`,
              text: `${p.name} built a ${t.houses === 5 ? 'Hotel' : 'House'} on ${t.name}!`,
              timestamp: Date.now(),
              type: 'buy'
            });
            sound.playBuy();
            multiplayer.updateRoom(updated);
            setSelectedTile(t);
          }}
          onSellHouse={(idx) => {
            const updated: GameRoom = JSON.parse(JSON.stringify(room));
            const t = updated.tiles[idx];
            const p = updated.players[currentPlayer.id];
            if (!t || !p || !t.houseCost || t.houses <= 0) return;

            const refund = Math.floor(t.houseCost / 2);
            p.cash += refund;
            t.houses -= 1;
            updated.logs.push({
              id: `sell_${Date.now()}`,
              text: `${p.name} sold a ${t.houses === 4 ? 'Hotel' : 'House'} on ${t.name} for $${refund}!`,
              timestamp: Date.now(),
              type: 'system'
            });
            sound.playCash();
            multiplayer.updateRoom(updated);
            setSelectedTile(t);
          }}
          onMortgage={(idx) => {
            const updated: GameRoom = JSON.parse(JSON.stringify(room));
            const t = updated.tiles[idx];
            const p = updated.players[currentPlayer.id];
            if (!t || !p || t.isMortgaged || t.houses > 0 || t.ownerId !== currentPlayer.id) return;

            t.isMortgaged = true;
            p.cash += t.mortgageValue;
            updated.logs.push({
              id: `mort_${Date.now()}`,
              text: `${p.name} mortgaged ${t.name} for $${t.mortgageValue}!`,
              timestamp: Date.now(),
              type: 'system'
            });
            sound.playCash();
            multiplayer.updateRoom(updated);
            setSelectedTile(t);
          }}
          onUnmortgage={(idx) => {
            const updated: GameRoom = JSON.parse(JSON.stringify(room));
            const t = updated.tiles[idx];
            const p = updated.players[currentPlayer.id];
            const cost = Math.floor(t.mortgageValue * 1.1);
            if (!t || !p || !t.isMortgaged || p.cash < cost || t.ownerId !== currentPlayer.id) return;

            p.cash -= cost;
            t.isMortgaged = false;
            updated.logs.push({
              id: `unmort_${Date.now()}`,
              text: `${p.name} unmortgaged ${t.name} for $${cost}!`,
              timestamp: Date.now(),
              type: 'buy'
            });
            sound.playBuy();
            multiplayer.updateRoom(updated);
            setSelectedTile(t);
          }}
        />
      )}
    </div>
  );
};

export default App;
