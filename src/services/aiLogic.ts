import { GameRoom, Player, Tile, TradeOffer } from '../types/game';
import { canBuildHouse } from './gameEngine';

export interface BotDecision {
  shouldBuy: boolean;
  reason: string;
}

/**
 * Intelligent and balanced decision maker for AI Bot players.
 * Balances aggressive monopoly creation/blocking with healthy cash reserves.
 */
export function evaluateBotPropertyPurchase(room: GameRoom, botId: string, tile: Tile): BotDecision {
  const bot = room.players[botId];
  if (!bot || bot.cash < tile.price) {
    return { shouldBuy: false, reason: 'Insufficient cash' };
  }

  // 1. Calculate how dangerous the board currently is
  // Count total opponent houses across all properties
  let opponentHouses = 0;
  Object.values(room.players).forEach(p => {
    if (p.id !== botId && !p.isBankrupt) {
      room.tiles.forEach(t => {
        if (t.ownerId === p.id && t.houses > 0) {
          opponentHouses += t.houses;
        }
      });
    }
  });

  // Dynamic cash safety cushion based on game phase
  let safetyCushion = 80;
  if (opponentHouses >= 5) {
    safetyCushion = 320; // High danger late game
  } else if (opponentHouses >= 2) {
    safetyCushion = 180; // Moderate danger mid game
  }

  // 2. Monopoly Completion Check (Priority 1)
  if (tile.group && tile.group !== 'station' && tile.group !== 'utility') {
    const groupTiles = room.tiles.filter(t => t.group === tile.group);
    const botOwnedInGroup = groupTiles.filter(t => t.ownerId === botId).length;
    // If buying this completes the monopoly
    if (botOwnedInGroup === groupTiles.length - 1) {
      // Aggressively buy if we have at least $25 left over
      if (bot.cash >= tile.price + 25) {
        return { shouldBuy: true, reason: 'Completes color monopoly!' };
      }
    }
  }

  // 3. Monopoly Blocker Check (Priority 2)
  if (tile.group && tile.group !== 'station' && tile.group !== 'utility') {
    const groupTiles = room.tiles.filter(t => t.group === tile.group);
    for (const p of Object.values(room.players)) {
      if (p.id !== botId && !p.isBankrupt) {
        const opponentCount = groupTiles.filter(t => t.ownerId === p.id).length;
        if (opponentCount === groupTiles.length - 1) {
          // Block opponent from getting full set
          if (bot.cash >= tile.price + 40) {
            return { shouldBuy: true, reason: `Blocks ${p.name}'s monopoly!` };
          }
        }
      }
    }
  }

  // 4. Stations / Airports (Priority 3 - high, reliable returns)
  if (tile.type === 'railroad') {
    const botStations = room.tiles.filter(t => t.type === 'railroad' && t.ownerId === botId).length;
    if (botStations >= 1 && bot.cash >= tile.price + 50) {
      return { shouldBuy: true, reason: 'Expands station network' };
    }
  }

  // 5. Standard purchase check against dynamic safety cushion
  if (bot.cash >= tile.price + safetyCushion) {
    return { shouldBuy: true, reason: 'Healthy cash reserve' };
  }

  // Cash too tight; pass to avoid early bankruptcy
  return { shouldBuy: false, reason: 'Conserving cash buffer' };
}

/**
 * Determines which tile the bot should build on, prioritizing the 3-house sweet spot
 * while reserving cash to survive opponent rents.
 */
export function getBotHouseBuildTileIndex(room: GameRoom, botId: string): number | null {
  const bot = room.players[botId];
  if (!bot) return null;

  // Find all tiles where the bot can legally build a house
  const eligibleIndices: number[] = [];
  room.tiles.forEach((_, idx) => {
    if (canBuildHouse(room, botId, idx)) {
      eligibleIndices.push(idx);
    }
  });

  if (eligibleIndices.length === 0) return null;

  // Prioritize bringing all properties to 3 houses first (best Monopoly ROI)
  const candidateTiles = eligibleIndices
    .map(idx => room.tiles[idx])
    .sort((a, b) => a.houses - b.houses);

  for (const candidate of candidateTiles) {
    const cost = candidate.houseCost || 100;
    // Require at least $180 cash reserve after building
    if (bot.cash >= cost + 180) {
      return candidate.index;
    }
  }

  return null;
}

/**
 * Determines whether a jailed bot should pay bail or wait out jail turns strategically.
 */
export function evaluateBotJailExit(room: GameRoom, botId: string): 'bail' | 'wait' {
  const bot = room.players[botId];
  if (!bot || !bot.inJail) return 'wait';

  const unownedProperties = room.tiles.filter(t => t.price > 0 && !t.ownerId).length;

  // Early game: pay bail to claim properties on the board
  if (unownedProperties >= 6 && bot.cash >= 120) {
    return 'bail';
  }

  // Late game: stay in jail safely to avoid landing on hotels
  return 'wait';
}

/**
 * Evaluates incoming trade proposals for AI bots based on fair economic value,
 * cash safety, and monopoly advantage.
 */
export function evaluateBotTrade(room: GameRoom, botId: string, trade: TradeOffer): { accept: boolean; reason: string } {
  const bot = room.players[botId];
  const sender = room.players[trade.senderId];
  if (!bot || !sender) {
    return { accept: false, reason: 'Invalid players' };
  }

  // 1. Feasibility validation
  if (bot.cash < trade.receiverCash) {
    return { accept: false, reason: 'Bot has insufficient cash' };
  }
  if (sender.cash < trade.senderCash) {
    return { accept: false, reason: 'Sender has insufficient cash' };
  }
  for (const idx of trade.receiverTileIndices) {
    if (room.tiles[idx]?.ownerId !== botId) {
      return { accept: false, reason: 'Bot does not own property' };
    }
  }
  for (const idx of trade.senderTileIndices) {
    if (room.tiles[idx]?.ownerId !== trade.senderId) {
      return { accept: false, reason: 'Sender does not own property' };
    }
  }

  // 2. Compute value given by bot
  let valueGiven = trade.receiverCash;
  for (const idx of trade.receiverTileIndices) {
    const tile = room.tiles[idx];
    if (tile) {
      valueGiven += tile.price;
      // High penalty if giving away this tile completes a color monopoly for the sender
      if (tile.group && tile.group !== 'station' && tile.group !== 'utility') {
        const groupTiles = room.tiles.filter(t => t.group === tile.group);
        const senderCurrentCount = groupTiles.filter(t => t.ownerId === trade.senderId).length;
        if (senderCurrentCount === groupTiles.length - 1) {
          valueGiven += 250; // Opponent monopoly penalty
        }
        // Heavy penalty if giving away this tile breaks bot's own monopoly
        const botCurrentCount = groupTiles.filter(t => t.ownerId === botId).length;
        if (botCurrentCount === groupTiles.length) {
          valueGiven += 350; // Don't break completed monopolies
        }
      }
    }
  }

  // 3. Compute value received by bot
  let valueReceived = trade.senderCash;
  for (const idx of trade.senderTileIndices) {
    const tile = room.tiles[idx];
    if (tile) {
      valueReceived += tile.price;
      // Big bonus if receiving this tile completes a color monopoly for the bot
      if (tile.group && tile.group !== 'station' && tile.group !== 'utility') {
        const groupTiles = room.tiles.filter(t => t.group === tile.group);
        const botCurrentCount = groupTiles.filter(t => t.ownerId === botId).length;
        if (botCurrentCount === groupTiles.length - 1) {
          valueReceived += 300; // Monopoly completion bonus!
        } else if (botCurrentCount === groupTiles.length - 2) {
          valueReceived += 80; // 2 of 3 progress bonus
        }
      }
    }
  }

  // Require reasonable fairness (value received >= 88% of value given, or at least breaking even)
  const isFair = valueReceived >= Math.max(20, valueGiven * 0.88);
  return {
    accept: isFair,
    reason: isFair ? 'Trade considered fair and beneficial' : 'Trade value insufficient'
  };
}
