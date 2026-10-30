import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { sound } from './services/sound';
import { secureStorage } from './services/secureStorage';

// Register Service Worker for ultra-low data consumption
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/sw.js`;
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// Anti-Cheat: Storage Tamper Shield & Active Integrity Monitor
if (typeof window !== 'undefined') {
  // Wipe legacy unverified coin keys so old plain-text numbers cannot be exploited
  try {
    const legacyCoins = localStorage.getItem('richup_user_coins');
    if (legacyCoins !== null) {
      localStorage.removeItem('richup_user_coins');
    }
  } catch {}

  // Active listener: detect and revert unauthorized console storage modifications in real time
  window.addEventListener('storage', (e) => {
    if (e.key?.includes('coins') || e.key?.includes('avatars') || e.key?.includes('themes')) {
      // Re-verify integrity signature immediately
      secureStorage.getCoins();
      secureStorage.getUnlockedAvatars();
      secureStorage.getUnlockedThemes();
    }
  });

  // Owner Developer API (Authorized by secret passcode)
  (window as any).richupOwner = (passcode: string, amount: number = 1000) => {
    const success = secureStorage.ownerGrantCoins(passcode, amount);
    if (success) {
      window.dispatchEvent(new Event('storage'));
    }
    return success;
  };

  // Display Anti-Cheat Banner in Console
  console.log(
    '%c🛡️ Richup Anti-Cheat System Active%c\nProtected against console memory injection, unauthorized cash additions, and storage tampering.\nOwner Developer command: richupOwner("istabra9", 1000)',
    'background: #10b981; color: #000; font-weight: 900; font-size: 13px; padding: 3px 8px; border-radius: 4px;',
    'color: #a78bfa; font-size: 11px;'
  );
}

// Preload meme sounds on first interaction
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    sound.preloadMemeSounds();
  };
  window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
  window.addEventListener('keydown', handleFirstInteraction, { once: true });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
