import React, { useState, useEffect, useRef } from 'react';
import { Tile, Player, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Plane, Zap, Droplets, HelpCircle, Gift, AlertTriangle, Shield, Palmtree, ArrowRight, Skull, Gem, Percent, ShoppingCart, Check } from 'lucide-react';
import { sound } from '../services/sound';
import { PlayerAvatar } from './PlayerAvatar';
import stegLogo from '../assets/steg.png';
import sonedeLogo from '../assets/sonede.svg';
import tunisairLogo from '../assets/tunisair.svg';
import qatarLogo from '../assets/qatarairways.svg';
import nouvelairLogo from '../assets/nouvelair.svg';
import emiratesLogo from '../assets/emirates.svg';
import mornaguiaJailImg from '../assets/mornaguia_jail.png';

interface BoardProps {
  room: GameRoom;
  currentPlayerId?: string;
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

export const Board: React.FC<BoardProps> = ({ room, currentPlayerId, onTileClick, centerContent }) => {
  const { tiles, players } = room;

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

        {/* Clear "YOU" indicator so player never loses their icon */}
        {isMe && (
          <span className="absolute -top-2.5 px-1 py-0.2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-[7.5px] sm:text-[8.5px] rounded-full shadow-lg border border-white tracking-wider leading-none z-40 pointer-events-none">
            YOU
          </span>
        )}

        {/* Large, stable avatar (no bounce) */}
        <PlayerAvatar avatar={p.isBot ? 'navy' : p.avatar} color={p.color} size={size} />
      </div>
    );
  };

  useEffect(() => {
    Object.values(players).forEach(p => {
      const currentVisual = visualPositions[p.id] ?? p.position;
      const targetPos = p.position;

      if (currentVisual !== targetPos) {
        // Direct teleportation to jail
        if (p.inJail && targetPos === 10) {
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
          sound.playMemePrison();
          return;
        }

        if (!animTimers.current[p.id]) {
          setMovingPlayerIds(prev => new Set(prev).add(p.id));
          let currentStep = currentVisual;
          animTimers.current[p.id] = setInterval(() => {
            currentStep = (currentStep + 1) % 40;
            sound.playStep();
            setVisualPositions(prev => ({ ...prev, [p.id]: currentStep }));

            if (currentStep === targetPos) {
              clearInterval(animTimers.current[p.id]);
              delete animTimers.current[p.id];
              setMovingPlayerIds(prev => {
                const next = new Set(prev);
                next.delete(p.id);
                return next;
              });

              // Trigger soundboard memes strictly upon landing in position!
              if (p.isBankrupt) {
                sound.playBankrupt();
              } else if (targetPos === 0) {
                // Stopped directly on Start (Tile 0), not just passing by
                sound.playLandOnStart();
              } else {
                const landedTile = tiles[targetPos];
                if (landedTile) {
                  if (landedTile.type === 'tax') {
                    if (targetPos === 38 || landedTile.name.toLowerCase().includes('premium')) {
                      sound.playPremiumTax();
                    } else {
                      sound.playEarningsTax();
                    }
                  } else if (landedTile.type === 'go_to_jail') {
                    sound.playPrison();
                  } else if (landedTile.type === 'chance') {
                    // Chance card drawn - sound triggered upon drawing
                  } else if (landedTile.type === 'chest') {
                    sound.playCash();
                  } else if (landedTile.type === 'railroad') {
                    sound.playTurnChime();
                  } else if (landedTile.type === 'vacation') {
                    sound.playVacation();
                  } else if (landedTile.type === 'property' || landedTile.type === 'utility') {
                    if (landedTile.ownerId && landedTile.ownerId !== p.id && !landedTile.isMortgaged) {
                      sound.playRent();
                    } else {
                      sound.playSelect();
                    }
                  } else {
                    sound.playSelect();
                  }
                } else {
                  sound.playSelect();
                }
              }
            }
          }, 110);
        }
      }
    });

    return () => {
      Object.values(animTimers.current).forEach(t => clearInterval(t));
      animTimers.current = {};
    };
  }, [players, tiles]);

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
      className="responsive-board-wrapper max-h-full relative bg-[#171328] rounded-2xl p-1 sm:p-1.5 md:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-[#261f3e] select-none flex flex-col justify-center m-auto"
    >
      <div
        className="w-full h-full gap-[2px] sm:gap-[3px] bg-[#110d1f] rounded-xl p-0.5 sm:p-1 relative"
        style={{
          display: 'grid',
          gridTemplateColumns: '2.15fr repeat(9, 1fr) 2.15fr',
          gridTemplateRows: '1.75fr repeat(9, 1fr) 1.75fr'
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
            return (
              <div
                key={tile.index}
                onClick={() => onTileClick && onTileClick(tile)}
                className="relative rounded-lg flex flex-col items-center justify-between overflow-hidden cursor-pointer bg-[#262a4c] border border-purple-900/40 p-1 shadow-inner hover:border-purple-400/60 transition-all select-none"
                style={{ gridRowStart: row, gridColumnStart: col }}
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
                        style={{ fontSize: 'clamp(8.5px, 1.2cqi, 12px)' }}
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

                      <div className="flex flex-col items-center z-10 -translate-y-2.5">
                        <span
                          className="font-black text-amber-200 uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wide"
                          style={{ fontSize: 'clamp(9.5px, 1.35cqi, 13.5px)' }}
                        >
                          In Prison
                        </span>
                        <span
                          className="text-[7.5px] sm:text-[8.5px] font-bold text-white/95 drop-shadow mt-0.5 tracking-tight font-sans leading-none"
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
                    <div style={{ fontSize: 'clamp(20px, 3.6cqi, 42px)' }}>
                      🏝️
                    </div>
                    <span
                      className="font-black text-white uppercase tracking-wider font-heading leading-tight"
                      style={{ fontSize: 'clamp(11px, 1.6cqi, 18px)' }}
                    >
                      Vacation
                    </span>
                    <span
                      className="font-semibold text-emerald-300 leading-none mt-0.5 font-mono"
                      style={{ fontSize: 'clamp(9.5px, 1.35cqi, 14px)' }}
                    >
                      ${room.pot || 0} on hold
                    </span>
                  </div>
                )}

                {/* 30: GO TO PRISON */}
                {cornerType === 'go_to_jail' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center gap-1">
                    <div
                      className="rounded-full overflow-hidden border-[1.5px] border-red-500/80 shadow-[0_2px_8px_rgba(239,68,68,0.5)] flex items-center justify-center bg-black/60 flex-shrink-0 relative"
                      style={{ width: 'clamp(28px, 4.2cqi, 46px)', height: 'clamp(28px, 4.2cqi, 46px)' }}
                    >
                      <img
                        src={mornaguiaJailImg}
                        alt="Mornaguia Prison"
                        className="w-full h-full object-cover brightness-95"
                      />
                      <div className="absolute inset-0 bg-red-950/20" />
                    </div>
                    <span
                      className="font-black text-white uppercase font-heading leading-tight tracking-wider"
                      style={{ fontSize: 'clamp(9.5px, 1.35cqi, 15px)' }}
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
          // 1. Outer Edge: Solid Owner Colored Bar OR Translucent Price Pill
          const renderOuterEdge = () => {
            if (isOwned && owner) {
              return (
                <div
                  className={`flex-shrink-0 flex items-center justify-center z-15 relative ${
                    side === 'top'
                      ? 'w-full h-2.5 sm:h-3 rounded-t-[6px]'
                      : side === 'bottom'
                      ? 'w-full h-2.5 sm:h-3 rounded-b-[6px]'
                      : side === 'left'
                      ? 'h-full w-2.5 sm:w-3 rounded-l-[6px]'
                      : 'h-full w-2.5 sm:w-3 rounded-r-[6px]'
                  }`}
                  style={{ backgroundColor: owner.color }}
                >
                  {/* House Cubes (sitting right on the owner bar) */}
                  {tile.houses > 0 && (
                    <div className="flex items-center gap-0.5">
                      {tile.houses < 5 ? (
                        Array.from({ length: tile.houses }).map((_, h) => (
                          <div key={h} className="w-1.5 h-1.5 bg-emerald-300 rounded-[1px] shadow-sm border border-emerald-900" />
                        ))
                      ) : (
                        <div className="w-2.5 h-2 bg-red-500 rounded-[1px] shadow border border-red-900 text-[6px] font-black text-white flex items-center justify-center">
                          H
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Unowned: Translucent price badge
            if (tile.price > 0) {
              return (
                <div className="flex items-center justify-center flex-shrink-0 z-20 py-0.5">
                  <div
                    className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono font-bold leading-none shadow-sm"
                    style={{ fontSize: isHorizontal ? 'clamp(9px, 1.25cqi, 12px)' : 'clamp(8.5px, 1.15cqi, 11.5px)' }}
                  >
                    {tile.price} $
                  </div>
                </div>
              );
            }

            if (tile.type === 'tax') {
              return (
                <div className="flex items-center justify-center flex-shrink-0 z-20 py-0.5">
                  <div
                    className="px-1.5 py-0.5 rounded bg-amber-500/30 border border-amber-400/40 text-amber-300 font-mono font-bold leading-none"
                    style={{ fontSize: isHorizontal ? 'clamp(9px, 1.25cqi, 12px)' : 'clamp(8.5px, 1.15cqi, 11.5px)' }}
                  >
                    {tile.name.includes('Earnings') ? '%10' : '$75'}
                  </div>
                </div>
              );
            }

            return <div className="h-2 flex-shrink-0" />;
          };

          // 2. Circular Flag or Special Space Icon (Inner Edge)
          const renderInnerIcon = () => {
            const iconSizeStyle = {
              width: isHorizontal ? 'clamp(18px, 2.4cqi, 26px)' : 'clamp(17px, 2.2cqi, 25px)',
              height: isHorizontal ? 'clamp(18px, 2.4cqi, 26px)' : 'clamp(17px, 2.2cqi, 25px)'
            };

            return (
              <div className="flex items-center justify-center flex-shrink-0 z-10 p-0.5">
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
                    className="rounded-full bg-amber-950/80 border-[1.5px] border-amber-400/70 shadow flex items-center justify-center flex-shrink-0"
                    style={iconSizeStyle}
                  >
                    {tile.name.includes('Earnings') ? (
                      <Percent className="w-[58%] h-[58%] text-amber-300" />
                    ) : (
                      <Gem className="w-[58%] h-[58%] text-sky-300" />
                    )}
                  </div>
                ) : tile.flag ? (
                  <span style={{ fontSize: 'clamp(16px, 2.4cqi, 28px)' }}>{tile.flag}</span>
                ) : null}
              </div>
            );
          };

          // 3. Title / City Name (Never breaks mid-word, full words intact, clean typography)
          const renderNameLabel = () => {
            // Split name into logical words preserving hyphens so words never break mid-word
            const words = tile.name.includes('-')
              ? tile.name.split('-').map((w, idx, arr) => (idx < arr.length - 1 ? `${w}-` : w))
              : tile.name.split(' ');

            const maxWordLen = Math.max(...words.map(w => w.length));

            // Dynamic font size clamp based on orientation and word length
            const fontSize = isHorizontal
              ? maxWordLen >= 10
                ? 'clamp(9.5px, 1.25cqi, 12px)'
                : maxWordLen >= 8
                ? 'clamp(10.5px, 1.35cqi, 13px)'
                : 'clamp(11.5px, 1.5cqi, 14.5px)'
              : maxWordLen >= 9
                ? 'clamp(8.5px, 1.12cqi, 11px)'
                : maxWordLen >= 7
                ? 'clamp(9.5px, 1.25cqi, 12px)'
                : 'clamp(10.5px, 1.38cqi, 13px)';

            return (
              <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center text-center z-10 px-0.5 w-full overflow-hidden">
                <span
                  className="font-sans font-extrabold text-white select-none text-center leading-[1.12] tracking-tight max-w-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
                  style={{
                    fontSize,
                    textRendering: 'optimizeLegibility',
                    wordBreak: 'keep-all',
                    overflowWrap: 'normal',
                    hyphens: 'none',
                    letterSpacing: maxWordLen >= 8 ? '-0.025em' : 'normal'
                  }}
                  title={tile.name}
                >
                  {words.map((word, idx) => (
                    <React.Fragment key={idx}>
                      <span className="inline-block whitespace-nowrap">{word}</span>
                      {idx < words.length - 1 && ' '}
                    </React.Fragment>
                  ))}
                </span>
              </div>
            );
          };

          return (
            <div
              key={tile.index}
              onClick={() => onTileClick && onTileClick(tile)}
              className="relative rounded-[7px] flex overflow-hidden cursor-pointer transition-all duration-150 select-none bg-[#262a4c] border border-purple-900/40 hover:border-purple-400/60 shadow-sm"
              style={{
                gridRowStart: row,
                gridColumnStart: col,
                ...(isOwned && owner
                  ? {
                      boxShadow: `inset 0 0 25px 2px ${owner.color}35`,
                      borderColor: `${owner.color}60`
                    }
                  : {})
              }}
            >
              {side === 'left' ? (
                /* Left Column: Outer edge (price/owner) on left, inner edge (flag) on right */
                <div className="w-full h-full flex flex-row items-center justify-between px-1 py-0.5 z-10">
                  {renderOuterEdge()}
                  {renderNameLabel()}
                  {renderInnerIcon()}
                </div>
              ) : side === 'right' ? (
                /* Right Column: Inner edge (flag) on left, outer edge (price/owner) on right */
                <div className="w-full h-full flex flex-row items-center justify-between px-1 py-0.5 z-10">
                  {renderInnerIcon()}
                  {renderNameLabel()}
                  {renderOuterEdge()}
                </div>
              ) : side === 'top' ? (
                /* Top Row: Outer edge (price/owner) at top, inner edge (flag) at bottom */
                <div className="w-full h-full flex flex-col items-center justify-between py-1 px-0.5 z-10">
                  {renderOuterEdge()}
                  {renderNameLabel()}
                  {renderInnerIcon()}
                </div>
              ) : (
                /* Bottom Row: Inner edge (flag) at top, outer edge (price/owner) at bottom */
                <div className="w-full h-full flex flex-col items-center justify-between py-1 px-0.5 z-10">
                  {renderInnerIcon()}
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
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-[#130f1d] rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-inner">
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {typeof centerContent === 'function' ? centerContent({ isPieceMoving }) : centerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
