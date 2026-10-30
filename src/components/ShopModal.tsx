import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ShoppingBag, ArrowLeft, Crown, MapPin, UserCheck, Palette, Layers } from 'lucide-react';
import { ALL_APPEARANCES, PROFILE_PICTURES, SHOP_APPEARANCES, BASE_APPEARANCES, AppearanceOption, PlayerAvatar } from './PlayerAvatar';
import { BOARD_THEMES, BoardTheme, getBoardTheme } from '../config/boardThemes';
import { sound } from '../services/sound';
import { secureStorage } from '../services/secureStorage';

interface ShopModalProps {
  currentAvatar: string;
  onSelectAvatar: (avatarStyle: string, color?: string) => void;
  currentBoardTheme?: string;
  onSelectBoardTheme?: (themeId: string) => void;
  onClose: () => void;
}

const STORAGE_KEY_COINS = 'richup_user_coins';
const STORAGE_KEY_UNLOCKED_AVATARS = 'richup_unlocked_avatars';
const STORAGE_KEY_UNLOCKED_THEMES = 'richup_unlocked_themes';
const STORAGE_KEY_SELECTED_THEME = 'richup_selected_board_theme';

type ShopCategory = 'pfp' | 'board' | 'googly';

export const ShopModal: React.FC<ShopModalProps> = ({
  currentAvatar,
  onSelectAvatar,
  currentBoardTheme,
  onSelectBoardTheme,
  onClose
}) => {
  // Coin balance: cryptographically protected against console tampering
  const [coins, setCoins] = useState<number>(() => secureStorage.getCoins());

  // Unlocked appearance styles: signed anti-cheat verification
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>(() => secureStorage.getUnlockedAvatars());

  // Unlocked board map themes: signed anti-cheat verification
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(() => secureStorage.getUnlockedThemes());

  // Equipped board theme
  const [equippedThemeId, setEquippedThemeId] = useState<string>(() => {
    if (currentBoardTheme) return currentBoardTheme;
    const saved = localStorage.getItem(STORAGE_KEY_SELECTED_THEME);
    return saved || 'midnight';
  });

  const [activeCategory, setActiveCategory] = useState<ShopCategory>('pfp');
  const [notification, setNotification] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Animation state for graceful, slower full-page slide in from left to right
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Slower, graceful slide entrance
    const timer = setTimeout(() => setIsOpen(true), 24);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Slower slide exit, then close modal
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 650);
  };

  useEffect(() => {
    secureStorage.setCoins(coins);
  }, [coins]);

  useEffect(() => {
    secureStorage.setUnlockedAvatars(unlockedAvatars);
  }, [unlockedAvatars]);

  useEffect(() => {
    secureStorage.setUnlockedThemes(unlockedThemes);
  }, [unlockedThemes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SELECTED_THEME, equippedThemeId);
  }, [equippedThemeId]);

  // Avatar Actions
  const handleBuyAvatar = (item: AppearanceOption) => {
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

  const handleEquipAvatar = (item: AppearanceOption) => {
    onSelectAvatar(item.style, item.color);
    sound.playSelect();
    setNotification(`Equipped ${item.name}!`);
    setTimeout(() => setNotification(''), 2000);
  };

  // Board Theme Actions
  const handleBuyTheme = (theme: BoardTheme) => {
    if (coins < theme.price) {
      setNotification(`Need ${theme.price - coins} more coins!`);
      setTimeout(() => setNotification(''), 2500);
      return;
    }

    const newCoins = coins - theme.price;
    const newUnlocked = [...unlockedThemes, theme.id];

    setCoins(newCoins);
    setUnlockedThemes(newUnlocked);
    setEquippedThemeId(theme.id);
    if (onSelectBoardTheme) {
      onSelectBoardTheme(theme.id);
    }
    sound.playUpgrade();

    setNotification(`🗺️ Unlocked & Applied ${theme.name} Board!`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleEquipTheme = (theme: BoardTheme) => {
    setEquippedThemeId(theme.id);
    if (onSelectBoardTheme) {
      onSelectBoardTheme(theme.id);
    }
    sound.playSelect();
    setNotification(`Applied ${theme.name} Board!`);
    setTimeout(() => setNotification(''), 2000);
  };

  const equippedAvatarItem = ALL_APPEARANCES.find(a => a.style === currentAvatar) || ALL_APPEARANCES[0];
  const equippedThemeItem = getBoardTheme(equippedThemeId);

  // Filter items based on active category and lock status
  const getDisplayItems = () => {
    if (activeCategory === 'board') {
      return BOARD_THEMES.filter(theme => {
        const isUnlocked = unlockedThemes.includes(theme.id) || theme.price === 0;
        if (filter === 'unlocked') return isUnlocked;
        if (filter === 'locked') return !isUnlocked;
        return true;
      });
    }

    const sourceList = activeCategory === 'pfp' ? PROFILE_PICTURES : ALL_APPEARANCES.filter(a => !PROFILE_PICTURES.some(p => p.id === a.id));
    return sourceList.filter(item => {
      const isUnlocked = unlockedAvatars.includes(item.style) || item.price === 0;
      if (filter === 'unlocked') return isUnlocked;
      if (filter === 'locked') return !isUnlocked;
      return true;
    });
  };

  const displayItems = getDisplayItems();

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0d0818]/98 backdrop-blur-2xl text-white flex flex-col select-none overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen
          ? 'translate-x-0 opacity-100 shadow-[30px_0_90px_rgba(0,0,0,0.95)]'
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
            title="Return to Game"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-pink-400" />
            <span>Back to Game</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-left hidden sm:block">
            <h1 className="text-lg sm:text-xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 leading-none">
              MONOPOLY STORE
            </h1>
            <p className="text-[10.5px] text-gray-400">
              Customize your profile pictures, board map styles & avatars
            </p>
          </div>
        </div>

        {/* Coins & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-amber-500/20 border border-amber-400/50 rounded-full shadow-inner">
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

      {/* 2. Category Switcher Tabs */}
      <div className="px-4 sm:px-8 pt-3 pb-2.5 bg-[#170f2b] border-b border-purple-900/40 flex items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('pfp')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeCategory === 'pfp'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_4px_16px_rgba(244,63,94,0.4)] border border-pink-400/60'
                : 'bg-[#201538] text-purple-200 hover:text-white border border-purple-800/40 hover:bg-[#281a44]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-pink-300" />
            <span>Profile Pictures ({PROFILE_PICTURES.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('board')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeCategory === 'board'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(168,85,247,0.4)] border border-purple-400/60'
                : 'bg-[#201538] text-purple-200 hover:text-white border border-purple-800/40 hover:bg-[#281a44]'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-300" />
            <span>Board Map Styles ({BOARD_THEMES.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('googly')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeCategory === 'googly'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.4)] border border-amber-400/60'
                : 'bg-[#201538] text-purple-200 hover:text-white border border-purple-800/40 hover:bg-[#281a44]'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-300" />
            <span>Googly Blobs ({ALL_APPEARANCES.length - PROFILE_PICTURES.length})</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-purple-900/60 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'unlocked'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Unlocked
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'locked'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Locked
          </button>
        </div>
      </div>

      {/* 3. Spotlight Hero Showcase */}
      <div className="px-4 sm:px-8 py-3 bg-gradient-to-r from-[#170e2b] via-[#22133e] to-[#170e2b] border-b border-purple-900/40 flex-shrink-0 flex items-center justify-between gap-4">
        {/* Equipped Avatar & Equipped Board Theme preview */}
        <div className="flex items-center gap-6">
          {/* Avatar Showcase */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-black/40 border-2 border-pink-400/70 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <PlayerAvatar avatar={equippedAvatarItem.style} color={equippedAvatarItem.color} size={42} />
              <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1.5 drop-shadow" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-pink-400 font-bold">
                Equipped Avatar
              </span>
              <span className="text-sm font-black text-white">
                {equippedAvatarItem.name}
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-purple-800/50 hidden sm:block" />

          {/* Board Theme Showcase */}
          <div className="flex items-center gap-3">
            <div
              className="relative w-12 h-12 rounded-2xl border-2 border-purple-400/70 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] overflow-hidden"
              style={{ backgroundColor: equippedThemeItem.colors.tileBg }}
            >
              <div
                className="w-7 h-7 rounded-lg border flex items-center justify-center text-[10px]"
                style={{
                  backgroundColor: equippedThemeItem.colors.centerBg,
                  borderColor: equippedThemeItem.colors.borderColor
                }}
              >
                🗺️
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Equipped Board Map
              </span>
              <span className="text-sm font-black text-white">
                {equippedThemeItem.name}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-purple-300 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Equip in 1-click across all games</span>
        </div>
      </div>

      {/* 4. Catalog Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 bg-[#0e0819]">
        {/* A. BOARD MAP STYLES GRID */}
        {activeCategory === 'board' ? (
          (displayItems as BoardTheme[]).map((theme) => {
            const isUnlocked = unlockedThemes.includes(theme.id) || theme.price === 0;
            const isEquipped = equippedThemeId === theme.id;
            const canAfford = coins >= theme.price;

            return (
              <div
                key={theme.id}
                className={`relative rounded-2xl p-3.5 flex flex-col items-center justify-between border transition-all duration-200 group hover:-translate-y-1 ${
                  isEquipped
                    ? 'bg-gradient-to-b from-purple-900/60 to-purple-950/80 border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/60'
                    : isUnlocked
                    ? 'bg-[#1b122e] border-purple-800/60 hover:border-purple-500 shadow-md'
                    : 'bg-[#140e23] border-purple-950/80 hover:border-purple-800/60'
                }`}
              >
                {theme.badge && (
                  <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-amber-500/25 border border-amber-400/50 text-[8.5px] font-black font-mono text-amber-300 tracking-wider uppercase">
                    {theme.badge}
                  </span>
                )}

                {/* Board Map Visual Swatch Preview */}
                <div
                  className="w-full h-24 rounded-xl border p-2 flex flex-col items-center justify-between relative overflow-hidden my-1 shadow-inner group-hover:scale-[1.02] transition-transform"
                  style={{
                    backgroundColor: theme.colors.wrapperBg,
                    borderColor: theme.colors.borderColor
                  }}
                >
                  {/* Miniature Top Tiles */}
                  <div className="flex items-center gap-1 w-full justify-center">
                    <div className="w-5 h-3 rounded-[2px]" style={{ backgroundColor: theme.colors.tileBg }} />
                    <div className="w-5 h-3 rounded-[2px]" style={{ backgroundColor: theme.colors.tileBg }} />
                    <div className="w-5 h-3 rounded-[2px]" style={{ backgroundColor: theme.colors.tileBg }} />
                  </div>
                  {/* Miniature Center */}
                  <div
                    className="w-12 h-8 rounded border flex items-center justify-center text-[10px] font-black shadow"
                    style={{
                      backgroundColor: theme.colors.centerBg,
                      borderColor: theme.colors.borderColor,
                      color: theme.colors.primaryAccent
                    }}
                  >
                    MAP
                  </div>
                  {/* Miniature Bottom Tiles */}
                  <div className="flex items-center gap-1 w-full justify-center">
                    <div className="w-5 h-3 rounded-[2px]" style={{ backgroundColor: theme.colors.tileBg }} />
                    <div className="w-5 h-3 rounded-[2px]" style={{ backgroundColor: theme.colors.tileBg }} />
                    <div className="w-5 h-3 rounded-[2px]" style={{ backgroundColor: theme.colors.tileBg }} />
                  </div>
                </div>

                {/* Theme Name & Info */}
                <div className="text-center w-full mt-1.5">
                  <h3 className="text-sm font-black text-white tracking-wide">
                    {theme.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 min-h-[26px]">
                    {theme.description}
                  </p>
                </div>

                {/* Action Button */}
                <div className="w-full mt-2.5">
                  {isEquipped ? (
                    <div className="w-full py-2 bg-purple-600/30 border border-purple-400/60 rounded-xl text-center text-xs font-black text-purple-200 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>APPLIED</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquipTheme(theme)}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95 border border-purple-400/40"
                    >
                      APPLY MAP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyTheme(theme)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black border border-amber-300'
                          : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className="leading-none">🪙</span>
                      <span>{theme.price}</span>
                      <span className="text-[9px] uppercase tracking-tight">Coins</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* B. PROFILE PICTURES & GOOGLY CHARACTERS GRID */
          (displayItems as AppearanceOption[]).map((item) => {
            const isUnlocked = unlockedAvatars.includes(item.style) || item.price === 0;
            const isEquipped = currentAvatar === item.style;
            const canAfford = coins >= item.price;

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl p-3.5 flex flex-col items-center justify-between border transition-all duration-200 group hover:-translate-y-1 ${
                  isEquipped
                    ? 'bg-gradient-to-b from-purple-900/60 to-purple-950/80 border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/60'
                    : isUnlocked
                    ? 'bg-[#1b122e] border-purple-800/60 hover:border-purple-500 shadow-md'
                    : 'bg-[#140e23] border-purple-950/80 hover:border-purple-800/60'
                }`}
              >
                {/* Character Preview */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-2 filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform">
                  <PlayerAvatar avatar={item.style} color={item.color} size={68} />
                </div>

                {/* Character Name & Info */}
                <div className="text-center w-full mt-1">
                  <h3 className="text-sm font-black text-white tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5 min-h-[26px]">
                    {item.description || 'Exclusive player portrait'}
                  </p>
                </div>

                {/* Action Button */}
                <div className="w-full mt-2.5">
                  {isEquipped ? (
                    <div className="w-full py-2 bg-purple-600/30 border border-purple-400/60 rounded-xl text-center text-xs font-black text-purple-200 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>EQUIPPED</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquipAvatar(item)}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-95 border border-purple-400/40"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyAvatar(item)}
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
          })
        )}
      </div>

      {/* 5. Bottom Footer Bar */}
      <footer className="h-12 px-4 sm:px-8 bg-[#140e24] border-t border-purple-900/50 flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
        <div className="flex items-center gap-2 text-purple-300 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Earn coins by winning matches (+50🪙), match finishes (+20🪙), and building hotels (+10🪙)!</span>
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
