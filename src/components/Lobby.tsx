import React, { useState } from 'react';
import { GameRoom, Player, GameSettings } from '../types/game';
import { Dices, Users, Settings, Copy, Check, Plus, Bot, Flame, Crown, Play, X, Sliders } from 'lucide-react';
import { sound } from '../services/sound';

interface LobbyProps {
  room: GameRoom;
  currentPlayer: Player;
  onUpdatePlayer: (name: string, avatar: string, color: string) => void;
  onUpdateSettings: (settings: GameSettings) => void;
  onAddBot: () => void;
  onStartGame: () => void;
  onOpenFirebaseConfig: () => void;
  isFirebaseActive: boolean;
}

// Exact emoji tokens matching Richup.io
const AVATAR_OPTIONS = [
  '🎩', '🚗', '🚀', '✈️', '🚂', '🚢', '🎮', '🎭', '🎨', 
  '🍕', '🍔', '🌮', '🍣', '🍦', '🎂', '🍓', '🥑', '🌶️', 
  '🔑', '⚙️', '⚔️', '🛡️', '👑', '💎', '⚡', '🏆', '🎉'
];

// Richup 8 player colors
const COLOR_OPTIONS = [
  '#ff253a', // Red
  '#007aff', // Blue
  '#07bc0c', // Green
  '#f1c40f', // Yellow
  '#9b51e0', // Purple
  '#ff6b22', // Orange
  '#00d2d3', // Cyan
  '#fd79a8'  // Pink
];

const RANDOM_NAMES = ['Investor', 'Tycoon', 'Broker', 'Mogul', 'Banker', 'Baron', 'Trader', 'Capitalist', 'Wolf', 'Whale'];

export const Lobby: React.FC<LobbyProps> = ({
  room,
  currentPlayer,
  onUpdatePlayer,
  onUpdateSettings,
  onAddBot,
  onStartGame,
  onOpenFirebaseConfig,
  isFirebaseActive
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [name, setName] = useState(currentPlayer.name);
  const isHost = room.hostId === currentPlayer.id;

  const handleRandomize = () => {
    const randomName = `${RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]}_${Math.floor(Math.random() * 900 + 100)}`;
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    setName(randomName);
    onUpdatePlayer(randomName, randomAvatar, randomColor);
    sound.playDiceRoll();
  };

  const handleCopyLink = () => {
    // Generate clean link using hash route so GitHub Pages never 404s
    const url = `${window.location.origin}${window.location.pathname}#/room/${room.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const playersList = Object.values(room.players);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 max-w-xl mx-auto w-full text-white relative select-none">
      {/* Brand Header */}
      <div className="text-center mb-5">
        <h1 className="text-5xl sm:text-6xl font-black font-heading tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-400 to-purple-400 leading-none">
          RICHUP
        </h1>
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-purple-300/80 mt-1">
          Rule the economy
        </h2>
      </div>

      {/* Main Lobby Card */}
      <div className="w-full bg-[#181126] border border-purple-900/60 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 sm:gap-5 backdrop-blur-md">
        {/* Room Code & Share URL */}
        <div className="flex items-center justify-between bg-[#110c1c] p-3 rounded-xl border border-purple-950">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Room:</span>
            <span className="text-base font-black font-mono tracking-widest text-purple-300">
              {room.id}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white rounded-lg text-xs font-bold transition-all border border-purple-500/30 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Share Room'}</span>
          </button>
        </div>

        {/* Player Profile Customization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">
              Your Player Profile
            </label>
            <button
              onClick={handleRandomize}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Randomize</span>
            </button>
          </div>

          {/* Nickname Input */}
          <input
            type="text"
            value={name}
            maxLength={18}
            onChange={(e) => {
              setName(e.target.value);
              onUpdatePlayer(e.target.value, currentPlayer.avatar, currentPlayer.color);
            }}
            className="w-full bg-[#110c1c] border border-purple-800/60 rounded-xl px-3 py-2 text-sm text-white font-bold outline-none focus:border-purple-500 transition-colors"
            placeholder="Enter your nickname"
          />

          {/* Token Pickers */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[11px] text-gray-400 font-semibold">Choose Your Token:</span>
            <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto p-1 bg-[#120c1d] rounded-xl border border-purple-950">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => onUpdatePlayer(name, av, currentPlayer.color)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm transition-transform cursor-pointer ${
                    currentPlayer.avatar === av
                      ? 'scale-110 bg-purple-600 shadow-md ring-2 ring-white'
                      : 'bg-[#1a1228] hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>

            {/* Color Pickers */}
            <span className="text-[11px] text-gray-400 font-semibold mt-1">Choose Player Color:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col}
                  onClick={() => onUpdatePlayer(name, currentPlayer.avatar, col)}
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-transform cursor-pointer shadow ${
                    currentPlayer.color === col
                      ? 'scale-115 ring-2 ring-white shadow-lg'
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Players In Lobby */}
        <div className="border-t border-purple-900/50 pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Players in Room ({playersList.length}/{room.settings.maxPlayers})</span>
            </div>

            {isHost && playersList.length < room.settings.maxPlayers && room.settings.canBotsJoin && (
              <button
                onClick={onAddBot}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add AI Bot</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {playersList.map((p) => (
              <div
                key={p.id}
                className="bg-[#120c1d] p-2.5 rounded-xl border border-purple-950 flex items-center gap-2.5"
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white/70 shadow relative flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.avatar || p.name[0]}
                  {p.isHost && <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1 drop-shadow" />}
                </div>

                <div className="flex flex-col leading-tight overflow-hidden">
                  <span className="text-xs font-bold text-white truncate">
                    {p.name} {p.id === currentPlayer.id ? '(You)' : ''}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {p.isBot ? 'AI Bot' : p.isHost ? 'Room Host' : 'Player'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="border-t border-purple-900/50 pt-3 flex items-center gap-3">
          {isHost && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-3 bg-[#24193a] hover:bg-[#2f204d] border border-purple-700/50 rounded-xl text-purple-200 transition-colors cursor-pointer"
              title="Game Rules & Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={playersList.length < 2}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 disabled:opacity-40 text-white font-black text-sm tracking-widest uppercase rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Game</span>
            </button>
          ) : (
            <div className="flex-1 py-3 text-center bg-[#120c1d] rounded-xl border border-purple-950 text-xs text-gray-400 font-semibold italic">
              Waiting for host to start the match...
            </div>
          )}
        </div>
      </div>

      {/* Rules / Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1228] border-2 border-purple-600/50 rounded-2xl w-full max-w-md p-5 text-white space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold font-heading uppercase tracking-wide">
                  Match Rules & Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Starting Cash */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-300">Starting Cash:</span>
                <select
                  value={room.settings.startingCash}
                  onChange={(e) => onUpdateSettings({ ...room.settings, startingCash: Number(e.target.value) })}
                  className="bg-[#120c1d] border border-purple-800 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none"
                >
                  <option value={1000}>$1,000</option>
                  <option value={1500}>$1,500 (Standard)</option>
                  <option value={2000}>$2,000</option>
                  <option value={2500}>$2,500</option>
                </select>
              </div>

              {/* Turn Limit */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-300">Turn Time Limit:</span>
                <select
                  value={room.settings.turnTimeLimit}
                  onChange={(e) => onUpdateSettings({ ...room.settings, turnTimeLimit: Number(e.target.value) })}
                  className="bg-[#120c1d] border border-purple-800 rounded-lg px-2 py-1 text-white font-mono font-bold outline-none"
                >
                  <option value={30}>30 Seconds</option>
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds (Standard)</option>
                  <option value={90}>90 Seconds</option>
                </select>
              </div>

              {/* Vacation Pot Toggle */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-300">Vacation Jackpot Pot:</span>
                <input
                  type="checkbox"
                  checked={room.settings.vacationCash}
                  onChange={(e) => onUpdateSettings({ ...room.settings, vacationCash: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Auction on Skip Toggle */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-300">Auction Skipped Properties:</span>
                <input
                  type="checkbox"
                  checked={room.settings.auction}
                  onChange={(e) => onUpdateSettings({ ...room.settings, auction: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Double Rent on Full Set */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-300">2x Rent on Complete Monopoly:</span>
                <input
                  type="checkbox"
                  checked={room.settings.payDoubleRentWhenOwnFullSet}
                  onChange={(e) => onUpdateSettings({ ...room.settings, payDoubleRentWhenOwnFullSet: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
