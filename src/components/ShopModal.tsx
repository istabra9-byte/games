import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ShoppingBag, ArrowLeft, Trophy, Crown } from 'lucide-react';
import { ALL_APPEARANCES, AppearanceOption, PlayerAvatar } from './PlayerAvatar';
import { sound } from '../services/sound';

interface ShopModalProps {
  currentAvatar: string;
  onSelectAvatar: (avatarStyle: string, color?: string) => void;
  onClose: () => void;
}

const STORAGE_KEY_COINS = 'richup_user_coins';
const STORAGE_KEY_UNLOCKED = 'richup_unlocked_avatars';

export const ShopModal: React.FC<ShopModalProps> = ({
  currentAvatar,
  onSelectAvatar,
  onClose
}) => {
  // Coin balance: default 250 coins so players can test buying characters immediately
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COINS);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 250;
  });

  // Unlocked appearance styles
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_UNLOCKED);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return arr;
      } catch (e) {}
    }
    return ['navy'];
  });

  const [notification, setNotification] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Animation state for smooth full-page slide in from left to right
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger smooth slide from left to right
    const timer = setTimeout(() => setIsOpen(true), 16);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Slide back from right to left, then invoke onClose
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COINS, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(unlockedAvatars));
  }, [unlockedAvatars]);

  const handleBuy = (item: AppearanceOption) => {
    if (coins < item.price) {
      setNotification(`Need ${item.price - coins} more coins!`);
      setTimeout(() => setNotification(''), 2500);
      return;
    }

    const newCoins = coins - item.price;
    const newUnlocked = [...unlockedAvatars, item.style];

    setCoins(newCoins);
    setUnlockedAvatars(newUnlocked);
    sound.playUpgrade();
    onSelectAvatar(item.style, item.color);

    setNotification(`🎉 Unlocked & Equipped ${item.name}!`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleEquip = (item: AppearanceOption) => {
    onSelectAvatar(item.style, item.color);
    sound.playSelect();
    setNotification(`Equipped ${item.name}!`);
    setTimeout(() => setNotification(''), 2000);
  };

  const equippedItem = ALL_APPEARANCES.find(a => a.style === currentAvatar) || ALL_APPEARANCES[0];

  const filteredItems = ALL_APPEARANCES.filter(item => {
    const isUnlocked = unlockedAvatars.includes(item.style) || item.price === 0;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0d0818]/98 backdrop-blur-2xl text-white flex flex-col select-none overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen
          ? 'translate-x-0 opacity-100 shadow-[20px_0_60px_rgba(0,0,0,0.9)]'
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. Top Navigation Bar */}
      <header className="h-16 px-4 sm:px-8 bg-[#140e24] border-b border-purple-900/50 flex items-center justify-between flex-shrink-0 z-10 shadow-lg">
        {/* Back Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="px-3.5 py-2 rounded-xl bg-[#201538] hover:bg-[#2e1d52] border border-purple-700/60 text-purple-200 hover:text-white flex items-center gap-2 font-bold text-xs sm:text-sm transition-all cursor-pointer group shadow"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-pink-400" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-left hidden sm:block">
            <h1 className="text-lg sm:text-xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 leading-none">
              APPEARANCE STORE
            </h1>
            <p className="text-[10.5px] text-gray-400">
              Unlock exclusive googly-eyed player appearances
            </p>
          </div>
        </div>

        {/* Coins & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-400/50 rounded-full shadow-inner">
            <span className="text-lg leading-none">🪙</span>
            <span className="text-base font-black font-mono text-amber-300">{coins}</span>
            <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider hidden sm:inline">Coins</span>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Close Shop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Temporary Alert Banner */}
      {notification && (
        <div className="bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 text-center py-2 px-4 text-xs font-bold text-white border-b border-pink-500/40 animate-in slide-in-from-top-1 z-20">
          {notification}
        </div>
      )}

      {/* 2. Spotlight Hero Banner */}
      <div className="px-4 sm:px-8 py-3.5 bg-gradient-to-r from-[#170e2b] via-[#22133e] to-[#170e2b] border-b border-purple-900/40 flex-shrink-0 flex flex-wrap items-center justify-between gap-4">
        {/* Currently Equipped Showcase */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/40 border-2 border-amber-400/70 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <PlayerAvatar avatar={equippedItem.style} color={equippedItem.color} size={54} />
            <Crown className="w-4 h-4 text-amber-400 absolute -top-1.5 -right-1.5 drop-shadow" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Currently Equipped
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-base sm:text-lg font-black font-heading text-white">
              {equippedItem.name}
            </span>
            <span className="text-[11px] text-gray-400">
              Equipped across all games and rooms
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-purple-900/60 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({ALL_APPEARANCES.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'locked'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Locked
          </button>
        </div>
      </div>

      {/* 3. Catalog Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 bg-[#0e0819]">
        {filteredItems.map((item) => {
          const isUnlocked = unlockedAvatars.includes(item.style) || item.price === 0;
          const isEquipped = currentAvatar === item.style;
          const canAfford = coins >= item.price;

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl p-4 flex flex-col items-center justify-between border transition-all duration-200 group hover:-translate-y-1 ${
                isEquipped
                  ? 'bg-gradient-to-b from-purple-900/60 to-purple-950/80 border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/60'
                  : isUnlocked
                  ? 'bg-[#1b122e] border-purple-800/60 hover:border-purple-500 shadow-md'
                  : 'bg-[#140e23] border-purple-950/80 hover:border-purple-800/60'
              }`}
            >
              {/* Character Preview */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-2 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-transform">
                <PlayerAvatar avatar={item.style} color={item.color} size={64} />
              </div>

              {/* Character Name & Info */}
              <div className="text-center w-full mt-1">
                <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                  {item.name}
                </h3>
                <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                  {item.description || 'Googly-eyed avatar'}
                </p>
              </div>

              {/* Action Button */}
              <div className="w-full mt-3">
                {isEquipped ? (
                  <div className="w-full py-2 bg-purple-600/30 border border-purple-400/60 rounded-xl text-center text-xs font-black text-purple-200 flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>EQUIPPED</span>
                  </div>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95 border border-purple-400/40"
                  >
                    EQUIP
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black border border-amber-300'
                        : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span className="leading-none">🪙</span>
                    <span>{item.price}</span>
                    <span className="text-[9px] uppercase tracking-tight">Coins</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Footer Bar */}
      <footer className="h-12 px-4 sm:px-8 bg-[#140e24] border-t border-purple-900/50 flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
        <div className="flex items-center gap-2 text-purple-300 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Equip unlocked appearances to stand out in your Monopoly matches!</span>
        </div>

        <button
          onClick={handleClose}
          className="text-xs font-bold text-gray-400 hover:text-white px-3 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          Close Store
        </button>
      </footer>
    </div>
  );
};
