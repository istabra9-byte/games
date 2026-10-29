import React, { useState, useEffect } from 'react';
import { GameRoom, Player, Tile, TradeOffer } from './types/game';
import { 
  createInitialRoom, 
  startGame, 
  rollDice, 
  buyCurrentProperty, 
  skipCurrentProperty,
  canBuildHouse,
  buildHouse,
  sellHouse,
  mortgageProperty,
  unmortgageProperty,
  sellPropertyToBank, 
  endTurn 
} from './services/gameEngine';
import { multiplayer } from './services/firebase';
import { sound } from './services/sound';
import { Home } from './components/Home';
import { Board } from './components/Board';
import { CenterControls } from './components/CenterControls';
import { Lobby } from './components/Lobby';
import { Leaderboard } from './components/Leaderboard';
import { ChatAndLogs } from './components/ChatAndLogs';
import { TradeModal } from './components/TradeModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { Volume2, VolumeX, Flame, LogOut, MessageSquare, Users, Dices, RotateCcw } from 'lucide-react';
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

  // Read roomId from URL hash or query; empty string means Home view
  const [roomId, setRoomId] = useState<string>(() => {
    const hashMatch = window.location.hash.match(/room[=/]([a-zA-Z0-9]+)/);
    if (hashMatch) return hashMatch[1];
    const searchMatch = window.location.search.match(/room=([a-zA-Z0-9]+)/);
    if (searchMatch) return searchMatch[1];
    return '';
  });

  const [room, setRoom] = useState<GameRoom | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showTradeModal, setShowTradeModal] = useState<boolean>(false);
  const [selectedTradePartnerId, setSelectedTradePartnerId] = useState<string>('');
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(multiplayer.isUsingFirebase());
  const [mobileTab, setMobileTab] = useState<'board' | 'chat' | 'players'>('board');

  // Sync window.location.hash
  useEffect(() => {
    if (roomId) {
      window.location.hash = `/room/${roomId}`;
    } else {
      window.location.hash = '';
    }
  }, [roomId]);

  // Listen to hash changes (e.g. back button or pasted link)
  useEffect(() => {
    const handleHash = () => {
      const match = window.location.hash.match(/room[=/]([a-zA-Z0-9]+)/);
      if (match) {
        if (match[1] !== roomId) setRoomId(match[1]);
      } else {
        setRoomId('');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [roomId]);


  // Shortcut 'T' to open and focus chat like standard gaming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.key === 't' || e.key === 'T') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setMobileTab('chat');
        setTimeout(() => {
          const chatInput = document.querySelector<HTMLInputElement>('input[placeholder*="Type a message"]');
          if (chatInput) {
            chatInput.focus();
          }
        }, 50);
      } else if (e.key === 'Escape' && isInput) {
        (target as HTMLElement).blur();
        if (mobileTab === 'chat') {
          setMobileTab('board');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileTab]);

  // Save current player info locally
  useEffect(() => {
    localStorage.setItem('richup_player', JSON.stringify(currentPlayer));
  }, [currentPlayer]);

  // Subscribe to room updates when roomId is set
  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      return;
    }

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
            handleSkip();
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

    // Only host executes AI bot turns to prevent duplicate/racing updates
    if (room.hostId !== currentPlayer.id) return;

    if (turnPlayer && turnPlayer.isBot && !turnPlayer.isBankrupt) {
      const botTimer = setTimeout(() => {
        if (room.turnPhase === 'roll') {
          const nextRoom = rollDice(room, turnPlayer.id);
          multiplayer.updateRoom(nextRoom);
        } else if (room.turnPhase === 'action') {
          const landed = room.tiles[turnPlayer.position];
          if (landed && !landed.ownerId && turnPlayer.cash >= landed.price + 50) {
            const nextRoom = buyCurrentProperty(room, turnPlayer.id);
            multiplayer.updateRoom(nextRoom);
          } else {
            const nextRoom = skipCurrentProperty(room, turnPlayer.id);
            multiplayer.updateRoom(nextRoom);
          }
        } else if (room.turnPhase === 'end') {
          // AI can build houses if it owns a monopoly
          let roomWithUpgrades = room;
          const monopolyTiles = room.tiles.filter((_, idx) => canBuildHouse(room, turnPlayer.id, idx));
          if (monopolyTiles.length > 0 && turnPlayer.cash >= 300) {
            roomWithUpgrades = buildHouse(room, turnPlayer.id, monopolyTiles[0].index);
          }
          const nextRoom = endTurn(roomWithUpgrades);
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

  const handleSkip = () => {
    if (!room) return;
    const updated = skipCurrentProperty(room, currentPlayer.id);
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

  const handleRestartRoom = () => {
    if (!room) return;
    const freshRoom = createInitialRoom(room.id, currentPlayer, room.settings);
    multiplayer.updateRoom(freshRoom);
    setRoom(freshRoom);
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

  // 1. HOME SCREEN (When on root or no room specified)
  if (!roomId) {
    return (
      <Home
        onJoinRoom={(rid, name) => {
          setCurrentPlayer(prev => ({ ...prev, name }));
          setRoomId(rid);
        }}
        onCreatePrivateRoom={(name) => {
          setCurrentPlayer(prev => ({ ...prev, name }));
          setRoomId(generateRoomId());
        }}
      />
    );
  }

  // 2. LOADING SCREEN
  if (!room) {
    return (
      <div className="w-screen h-screen bg-[#130f1d] flex flex-col items-center justify-center text-white select-none">
        <div className="w-10 h-10 border-4 border-[#6647e0] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xl font-bold font-heading tracking-widest text-purple-200">
          Entering Richup Room {roomId}...
        </span>
      </div>
    );
  }

  // 3. LOBBY SCREEN
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

  const isCurrentPlayerInGame = Boolean(room.players[currentPlayer.id]);

  // 4. GAME PLAYING / ENDED SCREEN
  return (
    <div className="w-screen h-screen bg-[#130f1d] flex flex-col overflow-hidden text-white font-sans select-none">
      {/* Top Header Navigation */}
      <header className="h-12 border-b border-purple-900/40 bg-[#160f25] px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setRoomId('')}
            className="text-2xl sm:text-3xl font-black font-heading tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-400 hover:opacity-80 transition-opacity cursor-pointer"
          >
            RICHUP
          </button>
          <span className="text-[11px] text-purple-300 font-mono bg-[#21163b] px-2 py-0.5 rounded-md border border-purple-800/60">
            Room: {room.id}
          </span>

          {!isCurrentPlayerInGame && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
              Spectator Mode
            </span>
          )}
        </div>

        {/* Mobile Navigation Pills */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            onClick={() => setMobileTab(mobileTab === 'chat' ? 'board' : 'chat')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-colors ${
              mobileTab === 'chat'
                ? 'bg-[#6647e0] text-white border-purple-400'
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
                ? 'bg-[#6647e0] text-white border-purple-400'
                : 'bg-[#21163b] text-purple-200 border-purple-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Players</span>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Propose Trade button */}
          <button
            onClick={() => setShowTradeModal(true)}
            title="Propose Trade with Player"
            className="px-2.5 py-1 bg-[#21163b] hover:bg-[#2e1f52] border border-purple-800/60 text-purple-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Trade</span>
          </button>

          {/* Restart match button */}
          <button
            onClick={handleRestartRoom}
            title="Restart Match / New Game"
            className="px-2.5 py-1 bg-[#21163b] hover:bg-[#2e1f52] border border-purple-800/60 text-purple-200 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => setIsMuted(sound.toggleMute())}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg bg-[#21163b] hover:bg-[#2e1f52] border border-purple-800/60 text-purple-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Leave game to home */}
          <button
            onClick={() => setRoomId('')}
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main 3-Pane Screen: Left Utility/Chat | Center Board | Right Leaderboard */}
      <div className="flex-1 w-full max-w-[1550px] mx-auto p-2 sm:p-3 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-3 overflow-hidden relative">
        {/* Left Pane: Chat & Activity Logs */}
        <div className={`w-full lg:w-64 h-full flex-col flex-shrink-0 ${
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

        {/* Center Hero: The Board with Embedded Center Controls */}
        <div className="flex-1 w-full h-full min-h-0 min-w-0 flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          <Board
            room={room}
            onTileClick={(tile) => setSelectedTile(tile)}
            centerContent={
              <CenterControls
                room={room}
                currentPlayerId={currentPlayer.id}
                onRoll={handleRoll}
                onBuy={handleBuy}
                onSkip={handleSkip}
                onEndTurn={handleEndTurn}
                onPayBail={handlePayBail}
                onRequestTime={handleRequestTime}
                onTileClick={(tile) => setSelectedTile(tile)}
              />
            }
          />
        </div>

        {/* Right Pane: Players Leaderboard */}
        <div className={`w-full lg:w-64 h-full flex-col flex-shrink-0 ${
          mobileTab === 'players'
            ? 'fixed inset-0 top-12 z-40 bg-[#130f1d] p-3 flex'
            : 'hidden lg:flex'
        }`}>
          <Leaderboard
            room={room}
            currentPlayerId={currentPlayer.id}
            onInitiateTrade={(targetId) => { setSelectedTradePartnerId(targetId); setShowTradeModal(true); }}
          />
        </div>
      </div>

      {(showTradeModal || room.activeTrade) && (
        <TradeModal
          room={room}
          currentPlayerId={currentPlayer.id}
          initialPartnerId={selectedTradePartnerId}
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
          onBuyProperty={(idx) => {
            const updated = buyCurrentProperty(room, currentPlayer.id);
            multiplayer.updateRoom(updated);
            setSelectedTile(updated.tiles[idx]);
          }}
          onSkipProperty={handleSkip}
          onSellProperty={(idx) => {
            const updated = sellPropertyToBank(room, currentPlayer.id, idx);
            multiplayer.updateRoom(updated);
            setSelectedTile(updated.tiles[idx]);
          }}
          onBuildHouse={(idx) => {
            const updated = buildHouse(room, currentPlayer.id, idx);
            multiplayer.updateRoom(updated);
            setSelectedTile(updated.tiles[idx]);
          }}
          onSellHouse={(idx) => {
            const updated = sellHouse(room, currentPlayer.id, idx);
            multiplayer.updateRoom(updated);
            setSelectedTile(updated.tiles[idx]);
          }}
          onMortgage={(idx) => {
            const updated = mortgageProperty(room, currentPlayer.id, idx);
            multiplayer.updateRoom(updated);
            setSelectedTile(updated.tiles[idx]);
          }}
          onUnmortgage={(idx) => {
            const updated = unmortgageProperty(room, currentPlayer.id, idx);
            multiplayer.updateRoom(updated);
            setSelectedTile(updated.tiles[idx]);
          }}
        />
      )}
    </div>
  );
};

export default App;
