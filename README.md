# Richup - Real-Time Multiplayer Board Game

[![GitHub Pages Deployment](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=flat-square&logo=github)](https://istabra9-byte.github.io/games/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-ffca28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

A high-performance, responsive, **100% serverless** real-time multiplayer board game inspired by **[Richup.io](https://richup.io)** and classic property-trading games.

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

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or newer)
* [npm](https://www.npmjs.com/)

### 1. Clone the repository
```bash
git clone https://github.com/istabra9-byte/games.git
cd games
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
```
The optimized static build will be placed in the `dist/` directory.

---

## 🔒 Configuration & Security

Credentials and database URLs are protected using Vite environment variables and GitHub Repository Secrets. **No sensitive API keys are stored in the public source code.**

### Local Environment Setup
To connect your own Firebase project for local development, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### GitHub Actions Secrets
For automated deployments on GitHub Pages, add the corresponding secrets in your repository under **Settings > Secrets and variables > Actions**:
* `VITE_FIREBASE_API_KEY`
* `VITE_FIREBASE_AUTH_DOMAIN`
* `VITE_FIREBASE_DATABASE_URL`
* `VITE_FIREBASE_PROJECT_ID`
* `VITE_FIREBASE_STORAGE_BUCKET`
* `VITE_FIREBASE_MESSAGING_SENDER_ID`
* `VITE_FIREBASE_APP_ID`

---

## 📁 Project Structure

```
├── .github/workflows/       # GitHub Actions CI/CD deployment
├── public/                  # Static assets & icons
├── src/
│   ├── components/          # React UI components
│   │   ├── Board.tsx        # 40-tile responsive grid board & token movement
│   │   ├── CenterControls.tsx # Center stage controls, dice, deed cards
│   │   ├── Lobby.tsx        # Pre-game lobby & character customizer
│   │   ├── Leaderboard.tsx  # Player HUD & real-time standings
│   │   ├── ChatAndLogs.tsx  # Activity feed & live chat
│   │   ├── AuctionModal.tsx # Real-time auction modal
│   │   ├── TradeModal.tsx   # Asset exchange modal
│   │   └── PropertyDetailModal.tsx # Property deeds & house upgrades
│   ├── data/                # Board tile properties, Chance & Chest decks
│   ├── services/            # Firebase RTDB engine & Web Audio synthesizer
│   ├── types/               # TypeScript interfaces & types
│   ├── App.tsx              # Main application shell & router
│   └── main.tsx             # React entrypoint
├── index.html               # Main HTML template
├── package.json             # Dependencies & build scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build & asset configuration
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
