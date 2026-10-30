import React, { useState, useEffect, useRef } from 'react';
import { Tile, Player, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { calculateRent } from '../services/gameEngine';
import { Plane, Zap, Droplets, HelpCircle, Gift, AlertTriangle, Shield, Palmtree, ArrowRight, Skull, Gem, Percent, ShoppingCart, Check } from 'lucide-react';
import { sound } from '../services/sound';
import { PlayerAvatar } from './PlayerAvatar';
import { HouseIcon, HotelIcon } from './HouseIcons';
import { getBoardTheme } from '../config/boardThemes';
import stegLogo from '../assets/steg.png';
import sonedeLogo from '../assets/sonede.svg';
import tunisairLogo from '../assets/tunisair.svg';
import qatarLogo from '../assets/qatarairways.svg';
import nouvelairLogo from '../assets/nouvelair.svg';
import emiratesLogo from '../assets/emirates.svg';
import mornaguiaJailImg from '../assets/mornaguia_jail.png';
import vacationImg from '../assets/vacation.png';
import posteLogo from '../assets/poste.png';
import bankLogo from '../assets/bank.png';

interface BoardProps {
  room: GameRoom;
  currentPlayerId?: string;
  boardThemeId?: string;
  onTileClick?: (tile: Tile) => void;
  centerContent?: React.ReactNode | ((props: { isPieceMoving: boolean }) => React.ReactNode);
}

export function getGridPosition(index: number) {
  if (index === 0) {
    return { row: 1, col: 1, isCorner: true, cornerType: 'start' as const, side: 'corner' as const };
  } else if (index >= 1 && index <= 9) {
    return { row: 1, col: index + 1, isCorner: false, side: 'top' as const };
  } else if (index === 10) {
    return { row: 1, col: 11, isCorner: true, cornerType: 'jail' as const, side: 'corner' as const };
  } else if (index >= 11 && index <= 19) {
    return { row: index - 9, col: 11, isCorner: false, side: 'right' as const };
  } else if (index === 20) {
    return { row: 11, col: 11, isCorner: true, cornerType: 'vacation' as const, side: 'corner' as const };
  } else if (index >= 21 && index <= 29) {
    return { row: 11, col: 11 - (index - 20), isCorner: false, side: 'bottom' as const };
  } else if (index === 30) {
    return { row: 11, col: 1, isCorner: true, cornerType: 'go_to_jail' as const, side: 'corner' as const };
  } else {
    return { row: 11 - (index - 30), col: 1, isCorner: false, side: 'left' as const };
  }
}

export const Board: React.FC<BoardProps> = ({ room, currentPlayerId, boardThemeId, onTileClick, centerContent }) => {
  const { tiles, players } = room;
  const currentTheme = getBoardTheme(boardThemeId || (typeof window !== 'undefined' ? localStorage.getItem('richup_selected_board_theme') || 'midnight' : 'midnight'));

  const [visualPositions, setVisualPositions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    Object.values(players).forEach(p => {
      init[p.id] = p.position;
    });
    return init;
  });

  const [movingPlayerIds, setMovingPlayerIds] = useState<Set<string>>(new Set());
  const animTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const currentTurnPlayerId = room.playerOrder[room.currentTurnPlayerIndex];
  const isPieceMoving = Boolean(
    movingPlayerIds.has(currentTurnPlayerId) ||
    (currentTurnPlayerId && visualPositions[currentTurnPlayerId] !== undefined && visualPositions[currentTurnPlayerId] !== room.players[currentTurnPlayerId]?.position)
  );

  // Prominent, non-bouncing, high-visibility player token renderer
  const renderPlayerToken = (p: Player, isCorner: boolean = false) => {
    const isMe = p.id === currentPlayerId;
    const isTurn = p.id === currentTurnPlayerId;
    const size = isCorner ? 'clamp(28px, 4.3cqi, 40px)' : 'clamp(26px, 3.8cqi, 36px)';

    return (
      <div
        key={p.id}
        className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-200 pointer-events-auto"
        title={`${p.name} ($${p.cash})`}
        style={{
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 5px ${p.color})`
        }}
      >
        {/* Active turn pulsing halo */}
        {isTurn && (
          <div
            className="absolute -inset-1 rounded-full ring-2 ring-white/90 animate-pulse pointer-events-none"
            style={{ boxShadow: `0 0 10px ${p.color}` }}
          />
        )}

        {/* Large, stable avatar (no bounce) */}
        <PlayerAvatar avatar={p.isBot ? 'navy' : p.avatar} color={p.color} size={size} />

        {/* Vacation Zzz Sleeping Animation on the side of the icon */}
        {p.position === 20 && !p.isBankrupt && (
          <div className="absolute -top-2.5 -right-3 pointer-events-none select-none flex items-center gap-0.5 z-20">
            <span className="text-[10px] font-black text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] animate-zzz-1">Z</span>
            <span className="text-[8px] font-bold text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] animate-zzz-2">z</span>
            <span className="text-[7px] font-semibold text-amber-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] animate-zzz-3">z</span>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    Object.values(players).forEach(p => {
      const currentVisual = visualPositions[p.id] ?? p.position;
      const targetPos = p.position;

      if (currentVisual !== targetPos) {
        // If player landed on Tile 30 (Go to Prison), walk them to 30 first so they see arrival,
        // then send them to Jail (10) and play the jail meme!
        const isJailFromTile30 = p.inJail && targetPos === 10 && currentVisual > 10;
        const actualWalkTarget = isJailFromTile30 ? 30 : targetPos;

        if (p.inJail && targetPos === 10 && !isJailFromTile30) {
          if (animTimers.current[p.id]) {
            clearInterval(animTimers.current[p.id]);
            delete animTimers.current[p.id];
          }
          setVisualPositions(prev => ({ ...prev, [p.id]: 10 }));
          setMovingPlayerIds(prev => {
            const next = new Set(prev);
            next.delete(p.id);
            return next;
          });
          sound.playPrison();
          return;
        }

        if (!animTimers.current[p.id]) {
          setMovingPlayerIds(prev => new Set(prev).add(p.id));
          let currentStep = currentVisual;
          animTimers.current[p.id] = setInterval(() => {
            currentStep = (currentStep + 1) % 40;
            sound.playStep();
            setVisualPositions(prev => ({ ...prev, [p.id]: currentStep }));

            if (currentStep === actualWalkTarget) {
              clearInterval(animTimers.current[p.id]);
              delete animTimers.current[p.id];

              if (isJailFromTile30) {
                // Stopped strictly on tile 30 "Go to Prison"!
                setTimeout(() => {
                  sound.playPrison();
                  setTimeout(() => {
                    setVisualPositions(prev => ({ ...prev, [p.id]: 10 }));
                    setMovingPlayerIds(prev => {
                      const next = new Set(prev);
                      next.delete(p.id);
                      return next;
                    });
                  }, 850);
                }, 220);
                return;
              }

              // Give a smooth 240ms settle delay so the token visibly lands and stops in place before soundboard triggers
              setTimeout(() => {
                setMovingPlayerIds(prev => {
                  const next = new Set(prev);
                  next.delete(p.id);
                  return next;
                });

                // Trigger soundboard memes strictly AFTER stopping and settling
                // 1. Bankrupt?
                if (p.isBankrupt) {
                  sound.playBankrupt();
                  return;
                }

                // 2. Escaped prison on roll?
                if ((p as any).escapedJailFirstRoll) {
                  (p as any).escapedJailFirstRoll = false;
                  (p as any).escapedJail = false;
                  sound.playPrisonEscapeFirstRoll();
                  return;
                }
                if ((p as any).escapedJail) {
                  (p as any).escapedJail = false;
                  sound.playPrisonEscape();
                  return;
                }

                // 3. Stopped directly on Start (Tile 0)?
                if (targetPos === 0) {
                  sound.playLandOnStart();
                  return;
                }

                const landedTile = tiles[targetPos];
                if (!landedTile) {
                  sound.playSelect();
                  return;
                }

                // 4. Taxes
                if (landedTile.type === 'tax') {
                  if (p.cash < 0) {
                    sound.playNegativeBalance();
                  } else {
                    let taxAmt = landedTile.price;
                    if (landedTile.name.toLowerCase().includes('earnings') || targetPos === 4) {
                      taxAmt = p.cash > 0 ? Math.max(10, Math.floor(p.cash * 0.10)) : 0;
                    } else if (landedTile.name.toLowerCase().includes('premium') || targetPos === 38) {
                      taxAmt = 100;
                    }
                    if (taxAmt >= 500) {
                      sound.playBigLoss();
                    } else if (targetPos === 38 || landedTile.name.toLowerCase().includes('premium')) {
                      sound.playPremiumTax();
                    } else {
                      sound.playEarningsTax();
                    }
                  }
                  return;
                }

                // 5. Vacation
                if (landedTile.type === 'vacation') {
                  sound.playVacation();
                  return;
                }

                // 6. Go to Jail
                if (landedTile.type === 'go_to_jail') {
                  sound.playPrison();
                  return;
                }

                // 7. Chance & Chest
                if (landedTile.type === 'chance' || landedTile.type === 'chest') {
                  const latestCard = room.logs?.slice(-3).reverse().find(l => l.type === 'card');
                  if (p.cash < 0) {
                    sound.playNegativeBalance();
                  } else if (latestCard && (latestCard.text.includes('Pay') || latestCard.text.includes('jail') || latestCard.text.includes('loss') || latestCard.text.includes('paid'))) {
                    sound.playBadSurprise();
                  } else {
                    sound.playCash();
                  }
                  return;
                }

                // 8. Properties / Utilities / Railroads
                if (landedTile.type === 'property' || landedTile.type === 'utility' || landedTile.type === 'railroad') {
                  if (landedTile.ownerId && landedTile.ownerId !== p.id && !landedTile.isMortgaged) {
                    const rollTotal = (room.dice?.[0] || 1) + (room.dice?.[1] || 1);
                    const rentAmount = calculateRent(room, landedTile, rollTotal);
                    if (p.cash < 0) {
                      sound.playNegativeBalance();
                    } else if (rentAmount >= 500) {
                      sound.playBigLoss();
                    } else if (rentAmount >= 400) {
                      sound.playBigRentCollect();
                    } else {
                      sound.playRent();
                    }
                  } else if (!landedTile.ownerId) {
                    sound.playSelect();
                  } else {
                    sound.playSelect();
                  }
                  return;
                }

                // Default landing click
                sound.playSelect();
              }, 240);
            }
          }, 110);
        }
      }
    });

    return () => {
      Object.values(animTimers.current).forEach(t => clearInterval(t));
      animTimers.current = {};
    };
  }, [players, tiles, room.dice, room.logs]);

  const playersOnTile: Record<number, Player[]> = {};
  Object.values(players).forEach(p => {
    if (!p.isBankrupt) {
      const pos = visualPositions[p.id] ?? p.position;
      if (!playersOnTile[pos]) playersOnTile[pos] = [];
      playersOnTile[pos].push(p);
    }
  });

  return (
    <div
      className="responsive-board-wrapper relative rounded-2xl p-1 sm:p-1.5 select-none flex flex-col justify-center transition-colors duration-500 border-[1.5px]"
      style={{
        backgroundColor: currentTheme.colors.gridBg,
        borderColor: currentTheme.colors.borderColor || currentTheme.colors.wrapperBorder,
        boxShadow: `0 20px 50px rgba(0,0,0,0.85), 0 0 30px ${currentTheme.colors.accentGlow}`
      }}
    >
      <div
        className="w-full h-full gap-[2px] sm:gap-[2.5px] relative transition-colors duration-500"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.3fr) repeat(9, minmax(0, 1fr)) minmax(0, 2.3fr)',
          gridTemplateRows: 'minmax(0, 1.85fr) repeat(9, minmax(0, 1fr)) minmax(0, 1.85fr)'
        }}
      >
        {tiles.map((tile) => {
          const { row, col, isCorner, cornerType, side } = getGridPosition(tile.index);
          const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;
          const owner = tile.ownerId ? players[tile.ownerId] : null;
          const playersHere = playersOnTile[tile.index] || [];
          const isOwned = Boolean(owner);
          const isHorizontal = side === 'left' || side === 'right';

          // Corner Tiles (Richup Exact Corners)
          if (isCorner) {
            const cornerRadiusClass =
              cornerType === 'start'
                ? 'rounded-tl-xl rounded-tr-[6px] rounded-bl-[6px] rounded-br-[6px]'
                : cornerType === 'jail'
                ? 'rounded-tr-xl rounded-tl-[6px] rounded-bl-[6px] rounded-br-[6px]'
                : cornerType === 'vacation'
                ? 'rounded-br-xl rounded-tl-[6px] rounded-tr-[6px] rounded-bl-[6px]'
                : 'rounded-bl-xl rounded-tl-[6px] rounded-tr-[6px] rounded-br-[6px]';

            return (
              <div
                key={tile.index}
                onClick={() => onTileClick && onTileClick(tile)}
                className={`relative ${cornerRadiusClass} flex min-w-0 min-h-0 flex-col items-center justify-between overflow-hidden cursor-pointer p-1 shadow-inner hover:border-purple-400/60 transition-all select-none border`}
                style={{
                  gridRowStart: row,
                  gridColumnStart: col,
                  backgroundColor: currentTheme.colors.cornerBg,
                  borderColor: currentTheme.colors.borderColor
                }}
              >
                {/* 0: START */}
                {cornerType === 'start' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center">
                    <span
                      className="font-black tracking-wider text-[#a3e635] font-heading drop-shadow-[0_2px_10px_rgba(163,230,53,0.8)] leading-none"
                      style={{ fontSize: 'clamp(15px, 2.4cqi, 30px)' }}
                    >
                      START
                    </span>
                    <div className="flex items-center justify-center gap-0.5 mt-1 text-[#a3e635]">
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 'clamp(20px, 3.4cqi, 38px)', height: 'clamp(20px, 3.4cqi, 38px)' }}>
                        <polygon points="4 4 12 12 4 20 4 4" />
                        <polygon points="12 4 20 12 12 20 12 4" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 10: PASSING BY / IN PRISON (Mornaguia Prison) */}
                {cornerType === 'jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-start gap-0.5 pt-0.5 px-0.5 pb-1 text-center relative">
                    <div className="flex flex-col items-center z-10 flex-shrink-0">
                      <span
                        className="font-black text-gray-300 uppercase tracking-tight leading-none pt-0.5"
                        style={{ fontSize: 'clamp(9.5px, 1.35cqi, 13.5px)' }}
                      >
                        Passing by
                      </span>
                      {/* Passing by tokens */}
                      {playersHere.filter(p => !p.inJail).length > 0 && (
                        <div className="flex items-center justify-center -space-x-2 mt-0.5 z-20">
                          {playersHere.filter(p => !p.inJail).map(p => renderPlayerToken(p, true))}
                        </div>
                      )}
                    </div>

                    <div className="w-[94%] flex-1 min-h-[58%] rounded-md border border-purple-400/60 shadow-inner relative overflow-hidden flex flex-col items-center justify-center pb-0.5">
                      {/* Real Mornaguia Civil Prison Photo */}
                      <img
                        src={mornaguiaJailImg}
                        alt="Mornaguia Prison"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.72] contrast-[1.1]"
                      />
                      {/* Dark gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60" />
                      {/* Prison Bars Overlay */}
                      <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,#cbd5e1_4px,#cbd5e1_6px)]" />

                      <div className="flex flex-col items-center justify-center z-10 text-center my-auto pb-0.5">
                        <span
                          className="font-black text-amber-200 uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wide"
                          style={{ fontSize: 'clamp(11.5px, 1.6cqi, 16.5px)' }}
                        >
                          In Prison
                        </span>
                        <span
                          className="text-[8.5px] sm:text-[10px] font-extrabold text-white/95 drop-shadow mt-1 tracking-tight font-sans leading-none"
                        >
                          المرناقية
                        </span>
                      </div>

                      {/* In Prison tokens */}
                      {playersHere.filter(p => p.inJail).length > 0 && (
                        <div className="absolute bottom-1 inset-x-0 flex items-center justify-center -space-x-2 z-20 pointer-events-none">
                          {playersHere.filter(p => p.inJail).map(p => renderPlayerToken(p, true))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 20: VACATION */}
                {cornerType === 'vacation' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center gap-0.5">
                    <div
                      className="rounded-xl overflow-hidden border-[1.5px] border-emerald-400/80 shadow-[0_2px_12px_rgba(16,185,129,0.5)] flex items-center justify-center bg-black/60 flex-shrink-0 relative"
                      style={{ width: 'clamp(58px, 9cqi, 96px)', height: 'clamp(42px, 6.4cqi, 68px)' }}
                    >
                      <img
                        src={vacationImg}
                        alt="Vacation Island"
                        className="w-full h-full object-cover brightness-105"
                      />
                      <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />
                    </div>
                    <span
                      className="font-black text-white uppercase tracking-wider font-heading leading-tight mt-0.5"
                      style={{ fontSize: 'clamp(11px, 1.55cqi, 17px)' }}
                    >
                      Vacation
                    </span>
                    <span
                      className="font-semibold text-emerald-300 leading-none font-mono"
                      style={{ fontSize: 'clamp(8.5px, 1.25cqi, 12.5px)' }}
                    >
                      $150 or doubles
                    </span>
                  </div>
                )}

                {/* 30: GO TO PRISON */}
                {cornerType === 'go_to_jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center gap-1">
                    <div
                      className="rounded-xl overflow-hidden border-[1.5px] border-red-500/80 shadow-[0_2px_12px_rgba(239,68,68,0.5)] flex items-center justify-center bg-black/60 flex-shrink-0 relative"
                      style={{ width: 'clamp(58px, 9cqi, 96px)', height: 'clamp(42px, 6.4cqi, 68px)' }}
                    >
                      <img
                        src={mornaguiaJailImg}
                        alt="Mornaguia Prison"
                        className="w-full h-full object-cover brightness-95"
                      />
                      <div className="absolute inset-0 bg-red-950/15 pointer-events-none" />
                    </div>
                    <span
                      className="font-black text-white uppercase font-heading leading-tight tracking-wider"
                      style={{ fontSize: 'clamp(11px, 1.55cqi, 17px)' }}
                    >
                      Go to prison
                    </span>
                  </div>
                )}

                {/* Player Tokens On Corner (Non-Jail) */}
                {cornerType !== 'jail' && playersHere.length > 0 && (
                  <div className="absolute bottom-1 inset-x-0 flex items-center justify-center -space-x-2 z-20 pointer-events-none">
                    {playersHere.map((p) => renderPlayerToken(p, true))}
                  </div>
                )}
              </div>
            );
          }

          // Edge Tiles (Top, Right, Bottom, Left)
          // 1. Outer Edge: Solid Owner Colored Bar with Miniature 3D Houses/Hotel OR Translucent Price Pill
          const renderOuterEdge = () => {
            const isHorizontal = side === 'top' || side === 'bottom';
            const fixedSlotClass = isHorizontal
              ? 'h-4 sm:h-[18px] w-full flex items-center justify-center flex-shrink-0 z-20'
              : 'w-[26px] sm:w-[30px] h-full flex items-center justify-center flex-shrink-0 z-20';

            if (isOwned && owner) {
              const hasBuildings = tile.houses > 0;
              return (
                <div
                  className={`flex-shrink-0 flex items-center justify-center z-15 relative overflow-visible ${
                    side === 'top'
                      ? hasBuildings ? 'w-full h-3.5 sm:h-4 rounded-t-[6px]' : 'w-full h-2.5 sm:h-3 rounded-t-[6px]'
                      : side === 'bottom'
                      ? hasBuildings ? 'w-full h-3.5 sm:h-4 rounded-b-[6px]' : 'w-full h-2.5 sm:h-3 rounded-b-[6px]'
                      : side === 'left'
                      ? hasBuildings ? 'h-full w-3.5 sm:w-4 rounded-l-[6px]' : 'h-full w-2.5 sm:w-3 rounded-l-[6px]'
                      : hasBuildings ? 'h-full w-3.5 sm:w-4 rounded-r-[6px]' : 'h-full w-2.5 sm:w-3 rounded-r-[6px]'
                  }`}
                  style={{ backgroundColor: owner.color }}
                >
                  {/* Miniature 3D Houses or Hotel (Actual models, not green dots) */}
                  {tile.houses > 0 && (
                    <div className={`flex items-center justify-center gap-0.5 ${isHorizontal ? 'flex-col' : 'flex-row'}`}>
                      {tile.houses < 5 ? (
                        Array.from({ length: tile.houses }).map((_, h) => (
                          <HouseIcon key={h} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        ))
                      ) : (
                        <HotelIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Tax spaces: Bank (19%) or Poste (no price badge, cannot be owned)
            if (tile.type === 'tax') {
              const isBank = tile.index === 4 || tile.name.toLowerCase().includes('bank') || tile.name.toLowerCase().includes('earnings');
              if (isBank) {
                return (
                  <div className={fixedSlotClass}>
                    <div
                      className="px-1 py-0.5 rounded bg-amber-500/30 border border-amber-400/40 text-amber-300 font-mono font-bold leading-none whitespace-nowrap shadow-sm"
                      style={{ fontSize: 'clamp(8px, 1.1cqi, 10.5px)' }}
                    >
                      %19
                    </div>
                  </div>
                );
              }
              // Poste has NO $100 price badge so players don't think it can be bought
              return <div className={fixedSlotClass} />;
            }

            // Unowned purchasable property: translucent compact price badge
            if (tile.price > 0 && (tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility')) {
              return (
                <div className={fixedSlotClass}>
                  <div
                    className="px-1 py-0.5 rounded bg-white/20 text-white font-mono font-bold leading-none shadow-sm whitespace-nowrap"
                    style={{ fontSize: 'clamp(8px, 1.1cqi, 10.5px)' }}
                  >
                    ${tile.price}
                  </div>
                </div>
              );
            }

            // Places that cannot be owned and have no badge (Treasure, Surprise): reserve exact same fixed slot so all names line up!
            return <div className={fixedSlotClass} />;
          };

          // 2. Circular Flag or Special Space Icon (Inner Edge: sits half in tile, half in center gameboard)
          const renderInnerIcon = () => {
            const iconSizeStyle = {
              width: 'clamp(23px, 3.2cqi, 34px)',
              height: 'clamp(23px, 3.2cqi, 34px)'
            };

            return (
              <div className="flex items-center justify-center flex-shrink-0 z-20">
                {tile.countryCode && tile.type === 'property' ? (
                  <div
                    className="rounded-full overflow-hidden border-[1.5px] border-white/90 shadow-md flex items-center justify-center bg-black/40 flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/flags/${tile.countryCode}.png`}
                      alt={tile.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://flagcdn.com/w40/${tile.countryCode}.png`;
                      }}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      style={
                        tile.countryCode === 'cn'
                          ? { objectPosition: '0% 0%', transform: 'scale(1.4) translate(10%, 10%)' }
                          : tile.countryCode === 'us'
                          ? { objectPosition: '10% 20%', transform: 'scale(1.2)' }
                          : { transform: 'scale(1.15)' }
                      }
                    />
                  </div>
                ) : tile.type === 'railroad' ? (
                  (() => {
                    let airportLogo = null;
                    const uName = tile.name.toUpperCase();
                    if (tile.index === 5 || uName.includes('TUNIS') || uName.includes('CARTHAGE') || uName.includes('MAD')) {
                      airportLogo = tunisairLogo;
                    } else if (tile.index === 15 || uName.includes('QATAR') || uName.includes('MUC')) {
                      airportLogo = qatarLogo;
                    } else if (tile.index === 25 || uName.includes('NOUVELAIR') || uName.includes('CDG')) {
                      airportLogo = nouvelairLogo;
                    } else if (tile.index === 35 || uName.includes('EMIRATES') || uName.includes('JFK')) {
                      airportLogo = emiratesLogo;
                    }

                    return (
                      <div
                        className="rounded-full overflow-hidden border-[1.5px] border-white/90 shadow-md flex items-center justify-center flex-shrink-0 bg-white"
                        style={iconSizeStyle}
                      >
                        {airportLogo ? (
                          <img
                            src={airportLogo}
                            alt={tile.name}
                            className="w-full h-full object-cover select-none pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                            <Plane className="w-[60%] h-[60%] text-sky-200" />
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : tile.type === 'utility' ? (
                  <div
                    className="rounded-full overflow-hidden border-[1.5px] border-white/90 shadow-md flex items-center justify-center flex-shrink-0 bg-white p-0.5"
                    style={iconSizeStyle}
                  >
                    {tile.name.toUpperCase().includes('POWER') || tile.name.toUpperCase().includes('STEG') ? (
                      <img
                        src={stegLogo}
                        alt="STEG"
                        className="w-full h-full object-contain select-none pointer-events-none"
                      />
                    ) : (
                      <img
                        src={sonedeLogo}
                        alt="SONEDE"
                        className="w-full h-full object-contain select-none pointer-events-none"
                      />
                    )}
                  </div>
                ) : tile.type === 'chest' ? (
                  <div
                    className="rounded-full bg-amber-950/80 border-[1.5px] border-amber-500/80 shadow flex items-center justify-center font-bold text-amber-300 flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    🎁
                  </div>
                ) : tile.type === 'chance' ? (
                  <div
                    className="rounded-full bg-pink-950/80 border-[1.5px] border-pink-500/80 shadow flex items-center justify-center font-black text-pink-300 flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    ?
                  </div>
                ) : tile.type === 'tax' ? (
                  <div
                    className="rounded-full overflow-hidden border-[1.5px] border-white/90 shadow-md flex items-center justify-center flex-shrink-0 bg-white"
                    style={iconSizeStyle}
                  >
                    {tile.index === 38 || tile.name.toLowerCase().includes('poste') || tile.name.toLowerCase().includes('premium') ? (
                      <img
                        src={posteLogo}
                        alt="Poste"
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    ) : (
                      <img
                        src={bankLogo}
                        alt="Bank"
                        className="w-full h-full object-contain select-none pointer-events-none p-0.5"
                      />
                    )}
                  </div>
                ) : tile.flag ? (
                  <span style={{ fontSize: 'clamp(18px, 2.6cqi, 30px)' }}>{tile.flag}</span>
                ) : null}
              </div>
            );
          };

          // 3. Title / City Name (High-visibility, prominent font scaling & crisp outline shadow)
          const renderNameLabel = () => {
            // Split name into logical words preserving hyphens so words never break mid-word
            const words = tile.name.includes('-')
              ? tile.name.split('-').map((w, idx, arr) => (idx < arr.length - 1 ? `${w}-` : w))
              : tile.name.split(' ');

            const isTopOrBottom = side === 'top' || side === 'bottom';
            const longestWordLen = Math.max(...words.map(w => w.length));

            let fontSize: string;
            let letterSpacing: string;

            if (isTopOrBottom) {
              if (longestWordLen >= 9) {
                // Barcelona (9), Nouvelair (9)
                fontSize = 'clamp(9px, 1.25cqi, 11px)';
                letterSpacing = '-0.035em';
              } else if (longestWordLen >= 7) {
                // Salvador (8), Surprise (8), Carthage (8), Toulouse (8), Shenzhen (8), Shanghai (8), Beijing (7), Seville (7)
                fontSize = 'clamp(10px, 1.4cqi, 12px)';
                letterSpacing = '-0.025em';
              } else {
                // Paris (5), Lyon (4), Rio (3), Bank (4), Madrid (6), SONEDE (6)
                fontSize = 'clamp(11px, 1.6cqi, 13.5px)';
                letterSpacing = '-0.015em';
              }
            } else {
              // Left/Right tiles (much wider 2.3fr space)
              if (longestWordLen >= 10) {
                // Manchester (10)
                fontSize = 'clamp(10.5px, 1.45cqi, 13px)';
                letterSpacing = '-0.025em';
              } else if (longestWordLen >= 9) {
                // Liverpool (9), Francisco (9), Frankfurt (9)
                fontSize = 'clamp(11px, 1.55cqi, 13.5px)';
                letterSpacing = '-0.02em';
              } else if (longestWordLen >= 7) {
                // Surprise (8), Treasure (8), Emirates (8), Airways (7)
                fontSize = 'clamp(11.5px, 1.65cqi, 14px)';
                letterSpacing = '-0.015em';
              } else {
                // London (6), Venice (6), Munich (6), Berlin (6), Milan (5), Rome (4), Poste (5), STEG (4), New (3), York (4)
                fontSize = 'clamp(12px, 1.8cqi, 15px)';
                letterSpacing = '-0.01em';
              }
            }

            return (
              <div className="flex-1 min-w-0 min-h-0 flex flex-col items-center justify-center text-center z-10 px-0.5 overflow-visible">
                <span
                  className="font-sans font-black text-white select-none text-center leading-[1.08] w-full flex flex-col items-center justify-center"
                  style={{
                    fontSize,
                    textRendering: 'optimizeLegibility',
                    letterSpacing,
                    lineHeight: 1.08,
                    textShadow: '0 1px 3px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.95), 0 0 1px rgba(0,0,0,1)'
                  }}
                  title={tile.name}
                >
                  {words.map((word, idx) => (
                    <span key={idx} className="block whitespace-nowrap leading-[1.08] max-w-full text-center">
                      {word}
                    </span>
                  ))}
                </span>
              </div>
            );
          };

          // Helper to position circular flags & special icons half inside the gameboard and half inside the tile
          const getInnerIconPositionClass = () => {
            if (side === 'right') return 'absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none';
            if (side === 'left') return 'absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none';
            if (side === 'top') return 'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 pointer-events-none';
            return 'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none';
          };

          return (
            <div
              key={tile.index}
              onClick={() => onTileClick && onTileClick(tile)}
              className="relative rounded-[7px] flex min-w-0 min-h-0 overflow-visible cursor-pointer transition-all duration-150 select-none border hover:border-purple-400/60 shadow-sm"
              style={{
                gridRowStart: row,
                gridColumnStart: col,
                backgroundColor: currentTheme.colors.tileBg,
                borderColor: currentTheme.colors.borderColor,
                ...(isOwned && owner
                  ? {
                      boxShadow: `inset 0 0 25px 2px ${owner.color}35`,
                      borderColor: `${owner.color}60`
                    }
                  : {})
              }}
            >
              {side === 'left' ? (
                /* Left Column: Outer edge (price/owner) on left, inner edge (flag) on right border half in/half out */
                <div className="w-full h-full flex flex-row items-center justify-between pl-1 pr-[17px] sm:pr-[18px] py-0.5 z-10 gap-1 relative overflow-visible">
                  {renderOuterEdge()}
                  {renderNameLabel()}
                  <div className={getInnerIconPositionClass()}>
                    {renderInnerIcon()}
                  </div>
                </div>
              ) : side === 'right' ? (
                /* Right Column: Inner edge (flag) on left border half in/half out, outer edge (price/owner) on right */
                <div className="w-full h-full flex flex-row items-center justify-between pl-[17px] sm:pl-[18px] pr-1 py-0.5 z-10 gap-1 relative overflow-visible">
                  <div className={getInnerIconPositionClass()}>
                    {renderInnerIcon()}
                  </div>
                  {renderNameLabel()}
                  {renderOuterEdge()}
                </div>
              ) : side === 'top' ? (
                /* Top Row: Outer edge (price/owner) at top, inner edge (flag) at bottom border half in/half out */
                <div className="w-full h-full flex flex-col items-center justify-between pt-0.5 pb-[17px] sm:pb-[18px] px-0.5 z-10 relative overflow-visible">
                  {renderOuterEdge()}
                  {renderNameLabel()}
                  <div className={getInnerIconPositionClass()}>
                    {renderInnerIcon()}
                  </div>
                </div>
              ) : (
                /* Bottom Row: Inner edge (flag) at top border half in/half out, outer edge (price/owner) at bottom */
                <div className="w-full h-full flex flex-col items-center justify-between pt-[17px] sm:pt-[18px] pb-0.5 px-0.5 z-10 relative overflow-visible">
                  <div className={getInnerIconPositionClass()}>
                    {renderInnerIcon()}
                  </div>
                  {renderNameLabel()}
                  {renderOuterEdge()}
                </div>
              )}

              {/* Mortgaged Overlay */}
              {tile.isMortgaged && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] flex items-center justify-center z-25">
                  <span className="text-[7.5px] sm:text-[9px] font-black text-red-400 uppercase -rotate-12 border border-red-500/80 px-1 py-0.5 rounded bg-red-950/90 shadow">
                    MORTGAGED
                  </span>
                </div>
              )}

              {/* Player Tokens On Tile (Non-bouncing, prominent with "YOU" badge and clean spacing) */}
              {playersHere.length > 0 && (
                <div
                  className={`absolute z-30 pointer-events-none flex items-center justify-center ${
                    side === 'top'
                      ? 'bottom-1 inset-x-0 flex-row -space-x-2'
                      : side === 'bottom'
                      ? 'top-1 inset-x-0 flex-row -space-x-2'
                      : side === 'left'
                      ? 'right-1 inset-y-0 flex-col -space-y-2'
                      : 'left-1 inset-y-0 flex-col -space-y-2'
                  }`}
                >
                  {playersHere.map((p) => renderPlayerToken(p, false))}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Board Stage */}
        <div
          className="col-start-2 col-end-11 row-start-2 row-end-11 rounded-xl flex flex-col items-center justify-center p-1.5 sm:p-2 pb-6 sm:pb-7 relative overflow-hidden shadow-inner transition-colors duration-500"
          style={{ backgroundColor: currentTheme.colors.centerBg }}
        >
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pb-2">
            {typeof centerContent === 'function' ? centerContent({ isPieceMoving }) : centerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
