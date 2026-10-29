import { GameRoom, Player, GameSettings, Tile, TurnPhase, GameLog, AuctionState } from '../types/game';
import { INITIAL_BOARD_TILES, PROPERTY_GROUPS } from '../data/boardTiles';
import { CHANCE_CARDS, CHEST_CARDS } from '../data/cards';
import { sound } from './sound';

export function createDefaultSettings(): GameSettings {
  return {
    maxPlayers: 6,
    startingCash: 1500,
    salary: 200,
    canBotsJoin: true,
    auction: true,
    vacationCash: true,
    evenBuild: true,
    payDoubleRentWhenOwnFullSet: true,
    noRentPaymentsWhileInPrison: false,
    turnTimeLimit: 60,
    isPrivate: false
  };
}

export function createInitialRoom(roomId: string, hostPlayer: Player, settings?: Partial<GameSettings>): GameRoom {
  const mergedSettings = { ...createDefaultSettings(), ...settings };
  return {
    id: roomId,
    status: 'lobby',
    hostId: hostPlayer.id,
    settings: mergedSettings,
    players: { [hostPlayer.id]: hostPlayer },
    playerOrder: [hostPlayer.id],
    currentTurnPlayerIndex: 0,
    turnPhase: 'roll',
    turnEndsAt: Date.now() + mergedSettings.turnTimeLimit * 1000,
    dice: [1, 1],
    isDoubles: false,
    consecutiveDoubles: 0,
    pot: 0,
    tiles: JSON.parse(JSON.stringify(INITIAL_BOARD_TILES)),
    auction: null,
    activeTrade: null,
    chat: [],
    logs: [
      {
        id: 'init',
        text: `Room created by ${hostPlayer.name}`,
        timestamp: Date.now(),
        type: 'system'
      }
    ],
    winnerId: null,
    lastUpdated: Date.now()
  };
}

export function startGame(room: GameRoom): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  newRoom.status = 'playing';
  newRoom.turnPhase = 'roll';
  newRoom.currentTurnPlayerIndex = 0;
  newRoom.turnEndsAt = Date.now() + newRoom.settings.turnTimeLimit * 1000;
  
  // Set all player starting cash and position
  Object.keys(newRoom.players).forEach(pId => {
    newRoom.players[pId].cash = newRoom.settings.startingCash;
    newRoom.players[pId].position = 0;
    newRoom.players[pId].inJail = false;
    newRoom.players[pId].jailTurns = 0;
    newRoom.players[pId].isBankrupt = false;
    newRoom.players[pId].netWorth = newRoom.settings.startingCash;
  });

  newRoom.logs.push({
    id: `start_${Date.now()}`,
    text: 'Game has started! Rule the economy!',
    timestamp: Date.now(),
    type: 'system'
  });

  return newRoom;
}

export function rollDice(room: GameRoom, playerId: string): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  if (!player || player.isBankrupt) return room;

  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const isDoubles = d1 === d2;
  const rollTotal = d1 + d2;

  newRoom.dice = [d1, d2];
  newRoom.isDoubles = isDoubles;

  sound.playDiceRoll();

  newRoom.logs.push({
    id: `roll_${Date.now()}`,
    text: `${player.name} rolled ${d1} and ${d2} (${rollTotal})${isDoubles ? ' - DOUBLES!' : ''}`,
    timestamp: Date.now(),
    type: 'roll'
  });

  // Handle player in Jail
  if (player.inJail) {
    if (isDoubles) {
      player.inJail = false;
      player.jailTurns = 0;
      newRoom.logs.push({
        id: `jail_free_${Date.now()}`,
        text: `${player.name} rolled doubles and escaped jail!`,
        timestamp: Date.now(),
        type: 'jail'
      });
      sound.playBuy();
    } else {
      player.jailTurns += 1;
      if (player.jailTurns >= 3) {
        // Force pay bail
        player.cash -= 50;
        newRoom.pot += 50;
        player.inJail = false;
        player.jailTurns = 0;
        newRoom.logs.push({
          id: `jail_pay_${Date.now()}`,
          text: `${player.name} served 3 turns, paid $50 bail and was released.`,
          timestamp: Date.now(),
          type: 'jail'
        });
      } else {
        newRoom.logs.push({
          id: `jail_stay_${Date.now()}`,
          text: `${player.name} remains in jail (Turn ${player.jailTurns}/3).`,
          timestamp: Date.now(),
          type: 'jail'
        });
        newRoom.turnPhase = 'end';
        return newRoom;
      }
    }
  }

  // Handle consecutive doubles
  if (isDoubles) {
    newRoom.consecutiveDoubles += 1;
    if (newRoom.consecutiveDoubles >= 3) {
      player.position = 10;
      player.inJail = true;
      newRoom.consecutiveDoubles = 0;
      newRoom.turnPhase = 'end';
      newRoom.logs.push({
        id: `jail_3doubles_${Date.now()}`,
        text: `${player.name} rolled 3 consecutive doubles and was sent directly to Jail!`,
        timestamp: Date.now(),
        type: 'jail'
      });
      sound.playJail();
      return newRoom;
    }
  } else {
    newRoom.consecutiveDoubles = 0;
  }

  // Move player
  const oldPos = player.position;
  const newPos = (oldPos + rollTotal) % 40;
  player.position = newPos;

  // Passed GO?
  if (newPos < oldPos) {
    player.cash += newRoom.settings.salary;
    newRoom.logs.push({
      id: `salary_${Date.now()}`,
      text: `${player.name} passed START and collected $${newRoom.settings.salary} salary.`,
      timestamp: Date.now(),
      type: 'system'
    });
    sound.playCash();
  }

  // Handle Landing on Tile
  const tile = newRoom.tiles[newPos];

  if (tile.type === 'start') {
    newRoom.turnPhase = isDoubles ? 'roll' : 'end';
  } else if (tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility') {
    if (tile.ownerId === null) {
      // Unowned: player can buy or trigger auction
      newRoom.turnPhase = 'action';
    } else if (tile.ownerId === player.id) {
      // Owned by current player
      newRoom.turnPhase = isDoubles ? 'roll' : 'end';
    } else {
      // Owned by someone else -> pay rent!
      const owner = newRoom.players[tile.ownerId];
      if (owner && !owner.isBankrupt && !tile.isMortgaged) {
        if (owner.inJail && newRoom.settings.noRentPaymentsWhileInPrison) {
          newRoom.logs.push({
            id: `rent_skip_${Date.now()}`,
            text: `${owner.name} is in jail and cannot collect rent!`,
            timestamp: Date.now(),
            type: 'rent'
          });
        } else {
          const rentAmount = calculateRent(newRoom, tile, rollTotal);
          player.cash -= rentAmount;
          owner.cash += rentAmount;
          newRoom.logs.push({
            id: `rent_${Date.now()}`,
            text: `${player.name} landed on ${tile.name} and paid $${rentAmount} rent to ${owner.name}!`,
            timestamp: Date.now(),
            type: 'rent'
          });
          sound.playCash();

          if (player.cash < 0) {
            handleBankruptcy(newRoom, player.id, owner.id);
          }
        }
      }
      newRoom.turnPhase = isDoubles ? 'roll' : 'end';
    }
  } else if (tile.type === 'tax') {
    player.cash -= tile.price;
    newRoom.pot += tile.price;
    newRoom.logs.push({
      id: `tax_${Date.now()}`,
      text: `${player.name} paid $${tile.price} in ${tile.name} (added to Vacation Pot)!`,
      timestamp: Date.now(),
      type: 'rent'
    });
    if (player.cash < 0) {
      handleBankruptcy(newRoom, player.id, null);
    }
    newRoom.turnPhase = isDoubles ? 'roll' : 'end';
  } else if (tile.type === 'vacation') {
    if (newRoom.settings.vacationCash && newRoom.pot > 0) {
      const potCash = newRoom.pot;
      player.cash += potCash;
      newRoom.pot = 0;
      newRoom.logs.push({
        id: `pot_${Date.now()}`,
        text: `🌴 ${player.name} landed on VACATION and won the $${potCash} pot!`,
        timestamp: Date.now(),
        type: 'system'
      });
      sound.playCash();
    }
    newRoom.turnPhase = isDoubles ? 'roll' : 'end';
  } else if (tile.type === 'go_to_jail') {
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    newRoom.consecutiveDoubles = 0;
    newRoom.turnPhase = 'end';
    newRoom.logs.push({
      id: `jail_land_${Date.now()}`,
      text: `${player.name} landed on GO TO JAIL! Off to jail!`,
      timestamp: Date.now(),
      type: 'jail'
    });
    sound.playJail();
  } else if (tile.type === 'chance' || tile.type === 'chest') {
    const cardDeck = tile.type === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
    const card = cardDeck[Math.floor(Math.random() * cardDeck.length)];
    applyCardEffect(newRoom, player, card);
    newRoom.turnPhase = isDoubles ? 'roll' : 'end';
  } else {
    newRoom.turnPhase = isDoubles ? 'roll' : 'end';
  }

  updateNetWorths(newRoom);
  return newRoom;
}

export function buyCurrentProperty(room: GameRoom, playerId: string): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[player.position];

  if (!tile || tile.ownerId !== null || player.cash < tile.price) return room;

  player.cash -= tile.price;
  tile.ownerId = playerId;

  newRoom.logs.push({
    id: `buy_${Date.now()}`,
    text: `${player.name} bought ${tile.name} for $${tile.price}!`,
    timestamp: Date.now(),
    type: 'buy'
  });

  sound.playBuy();
  newRoom.turnPhase = newRoom.isDoubles ? 'roll' : 'end';
  updateNetWorths(newRoom);
  return newRoom;
}

export function startAuctionForCurrentTile(room: GameRoom, playerId: string): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[player.position];

  if (!tile || tile.ownerId !== null) return room;

  const auction: AuctionState = {
    tileIndex: tile.index,
    currentBid: 10,
    highestBidderId: null,
    highestBidderName: null,
    passedPlayerIds: [playerId],
    expiresAt: Date.now() + 25000
  };

  newRoom.auction = auction;
  newRoom.turnPhase = 'auction';

  newRoom.logs.push({
    id: `auction_start_${Date.now()}`,
    text: `Auction started for ${tile.name}! Starting bid: $10.`,
    timestamp: Date.now(),
    type: 'auction'
  });

  sound.playBid();
  return newRoom;
}

export function placeAuctionBid(room: GameRoom, bidderId: string, amount: number): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  if (!newRoom.auction) return room;
  const bidder = newRoom.players[bidderId];
  if (!bidder || bidder.cash < amount || amount <= newRoom.auction.currentBid) return room;

  newRoom.auction.currentBid = amount;
  newRoom.auction.highestBidderId = bidderId;
  newRoom.auction.highestBidderName = bidder.name;
  newRoom.auction.expiresAt = Date.now() + 15000; // extend by 15s

  newRoom.logs.push({
    id: `auction_bid_${Date.now()}`,
    text: `${bidder.name} bid $${amount} on ${newRoom.tiles[newRoom.auction.tileIndex].name}!`,
    timestamp: Date.now(),
    type: 'auction'
  });

  sound.playBid();
  return newRoom;
}

export function finishAuction(room: GameRoom): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  if (!newRoom.auction) return room;

  const { tileIndex, highestBidderId, currentBid } = newRoom.auction;
  const tile = newRoom.tiles[tileIndex];

  if (highestBidderId && newRoom.players[highestBidderId]) {
    const winner = newRoom.players[highestBidderId];
    winner.cash -= currentBid;
    tile.ownerId = highestBidderId;

    newRoom.logs.push({
      id: `auction_win_${Date.now()}`,
      text: `Auction won by ${winner.name} for ${tile.name} at $${currentBid}!`,
      timestamp: Date.now(),
      type: 'auction'
    });

    sound.playBuy();
  } else {
    newRoom.logs.push({
      id: `auction_pass_${Date.now()}`,
      text: `No bids placed for ${tile.name}. It remains unowned.`,
      timestamp: Date.now(),
      type: 'auction'
    });
  }

  newRoom.auction = null;
  newRoom.turnPhase = newRoom.isDoubles ? 'roll' : 'end';
  updateNetWorths(newRoom);
  return newRoom;
}

export function endTurn(room: GameRoom): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  
  // Find next non-bankrupt player
  let nextIdx = (newRoom.currentTurnPlayerIndex + 1) % newRoom.playerOrder.length;
  let attempts = 0;
  while (newRoom.players[newRoom.playerOrder[nextIdx]].isBankrupt && attempts < newRoom.playerOrder.length) {
    nextIdx = (nextIdx + 1) % newRoom.playerOrder.length;
    attempts++;
  }

  newRoom.currentTurnPlayerIndex = nextIdx;
  newRoom.turnPhase = 'roll';
  newRoom.turnEndsAt = Date.now() + newRoom.settings.turnTimeLimit * 1000;
  newRoom.consecutiveDoubles = 0;
  newRoom.isDoubles = false;

  const nextPlayer = newRoom.players[newRoom.playerOrder[nextIdx]];
  newRoom.logs.push({
    id: `turn_${Date.now()}`,
    text: `It's now ${nextPlayer.name}'s turn!`,
    timestamp: Date.now(),
    type: 'system'
  });

  sound.playTurnChime();

  // Check victory condition (only 1 non-bankrupt player remaining)
  const activePlayers = Object.values(newRoom.players).filter(p => !p.isBankrupt);
  if (activePlayers.length === 1) {
    newRoom.status = 'ended';
    newRoom.winnerId = activePlayers[0].id;
    newRoom.logs.push({
      id: `winner_${Date.now()}`,
      text: `🏆 ${activePlayers[0].name} has won the game! Congratulations!`,
      timestamp: Date.now(),
      type: 'system'
    });
    sound.playWinFanfare();
  }

  return newRoom;
}

export function calculateRent(room: GameRoom, tile: Tile, rollTotal: number): number {
  if (tile.isMortgaged || !tile.ownerId) return 0;

  if (tile.type === 'railroad') {
    const railroadsOwned = room.tiles.filter(t => t.type === 'railroad' && t.ownerId === tile.ownerId).length;
    return tile.rent[Math.min(railroadsOwned - 1, 3)] || 25;
  }

  if (tile.type === 'utility') {
    const utilitiesOwned = room.tiles.filter(t => t.type === 'utility' && t.ownerId === tile.ownerId).length;
    const multiplier = utilitiesOwned >= 2 ? 10 : 4;
    return rollTotal * multiplier;
  }

  if (tile.type === 'property' && tile.group) {
    if (tile.houses > 0) {
      return tile.rent[tile.houses];
    }
    // Check full set monopoly
    const groupDef = PROPERTY_GROUPS[tile.group];
    const groupTiles = room.tiles.filter(t => t.group === tile.group);
    const hasMonopoly = groupTiles.every(t => t.ownerId === tile.ownerId);

    if (hasMonopoly && room.settings.payDoubleRentWhenOwnFullSet) {
      return tile.rent[0] * 2;
    }
    return tile.rent[0];
  }

  return 0;
}

export function handleBankruptcy(room: GameRoom, debtorId: string, creditorId: string | null) {
  const debtor = room.players[debtorId];
  if (!debtor) return;

  debtor.isBankrupt = true;
  debtor.cash = 0;

  // Transfer properties to creditor or reset to unowned
  room.tiles.forEach(t => {
    if (t.ownerId === debtorId) {
      if (creditorId) {
        t.ownerId = creditorId;
      } else {
        t.ownerId = null;
        t.houses = 0;
        t.isMortgaged = false;
      }
    }
  });

  const creditorName = creditorId ? room.players[creditorId]?.name : 'the Bank';
  room.logs.push({
    id: `bankrupt_${Date.now()}`,
    text: `💥 ${debtor.name} went bankrupt to ${creditorName}!`,
    timestamp: Date.now(),
    type: 'bankrupt'
  });

  sound.playJail();
}

function applyCardEffect(room: GameRoom, player: Player, card: any) {
  room.logs.push({
    id: `card_${Date.now()}`,
    text: `📜 ${player.name} drew: "${card.title}" - ${card.description}`,
    timestamp: Date.now(),
    type: 'card'
  });

  switch (card.action) {
    case 'advance_to_go':
      player.position = 0;
      player.cash += room.settings.salary;
      sound.playCash();
      break;
    case 'pay_pot_50':
      player.cash -= 50;
      room.pot += 50;
      break;
    case 'receive_100':
      player.cash += 100;
      sound.playCash();
      break;
    case 'receive_200':
      player.cash += 200;
      sound.playCash();
      break;
    case 'receive_50':
      player.cash += 50;
      sound.playCash();
      break;
    case 'receive_75':
      player.cash += 75;
      sound.playCash();
      break;
    case 'go_to_jail':
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
      sound.playJail();
      break;
    case 'jail_card':
      player.jailCards = (player.jailCards || 0) + 1;
      break;
    case 'advance_to_39':
      player.position = 39;
      break;
    case 'collect_from_all_20':
      Object.values(room.players).forEach(other => {
        if (other.id !== player.id && !other.isBankrupt) {
          other.cash -= 20;
          player.cash += 20;
        }
      });
      sound.playCash();
      break;
  }
}

function updateNetWorths(room: GameRoom) {
  Object.values(room.players).forEach(player => {
    let net = player.cash;
    room.tiles.forEach(t => {
      if (t.ownerId === player.id) {
        net += t.isMortgaged ? t.mortgageValue : t.price;
        if (t.houses > 0 && t.houseCost) {
          net += t.houses * t.houseCost;
        }
      }
    });
    player.netWorth = net;
  });
}
