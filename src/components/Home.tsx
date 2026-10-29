import React, { useState } from 'react';
import { Dices, Key, Users, Volume2, VolumeX, Sparkles, Play } from 'lucide-react';
import { sound } from '../services/sound';

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

  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handlePlay = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = nickname.trim() || `Player_${Math.floor(Math.random() * 900 + 100)}`;
    onCreatePrivateRoom(finalName);
    sound.playDiceRoll();
  };

  return (
    <div className="w-screen h-screen bg-[#130f1d] flex flex-col items-center justify-between p-4 relative overflow-hidden select-none text-white font-sans">
      {/* Top Navbar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-20">
        <button
          onClick={() => setIsMuted(sound.toggleMute())}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-xl bg-[#1f1830] hover:bg-[#2a2042] border border-purple-900/60 text-purple-200 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <a
          href="https://github.com/istabra9-byte/games"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-purple-300 hover:text-white bg-[#1f1830] hover:bg-[#2a2042] px-3 py-1.5 rounded-xl border border-purple-900/60 transition-colors"
        >
          GitHub Repo
        </a>
      </header>

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

        {/* Brand Title */}
        <h1 className="text-6xl sm:text-7xl font-black font-heading tracking-widest text-white leading-none">
          RICHUP<span className="text-[#8c47e0]">.IO</span>
        </h1>
        <p className="text-sm font-semibold tracking-wider text-purple-300/80 mt-1 uppercase">
          Rule the economy
        </p>

        {/* Input & Play Form */}
        <form onSubmit={handlePlay} className="mt-8 w-full flex flex-col gap-3">
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

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#6647e0] to-[#8c47e0] hover:from-[#7555ee] hover:to-[#9d55ee] active:scale-98 text-white font-black text-base tracking-wider uppercase rounded-xl shadow-[0_6px_25px_rgba(102,71,224,0.5)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-purple-400/30"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Play</span>
          </button>
        </form>

        {/* Secondary Actions */}
        <div className="mt-4 flex items-center gap-2 w-full justify-center">
          <button
            onClick={() => handlePlay()}
            className="flex-1 py-2.5 px-3 bg-[#1e162f] hover:bg-[#291e40] border border-purple-900/60 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>Create Private Room</span>
          </button>
        </div>
      </div>

      {/* Floating Animated Icons in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-6 gap-20 text-4xl transform -rotate-12 scale-125">
          <span>✈️</span><span>🍕</span><span>🎩</span><span>💎</span><span>👑</span><span>🚗</span>
          <span>⚡</span><span>🍔</span><span>🚀</span><span>🏆</span><span>🎯</span><span>🍣</span>
          <span>🍦</span><span>🔑</span><span>⚙️</span><span>⚔️</span><span>🛡️</span><span>🎂</span>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-[11px] text-gray-500 font-medium z-20">
        Free online multiplayer property board game • Zero downloads or sign-ups required
      </footer>
    </div>
  );
};
