import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, Database, runTransaction } from 'firebase/database';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  Auth,
  User
} from 'firebase/auth';
import { GameRoom, ChatMessage, GameLog, Tile } from '../types/game';
import { firebaseConfig as staticConfig } from '../firebaseConfig';
import { INITIAL_BOARD_TILES } from '../data/boardTiles';

// Lightweight dynamic tile state for network packets (reduces tiles payload by 96%)
export interface CompactTileState {
  o?: string | null; // ownerId
  h?: number;        // houses count (0-5)
  m?: boolean;       // isMortgaged
}

/**
 * Compresses room state before sending over the wire to Firebase RTDB.
 * Strips 40 static board definitions (names, prices, flags, rents) and
 * keeps only dynamic ownership, houses, mortgage, and capped logs/chat.
 */
export function compressRoomForNetwork(room: GameRoom): any {
  if (!room) return room;
  const clone: any = { ...room };

  // 1. Pack 40 heavy tile objects into a compact dictionary of only active/owned tiles
  const tileState: Record<number, CompactTileState> = {};
  if (Array.isArray(clone.tiles)) {
    clone.tiles.forEach((t: Tile, idx: number) => {
      if (t.ownerId || t.houses > 0 || t.isMortgaged) {
        tileState[idx] = {
          ...(t.ownerId ? { o: t.ownerId } : {}),
          ...(t.houses > 0 ? { h: t.houses } : {}),
          ...(t.isMortgaged ? { m: true } : {})
        };
      }
    });
  }

  // Remove the static tiles array from network payload
  delete clone.tiles;
  clone.tileState = tileState;

  // 2. Cap logs to the most recent 25 to avoid accumulating bandwidth over long games
  if (Array.isArray(clone.logs) && clone.logs.length > 20) {
    clone.logs = clone.logs.slice(-20);
  }

  // 3. Cap chat messages to the most recent 25
  if (Array.isArray(clone.chat) && clone.chat.length > 20) {
    clone.chat = clone.chat.slice(-20);
  }

  return clone;
}

/**
 * Hydrates full canonical room from compact network packet.
 * Combines static local board metadata with network tile state seamlessly.
 */
export function sanitizeRoom(raw: any): GameRoom {
  if (!raw) return raw;
  const room = { ...raw };

  const tileState: Record<number, CompactTileState> = room.tileState || {};
  const legacyTiles: any[] = Array.isArray(room.tiles) ? room.tiles : [];

  // Reconstruct full 40 canonical tiles from local static definitions
  room.tiles = INITIAL_BOARD_TILES.map((canonical, idx) => {
    const compact = tileState[idx];
    const legacy = legacyTiles[idx];

    const ownerId = compact?.o !== undefined ? compact.o : (legacy?.ownerId || null);
    const houses = compact?.h !== undefined ? compact.h : (typeof legacy?.houses === 'number' ? legacy.houses : 0);
    const isMortgaged = compact?.m !== undefined ? Boolean(compact.m) : Boolean(legacy?.isMortgaged);

    return {
      ...canonical,
      ownerId: ownerId || null,
      houses,
      isMortgaged,
      mortgageValue: canonical.mortgageValue || Math.floor(canonical.price / 2)
    };
  });

  if (!room.logs) room.logs = [];
  if (!room.chat) room.chat = [];
  if (!room.players) room.players = {};
  if (!room.playerOrder) room.playerOrder = [];

  if (room.activeTrade) {
    room.activeTrade = {
      ...room.activeTrade,
      senderTileIndices: Array.isArray(room.activeTrade.senderTileIndices) ? room.activeTrade.senderTileIndices : [],
      receiverTileIndices: Array.isArray(room.activeTrade.receiverTileIndices) ? room.activeTrade.receiverTileIndices : [],
      senderCash: typeof room.activeTrade.senderCash === 'number' ? room.activeTrade.senderCash : 0,
      receiverCash: typeof room.activeTrade.receiverCash === 'number' ? room.activeTrade.receiverCash : 0
    };
  }

  room.turnTimer = raw.turnTimer || null;

  return room as GameRoom;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const LOCAL_STORAGE_CONFIG_KEY = 'richup_firebase_config';

export function getSavedFirebaseConfig(): FirebaseConfig | null {
  // First priority: check static config file
  if (staticConfig.apiKey && staticConfig.apiKey !== 'YOUR_API_KEY' && staticConfig.databaseURL && !staticConfig.databaseURL.includes('YOUR_PROJECT_ID')) {
    return staticConfig;
  }
  // Second priority: check localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function saveFirebaseConfig(cfg: FirebaseConfig) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {}
}

class MultiplayerService {
  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private auth: Auth | null = null;
  private currentUser: User | null = null;
  private authSubscribers: ((user: User | null) => void)[] = [];
  private isFirebaseReady: boolean = false;
  private broadcast: BroadcastChannel | null = null;
  private memoryRooms: Record<string, GameRoom> = {};
  private activeRoomSubscribers: Record<string, ((room: GameRoom) => void)[]> = {};
  private lastSentFingerprint: Record<string, string> = {};

  constructor() {
    this.broadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window 
      ? new BroadcastChannel('richup_sync') 
      : null;

    if (this.broadcast) {
      this.broadcast.onmessage = (event) => {
        if (event.data?.type === 'ROOM_UPDATE' && event.data.room) {
          const room: GameRoom = sanitizeRoom(event.data.room);
          this.memoryRooms[room.id] = room;
          this.notifySubscribers(room.id, room);
        }
      };
    }

    this.tryInit();
  }

  // Fast game-state digest to detect and suppress redundant network transmissions
  private getRoomFingerprint(room: GameRoom): string {
    const tileDigest = Array.isArray(room.tiles)
      ? room.tiles.map(t => `${t.ownerId || ''}:${t.houses}:${t.isMortgaged ? 1 : 0}`).join(';')
      : '';
    const playerDigest = Object.values(room.players || {})
      .map(p => `${p.id}:${p.cash}:${p.position}:${p.inJail ? 1 : 0}:${p.isBankrupt ? 1 : 0}:${p.color}:${p.avatar}`)
      .join(';');
    const logsCount = (room.logs || []).length;
    const lastLogId = logsCount > 0 ? room.logs[logsCount - 1].id : '';
    const chatCount = (room.chat || []).length;
    const lastChatId = chatCount > 0 ? room.chat[chatCount - 1].id : '';
    const timerDigest = room.turnTimer ? `${room.turnTimer.active}:${room.turnTimer.situation}:${room.turnTimer.expiresAt}` : 'none';

    return `${room.status}_${room.currentTurnPlayerIndex}_${room.turnPhase}_${room.dice?.join(',')}_${room.pot}_${room.winnerId}_${timerDigest}_${tileDigest}_${playerDigest}_${lastLogId}_${lastChatId}`;
  }

  public tryInit(): boolean {
    const cfg = getSavedFirebaseConfig();
    if (cfg && cfg.databaseURL && cfg.apiKey) {
      return this.initFirebase(cfg);
    }
    return false;
  }

  public initFirebase(config: FirebaseConfig): boolean {
    try {
      if (getApps().length === 0) {
        this.app = initializeApp(config);
      } else {
        this.app = getApps()[0];
      }
      this.db = getDatabase(this.app);
      this.auth = getAuth(this.app);
      this.isFirebaseReady = true;
      saveFirebaseConfig(config);

      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.authSubscribers.forEach(cb => cb(user));
      });

      if (!this.auth.currentUser) {
        signInAnonymously(this.auth).catch((e) => {
          console.warn('Anonymous sign-in auto attempt:', e);
        });
      }

      return true;
    } catch (e) {
      console.warn('Firebase init error (using offline multi-tab mode):', e);
      this.isFirebaseReady = false;
      return false;
    }
  }

  public async signInWithGoogle(): Promise<User | null> {
    if (!this.auth) this.tryInit();
    if (!this.auth) throw new Error('Firebase Auth is not available.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  public async signInAsGuest(): Promise<User | null> {
    if (!this.auth) this.tryInit();
    if (!this.auth) throw new Error('Firebase Auth is not available.');
    const result = await signInAnonymously(this.auth);
    return result.user;
  }

  public async signOutUser(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
      await signInAnonymously(this.auth).catch(() => {});
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser || (this.auth ? this.auth.currentUser : null);
  }

  public onAuthChange(callback: (user: User | null) => void): () => void {
    this.authSubscribers.push(callback);
    callback(this.getCurrentUser());
    return () => {
      this.authSubscribers = this.authSubscribers.filter(cb => cb !== callback);
    };
  }

  public getAuthInstance(): Auth | null {
    return this.auth;
  }

  public isUsingFirebase(): boolean {
    return this.isFirebaseReady && this.db !== null;
  }

  public subscribeToRoom(roomId: string, callback: (room: GameRoom) => void): () => void {
    if (this.isFirebaseReady && this.db) {
      const roomRef = ref(this.db, `rooms/${roomId}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const hydrated = sanitizeRoom(val);
          // Record fingerprint of received state to prevent echo writes back
          this.lastSentFingerprint[roomId] = this.getRoomFingerprint(hydrated);
          callback(hydrated);
        }
      });
      // Proper Firebase modular v9 unsubscribe method
      return () => {
        unsubscribe();
      };
    } else {
      // Local multi-tab fallback when database is not yet connected
      if (!this.activeRoomSubscribers[roomId]) {
        this.activeRoomSubscribers[roomId] = [];
      }
      this.activeRoomSubscribers[roomId].push(callback);

      if (this.memoryRooms[roomId]) {
        callback(sanitizeRoom(this.memoryRooms[roomId]));
      } else {
        const stored = localStorage.getItem(`room_${roomId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const sanitized = sanitizeRoom(parsed);
            this.memoryRooms[roomId] = sanitized;
            callback(sanitized);
          } catch (e) {}
        }
      }

      return () => {
        this.activeRoomSubscribers[roomId] = (this.activeRoomSubscribers[roomId] || []).filter(cb => cb !== callback);
      };
    }
  }

  private notifySubscribers(roomId: string, room: GameRoom) {
    if (this.activeRoomSubscribers[roomId]) {
      this.activeRoomSubscribers[roomId].forEach(cb => cb(room));
    }
  }

  public async updateRoom(room: GameRoom): Promise<void> {
    const fingerprint = this.getRoomFingerprint(room);
    if (this.lastSentFingerprint[room.id] === fingerprint) {
      // Data is identical; skip redundant database write to save internet bandwidth
      return;
    }
    this.lastSentFingerprint[room.id] = fingerprint;

    const compressed = compressRoomForNetwork(room);
    compressed.lastUpdated = Date.now();

    if (this.isFirebaseReady && this.db) {
      const roomRef = ref(this.db, `rooms/${room.id}`);
      await set(roomRef, compressed);
    } else {
      this.memoryRooms[room.id] = sanitizeRoom(compressed);
      try {
        localStorage.setItem(`room_${room.id}`, JSON.stringify(compressed));
      } catch (e) {}
      if (this.broadcast) {
        this.broadcast.postMessage({ type: 'ROOM_UPDATE', room: this.memoryRooms[room.id] });
      }
      this.notifySubscribers(room.id, this.memoryRooms[room.id]);
    }
  }

  public async sendChatMessage(roomId: string, message: ChatMessage): Promise<void> {
    if (this.isFirebaseReady && this.db) {
      const roomRef = ref(this.db, `rooms/${roomId}/chat`);
      await runTransaction(roomRef, (currentChat) => {
        const chat = currentChat || [];
        // Keep max 25 recent messages to minimize egress data
        return [...chat.slice(-24), message];
      });
    } else {
      const room = this.memoryRooms[roomId];
      if (room) {
        room.chat = [...(room.chat || []).slice(-24), message];
        await this.updateRoom(room);
      }
    }
  }

  public async addLog(roomId: string, log: GameLog): Promise<void> {
    if (this.isFirebaseReady && this.db) {
      const logsRef = ref(this.db, `rooms/${roomId}/logs`);
      await runTransaction(logsRef, (currentLogs) => {
        const logs = currentLogs || [];
        // Keep max 25 recent logs to minimize egress data
        return [...logs.slice(-24), log];
      });
    } else {
      const room = this.memoryRooms[roomId];
      if (room) {
        room.logs = [...(room.logs || []).slice(-24), log];
        await this.updateRoom(room);
      }
    }
  }
}

export const multiplayer = new MultiplayerService();
