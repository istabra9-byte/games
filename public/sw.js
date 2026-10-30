// Ultra-Low Data Consumption Service Worker for Monopoly
// Caches all static assets, images, flags, and sounds locally so subsequent games use 0.00 MB.

const CACHE_NAME = 'monopoly-cache-v3';

const STATIC_ASSETS = [
  './',
  './index.html',
  './sounds/welcome_merhba.mp3',
  './sounds/welcome_meow.mp3',
  './sounds/welcome_muhehehe.mp3',
  './sounds/welcome_putin.mp3',
  './sounds/tax_amoun.mp3',
  './sounds/tax_wallahi.mp3',
  './flags/br.png',
  './flags/tn.png',
  './flags/es.png',
  './flags/it.png',
  './flags/qa.png',
  './flags/de.png',
  './flags/cn.png',
  './flags/fr.png',
  './flags/gb.png',
  './flags/ae.png',
  './flags/us.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache skipped some items:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass Firebase real-time database, websockets, and telemetry to keep multiplayer dynamic
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseapp.com')
  ) {
    return;
  }

  // Cache-first strategy for all local static assets: fast load & zero internet consumption
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback if offline
          return caches.match('./index.html') as Promise<Response>;
        });
    })
  );
});
