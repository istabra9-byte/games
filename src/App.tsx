import React, { useState, useEffect, useRef } from 'react';
import { GameRoom, Player, Tile, TradeOffer, ChatMessage } from './types/game';
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
  endTurn,
  surrenderBankruptcy,
  updateNetWorths
} from './services/gameEngine';
import { multiplayer } from './services/firebase';
import { sound } from './services/sound';
import { INITIAL_BOARD_TILES } from './data/boardTiles';
import { evaluateBotPropertyPurchase, getBotHouseBuildTileIndex, evaluateBotJailExit, evaluateBotTrade } from './services/aiLogic';
import { Home } from './components/Home';
import { Board } from './components/Board';
import { CenterControls } from './components/CenterControls';
import { Lobby } from './components/Lobby';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { RoomSettingsModal } from './components/RoomSettingsModal';
import { Leaderboard } from './components/Leaderboard';
import { ChatAndLogs } from './components/ChatAndLogs';
import { TradeModal } from './components/TradeModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { GameOverModal } from './components/GameOverModal';
import { ShopModal } from './components/ShopModal';
import { secureStorage } from './services/secureStorage';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { PlayerAvatar, PLAYER_COLORS, COLOR_HEXES } from './components/PlayerAvatar';
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
      try {
        const p = JSON.parse(saved);
        if (p.avatar === 'red_wine') p.avatar = 'navy';
        // Ensure color is one of the 8 canonical distinct colors
        if (!COLOR_HEXES.map(c => c.toLowerCase()).includes((p.color || '').toLowerCase())) {
          p.color = COLOR_HEXES[0];
        }
        return p;
      } catch (e) {}
    }
    const newId = `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      id: newId,
      name: `Player_${Math.floor(Math.random() * 900 + 100)}`,
      avatar: 'navy',
      color: '#2563eb', // Royal Blue (from the 8 distinct colors)
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
  const [dismissedTradeOfferKey, setDismissedTradeOfferKey] = useState<string | null>(null);
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(true);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [earnedCoins, setEarnedCoins] = useState<number>(0);
  const [coinRewardToast, setCoinRewardToast] = useState<{ amount: number; reason: string } | null>(null);
  const [boardTheme, setBoardTheme] = useState<string>(() => localStorage.getItem('richup_selected_board_theme') || 'midnight');
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());
  const [isMemeSound, setIsMemeSound] = useState<boolean>(sound.isMemeSoundsEnabled());
  const [memeVolume, setMemeVolume] = useState<number>(() => sound.getMemeVolume());

  const handleCycleMemeVolume = () => {
    let next: number;
    if (memeVolume >= 0.95) next = 0.75;
    else if (memeVolume >= 0.70) next = 0.50;
    else if (memeVolume >= 0.45) next = 0.25;
    else if (memeVolume >= 0.20) next = 0.0;
    else next = 1.0;

    const saved = sound.setMemeVolume(next);
    setMemeVolume(saved);
    setIsMemeSound(saved > 0);
    sound.playSelect();
  };
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(multiplayer.isUsingFirebase());
  const [mobileTab, setMobileTab] = useState<'board' | 'chat' | 'players'>('board');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState<boolean>(false);
  const [droppedMessages, setDroppedMessages] = useState<ChatMessage[]>([]);
  const lastMessageCountRef = useRef<number>(0);
  const prevRoomStatusRef = useRef<string | null>(null);
  const phaseStartedAtRef = useRef<number>(Date.now());
  const prevTurnKeyRef = useRef<string>('');

  // Preload all meme audio clips into local browser memory on mount
  useEffect(() => {
    sound.preloadMemeSounds();
  }, []);

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


  // Shortcut 'T' to open chat and Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.key === 't' || e.key === 'T') && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsChatOpen(true);
        setDroppedMessages([]);
      } else if (e.key === 'Escape') {
        if (isInput) (target as HTMLElement).blur();
        setIsChatOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track incoming dropped messages when chat is closed
  useEffect(() => {
    const currentChat = room?.chat || [];
    if (currentChat.length > lastMessageCountRef.current) {
      if (!isChatOpen && lastMessageCountRef.current > 0) {
        const newArrivals = currentChat.slice(lastMessageCountRef.current);
        setDroppedMessages(prev => [...prev, ...newArrivals].slice(-3));
      }
      lastMessageCountRef.current = currentChat.length;
    }
  }, [room?.chat, isChatOpen]);

  // Auto-expire dropped messages after 5 seconds
  useEffect(() => {
    if (droppedMessages.length > 0) {
      const timer = setTimeout(() => {
        setDroppedMessages(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [droppedMessages]);

  // Synchronize authenticated Firebase user (Google or Anonymous) with currentPlayer
  useEffect(() => {
    const unsub = multiplayer.onAuthChange((user) => {
      if (user) {
        setCurrentPlayer(prev => {
          const isGoogle = !user.isAnonymous && Boolean(user.displayName);
          const updatedName = isGoogle ? (user.displayName || prev.name) : prev.name;
          const updated = {
            ...prev,
            id: user.uid,
            name: updatedName
          };
          localStorage.setItem('richup_player', JSON.stringify(updated));
          return updated;
        });
      }
    });
    return unsub;
  }, []);

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

        // Ensure player color is unique among the 8 colors
        const takenColors = new Set(Object.values(updatedRoom.players).map(p => p.color.toLowerCase()));
        let uniqueColor = currentPlayer.color;
        if (takenColors.has(uniqueColor.toLowerCase())) {
          uniqueColor = PLAYER_COLORS.find(c => !takenColors.has(c.hex.toLowerCase()))?.hex || PLAYER_COLORS[0].hex;
          setCurrentPlayer(prev => ({ ...prev, color: uniqueColor }));
        }

        const playerToAdd: Player = {
          ...currentPlayer,
          color: uniqueColor,
          avatar: currentPlayer.avatar === 'red_wine' ? 'navy' : currentPlayer.avatar,
          isHost: isFirst || updatedRoom.hostId === currentPlayer.id
        };
        const nextRoom = { ...updatedRoom };
        if (isFirst) {
          nextRoom.hostId = currentPlayer.id;
        }
        nextRoom.players = { ...nextRoom.players, [currentPlayer.id]: playerToAdd };
        Object.values(nextRoom.players).forEach(p => {
          if (p.isBot && p.avatar !== 'navy') {
            p.avatar = 'navy';
          }
        });
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

      if (updatedRoom.players) {
        Object.values(updatedRoom.players).forEach(p => {
          if (p.isBot && p.avatar !== 'navy') {
            p.avatar = 'navy';
          }
        });
      }
      if (prevRoomStatusRef.current === 'lobby' && updatedRoom.status === 'playing') {
        sound.playMemeWelcome();
      }
      prevRoomStatusRef.current = updatedRoom.status;

      setRoom(updatedRoom);
      if (updatedRoom.winnerId && updatedRoom.status === 'ended' && prevRoomStatusRef.current !== 'ended') {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        sound.playWinner();
        setShowGameOverModal(true);

        const isMeWinner = updatedRoom.winnerId === currentPlayer.id;
        const reward = isMeWinner ? 50 : 20;
        const reason = isMeWinner ? 'Championship Victory' : 'Match Runner-up Prize';
        const { earned } = secureStorage.earnCoins(reward, reason);
        setEarnedCoins(earned);
        setCoinRewardToast({ amount: earned, reason: isMeWinner ? '🏆 Championship Victory Bonus!' : '🥈 Match Runner-up Prize!' });
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
    }, 1200);

    return () => {
      unsub();
      clearTimeout(initTimer);
    };
  }, [roomId, currentPlayer.id]);

  // Floating Coin Reward Toast Auto-Dismiss
  useEffect(() => {
    if (coinRewardToast) {
      try { sound.playCash(); } catch {}
      const timer = setTimeout(() => setCoinRewardToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [coinRewardToast]);

  // Reset phase start timestamp whenever turn player, turn phase, or dice changes
  useEffect(() => {
    if (!room || room.status !== 'playing') return;
    const turnKey = `${room.currentTurnPlayerIndex}_${room.turnPhase}_${room.dice?.join(',')}`;
    if (prevTurnKeyRef.current !== turnKey) {
      prevTurnKeyRef.current = turnKey;
      phaseStartedAtRef.current = Date.now();
    }
  }, [room?.currentTurnPlayerIndex, room?.turnPhase, room?.dice, room?.status]);

  // Turn Inactivity Timer & Auto-Play System
  // 1. Roll phase: if no roll for 10s, starts 20s timer pill. If expires, auto-rolls.
  // 2. Action/Decision phase: if stopped playing for 10s, starts 3:00m timer pill. If expires, auto-plays.
  // 3. Last 20s: Grant Time option appears (+30s for roll, +1m for action). Friends can also grant time!
  useEffect(() => {
    if (!room || room.status !== 'playing') return;
    const currentTurnId = room.playerOrder[room.currentTurnPlayerIndex];
    const turnPlayer = room.players[currentTurnId];
    if (!turnPlayer || turnPlayer.isBot || turnPlayer.isBankrupt) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const isMyTurn = currentTurnId === currentPlayer.id;
      const isHost = room.hostId === currentPlayer.id;

      // Check if 10 seconds of inactivity has elapsed without action
      if (!room.turnTimer || !room.turnTimer.active) {
        const inactivityMs = now - phaseStartedAtRef.current;
        if (inactivityMs >= 10000) {
          // Current turn player (or host after 12s as network fallback) starts the timer
          if (isMyTurn || (isHost && inactivityMs >= 12000)) {
            const situation: 'roll' | 'action' = room.turnPhase === 'roll' ? 'roll' : 'action';
            const durationMs = situation === 'roll' ? 20000 : 180000; // 20s for roll, 3:00 min for action
            const updatedRoom: GameRoom = JSON.parse(JSON.stringify(room));
            updatedRoom.turnTimer = {
              active: true,
              situation,
              forPlayerId: currentTurnId,
              expiresAt: now + durationMs,
              totalDuration: durationMs
            };
            multiplayer.updateRoom(updatedRoom);
          }
        }
      } else {
        // Timer is active: check if expired (reach 0:00)
        if (now >= room.turnTimer.expiresAt) {
          if (isMyTurn || isHost) {
            if (room.turnTimer.situation === 'roll') {
              // Auto-roll dice on expiration
              handleRoll();
            } else {
              // Auto-play action on expiration
              if (room.turnPhase === 'action') {
                const skipped = skipCurrentProperty(room, currentTurnId);
                if (skipped.turnPhase === 'end') {
                  const ended = endTurn(skipped);
                  ended.turnTimer = null;
                  multiplayer.updateRoom(ended);
                } else {
                  skipped.turnTimer = null;
                  multiplayer.updateRoom(skipped);
                }
              } else {
                const ended = endTurn(room);
                ended.turnTimer = null;
                multiplayer.updateRoom(ended);
              }
            }
          }
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [room, currentPlayer.id]);

  // Intelligent AI Bot player executor
  useEffect(() => {
    if (!room || room.status !== 'playing') return;
    const currentTurnId = room.playerOrder[room.currentTurnPlayerIndex];
    const turnPlayer = room.players[currentTurnId];

    // Only host executes AI bot turns to prevent duplicate/racing updates
    if (room.hostId !== currentPlayer.id) return;

    if (turnPlayer && turnPlayer.isBot && !turnPlayer.isBankrupt) {
      // If a trade proposal involving this bot is pending, pause bot turn until trade resolves
      if (room.activeTrade && (room.activeTrade.receiverId === turnPlayer.id || room.activeTrade.senderId === turnPlayer.id)) {
        return;
      }

      // Allow piece movement animation to finish before bot takes action
      const delay = room.turnPhase === 'action' ? 2000 : 1400;
      const botTimer = setTimeout(() => {
        if (room.turnPhase === 'roll') {
          // Check strategic jail exit
          if (turnPlayer.inJail) {
            const jailExit = evaluateBotJailExit(room, turnPlayer.id);
            if (jailExit === 'bail' && turnPlayer.cash >= 50) {
              const unjailed = JSON.parse(JSON.stringify(room));
              unjailed.players[turnPlayer.id].cash -= 50;
              unjailed.pot += 50;
              unjailed.players[turnPlayer.id].inJail = false;
              unjailed.players[turnPlayer.id].jailTurns = 0;
              unjailed.logs.push({
                id: `bot_bail_${Date.now()}`,
                text: `⚖️ ${turnPlayer.name} paid $50 bail to exit prison!`,
                timestamp: Date.now(),
                type: 'jail'
              });
              sound.playDiceRoll();
              const rolled = rollDice(unjailed, turnPlayer.id);
              multiplayer.updateRoom(rolled);
              return;
            }
          }

          // Check strategic vacation exit for bots
          if (turnPlayer.inVacation && turnPlayer.cash >= 150) {
            const shouldPayVacation = (turnPlayer.vacationTurns || 0) >= 2 || (turnPlayer.cash >= 400 && Math.random() > 0.6);
            if (shouldPayVacation) {
              const unvacationed = JSON.parse(JSON.stringify(room));
              unvacationed.players[turnPlayer.id].cash -= 150;
              unvacationed.pot += 150;
              unvacationed.players[turnPlayer.id].inVacation = false;
              unvacationed.players[turnPlayer.id].vacationTurns = 0;
              unvacationed.logs.push({
                id: `bot_vacation_fee_${Date.now()}`,
                text: `🌴 ${turnPlayer.name} paid $150 island fee to leave Vacation!`,
                timestamp: Date.now(),
                type: 'system',
                playerId: turnPlayer.id
              });
              sound.playDiceRoll();
              const rolled = rollDice(unvacationed, turnPlayer.id);
              multiplayer.updateRoom(rolled);
              return;
            }
          }
          sound.playDiceRoll();
          const nextRoom = rollDice(room, turnPlayer.id);
          multiplayer.updateRoom(nextRoom);
        } else if (room.turnPhase === 'action') {
          const landed = room.tiles[turnPlayer.position];
          let actedRoom: GameRoom;
          if (landed && !landed.ownerId && (landed.type === 'property' || landed.type === 'railroad' || landed.type === 'utility') && landed.price > 0) {
            const decision = evaluateBotPropertyPurchase(room, turnPlayer.id, landed);
            if (decision.shouldBuy) {
              actedRoom = buyCurrentProperty(room, turnPlayer.id);
            } else {
              actedRoom = skipCurrentProperty(room, turnPlayer.id);
            }
          } else {
            actedRoom = { ...room };
          }
          // Smart House Building (Medium-Hard AI: build up to 3 houses per turn while funds permit)
          let buildCount = 0;
          while (buildCount < 3) {
            const bestTileToBuild = getBotHouseBuildTileIndex(actedRoom, turnPlayer.id);
            if (bestTileToBuild !== null) {
              actedRoom = buildHouse(actedRoom, turnPlayer.id, bestTileToBuild);
              buildCount++;
            } else {
              break;
            }
          }
          if (actedRoom.turnPhase === 'end') {
            const nextRoom = endTurn(actedRoom);
            multiplayer.updateRoom(nextRoom);
          } else {
            // Bot rolled doubles or card granted extra roll: keep turnPhase as roll!
            multiplayer.updateRoom(actedRoom);
          }
        } else if (room.turnPhase === 'end') {
          let roomWithUpgrades = room;
          let buildCount = 0;
          while (buildCount < 3) {
            const bestTileToBuild = getBotHouseBuildTileIndex(roomWithUpgrades, turnPlayer.id);
            if (bestTileToBuild !== null) {
              roomWithUpgrades = buildHouse(roomWithUpgrades, turnPlayer.id, bestTileToBuild);
              buildCount++;
            } else {
              break;
            }
          }
          const nextRoom = endTurn(roomWithUpgrades);
          multiplayer.updateRoom(nextRoom);
        }
      }, delay);

      return () => clearTimeout(botTimer);
    }
  }, [room]);

  // Automated AI Bot Trade Evaluation & Response (Host-only execution)
  useEffect(() => {
    if (!room || !room.activeTrade) return;
    if (room.hostId !== currentPlayer.id) return;

    const trade = room.activeTrade;
    const receiver = room.players[trade.receiverId];
    if (receiver && receiver.isBot && !receiver.isBankrupt) {
      // 1.2s thinking time for realistic interactive feel
      const botTradeTimer = setTimeout(() => {
        // Re-check trade is still active and unmodified
        if (!room.activeTrade || room.activeTrade.senderId !== trade.senderId) return;
        const decision = evaluateBotTrade(room, receiver.id, trade);
        if (decision.accept) {
          handleAcceptTrade();
        } else {
          handleDeclineTrade();
        }
      }, 1200);

      return () => clearTimeout(botTradeTimer);
    }
  }, [room?.activeTrade]);

  // Actions
  const handleRoll = () => {
    if (!room || room.status !== 'playing') return;
    const turnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
    // Anti-Cheat: strict turn & phase validation prevents console / speed exploits
    if (turnPlayerId !== currentPlayer.id || room.turnPhase !== 'roll') return;
    phaseStartedAtRef.current = Date.now();
    const updated = rollDice(room, currentPlayer.id);
    multiplayer.updateRoom(updated);
  };

  const handleBuy = () => {
    if (!room || room.status !== 'playing') return;
    const turnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
    if (turnPlayerId !== currentPlayer.id || room.turnPhase !== 'action') return;
    phaseStartedAtRef.current = Date.now();
    const updated = buyCurrentProperty(room, currentPlayer.id);
    multiplayer.updateRoom(updated);
  };

  const handleSkip = () => {
    if (!room || room.status !== 'playing') return;
    const turnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
    if (turnPlayerId !== currentPlayer.id || room.turnPhase !== 'action') return;
    phaseStartedAtRef.current = Date.now();
    const updated = skipCurrentProperty(room, currentPlayer.id);
    multiplayer.updateRoom(updated);
  };

  const handleEndTurn = () => {
    if (!room || room.status !== 'playing') return;
    const turnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
    if (turnPlayerId !== currentPlayer.id || room.turnPhase !== 'end') return;
    phaseStartedAtRef.current = Date.now();
    const updated = endTurn(room);
    multiplayer.updateRoom(updated);
  };

  const handleDeclareBankruptcy = () => {
    if (!room) return;
    phaseStartedAtRef.current = Date.now();
    const updated = surrenderBankruptcy(room, currentPlayer.id);
    multiplayer.updateRoom(updated);
  };

  const handlePayBail = () => {
    if (!room) return;
    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    const p = newRoom.players[currentPlayer.id];
    if (p && p.inJail && p.cash >= 50) {
      phaseStartedAtRef.current = Date.now();
      newRoom.turnTimer = null;
      p.cash -= 50;
      newRoom.pot += 50;
      p.inJail = false;
      p.jailTurns = 0;
      newRoom.logs.push({
        id: `bail_${Date.now()}`,
        text: `⚖️ ${p.name} paid $50 bail and was released!`,
        timestamp: Date.now(),
        type: 'jail',
        playerId: p.id
      });
      sound.playPrisonEscape();
      multiplayer.updateRoom(newRoom);
    }
  };

  const handlePayVacationFee = () => {
    if (!room) return;
    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    const p = newRoom.players[currentPlayer.id];
    if (p && p.inVacation && p.cash >= 150) {
      phaseStartedAtRef.current = Date.now();
      newRoom.turnTimer = null;
      p.cash -= 150;
      newRoom.pot += 150;
      p.inVacation = false;
      p.vacationTurns = 0;
      newRoom.logs.push({
        id: `vacation_fee_${Date.now()}`,
        text: `🌴 ${p.name} paid $150 island fee and departed Vacation!`,
        timestamp: Date.now(),
        type: 'system',
        playerId: p.id
      });
      sound.playSelect();
      multiplayer.updateRoom(newRoom);
    }
  };

  const handleGrantTime = () => {
    if (!room || !room.turnTimer || !room.turnTimer.active) return;
    const timer = room.turnTimer;
    const isRoll = timer.situation === 'roll';
    const addedMs = isRoll ? 30000 : 60000; // +30s for roll, +1m for action
    const label = isRoll ? '30 seconds' : '1 minute';
    const granter = room.players[currentPlayer.id]?.name || 'A player';
    const forPlayer = room.players[timer.forPlayerId]?.name || 'Player';

    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    if (!newRoom.turnTimer) return;
    newRoom.turnTimer.expiresAt += addedMs;
    newRoom.turnTimer.totalDuration += addedMs;
    newRoom.logs.push({
      id: `grant_${Date.now()}`,
      text: `⏱️ ${granter} granted +${label} to ${forPlayer}.`,
      timestamp: Date.now(),
      type: 'system'
    });
    sound.playTurnChime();
    multiplayer.updateRoom(newRoom);
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
    
    // Pick an unused color from the 8 canonical colors so each player has a unique color
    const takenColors = new Set(Object.values(room.players).map(p => p.color.toLowerCase()));
    const availableColor = PLAYER_COLORS.find(c => !takenColors.has(c.hex.toLowerCase()))?.hex || PLAYER_COLORS[botNum % PLAYER_COLORS.length].hex;

    // All AI bots have the classic Navy character appearance with their distinct assigned color



    const newBot: Player = {
      id: botId,
      name: `AI_Bot_${botNum}`,
      avatar: 'navy',
      color: availableColor,
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
    sound.preloadMemeSounds();
    sound.playMemeWelcome();
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
    newRoom.activeTrade = {
      ...offer,
      senderTileIndices: Array.isArray(offer.senderTileIndices) ? offer.senderTileIndices : [],
      receiverTileIndices: Array.isArray(offer.receiverTileIndices) ? offer.receiverTileIndices : [],
      senderCash: typeof offer.senderCash === 'number' ? offer.senderCash : 0,
      receiverCash: typeof offer.receiverCash === 'number' ? offer.receiverCash : 0
    };
    if (!newRoom.logs) newRoom.logs = [];
    newRoom.logs.push({
      id: `trade_off_${Date.now()}`,
      text: `🤝 ${currentPlayer.name} proposed a trade to ${room.players[offer.receiverId]?.name || 'Player'}!`,
      timestamp: Date.now(),
      type: 'trade',
      playerId: currentPlayer.id
    });
    sound.playTurnChime();
    setDismissedTradeOfferKey(null);
    multiplayer.updateRoom(newRoom);
    // Keep modal open so sender sees active waiting spinner with cancel button
    setShowTradeModal(true);
  };

  const handleAcceptTrade = () => {
    if (!room || !room.activeTrade) return;
    const trade = room.activeTrade;
    const sender = room.players[trade.senderId];
    const receiver = room.players[trade.receiverId];
    if (!sender || !receiver) return;

    const prevSenderCash = sender.cash;
    const prevReceiverCash = receiver.cash;

    const senderTileIndices = Array.isArray(trade.senderTileIndices) ? trade.senderTileIndices : [];
    const receiverTileIndices = Array.isArray(trade.receiverTileIndices) ? trade.receiverTileIndices : [];
    const senderCash = typeof trade.senderCash === 'number' ? trade.senderCash : 0;
    const receiverCash = typeof trade.receiverCash === 'number' ? trade.receiverCash : 0;

    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    if (!newRoom.players[trade.senderId] || !newRoom.players[trade.receiverId]) return;

    newRoom.players[trade.senderId].cash -= senderCash;
    newRoom.players[trade.receiverId].cash += senderCash;
    newRoom.players[trade.receiverId].cash -= receiverCash;
    newRoom.players[trade.senderId].cash += receiverCash;

    senderTileIndices.forEach(idx => {
      if (newRoom.tiles[idx]) {
        newRoom.tiles[idx].ownerId = trade.receiverId;
      }
    });
    receiverTileIndices.forEach(idx => {
      if (newRoom.tiles[idx]) {
        newRoom.tiles[idx].ownerId = trade.senderId;
      }
    });

    if (!newRoom.logs) newRoom.logs = [];
    newRoom.logs.push({
      id: `trade_done_${Date.now()}`,
      text: `✅ Trade completed between ${sender.name} and ${receiver.name}!`,
      timestamp: Date.now(),
      type: 'trade',
      playerId: sender.id
    });

    // Check if one player gave cash and received nothing in trade
    const senderGaveMoneyGotNothing = senderCash > 0 && receiverCash === 0 && receiverTileIndices.length === 0;
    const receiverGaveMoneyGotNothing = receiverCash > 0 && senderCash === 0 && senderTileIndices.length === 0;

    // Check debt cleared for either player
    if (prevSenderCash < 0 && newRoom.players[trade.senderId].cash >= 0) {
      sound.playDebtCleared();
    } else if (prevReceiverCash < 0 && newRoom.players[trade.receiverId].cash >= 0) {
      sound.playDebtCleared();
    } else if (senderGaveMoneyGotNothing || receiverGaveMoneyGotNothing) {
      sound.playTradeOneWayCash();
    } else {
      sound.playTrade();
    }

    // Check if either player now holds 3 of 3 or 2 of 3 in China (red group)
    const chinaSender = newRoom.tiles.filter(t => t.group === 'red' && t.ownerId === trade.senderId).length;
    const chinaReceiver = newRoom.tiles.filter(t => t.group === 'red' && t.ownerId === trade.receiverId).length;
    if (chinaSender === 3 || chinaReceiver === 3) {
      sound.playChinaFullMonopoly();
    } else if (chinaSender === 2 || chinaReceiver === 2) {
      sound.playChinaNearMonopoly();
    }
    newRoom.activeTrade = null;
    updateNetWorths(newRoom);
    setShowTradeModal(false);
    setDismissedTradeOfferKey(null);
    multiplayer.updateRoom(newRoom);
  };

  const handleDeclineTrade = () => {
    if (!room) return;
    const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
    if (!newRoom.logs) newRoom.logs = [];
    newRoom.logs.push({
      id: `trade_decl_${Date.now()}`,
      text: `❌ Trade proposal was declined.`,
      timestamp: Date.now(),
      type: 'trade'
    });
    newRoom.activeTrade = null;
    setShowTradeModal(false);
    setDismissedTradeOfferKey(null);
    multiplayer.updateRoom(newRoom);
  };

  // 1. HOME SCREEN (When on root or no room specified)
  if (!roomId) {
    return (
      <Home
        onJoinRoom={(rid, name) => {
          sound.preloadMemeSounds();
          setCurrentPlayer(prev => ({ ...prev, name }));
          setRoomId(rid);
        }}
        onCreatePrivateRoom={(name) => {
          sound.preloadMemeSounds();
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
          Entering Room {roomId}...
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
          currentBoardTheme={boardTheme}
          onSelectBoardTheme={(themeId) => setBoardTheme(themeId)}
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
      {/* Top Header Navigation matching Richup */}
      <header className="h-9 sm:h-10 border-b border-purple-900/40 bg-[#160f25] px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setRoomId('')}
            className="text-lg sm:text-xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-400 to-purple-400 hover:opacity-85 transition-opacity cursor-pointer flex-shrink-0 leading-none"
          >
            MONOPOLY
          </button>

          {!isCurrentPlayerInGame && (
            <span className="hidden sm:inline px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold whitespace-nowrap leading-none">
              Spectator
            </span>
          )}
        </div>

        {/* Right Actions: Clean minimal controls matching Richup */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile Chat drawer toggle (< 1024px) */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (!isChatOpen) setIsPlayersOpen(false);
            }}
            title="Chat"
            className={`lg:hidden px-2 py-1 border rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer relative ${
              isChatOpen 
                ? 'bg-purple-600 text-white border-purple-400 shadow-md' 
                : 'bg-[#21163b] hover:bg-[#2e1f52] border-purple-800/60 text-purple-200'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span className="hidden sm:inline">Chat</span>
            {droppedMessages.length > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Mobile Players drawer toggle (< 1024px) */}
          <button
            onClick={() => {
              setIsPlayersOpen(!isPlayersOpen);
              if (!isPlayersOpen) setIsChatOpen(false);
            }}
            title="Players & Standings"
            className={`lg:hidden px-2 py-1 border rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isPlayersOpen
                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                : 'bg-[#21163b] hover:bg-[#2e1f52] border-purple-800/60 text-purple-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Players</span>
          </button>

          {/* Tunisian Meme Sounds Volume Control */}
          <button
            onClick={handleCycleMemeVolume}
            title={`Meme Sound Volume: ${Math.round(memeVolume * 100)}% (Click to reduce/cycle)`}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
              memeVolume > 0 && isMemeSound
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 shadow-sm'
                : 'bg-[#21163b] text-gray-400 border-purple-800/60 hover:text-gray-200'
            }`}
          >
            <span className="text-xs">🎭</span>
            <span className="font-mono">
              {memeVolume > 0 && isMemeSound ? `${Math.round(memeVolume * 100)}%` : 'Muted'}
            </span>
            <span className="hidden sm:inline text-[10px] text-amber-400/80">Memes</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => setIsMuted(sound.toggleMute())}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1 rounded-lg bg-[#21163b] hover:bg-[#2e1f52] border border-purple-800/60 text-purple-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
          </button>

          {/* Leave game to home */}
          <button
            onClick={() => setRoomId('')}
            title="Exit to Main Menu"
            className="px-1.5 py-1 flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Screen 3-Column Area: LeftSidebar (Share & Chat), Board, RightSidebar (Players, Bankrupt, Trades, My Properties) */}
      <div className="flex-1 w-full min-h-0 px-2 sm:px-3 py-1 sm:py-1.5 flex items-center justify-center gap-2.5 sm:gap-3 overflow-hidden relative">
        {/* Desktop Left Sidebar: Share this game & Permanent Chat */}
        <div className="hidden lg:flex w-64 xl:w-72 h-full flex-col flex-shrink-0">
          <LeftSidebar
            room={room}
            currentPlayer={currentPlayer}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        </div>

        {/* Center Hero: The Board with Embedded Center Controls */}
        <div className="flex-1 h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden py-1 px-1 relative [container-type:size]">
          <Board
            room={room}
            currentPlayerId={currentPlayer.id}
            boardThemeId={boardTheme}
            onTileClick={(tile) => setSelectedTile(tile)}
            centerContent={({ isPieceMoving }) => (
              <CenterControls
                room={room}
                currentPlayerId={currentPlayer.id}
                isPieceMoving={isPieceMoving}
                onRoll={handleRoll}
                onBuy={handleBuy}
                onSkip={handleSkip}
                onEndTurn={handleEndTurn}
                onPayBail={handlePayBail}
                onPayVacationFee={handlePayVacationFee}
                onRequestTime={handleRequestTime}
                onGrantTime={handleGrantTime}
                onTileClick={(tile) => setSelectedTile(tile)}
              />
            )}
          />
        </div>

        {/* Desktop Right Sidebar: Players, Bankrupt, Trades, My Properties */}
        <div className="hidden lg:flex w-64 xl:w-72 h-full flex-col flex-shrink-0">
          <RightSidebar
            room={room}
            currentPlayerId={currentPlayer.id}
            onInitiateTrade={(targetId) => { setSelectedTradePartnerId(targetId); setShowTradeModal(true); }}
            onOpenTradeModal={() => { setSelectedTradePartnerId(''); setShowTradeModal(true); }}
            onSelectTile={(tile) => setSelectedTile(tile)}
            onDeclareBankruptcy={handleDeclareBankruptcy}
            onGrantTime={handleGrantTime}
          />
        </div>
      </div>

      {/* Mobile/Tablet Drawer for Left Sidebar (Chat & Share) */}
      {isChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden cursor-pointer"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="fixed top-12 bottom-3 left-3 z-50 w-80 max-w-[calc(100vw-1.5rem)] flex flex-col animate-in slide-in-from-left duration-200 shadow-2xl lg:hidden">
            <LeftSidebar
              room={room}
              currentPlayer={currentPlayer}
              onSendMessage={handleSendMessage}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          </div>
        </>
      )}

      {/* Mobile/Tablet Drawer for Right Sidebar (Players, Bankrupt, Trades, My Properties) */}
      {isPlayersOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden cursor-pointer"
            onClick={() => setIsPlayersOpen(false)}
          />
          <div className="fixed top-12 bottom-3 right-3 z-50 w-80 max-w-[calc(100vw-1.5rem)] flex flex-col animate-in slide-in-from-right duration-200 shadow-2xl lg:hidden">
            <RightSidebar
              room={room}
              currentPlayerId={currentPlayer.id}
              onInitiateTrade={(targetId) => { setSelectedTradePartnerId(targetId); setShowTradeModal(true); }}
              onOpenTradeModal={() => { setSelectedTradePartnerId(''); setShowTradeModal(true); }}
              onSelectTile={(tile) => setSelectedTile(tile)}
              onDeclareBankruptcy={handleDeclareBankruptcy}
              onGrantTime={handleGrantTime}
            />
          </div>
        </>
      )}

      {/* Floating Incoming Messages when Chat is Closed on mobile */}
      {!isChatOpen && droppedMessages.length > 0 && (
        <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2 max-w-xs sm:max-w-sm pointer-events-none lg:hidden">
          {droppedMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => {
                setIsChatOpen(true);
                setDroppedMessages([]);
              }}
              className="pointer-events-auto cursor-pointer p-2.5 bg-[#171126]/95 border border-purple-500/60 rounded-xl shadow-2xl backdrop-blur-md flex items-start gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-200 hover:scale-102 transition-transform"
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <PlayerAvatar color={msg.senderColor || '#ff4081'} size={24} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs" style={{ color: msg.senderColor || '#ff4081' }}>
                    {msg.senderName}
                  </span>
                  <span className="text-[9px] text-gray-500">just now</span>
                </div>
                <p className="text-xs text-gray-200 break-words leading-tight mt-0.5">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSettingsModal && (
        <RoomSettingsModal
          settings={room.settings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {(() => {
        const activeTradeKey = room?.activeTrade
          ? `${room.activeTrade.senderId}_${room.activeTrade.receiverId}_${room.activeTrade.senderCash}_${room.activeTrade.receiverCash}_${(room.activeTrade.senderTileIndices || []).join('-')}`
          : null;

        const isIncomingTradeForMe = Boolean(
          room?.activeTrade &&
          room.activeTrade.receiverId === currentPlayer.id &&
          dismissedTradeOfferKey !== activeTradeKey
        );

        const isPendingOutgoingTrade = Boolean(
          room?.activeTrade &&
          room.activeTrade.senderId === currentPlayer.id &&
          dismissedTradeOfferKey !== activeTradeKey
        );

        const shouldShow = showTradeModal || isIncomingTradeForMe || isPendingOutgoingTrade;

        if (!shouldShow) return null;

        return (
          <TradeModal
            room={room}
            currentPlayerId={currentPlayer.id}
            initialPartnerId={selectedTradePartnerId}
            onSendTrade={handleSendTrade}
            onAcceptTrade={handleAcceptTrade}
            onDeclineTrade={handleDeclineTrade}
            onClose={() => {
              setShowTradeModal(false);
              if (activeTradeKey) {
                setDismissedTradeOfferKey(activeTradeKey);
              }
            }}
          />
        );
      })()}

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
            const currentHouses = room.tiles[idx]?.houses || 0;
            const updated = buildHouse(room, currentPlayer.id, idx);
            multiplayer.updateRoom(updated);
            setSelectedTile(updated.tiles[idx]);
            if (currentHouses === 4) {
              const { earned } = secureStorage.earnCoins(10, 'Hotel Built');
              setCoinRewardToast({ amount: earned, reason: '🏨 Built a Grand Luxury Hotel!' });
            }
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

      {/* Floating Coin Reward Toast */}
      {coinRewardToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-purple-950 font-black px-4 py-2 rounded-2xl shadow-[0_6px_30px_rgba(245,158,11,0.65)] flex items-center gap-2.5 border-2 border-yellow-200 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
          <span className="text-xl leading-none">🪙</span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black">+{coinRewardToast.amount} Free Coins Earned!</span>
            <span className="text-[10px] font-bold opacity-85">{coinRewardToast.reason}</span>
          </div>
        </div>
      )}

      {/* Game Over Victory Modal */}
      {room && room.status === 'ended' && room.winnerId && showGameOverModal && (
        <GameOverModal
          room={room}
          currentPlayerId={currentPlayer.id}
          earnedCoins={earnedCoins}
          onPlayAgain={() => {
            const nextRoom = createInitialRoom(room.id, currentPlayer);
            multiplayer.updateRoom(nextRoom);
            setShowGameOverModal(false);
          }}
          onReturnHome={() => {
            setRoomId('');
            setRoom(null);
            setShowGameOverModal(false);
            window.location.hash = '';
          }}
          onOpenShop={() => {
            setShowShopModal(true);
          }}
        />
      )}

      {/* Character & Board Theme Shop Modal */}
      {showShopModal && (
        <ShopModal
          currentAvatar={currentPlayer.avatar}
          onSelectAvatar={(style, color) => {
            const chosenColor = color || currentPlayer.color;
            setCurrentPlayer(prev => ({ ...prev, avatar: style, color: chosenColor }));
            if (room && room.players[currentPlayer.id]) {
              const updated = JSON.parse(JSON.stringify(room));
              updated.players[currentPlayer.id].avatar = style;
              updated.players[currentPlayer.id].color = chosenColor;
              multiplayer.updateRoom(updated);
            }
          }}
          currentBoardTheme={boardTheme}
          onSelectBoardTheme={(themeId) => {
            setBoardTheme(themeId);
            localStorage.setItem('richup_selected_board_theme', themeId);
          }}
          onClose={() => setShowShopModal(false)}
        />
      )}

    </div>
  );
};

export default App;
