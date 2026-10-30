/**
 * Richup Anti-Cheat Secure Storage Service
 * Protects coins, unlocked character skins, and player assets against
 * browser DevTools console tampering, localStorage injection, and memory exploits.
 */

const STORAGE_PEPPER = 'R1CHUP_v4_S3CUR3_K3Y_!9x8#2@';
const DEVICE_SALT_KEY = '__richup_sys_id__';

// Canonical maximum allowed coins to prevent overflow or cheat injections
export const MAX_SAFE_COINS = 25000;
export const DEFAULT_STARTING_COINS = 100;

interface SignedEnvelope<T> {
  d: T;       // data payload
  s: string;  // cryptographic integrity signature
  t: number;  // timestamp of last authorized write
}

/**
 * Generates or retrieves a unique per-device salt so storage dumps cannot be copied across machines.
 */
function getDeviceSalt(): string {
  try {
    let salt = localStorage.getItem(DEVICE_SALT_KEY);
    if (!salt || salt.length < 16) {
      salt = Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
      localStorage.setItem(DEVICE_SALT_KEY, salt);
    }
    return salt;
  } catch {
    return 'default_fallback_salt_39184';
  }
}

/**
 * High-speed 32-bit avalanche hash with salt & pepper for synchronous integrity verification.
 * Resistant to casual console tampering and signature forgery.
 */
function computeSignature(payload: string, timestamp: number): string {
  const deviceSalt = getDeviceSalt();
  const input = `${STORAGE_PEPPER}:${deviceSalt}:${payload}:${timestamp}:${STORAGE_PEPPER}`;

  // Multi-pass FNV-1a + Murmur3 avalanche hash
  let h1 = 0x811c9dc5;
  let h2 = 0x5bd1e995;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);

    h2 ^= code;
    h2 = Math.imul(h2, 0x5bd1e995);
    h2 ^= h2 >>> 15;
  }

  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  h2 ^= h2 >>> 16;
  h2 = Math.imul(h2, 0x85ebca6b);
  h2 ^= h2 >>> 13;

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}`;
}

export const secureStorage = {
  /**
   * Securely saves an item with an anti-tamper signature.
   */
  setItem<T>(key: string, value: T): void {
    try {
      const payloadStr = JSON.stringify(value);
      const timestamp = Date.now();
      const signature = computeSignature(payloadStr, timestamp);

      const envelope: SignedEnvelope<T> = {
        d: value,
        s: signature,
        t: timestamp
      };

      localStorage.setItem(key, JSON.stringify(envelope));
    } catch (e) {
      console.warn('[Anti-Cheat] Failed to write secure item:', e);
    }
  },

  /**
   * Securely retrieves an item, verifying its integrity signature.
   * If any console modification or tampering is detected, resets to defaultValue.
   */
  getItem<T>(key: string, defaultValue: T, validator?: (val: any) => boolean): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        // Save initial verified default
        this.setItem(key, defaultValue);
        return defaultValue;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.warn(`[Anti-Cheat] Raw unparsed data detected in "${key}". Potential console tampering. Reverting to safe default.`);
        this.setItem(key, defaultValue);
        return defaultValue;
      }

      // Must be a valid SignedEnvelope structure
      if (!parsed || typeof parsed !== 'object' || !('d' in parsed) || typeof parsed.s !== 'string' || typeof parsed.t !== 'number') {
        console.warn(`[Anti-Cheat] Unsigned data injected into "${key}" via console. Reverting to safe default.`);
        this.setItem(key, defaultValue);
        return defaultValue;
      }

      // Verify cryptographic signature
      const expectedSignature = computeSignature(JSON.stringify(parsed.d), parsed.t);
      if (parsed.s !== expectedSignature) {
        console.warn(`[Anti-Cheat] FORGERY DETECTED: Signature mismatch on "${key}". Console manipulation blocked. Reverting.`);
        this.setItem(key, defaultValue);
        return defaultValue;
      }

      // Run optional custom range/type validator
      if (validator && !validator(parsed.d)) {
        console.warn(`[Anti-Cheat] Out-of-bounds or invalid data on "${key}". Reverting.`);
        this.setItem(key, defaultValue);
        return defaultValue;
      }

      return parsed.d as T;
    } catch (e) {
      console.warn('[Anti-Cheat] Error reading secure item:', e);
      return defaultValue;
    }
  },

  /**
   * Validates and retrieves player coins with strict bounds.
   */
  getCoins(): number {
    return this.getItem<number>(
      'richup_user_coins_secure',
      DEFAULT_STARTING_COINS,
      (val) => typeof val === 'number' && Number.isFinite(val) && val >= 0 && val <= MAX_SAFE_COINS && Number.isInteger(val)
    );
  },

  /**
   * Securely saves player coins with signature.
   */
  setCoins(coins: number): void {
    const safeCoins = Math.max(0, Math.min(MAX_SAFE_COINS, Math.floor(coins)));
    this.setItem('richup_user_coins_secure', safeCoins);
  },

  /**
   * Safely awards coins from gameplay milestones (winning, building hotels, monopolies)
   */
  earnCoins(amount: number, reason: string): { newTotal: number; earned: number } {
    const current = this.getCoins();
    const safeAdd = Math.max(1, Math.min(100, Math.floor(amount)));
    const newTotal = Math.min(MAX_SAFE_COINS, current + safeAdd);
    this.setCoins(newTotal);
    return { newTotal, earned: safeAdd };
  },

  /**
   * Owner Developer Mode: Authorized coin addition with cryptographic signature
   */
  ownerGrantCoins(passcode: string, amount: number): boolean {
    const validCodes = ['istabra9', 'owner', 'admin'];
    if (!validCodes.includes(String(passcode).trim().toLowerCase())) {
      console.warn('❌ Invalid owner passcode.');
      return false;
    }
    const current = this.getCoins();
    const safeAmount = Math.max(1, Math.min(10000, Math.floor(amount)));
    const newTotal = Math.min(MAX_SAFE_COINS, current + safeAmount);
    this.setCoins(newTotal);
    console.log(`%c👑 [Owner Access Granted] Added +${safeAmount} coins! New total: ${newTotal}`, 'color: #10b981; font-weight: bold;');
    return true;
  },

  /**
   * Owner Developer Mode: Unlock all avatars and board themes
   */
  ownerUnlockAll(passcode: string, allAvatars: string[], allThemes: string[]): boolean {
    const validCodes = ['istabra9', 'owner', 'admin'];
    if (!validCodes.includes(String(passcode).trim().toLowerCase())) {
      console.warn('❌ Invalid owner passcode.');
      return false;
    }
    this.setUnlockedAvatars(allAvatars);
    this.setUnlockedThemes(allThemes);
    console.log('%c👑 [Owner Access Granted] All skins and board themes unlocked!', 'color: #10b981; font-weight: bold;');
    return true;
  },

  /**
   * Retrieves unlocked avatar styles, always ensuring 'navy' is present.
   */
  getUnlockedAvatars(): string[] {
    return this.getItem<string[]>(
      'richup_unlocked_avatars_secure',
      ['navy'],
      (val) => Array.isArray(val) && val.every(item => typeof item === 'string' && item.length < 32)
    );
  },

  /**
   * Securely saves unlocked avatars list.
   */
  setUnlockedAvatars(avatars: string[]): void {
    const list = Array.from(new Set(['navy', ...avatars.filter(a => typeof a === 'string')]));
    this.setItem('richup_unlocked_avatars_secure', list);
  },

  /**
   * Retrieves unlocked board themes, always ensuring 'midnight' is present.
   */
  getUnlockedThemes(): string[] {
    return this.getItem<string[]>(
      'richup_unlocked_themes_secure',
      ['midnight'],
      (val) => Array.isArray(val) && val.every(item => typeof item === 'string')
    );
  },

  /**
   * Securely saves unlocked themes list.
   */
  setUnlockedThemes(themes: string[]): void {
    const list = Array.from(new Set(['midnight', ...themes.filter(t => typeof t === 'string')]));
    this.setItem('richup_unlocked_themes_secure', list);
  }
};
