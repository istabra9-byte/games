import React from 'react';
import { GameSettings } from '../types/game';
import { Settings, X, Check, ShieldCheck, DollarSign, Clock, Palmtree, Gavel, Scale } from 'lucide-react';

interface RoomSettingsModalProps {
  settings: GameSettings;
  onClose: () => void;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({ settings, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-[#1f1630] border-2 border-purple-500/50 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white relative cursor-default flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/50 pb-2.5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-black font-heading text-purple-200 tracking-wide">
              Room Settings & Rules
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg bg-black/20 hover:bg-black/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-[#140e22] rounded-xl border border-purple-950">
            <div className="flex items-center gap-2 text-gray-300">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Starting Cash</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ${settings.startingCash}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#140e22] rounded-xl border border-purple-950">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Turn Time Limit</span>
            </div>
            <span className="font-mono font-bold text-sky-400">
              {settings.turnTimeLimit}s
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#140e22] rounded-xl border border-purple-950">
            <div className="flex items-center gap-2 text-gray-300">
              <Palmtree className="w-4 h-4 text-teal-400" />
              <span>Vacation Cash Pot</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.vacationCash ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'}`}>
              {settings.vacationCash ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#140e22] rounded-xl border border-purple-950">
            <div className="flex items-center gap-2 text-gray-300">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Property Auctions</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${settings.auction ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'}`}>
              {settings.auction ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#140e22] rounded-xl border border-purple-950">
            <div className="flex items-center gap-2 text-gray-300">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Even Building Rule</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              {settings.evenBuild ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#140e22] rounded-xl border border-purple-950">
            <div className="flex items-center gap-2 text-gray-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>2x Rent on Complete Monopoly</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              {settings.payDoubleRentWhenOwnFullSet ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer mt-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};
