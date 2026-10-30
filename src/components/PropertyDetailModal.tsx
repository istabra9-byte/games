import React from 'react';
import { Tile, GameRoom } from '../types/game';
import { PROPERTY_GROUPS } from '../data/boardTiles';
import { Home, X, DollarSign, AlertCircle, Sparkles, Building2, CheckCircle2, HelpCircle, Gift } from 'lucide-react';
import { HouseIcon, HotelIcon } from './HouseIcons';
import stegLogo from '../assets/steg.png';
import sonedeLogo from '../assets/sonede.svg';
import tunisairLogo from '../assets/tunisair.svg';
import qatarLogo from '../assets/qatarairways.svg';
import nouvelairLogo from '../assets/nouvelair.svg';
import emiratesLogo from '../assets/emirates.svg';
import mornaguiaJailImg from '../assets/mornaguia_jail.png';
import posteLogo from '../assets/poste.png';
import bankLogo from '../assets/bank.png';

interface PropertyDetailModalProps {
  tile: Tile | null;
  room: GameRoom;
  currentPlayerId: string;
  onClose: () => void;
  onBuildHouse: (tileIndex: number) => void;
  onSellHouse: (tileIndex: number) => void;
  onMortgage: (tileIndex: number) => void;
  onUnmortgage: (tileIndex: number) => void;
  onSellProperty: (tileIndex: number) => void;
  onBuyProperty?: (tileIndex: number) => void;
  onSkipProperty?: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  tile,
  room,
  currentPlayerId,
  onClose,
  onBuildHouse,
  onSellHouse,
  onMortgage,
  onUnmortgage,
  onSellProperty,
  onBuyProperty,
  onSkipProperty
}) => {
  if (!tile) return null;

  const isOwner = tile.ownerId === currentPlayerId;
  const owner = tile.ownerId ? room.players[tile.ownerId] : null;
  const groupMeta = tile.group ? PROPERTY_GROUPS[tile.group] : null;
  const myPlayer = room.players[currentPlayerId];

  // Group / Monopoly Calculations
  const groupTiles = tile.group ? room.tiles.filter(t => t.group === tile.group) : [];
  const ownedInGroup = groupTiles.filter(t => t.ownerId === tile.ownerId).length;
  const hasMonopoly = groupTiles.length > 0 && groupTiles.every(t => t.ownerId === tile.ownerId);
  const myPlayerOwnsMonopoly = groupTiles.length > 0 && groupTiles.every(t => t.ownerId === currentPlayerId);

  // Even Building Checks
  const minHousesInGroup = groupTiles.length > 0 ? Math.min(...groupTiles.map(t => t.houses)) : 0;
  const maxHousesInGroup = groupTiles.length > 0 ? Math.max(...groupTiles.map(t => t.houses)) : 0;
  const isEvenBuildAllowed = tile.houses === minHousesInGroup;
  const isEvenSellAllowed = tile.houses === maxHousesInGroup;

  const hasMortgagedInGroup = groupTiles.some(t => t.isMortgaged);
  const hasHousesInGroup = groupTiles.some(t => t.houses > 0);

  const canBuildHouse = isOwner && myPlayerOwnsMonopoly && tile.houses < 5 && !tile.isMortgaged && !hasMortgagedInGroup && isEvenBuildAllowed && myPlayer && myPlayer.cash >= (tile.houseCost || 0);
  const canSellHouse = isOwner && tile.houses > 0 && isEvenSellAllowed;
  const canMortgage = isOwner && !tile.isMortgaged && !hasHousesInGroup;
  const canUnmortgage = isOwner && tile.isMortgaged && myPlayer && myPlayer.cash >= Math.floor(tile.mortgageValue * 1.1);

  const isCurrentTurnPlayer = room.playerOrder[room.currentTurnPlayerIndex] === currentPlayerId;
  const isLandedHere = myPlayer && myPlayer.position === tile.index;
  const isBuyableType = tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility';
  const canBuyNow = !tile.ownerId && isCurrentTurnPlayer && isLandedHere && room.turnPhase === 'action' && myPlayer.cash >= tile.price && isBuyableType;

  const sellToBankPrice = tile.isMortgaged ? tile.mortgageValue : Math.floor(tile.price * 0.7);
  const countryDisplayName = tile.country || groupMeta?.name || 'Country';

  // Count airports owned by this airport's owner (if owned)
  const ownedRailroadsCount = tile.ownerId
    ? room.tiles.filter(t => t.type === 'railroad' && t.ownerId === tile.ownerId).length
    : 0;

  // Header subtitle label
  const getSubtitle = () => {
    if (tile.type === 'tax') {
      return tile.index === 4 || tile.name.toLowerCase().includes('bank') ? 'Public Bank' : 'Public Service';
    }
    if (tile.type === 'chance') return 'Surprise Event';
    if (tile.type === 'chest') return 'Treasure Event';
    if (tile.type === 'railroad') return `Airport • $${tile.price}`;
    if (tile.type === 'utility') return `Utility Service • $${tile.price}`;
    if (tile.type === 'start') return 'Start Space';
    if (tile.type === 'jail' || tile.type === 'go_to_jail') return 'Prison Space';
    if (tile.type === 'vacation') return 'Vacation Space';
    return `${countryDisplayName} ${tile.price > 0 ? `• $${tile.price}` : ''}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[#1f1630] border-2 border-purple-500/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl text-white relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title & Group Color Strip */}
        <div
          className="p-4 text-center relative"
          style={{ backgroundColor: owner ? owner.color : '#251b3a' }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center justify-center gap-2">
            {tile.name.toUpperCase().includes('STEG') ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/60 shadow p-1 bg-white flex items-center justify-center">
                <img src={stegLogo} alt="STEG" className="max-w-full max-h-full object-contain" />
              </div>
            ) : tile.name.toUpperCase().includes('SONEDE') ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/60 shadow p-1 bg-white flex items-center justify-center">
                <img src={sonedeLogo} alt="SONEDE" className="max-w-full max-h-full object-contain" />
              </div>
            ) : tile.index === 38 || tile.name.toLowerCase().includes('poste') ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/80 shadow flex items-center justify-center bg-white flex-shrink-0">
                <img src={posteLogo} alt="Poste" className="w-full h-full object-cover" />
              </div>
            ) : tile.index === 4 || tile.name.toLowerCase().includes('bank') ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/80 shadow flex items-center justify-center bg-white flex-shrink-0 p-0.5">
                <img src={bankLogo} alt="Bank" className="w-full h-full object-contain" />
              </div>
            ) : tile.type === 'chance' ? (
              <div className="w-8 h-8 rounded-full bg-fuchsia-600 border border-white/80 shadow flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                ?
              </div>
            ) : tile.type === 'chest' ? (
              <div className="w-8 h-8 rounded-full bg-amber-500 border border-white/80 shadow flex items-center justify-center text-white text-lg flex-shrink-0">
                🎁
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
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/80 shadow flex items-center justify-center bg-white flex-shrink-0">
                    {airportLogo ? (
                      <img src={airportLogo} alt={tile.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">✈️</span>
                    )}
                  </div>
                );
              })()
            ) : tile.countryCode && tile.type === 'property' ? (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/80 shadow flex items-center justify-center bg-black/30">
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
            ) : tile.type === 'jail' || tile.type === 'go_to_jail' ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/80 shadow flex items-center justify-center bg-black flex-shrink-0">
                <img src={mornaguiaJailImg} alt="Mornaguia Prison" className="w-full h-full object-cover" />
              </div>
            ) : tile.flag ? (
              <span className="text-2xl drop-shadow">{tile.flag}</span>
            ) : null}
            <h2 className="text-xl font-black tracking-wide drop-shadow text-white">
              {tile.name}
            </h2>
          </div>
          <span className="text-xs uppercase font-bold text-white/90 tracking-widest mt-0.5 block">
            {getSubtitle()}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3 text-xs">
          {/* Owner status: only for buyable properties */}
          {isBuyableType && (
            <div className="flex items-center justify-between pb-2 border-b border-purple-800/40">
              <span className="text-gray-400">Ownership:</span>
              <span className="font-bold flex items-center gap-1.5">
                {owner ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: owner.color }} />
                    <span>{owner.name} {isOwner ? '(You)' : ''}</span>
                  </>
                ) : (
                  <span className="text-emerald-400 font-mono font-bold">Unowned (${tile.price})</span>
                )}
              </span>
            </div>
          )}

          {/* Surprise Mystery Card explanation */}
          {tile.type === 'chance' && (
            <div className="p-3.5 bg-fuchsia-950/40 border border-fuchsia-500/40 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-fuchsia-300 flex items-center gap-1.5 text-sm">
                <span>❓</span>
                <span>Surprise Mystery Event</span>
              </div>
              <p className="text-[11px] text-gray-200 leading-relaxed">
                Landing on a <span className="font-bold text-fuchsia-300">Surprise</span> tile draws a chance card with dynamic game events:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                <li>Advance to next Airport or designated property</li>
                <li>Cash prizes, rewards, and unexpected payouts</li>
                <li>Property repair bills and general maintenance fees</li>
                <li>Go directly to Mornaguia Prison without salary</li>
              </ul>
              <div className="text-[10px] text-fuchsia-400 font-mono pt-1 border-t border-fuchsia-900/40">
                * Event tiles cannot be bought, mortgaged, or owned.
              </div>
            </div>
          )}

          {/* Treasure Vault Card explanation */}
          {tile.type === 'chest' && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                <span>🎁</span>
                <span>Community Treasure Vault</span>
              </div>
              <p className="text-[11px] text-gray-200 leading-relaxed">
                Landing on a <span className="font-bold text-amber-300">Treasure</span> tile draws a community chest card with fortune and fees:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                <li>Bank error in your favor & inheritances</li>
                <li>Consultancy fees, stock dividends, and tax refunds</li>
                <li>Doctor bills, hospital charges, and schooling fees</li>
                <li>Get out of Prison free card</li>
              </ul>
              <div className="text-[10px] text-amber-400 font-mono pt-1 border-t border-amber-900/40">
                * Event tiles cannot be bought, mortgaged, or owned.
              </div>
            </div>
          )}

          {/* Public space explanation for Bank and Poste */}
          {tile.type === 'tax' && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-1.5 text-xs text-amber-200">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🏛️</span>
                <span>{tile.name} Rules</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {tile.index === 4 || tile.name.toLowerCase().includes('bank')
                  ? 'Landing on Bank charges 19% tax of your current cash balance into the Vacation Pot.'
                  : 'Landing on Poste charges a flat $100 service fee into the Vacation Pot.'}
              </p>
              <div className="text-[10px] text-amber-400 font-mono">
                * This location cannot be owned, traded, or mortgaged.
              </div>
            </div>
          )}

          {/* Airport Rent Schedule matching Photo 5 */}
          {tile.type === 'railroad' && (
            <div className="space-y-2 bg-[#150f24] p-3 rounded-xl border border-purple-900/50 text-xs">
              <div className="flex justify-between items-center pb-1 border-b border-purple-800/40 text-gray-400 font-bold">
                <span className="underline underline-offset-4 decoration-purple-500/50">when</span>
                <span className="underline underline-offset-4 decoration-purple-500/50">get</span>
              </div>
              <div className="space-y-1.5 pt-0.5 text-[11px]">
                <div className={`flex justify-between items-center ${ownedRailroadsCount === 1 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                  <span>one airport is owned</span>
                  <span className="font-mono font-bold">$ 25</span>
                </div>
                <div className={`flex justify-between items-center ${ownedRailroadsCount === 2 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                  <span>2 airports are owned</span>
                  <span className="font-mono font-bold">$ 50</span>
                </div>
                <div className={`flex justify-between items-center ${ownedRailroadsCount === 3 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                  <span>3 airports are owned</span>
                  <span className="font-mono font-bold">$ 100</span>
                </div>
                <div className={`flex justify-between items-center ${ownedRailroadsCount === 4 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                  <span>4 airports are owned</span>
                  <span className="font-mono font-bold">$ 200</span>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-purple-800/40 text-center">
                <span className="text-gray-400 text-[11px] block">Price</span>
                <span className="text-white font-bold font-mono text-sm">$ {tile.price}</span>
              </div>
            </div>
          )}

          {/* Quick Buy or Skip buttons if landed here */}
          {canBuyNow && onBuyProperty && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onBuyProperty(tile.index);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer border border-emerald-400/40"
              >
                <DollarSign className="w-4 h-4" />
                <span>Buy for ${tile.price}</span>
              </button>

              {onSkipProperty && (
                <button
                  onClick={() => {
                    onSkipProperty();
                    onClose();
                  }}
                  className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Skip</span>
                </button>
              )}
            </div>
          )}

          {/* Monopoly Status Badge */}
          {tile.type === 'property' && (
            <div className={`p-2.5 rounded-xl border flex flex-col gap-1 text-[11px] ${
              myPlayerOwnsMonopoly
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-purple-950/40 border-purple-800/40 text-purple-200'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {myPlayerOwnsMonopoly ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Monopoly Complete! House upgrades unlocked.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Requires all {countryDisplayName} states to upgrade houses ({ownedInGroup}/{groupTiles.length} owned).</span>
                  </>
                )}
              </div>
              {tile.houses > 0 && (
                <div className="text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
                  <span>Current Level:</span>
                  {tile.houses === 5 ? (
                    <span className="inline-flex items-center gap-1 text-red-400 font-black">
                      <HotelIcon className="w-4 h-4" /> Hotel
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-black">
                      <HouseIcon className="w-3.5 h-3.5" /> {tile.houses} {tile.houses === 1 ? 'House' : 'Houses'}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rent Schedule for properties */}
          {tile.type === 'property' && tile.rent.length >= 6 && (
            <div className="space-y-1 bg-[#150f24] p-2.5 rounded-xl border border-purple-900/50 font-mono text-[11px]">
              <div className={`flex justify-between ${tile.houses === 0 && !hasMonopoly ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                <span>Base Rent:</span>
                <span>${tile.rent[0]}</span>
              </div>
              <div className={`flex justify-between ${tile.houses === 0 && hasMonopoly ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>
                <span>Monopoly (Unimproved 2x):</span>
                <span>${tile.rent[0] * 2}</span>
              </div>
              <div className={`flex justify-between items-center ${tile.houses === 1 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                <span className="inline-flex items-center gap-1">
                  <HouseIcon className="w-3 h-3" /> Rent with 1 House:
                </span>
                <span>${tile.rent[1]}</span>
              </div>
              <div className={`flex justify-between items-center ${tile.houses === 2 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                <span className="inline-flex items-center gap-1">
                  <div className="inline-flex gap-0.5"><HouseIcon className="w-2.5 h-2.5" /><HouseIcon className="w-2.5 h-2.5" /></div> Rent with 2 Houses:
                </span>
                <span>${tile.rent[2]}</span>
              </div>
              <div className={`flex justify-between items-center ${tile.houses === 3 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                <span className="inline-flex items-center gap-1">
                  <div className="inline-flex gap-0.5"><HouseIcon className="w-2.5 h-2.5" /><HouseIcon className="w-2.5 h-2.5" /><HouseIcon className="w-2.5 h-2.5" /></div> Rent with 3 Houses:
                </span>
                <span>${tile.rent[3]}</span>
              </div>
              <div className={`flex justify-between items-center ${tile.houses === 4 ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
                <span className="inline-flex items-center gap-1">
                  <div className="inline-flex gap-0.5"><HouseIcon className="w-2.5 h-2.5" /><HouseIcon className="w-2.5 h-2.5" /><HouseIcon className="w-2.5 h-2.5" /><HouseIcon className="w-2.5 h-2.5" /></div> Rent with 4 Houses:
                </span>
                <span>${tile.rent[4]}</span>
              </div>
              <div className={`flex justify-between items-center ${tile.houses === 5 ? 'text-red-400 font-bold' : 'text-red-300'}`}>
                <span className="inline-flex items-center gap-1">
                  <HotelIcon className="w-3.5 h-3.5" /> Rent with Hotel:
                </span>
                <span>${tile.rent[5]}</span>
              </div>
              {tile.houseCost && (
                <div className="pt-1 mt-1 border-t border-purple-950 flex justify-between text-gray-400 text-[10px]">
                  <span>Building Cost:</span>
                  <span>${tile.houseCost} per house</span>
                </div>
              )}
            </div>
          )}

          {/* Mortgage Value: only for buyable tiles with mortgageValue */}
          {isBuyableType && tile.mortgageValue > 0 && (
            <div className="flex justify-between text-gray-400 text-xs">
              <span>Mortgage Value:</span>
              <span className="font-mono font-bold text-gray-200">${tile.mortgageValue}</span>
            </div>
          )}

          {/* Owner Actions: Build, Sell House, Mortgage, Sell to Bank */}
          {isOwner && (
            <div className="pt-2 space-y-2 border-t border-purple-800/40">
              {/* Build / Sell house buttons */}
              {tile.type === 'property' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onBuildHouse(tile.index)}
                      disabled={!canBuildHouse}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-black text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow border border-emerald-400/40"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>{tile.houses === 4 ? `Upgrade to Hotel ($${tile.houseCost})` : `Upgrade House ($${tile.houseCost})`}</span>
                    </button>

                    {tile.houses > 0 && (
                      <button
                        onClick={() => onSellHouse(tile.index)}
                        disabled={!canSellHouse}
                        className="py-2 px-3 bg-amber-600/80 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors border border-amber-500/40"
                      >
                        <span>Sell House (+${Math.floor((tile.houseCost || 0) / 2)})</span>
                      </button>
                    )}
                  </div>

                  {!isEvenBuildAllowed && myPlayerOwnsMonopoly && tile.houses < 5 && (
                    <span className="text-[10px] text-amber-300 italic text-center">
                      * Must build evenly across all {countryDisplayName} states first.
                    </span>
                  )}
                </div>
              )}

              {/* Mortgage toggle */}
              <div className="flex items-center gap-2">
                {!tile.isMortgaged ? (
                  <button
                    onClick={() => onMortgage(tile.index)}
                    disabled={!canMortgage}
                    className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 font-bold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Mortgage (${tile.mortgageValue})
                  </button>
                ) : (
                  <button
                    onClick={() => onUnmortgage(tile.index)}
                    disabled={!canUnmortgage}
                    className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Unmortgage (${Math.floor(tile.mortgageValue * 1.1)})
                  </button>
                )}

                {/* Sell Property to Bank */}
                <button
                  onClick={() => {
                    onSellProperty(tile.index);
                    onClose();
                  }}
                  disabled={hasHousesInGroup}
                  className="flex-1 py-1.5 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow cursor-pointer transition-colors"
                  title={hasHousesInGroup ? "Sell all houses in this group first" : "Sell property to the bank"}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Sell Prop (+${sellToBankPrice})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
