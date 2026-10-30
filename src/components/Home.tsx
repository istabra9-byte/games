import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Key, ShoppingBag, Github, X, ArrowRight } from 'lucide-react';
import { sound } from '../services/sound';
import { ShopModal } from './ShopModal';
import { AuthStatus } from './AuthStatus';

interface HomeProps {
  onJoinRoom: (roomId: string, playerName: string) => void;
  onCreatePrivateRoom: (playerName: string) => void;
}

const RANDOM_NICKNAMES = [
  'Tycoon', 'Investor', 'Broker', 'Mogul', 'Banker', 
  'Baron', 'Trader', 'Capitalist', 'Wolf', 'Whale', 'Venture'
];

export const Home: React.FC<HomeProps> = ({ onJoinRoom, onCreatePrivateRoom }) => {
  const [nickname, setNickname] = useState(() => {
    const saved = localStorage.getItem('richup_player');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      } catch (e) {}
    }
    const rand = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    return `${rand}_${Math.floor(Math.random() * 900 + 100)}`;
  });

  const [currentAvatar, setCurrentAvatar] = useState(() => {
    try {
      const saved = localStorage.getItem('richup_player');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.avatar) return parsed.avatar;
      }
    } catch (e) {}
    return 'navy';
  });

  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [showShop, setShowShop] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomKeyInput, setRoomKeyInput] = useState('');
  const [joinError, setJoinError] = useState('');

  const getFinalName = () => {
    const trimmed = nickname.trim();
    const finalName = trimmed || `Player_${Math.floor(Math.random() * 900 + 100)}`;
    try {
      const saved = localStorage.getItem('richup_player');
      const p = saved ? JSON.parse(saved) : {};
      p.name = finalName;
      localStorage.setItem('richup_player', JSON.stringify(p));
    } catch (e) {}
    return finalName;
  };

  const handleSelectAvatar = (style: string) => {
    setCurrentAvatar(style);
    try {
      const saved = localStorage.getItem('richup_player');
      const p = saved ? JSON.parse(saved) : {};
      p.avatar = style;
      localStorage.setItem('richup_player', JSON.stringify(p));
    } catch (e) {}
  };

  // Play button triggers Join Room flow
  const handleOpenJoinModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setJoinError('');
    setShowJoinModal(true);
    sound.playSelect();
  };

  // Submitting the room key
  const handleJoinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = roomKeyInput.trim().toLowerCase();
    if (!cleaned) {
      setJoinError('Please enter a room key');
      return;
    }
    sound.playDiceRoll();
    setShowJoinModal(false);
    onJoinRoom(cleaned, getFinalName());
  };

  // Create Private Room creates a new room as host
  const handleCreateRoom = () => {
    sound.playDiceRoll();
    onCreatePrivateRoom(getFinalName());
  };

  return (
    <div className="w-screen h-screen bg-[#130f1d] flex flex-col items-center justify-between p-4 relative overflow-hidden select-none text-white font-sans">
      {/* Top Navbar: Google Sign-in on Left, Audio & GitHub on Right */}
      <header className="w-full flex items-center justify-between z-20 px-3 sm:px-6 py-2">
        {/* Left: Google Sign-in / Player Account */}
        <div className="flex items-center gap-2">
          <AuthStatus onUserChanged={(user) => {
            if (user && user.displayName) {
              setNickname(user.displayName);
              try {
                const saved = localStorage.getItem('richup_player');
                const p = saved ? JSON.parse(saved) : {};
                p.name = user.displayName;
                localStorage.setItem('richup_player', JSON.stringify(p));
              } catch {}
            }
          }} />
        </div>

        {/* Right: Audio Mute & GitHub Repo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMuted(sound.toggleMute())}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#1e1533]/90 hover:bg-[#2a1d47] border border-purple-800/60 text-purple-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-purple-300" />}
            <span className="text-xs font-bold hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          <a
            href="https://github.com/istabra9-byte/games"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-purple-200 hover:text-white bg-[#1e1533]/90 hover:bg-[#2a1d47] px-3.5 py-2 rounded-xl border border-purple-800/60 transition-all flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
          >
            <Github className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">GitHub Repo</span>
          </a>
        </div>
      </header>

      {/* Slide-out Appearance Shop Button on the Left */}
      <button
        onClick={() => setShowShop(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 group flex items-center bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white font-black py-3 px-3 pl-3.5 pr-4 rounded-r-2xl shadow-[0_8px_25px_rgba(245,158,11,0.45)] border-t border-r border-b border-yellow-300/60 transition-all duration-300 transform hover:translate-x-1 cursor-pointer"
        title="Open Character Shop"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-yellow-100 group-hover:scale-110 transition-transform animate-bounce" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] uppercase font-bold text-yellow-200 tracking-wider">Appearance</span>
            <span className="text-sm font-extrabold tracking-wide uppercase drop-shadow">Shop</span>
          </div>
        </div>
      </button>

      {/* Center Hero Form */}
      <div className="my-auto flex flex-col items-center max-w-md w-full z-20 text-center">
        {/* 3D Die Illustration */}
        <div className="relative mb-3 transform hover:rotate-12 transition-transform duration-500 cursor-pointer">
          <div className="w-20 h-20 bg-gradient-to-br from-white via-gray-100 to-gray-300 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-2 border-white/80 flex items-center justify-center relative rotate-6">
            <div className="w-4 h-4 bg-purple-900 rounded-full shadow-inner" />
            <div className="absolute top-3 left-3 w-3 h-3 bg-red-600 rounded-full shadow-inner" />
            <div className="absolute bottom-3 right-3 w-3 h-3 bg-red-600 rounded-full shadow-inner" />
          </div>
        </div>

        {/* Brand Title: MONOPOLY only */}
        <h1 className="text-6xl sm:text-7xl font-black font-heading tracking-widest text-white leading-none">
          MONOPOLY
        </h1>
        <p className="text-sm font-semibold tracking-wider text-purple-300/80 mt-1 uppercase">
          Rule the economy
        </p>

        {/* Nickname Input & Play Button Form */}
        <form onSubmit={handleOpenJoinModal} className="mt-8 w-full flex flex-col gap-3">
          <div className="relative w-full">
            <input
              type="text"
              value={nickname}
              maxLength={18}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname..."
              className="w-full bg-[#1e162f] border border-purple-800/60 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-gray-500 outline-none focus:border-[#6647e0] focus:ring-2 focus:ring-[#6647e0]/40 transition-all text-center"
            />
          </div>

          {/* PLAY Button: Means Join a Room */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#6647e0] to-[#8c47e0] hover:from-[#7555ee] hover:to-[#9d55ee] active:scale-98 text-white font-black text-base tracking-wider uppercase rounded-xl shadow-[0_6px_25px_rgba(102,71,224,0.5)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-purple-400/30"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Play</span>
          </button>
        </form>

        {/* Secondary Action: Create Private Room (Host) */}
        <div className="mt-3.5 flex items-center gap-2 w-full justify-center">
          <button
            onClick={handleCreateRoom}
            className="w-full py-3 px-3 bg-[#1e162f] hover:bg-[#291e40] border border-purple-800/70 hover:border-purple-500/80 text-purple-200 hover:text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Key className="w-4 h-4 text-purple-400" />
            <span>Create Private Room</span>
          </button>
        </div>
      </div>

      {/* Join Room Modal (When user clicks Play) */}
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="bg-[#1e1533] border-2 border-purple-500/60 rounded-2xl w-full max-w-sm p-5 shadow-2xl text-white relative cursor-default text-center flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-500/60 flex items-center justify-center mx-auto text-purple-300">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black font-heading text-white">
              Join a Room
            </h3>

            <p className="text-xs text-gray-300">
              Enter the room key to join your friends:
            </p>

            <form onSubmit={handleJoinSubmit} className="flex flex-col gap-2.5 mt-1">
              <input
                type="text"
                autoFocus
                value={roomKeyInput}
                onChange={(e) => {
                  setRoomKeyInput(e.target.value);
                  if (joinError) setJoinError('');
                }}
                placeholder="Room key (e.g. cj5sf)"
                className="w-full bg-[#150e24] border border-purple-700/60 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white text-center placeholder-gray-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/40"
              />

              {joinError && (
                <span className="text-[11px] text-red-400 font-bold">
                  {joinError}
                </span>
              )}

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-purple-400/40"
                >
                  <span>Join Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Shop Modal */}
      {showShop && (
        <ShopModal
          currentAvatar={currentAvatar}
          onSelectAvatar={handleSelectAvatar}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Floating Animated Icons in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-6 gap-20 text-4xl transform -rotate-12 scale-125">
          <span>✈️</span><span>🍕</span><span>🎩</span><span>💎</span><span>👑</span><span>🚗</span>
          <span>⚡</span><span>🍔</span><span>🚀</span><span>🏆</span><span>🎯</span><span>🍣</span>
          <span>🍦</span><span>🔑</span><span>⚙️</span><span>⚔️</span><span>🛡️</span><span>🎂</span>
        </div>
      </div>
    </div>
  );
};
