// Ultra-Low Data Consumption Service Worker for Monopoly
// Caches all static assets, images, flags, and sounds locally so subsequent games use 0.00 MB.

const CACHE_NAME = 'monopoly-cache-v46';

const STATIC_ASSETS = [
  './',
  './index.html',
  './sounds/welcome_merhba.mp3',
  './sounds/welcome_meow.mp3',
  './sounds/welcome_muhehehe.mp3',
  './sounds/welcome_putin.mp3',
  './sounds/tax_amoun.mp3',
  './sounds/tax_wallahi.mp3',
  './sounds/tax_premium_ack.mp3',
  './sounds/tax_raaaaaah.mp3',
  './sounds/prison_fbi.mp3',
  './sounds/prison_hnt.mp3',
  './sounds/prison_vacation_jey.mp3',
  './sounds/prison_escape_amogus.mp3',
  './sounds/prison_escape_mbappe.mp3',
  './sounds/prison_escape_byebye.mp3',
  './sounds/oui_slow.mp3',
  './sounds/vacation_snore.mp3',
  './sounds/vacation_xue_hua.mp3',
  './sounds/land_start_cena.mp3',
  './sounds/china_chino.mp3',
  './sounds/china_full_monopoly.mp3',
  './sounds/china_3houses.mp3',
  './sounds/airport_arab_apoio.mp3',
  './sounds/trade_let_her_go.mp3',
  './sounds/debt_chawali.mp3',
  './sounds/debt_social_credit.mp3',
  './sounds/debt_cleared_levelup.mp3',
  './sounds/surprise_bad_cat.mp3',
  './sounds/surprise_bad_dundun.mp3',
  './sounds/bankrupt_spongebob.mp3',
  './sounds/winner_gta.mp3',
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

  // Network-first for navigation and index.html so code updates are loaded immediately
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/games/') ||
    url.pathname.endsWith('/games')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Cache-first strategy for all local static assets (sounds, flags, images, JS/CSS chunks): 0 MB consumption
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
          return caches.match('./index.html');
        });
    })
  );
});
