import React, { useState, useRef, useEffect } from 'react';
import { GameRoom, Player, ChatMessage } from '../types/game';
import { PlayerAvatar } from './PlayerAvatar';
import { Copy, Check, Settings, Send, MessageSquare, Volume2, Info } from 'lucide-react';

interface LeftSidebarProps {
  room: GameRoom;
  currentPlayer: Player;
  onSendMessage: (text: string) => void;
  onOpenSettings: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  room,
  currentPlayer,
  onSendMessage,
  onOpenSettings
}) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/room/${room.id}`
    : `https://istabra9-byte.github.io/games/#/room/${room.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const chatMessages = room.chat || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  return (
    <div className="w-full h-full flex flex-col gap-2.5 overflow-hidden select-none">
      {/* 1. Share this game Card */}
      <div className="bg-[#1b142c] border border-purple-900/50 rounded-2xl p-3 shadow-lg flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
            <span>Share this game</span>
            <Info className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-[10px] text-purple-400 font-mono font-bold bg-[#120c1e] px-1.5 py-0.5 rounded border border-purple-900/50">
            {room.id}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#120c1e] border border-purple-950 rounded-xl px-2.5 py-1.5">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="w-full bg-transparent text-[11px] font-mono text-purple-300 outline-none select-all truncate"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#25193f] hover:bg-[#322055] text-purple-200 hover:text-white rounded-xl text-[11px] font-bold transition-all border border-purple-700/40 cursor-pointer active:scale-98"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#25193f] hover:bg-[#322055] text-purple-200 hover:text-white rounded-xl text-[11px] font-bold transition-all border border-purple-700/40 cursor-pointer active:scale-98"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span className="truncate">Room settings</span>
          </button>
        </div>
      </div>

      {/* 2. Embedded Chat Card */}
      <div className="flex-1 min-h-0 bg-[#1b142c] border border-purple-900/50 rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Chat Card Header */}
        <div className="px-3 py-2 border-b border-purple-900/40 flex items-center justify-between bg-[#1e1632] flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-gray-200">Chat</span>
            {chatMessages.length > 0 && (
              <span className="text-[10px] text-purple-300 bg-[#120c1e] px-1.5 py-0.2 rounded-full font-mono">
                {chatMessages.length}
              </span>
            )}
          </div>
          <Volume2 className="w-3.5 h-3.5 text-gray-500" />
        </div>

        {/* Message Feed */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 select-text">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs gap-1.5 select-none py-6">
              <span className="text-2xl">💬</span>
              <span>No messages yet</span>
              <span className="text-[10px] text-gray-600">Say hello to the room!</span>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe = msg.senderId === currentPlayer.id;
              const sender = room.players[msg.senderId];
              const senderColor = msg.senderColor || sender?.color || '#ff4081';
              const senderAvatar = sender?.avatar || 'navy';

              return (
                <div key={msg.id} className="flex items-start gap-2 text-xs leading-relaxed animate-in fade-in duration-100">
                  <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                    <PlayerAvatar avatar={senderAvatar} color={senderColor} size={20} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-[11px] truncate" style={{ color: senderColor }}>
                        {msg.senderName} {isMe ? '(You)' : ''}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-200 text-xs break-words font-medium leading-snug">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-2 border-t border-purple-900/40 bg-[#140e22] flex items-center gap-1.5 flex-shrink-0">
          <input
            type="text"
            value={inputText}
            maxLength={140}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-[#1a122d] border border-purple-900/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white rounded-xl transition-all cursor-pointer flex-shrink-0"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
