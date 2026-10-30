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
    if (!tile.ownerId) {
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
            text: `💸 ${player.name} paid $${rentAmount} rent to ${owner.name}!`,
            timestamp: Date.now(),
            type: 'rent',
            playerId: player.id
          });

          if (player.cash < 0) {
            resolveDebtOrBankruptcy(newRoom, player.id, owner.id);
          }
        }
      }
      newRoom.turnPhase = isDoubles ? 'roll' : 'end';
    }
  } else if (tile.type === 'tax') {
    let taxAmount = tile.price;
    if (tile.name.toLowerCase().includes('earnings') || tile.index === 4) {
      // Earnings Tax: takes 10% of player cash
      taxAmount = player.cash > 0 ? Math.max(10, Math.floor(player.cash * 0.10)) : 0;
    } else if (tile.name.toLowerCase().includes('premium') || tile.index === 38) {
      // Premium Tax: takes $100
      taxAmount = 100;
    }

    player.cash -= taxAmount;
    newRoom.pot += taxAmount;
    newRoom.logs.push({
      id: `tax_${Date.now()}`,
      text: `💰 ${player.name} paid $${taxAmount} in ${tile.name}!`,
      timestamp: Date.now(),
      type: 'rent',
      playerId: player.id
    });
    if (player.cash < 0) {
      resolveDebtOrBankruptcy(newRoom, player.id, null);
    }
    newRoom.turnPhase = isDoubles ? 'roll' : 'end';
  } else if (tile.type === 'vacation') {
    if (newRoom.settings.vacationCash && newRoom.pot > 0) {
      const potCash = newRoom.pot;
      player.cash += potCash;
      newRoom.pot = 0;
      newRoom.logs.push({
        id: `pot_${Date.now()}`,
        text: `🌴 ${player.name} won the $${potCash} Vacation Pot!`,
        timestamp: Date.now(),
        type: 'rent',
        playerId: player.id
      });
    } else {
      newRoom.logs.push({
        id: `vacation_${Date.now()}`,
        text: `🌴 ${player.name} is resting on Vacation!`,
        timestamp: Date.now(),
        type: 'system',
        playerId: player.id
      });
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

  if (!tile || Boolean(tile.ownerId) || player.cash < tile.price) return room;

  player.cash -= tile.price;
  tile.ownerId = playerId;

  const placeFlag = tile.flag ? `${tile.flag} ` : '';
  newRoom.logs.push({
    id: `buy_${Date.now()}`,
    text: `🏠 ${player.name} bought ${placeFlag}${tile.name} for $${tile.price}!`,
    timestamp: Date.now(),
    type: 'buy',
    playerId: player.id
  });

  // Check if player just completed a country monopoly!
  let completedMonopoly = false;
  if (tile.group && tile.group !== 'station' && tile.group !== 'utility') {
    const groupTiles = newRoom.tiles.filter(t => t.group === tile.group);
    const ownsAll = groupTiles.every(t => t.ownerId === playerId);
    if (ownsAll) {
      completedMonopoly = true;
      const countryName = tile.country || PROPERTY_GROUPS[tile.group]?.name || tile.group;
      newRoom.logs.push({
        id: `monopoly_${Date.now()}`,
        text: `🎉 ${player.name} owns all states in ${countryName}! Upgrades unlocked!`,
        timestamp: Date.now(),
        type: 'buy',
        playerId: player.id
      });
      sound.playMonopoly();
    }
  }

  if (!completedMonopoly) {
    sound.playBuy();
  }
  newRoom.turnPhase = newRoom.isDoubles ? 'roll' : 'end';
  updateNetWorths(newRoom);
  return newRoom;
}

export function skipCurrentProperty(room: GameRoom, playerId: string): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[player.position];

  newRoom.logs.push({
    id: `skip_${Date.now()}`,
    text: `${player.name} passed on buying ${tile.name}.`,
    timestamp: Date.now(),
    type: 'system'
  });

  newRoom.turnPhase = newRoom.isDoubles ? 'roll' : 'end';
  return newRoom;
}

export function canBuildHouse(room: GameRoom, playerId: string, tileIndex: number): boolean {
  const player = room.players[playerId];
  const tile = room.tiles[tileIndex];
  if (!player || !tile || tile.ownerId !== playerId || tile.type !== 'property' || !tile.group) return false;
  if (tile.houses >= 5 || tile.isMortgaged || (tile.houseCost || 0) > player.cash) return false;

  const groupTiles = room.tiles.filter(t => t.group === tile.group);
  const ownsAll = groupTiles.every(t => t.ownerId === playerId && !t.isMortgaged);
  if (!ownsAll) return false;

  // Even building rule: cannot build on this tile if any other tile in group has fewer houses
  const minHouses = Math.min(...groupTiles.map(t => t.houses));
  return tile.houses === minHouses;
}

export function buildHouse(room: GameRoom, playerId: string, tileIndex: number): GameRoom {
  if (!canBuildHouse(room, playerId, tileIndex)) return room;
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[tileIndex];

  player.cash -= tile.houseCost!;
  tile.houses += 1;

  const isHotel = tile.houses === 5;
  newRoom.logs.push({
    id: `build_${Date.now()}`,
    text: `🏠 ${player.name} upgraded ${tile.name} to ${isHotel ? 'a HOTEL 🏨' : `House ${tile.houses} 🏡`}!`,
    timestamp: Date.now(),
    type: 'buy',
    playerId: player.id
  });

  sound.playUpgrade();
  updateNetWorths(newRoom);
  return newRoom;
}

export function canSellHouse(room: GameRoom, playerId: string, tileIndex: number): boolean {
  const player = room.players[playerId];
  const tile = room.tiles[tileIndex];
  if (!player || !tile || tile.ownerId !== playerId || tile.type !== 'property' || !tile.group) return false;
  if (tile.houses <= 0) return false;

  const groupTiles = room.tiles.filter(t => t.group === tile.group);
  // Even selling rule: cannot sell from this tile if any other tile in group has more houses
  const maxHouses = Math.max(...groupTiles.map(t => t.houses));
  return tile.houses === maxHouses;
}

export function sellHouse(room: GameRoom, playerId: string, tileIndex: number): GameRoom {
  if (!canSellHouse(room, playerId, tileIndex)) return room;
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[tileIndex];

  const refund = Math.floor((tile.houseCost || 0) / 2);
  player.cash += refund;
  tile.houses -= 1;

  newRoom.logs.push({
    id: `sell_house_${Date.now()}`,
    text: `🏚️ ${player.name} sold a house on ${tile.name} for $${refund}.`,
    timestamp: Date.now(),
    type: 'system'
  });

  sound.playCash();
  updateNetWorths(newRoom);
  return newRoom;
}

export function canMortgageProperty(room: GameRoom, playerId: string, tileIndex: number): boolean {
  const player = room.players[playerId];
  const tile = room.tiles[tileIndex];
  if (!player || !tile || tile.ownerId !== playerId || tile.isMortgaged) return false;

  // Cannot mortgage if there are any houses on any property in that group!
  if (tile.group) {
    const groupTiles = room.tiles.filter(t => t.group === tile.group);
    if (groupTiles.some(t => t.houses > 0)) return false;
  }

  return true;
}

export function mortgageProperty(room: GameRoom, playerId: string, tileIndex: number): GameRoom {
  if (!canMortgageProperty(room, playerId, tileIndex)) return room;
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[tileIndex];

  tile.isMortgaged = true;
  player.cash += tile.mortgageValue;

  newRoom.logs.push({
    id: `mortgage_${Date.now()}`,
    text: `📜 ${player.name} mortgaged ${tile.name} for $${tile.mortgageValue}!`,
    timestamp: Date.now(),
    type: 'system'
  });

  sound.playCash();
  updateNetWorths(newRoom);
  return newRoom;
}

export function canUnmortgageProperty(room: GameRoom, playerId: string, tileIndex: number): boolean {
  const player = room.players[playerId];
  const tile = room.tiles[tileIndex];
  if (!player || !tile || tile.ownerId !== playerId || !tile.isMortgaged) return false;
  const cost = Math.floor(tile.mortgageValue * 1.1);
  return player.cash >= cost;
}

export function unmortgageProperty(room: GameRoom, playerId: string, tileIndex: number): GameRoom {
  if (!canUnmortgageProperty(room, playerId, tileIndex)) return room;
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[tileIndex];

  const cost = Math.floor(tile.mortgageValue * 1.1);
  player.cash -= cost;
  tile.isMortgaged = false;

  newRoom.logs.push({
    id: `unmortgage_${Date.now()}`,
    text: `🏛️ ${player.name} unmortgaged ${tile.name} for $${cost}!`,
    timestamp: Date.now(),
    type: 'system'
  });

  sound.playBuy();
  updateNetWorths(newRoom);
  return newRoom;
}

// Deprecated auction stubs for backwards compatibility
export function startAuctionForCurrentTile(room: GameRoom, playerId: string): GameRoom {
  return skipCurrentProperty(room, playerId);
}

export function placeAuctionBid(room: GameRoom, _bidderId: string, _amount: number): GameRoom {
  return room;
}

export function finishAuction(room: GameRoom): GameRoom {
  return room;
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

/**
 * Automatically sells houses and mortgages un-monopolized properties to cover debt
 * before resorting to bankruptcy. Prevents sudden unfair elimination.
 */
export function resolveDebtOrBankruptcy(room: GameRoom, debtorId: string, creditorId: string | null) {
  const debtor = room.players[debtorId];
  if (!debtor || debtor.cash >= 0) return;

  // 1. First sell houses on owned properties (if any)
  const ownedTilesWithHouses = room.tiles
    .filter(t => t.ownerId === debtorId && t.houses > 0)
    .sort((a, b) => a.houses - b.houses);

  for (const t of ownedTilesWithHouses) {
    while (t.houses > 0 && debtor.cash < 0) {
      const houseRefund = Math.floor((t.houseCost || 100) / 2);
      t.houses -= 1;
      debtor.cash += houseRefund;
      room.logs.push({
        id: `sell_house_debt_${Date.now()}_${t.index}`,
        text: `🏚️ ${debtor.name} sold a house on ${t.name} (+$${houseRefund}) to pay debt!`,
        timestamp: Date.now(),
        type: 'rent',
        playerId: debtor.id
      });
    }
    if (debtor.cash >= 0) break;
  }

  // 2. If still in debt, mortgage unmortgaged properties
  if (debtor.cash < 0) {
    const unmortgagedTiles = room.tiles
      .filter(t => t.ownerId === debtorId && !t.isMortgaged && t.houses === 0)
      .sort((a, b) => {
        // Prioritize non-monopoly loose properties first
        const aGroupCount = room.tiles.filter(tile => tile.group === a.group && tile.ownerId === debtorId).length;
        const bGroupCount = room.tiles.filter(tile => tile.group === b.group && tile.ownerId === debtorId).length;
        return aGroupCount - bGroupCount;
      });

    for (const t of unmortgagedTiles) {
      t.isMortgaged = true;
      debtor.cash += t.mortgageValue;
      room.logs.push({
        id: `mortgage_debt_${Date.now()}_${t.index}`,
        text: `🛡️ ${debtor.name} mortgaged ${t.name} (+$${t.mortgageValue}) to avoid bankruptcy!`,
        timestamp: Date.now(),
        type: 'rent',
        playerId: debtor.id
      });
      if (debtor.cash >= 0) break;
    }
  }

  // 3. If after selling and mortgaging everything the player is STILL negative:
  if (debtor.cash < 0) {
    handleBankruptcy(room, debtorId, creditorId);
  }
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
      break;
    case 'pay_pot_50':
      player.cash -= 50;
      room.pot += 50;
      if (player.cash < 0) {
        resolveDebtOrBankruptcy(room, player.id, null);
      }
      break;
    case 'receive_100':
      player.cash += 100;
      break;
    case 'receive_200':
      player.cash += 200;
      break;
    case 'receive_50':
      player.cash += 50;
      break;
    case 'receive_75':
      player.cash += 75;
      break;
    case 'go_to_jail':
      player.position = 10;
      player.inJail = true;
      player.jailTurns = 0;
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

export function sellPropertyToBank(room: GameRoom, playerId: string, tileIndex: number): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  const tile = newRoom.tiles[tileIndex];

  if (!tile || tile.ownerId !== playerId) return room;

  // Cannot sell if there are houses on any property in the group
  if (tile.group) {
    const groupTiles = newRoom.tiles.filter(t => t.group === tile.group);
    const hasHousesInGroup = groupTiles.some(t => t.houses > 0);
    if (hasHousesInGroup) return room;
  }

  // Calculate sell price: 70% of base purchase price, or mortgage value if mortgaged
  const sellPrice = tile.isMortgaged ? tile.mortgageValue : Math.floor(tile.price * 0.7);
  player.cash += sellPrice;
  tile.ownerId = null;
  tile.houses = 0;
  tile.isMortgaged = false;

  newRoom.logs.push({
    id: `sell_prop_${Date.now()}`,
    text: `🏛️ ${player.name} sold ${tile.flag || ''} ${tile.name} to the Bank for $${sellPrice}!`,
    timestamp: Date.now(),
    type: 'buy'
  });

  sound.playCash();
  updateNetWorths(newRoom);
  return newRoom;
}


export function surrenderBankruptcy(room: GameRoom, playerId: string): GameRoom {
  const newRoom: GameRoom = JSON.parse(JSON.stringify(room));
  const player = newRoom.players[playerId];
  if (!player || player.isBankrupt) return room;

  handleBankruptcy(newRoom, playerId, null);
  sound.playMemeBankrupt();
  updateNetWorths(newRoom);

  // Check if only one non-bankrupt player remains (victory)
  const activePlayers = Object.values(newRoom.players).filter(p => !p.isBankrupt);
  if (activePlayers.length === 1) {
    newRoom.winnerId = activePlayers[0].id;
    newRoom.status = 'ended';
    newRoom.logs.push({
      id: `winner_${Date.now()}`,
      text: `🏆 ${activePlayers[0].name} has won the match by bankruptcy!`,
      timestamp: Date.now(),
      type: 'system'
    });
    return newRoom;
  }

  // If it's this player's turn, advance to next player
  const currentTurnPlayerId = newRoom.playerOrder[newRoom.currentTurnPlayerIndex];
  if (currentTurnPlayerId === playerId) {
    return endTurn(newRoom);
  }
  return newRoom;
}
