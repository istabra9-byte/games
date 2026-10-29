export type TileType = 
  | 'start' 
  | 'property' 
  | 'railroad' 
  | 'utility' 
  | 'chest' 
  | 'chance' 
  | 'tax' 
  | 'jail' 
  | 'vacation' 
  | 'go_to_jail';

export type PropertyGroup = 
  | 'brown' 
  | 'light_blue' 
  | 'pink' 
  | 'orange' 
  | 'red' 
  | 'yellow' 
  | 'green' 
  | 'dark_blue' 
  | 'station' 
  | 'utility';

export interface Tile {
  index: number;
  name: string;
  country?: string;
  flag?: string;
  countryCode?: string;
  type: TileType;
  group?: PropertyGroup;
  price: number;
  rent: number[]; // [base, 1h, 2h, 3h, 4h, hotel] or [multiplier1, multiplier2] for utilities
  houseCost?: number;
  ownerId: string | null;
  houses: number; // 0..4, 5 = hotel
  isMortgaged: boolean;
  mortgageValue: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cash: number;
  position: number; // 0..39
  inJail: boolean;
  jailTurns: number;
  jailCards: number;
  isBankrupt: boolean;
  isHost: boolean;
  isBot: boolean;
  connected: boolean;
  netWorth: number;
}

export interface GameSettings {
  maxPlayers: number;
  startingCash: number;
  salary: number;
  canBotsJoin: boolean;
  auction: boolean;
  vacationCash: boolean;
  evenBuild: boolean;
  payDoubleRentWhenOwnFullSet: boolean;
  noRentPaymentsWhileInPrison: boolean;
  turnTimeLimit: number;
  isPrivate: boolean;
}

export interface AuctionState {
  tileIndex: number;
  currentBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  passedPlayerIds: string[];
  expiresAt: number;
}

export interface TradeOffer {
  senderId: string;
  receiverId: string;
  senderCash: number;
  receiverCash: number;
  senderTileIndices: number[];
  receiverTileIndices: number[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameLog {
  id: string;
  text: string;
  timestamp: number;
  type: 'roll' | 'buy' | 'rent' | 'jail' | 'card' | 'auction' | 'trade' | 'bankrupt' | 'system';
  playerId?: string;
}

export type TurnPhase = 'roll' | 'action' | 'trade' | 'auction' | 'end';

export interface GameRoom {
  id: string;
  status: 'lobby' | 'playing' | 'ended';
  hostId: string;
  settings: GameSettings;
  players: Record<string, Player>;
  playerOrder: string[];
  currentTurnPlayerIndex: number;
  turnPhase: TurnPhase;
  turnEndsAt: number;
  dice: [number, number];
  isDoubles: boolean;
  consecutiveDoubles: number;
  pot: number;
  tiles: Tile[];
  auction: AuctionState | null;
  activeTrade: TradeOffer | null;
  chat: ChatMessage[];
  logs: GameLog[];
  winnerId: string | null;
  lastUpdated: number;
}
