import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { sound } from './services/sound';

// Register Service Worker for ultra-low data consumption
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/sw.js`;
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
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
