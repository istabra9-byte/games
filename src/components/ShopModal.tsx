import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ShoppingBag, Lock } from 'lucide-react';
import { SHOP_APPEARANCES, AppearanceOption, PlayerAvatar } from './PlayerAvatar';
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#160f25] border border-purple-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 bg-[#110b1d] border-b border-purple-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 leading-none">
                CHARACTER SHOP
              </h2>
              <p className="text-[11px] text-gray-400">
                Unlock exclusive googly-eyed cartoon appearances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins Balance Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full shadow-inner">
              <span className="text-base leading-none">🪙</span>
              <span className="text-sm font-black font-mono text-amber-300">
                {coins}
              </span>
              <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">
                Coins
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close Shop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary Notification Banner */}
        {notification && (
          <div className="bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 text-center py-1.5 px-4 text-xs font-bold text-white border-b border-pink-500/40 animate-in slide-in-from-top-1">
            {notification}
          </div>
        )}

        {/* Character Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-[#0f0a1a]">
          {SHOP_APPEARANCES.map((item) => {
            const isUnlocked = unlockedAvatars.includes(item.style);
            const isEquipped = currentAvatar === item.style;
            const canAfford = coins >= item.price;

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl p-3 flex flex-col items-center justify-between border transition-all ${
                  isEquipped
                    ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.45)] ring-1 ring-purple-300'
                    : isUnlocked
                    ? 'bg-[#1b122e] border-purple-800/60 hover:border-purple-600'
                    : 'bg-[#140e23] border-purple-950/80 hover:border-purple-800/40'
                }`}
              >
                {/* Character Preview */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center my-1 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  <PlayerAvatar avatar={item.style} color={item.color} size={54} />
                </div>

                {/* Character Name */}
                <div className="text-center w-full mt-1">
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-[9.5px] text-gray-400 truncate max-w-full">
                    {item.description || 'Googly-eyed style'}
                  </p>
                </div>

                {/* Price / Status */}
                <div className="w-full mt-2.5">
                  {isEquipped ? (
                    <div className="w-full py-1.5 bg-purple-600/30 border border-purple-400/60 rounded-xl text-center text-[10px] sm:text-xs font-black text-purple-200 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>EQUIPPED</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all shadow cursor-pointer active:scale-95"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow active:scale-95 ${
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

        {/* Footer info */}
        <div className="p-3 bg-[#110b1d] border-t border-purple-900/60 text-center flex items-center justify-between text-[11px] text-gray-400 px-4">
          <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gameplay Reward System Coming Soon!</span>
          </div>
          <span>Earn coins by winning games & trading</span>
        </div>
      </div>
    </div>
  );
};
