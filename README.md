# Monopoly -  Multiplayer Board Game

[![GitHub Pages Deployment](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=flat-square&logo=github)](https://istabra9-byte.github.io/games/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)


🎮 **Play Live:** [https://istabra9-byte.github.io/games/](https://istabra9-byte.github.io/games/)

---

## ✨ Features

### 🎲 1. Classic 40-Tile Board & Economy
* **Complete Board Structure:** 40 tiles including START (`+$200` salary), 22 properties across 8 color sets, 4 Airports, 2 Utilities (Water & Electric), Income Tax, Luxury Tax, Chance & Community Chest bonus cards, Vacation pot accumulator, and Jail with Just Visiting perimeter.
* **Property Development:**
  * Base rents, full set monopoly doubling, 1 to 4 houses, and Hotel upgrades.
  * Mortgaging and unmortgaging with 10% bank interest.
  * Selling houses back for 50% liquidity.
* **Tile-by-Tile Stepping Animation:** Smooth visual player token movement with procedural audio ticks as tokens hop along the board.

### ⏱️ 2. Dynamic Turn Clock & Richup Mechanics
* **Radial Turn Clock:** SVG radial countdown ring with urgency pulses when time is low.
* **Extra Time Grants:** Players can request `+15s` clock time extensions during negotiations.
* **Live Property Auctions:** When an unowned property is skipped, a real-time auction triggers with countdown timer and `+$10`, `+$50`, `+$100` bid increments.
* **Player-to-Player Trading:** Multi-way asset swaps (cash + multiple property deeds) with live acceptance and counter-proposals.
* **Smart AI Opponents:** Play solo or fill empty room seats anytime by adding AI bots.

### ⚡ 3. 100% Serverless Architecture
* **Zero Dedicated Backend Servers:** Runs entirely in browser clients and synchronizes game room state, dice rolls, trades, and chat via **Firebase Realtime Database**.
* **Zero Hosting Costs:** Hosted globally on **GitHub Pages** with continuous deployment via **GitHub Actions**.
* **Offline Multi-Tab Fallback:** Operates seamlessly across browser tabs via `BroadcastChannel` and `localStorage` even when database is disconnected.

### 🎵 4. Zero-Asset Procedural Audio Synthesizer
* Built using the **Web Audio API** with zero external audio dependencies:
  * Rolling 3D dice rattle & tile stepping ticks
  * Turn chime notifications
  * Cash register bells on rent or salary
  * Property purchase chords
  * Auction gavel taps
  * Jail cell clank & buzzer
  * Victory fanfares and confetti celebrations

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
