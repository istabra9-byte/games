import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, Database, off, runTransaction } from 'firebase/database';
import { GameRoom, ChatMessage, GameLog } from '../types/game';
import { firebaseConfig as staticConfig } from '../firebaseConfig';
import { INITIAL_BOARD_TILES } from '../data/boardTiles';

export function sanitizeRoom(room: GameRoom): GameRoom {
  if (!room) return room;
  if (Array.isArray(room.tiles)) {
    room.tiles = INITIAL_BOARD_TILES.map((canonical, idx) => {
      const saved = room.tiles[idx] || {};
      return {
        ...canonical,
        ownerId: saved.ownerId || null,
        houses: typeof saved.houses === 'number' ? saved.houses : 0,
        isMortgaged: Boolean(saved.isMortgaged)
      };
    });
  } else {
    room.tiles = JSON.parse(JSON.stringify(INITIAL_BOARD_TILES));
  }
  return room;
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
  private isFirebaseReady: boolean = false;
  private broadcast: BroadcastChannel | null = null;
  private memoryRooms: Record<string, GameRoom> = {};
  private activeRoomSubscribers: Record<string, ((room: GameRoom) => void)[]> = {};

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
      this.isFirebaseReady = true;
      saveFirebaseConfig(config);
      return true;
    } catch (e) {
      console.warn('Firebase init error (using offline multi-tab mode):', e);
      this.isFirebaseReady = false;
      return false;
    }
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
          callback(sanitizeRoom(val as GameRoom));
        }
      });
      return () => off(roomRef, 'value', unsubscribe);
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
    const cleanRoom = sanitizeRoom(room);
    cleanRoom.lastUpdated = Date.now();

    if (this.isFirebaseReady && this.db) {
      const roomRef = ref(this.db, `rooms/${cleanRoom.id}`);
      await set(roomRef, cleanRoom);
    } else {
      this.memoryRooms[cleanRoom.id] = cleanRoom;
      try {
        localStorage.setItem(`room_${cleanRoom.id}`, JSON.stringify(cleanRoom));
      } catch (e) {}
      if (this.broadcast) {
        this.broadcast.postMessage({ type: 'ROOM_UPDATE', room: cleanRoom });
      }
      this.notifySubscribers(cleanRoom.id, cleanRoom);
    }
  }

  public async sendChatMessage(roomId: string, message: ChatMessage): Promise<void> {
    if (this.isFirebaseReady && this.db) {
      const roomRef = ref(this.db, `rooms/${roomId}/chat`);
      await runTransaction(roomRef, (currentChat) => {
        const chat = currentChat || [];
        return [...chat, message];
      });
    } else {
      const room = this.memoryRooms[roomId];
      if (room) {
        room.chat = [...(room.chat || []), message];
        await this.updateRoom(room);
      }
    }
  }

  public async addLog(roomId: string, log: GameLog): Promise<void> {
    if (this.isFirebaseReady && this.db) {
      const logsRef = ref(this.db, `rooms/${roomId}/logs`);
      await runTransaction(logsRef, (currentLogs) => {
        const logs = currentLogs || [];
        return [...logs, log];
      });
    } else {
      const room = this.memoryRooms[roomId];
      if (room) {
        room.logs = [...(room.logs || []), log];
        await this.updateRoom(room);
      }
    }
  }
}

export const multiplayer = new MultiplayerService();
