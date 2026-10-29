import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GameLog, Player } from '../types/game';
import { MessageSquare, Send, X } from 'lucide-react';
import { sound } from '../services/sound';

interface ChatAndLogsProps {
  chat: ChatMessage[];
  logs?: GameLog[];
  currentPlayer: Player;
  onSendMessage: (text: string) => void;
  onClose?: () => void;
}

export const ChatAndLogs: React.FC<ChatAndLogsProps> = ({
  chat,
  currentPlayer,
  onSendMessage,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    sound.playChatPop();
  };

  return (
    <div className="flex flex-col h-full bg-[#171126] border border-purple-900/60 rounded-2xl overflow-hidden shadow-2xl text-white backdrop-blur-md">
      {/* Header with Title & Close Button (Pure Chat, No Logs tab) */}
      <div className="flex items-center justify-between border-b border-purple-900/60 bg-[#120d1e] px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span className="tracking-wide">Chat ({chat.length})</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-200 hover:text-white rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 transition-all cursor-pointer shadow-sm ml-2"
            title="Close Chat (or click anywhere on screen)"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-sans">
        {chat.map((msg) => (
          <div key={msg.id} className="flex flex-col leading-tight bg-[#1c152e]/50 p-2 rounded-xl border border-purple-950">
            <div className="flex items-center gap-1.5">
              <span
                className="font-bold text-[11px]"
                style={{ color: msg.senderColor || '#ff4081' }}
              >
                {msg.senderName}
              </span>
              <span className="text-[9px] text-gray-500 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-gray-200 text-xs mt-0.5 break-words">
              {msg.text}
            </p>
          </div>
        ))}
        {chat.length === 0 && (
          <div className="text-center text-gray-500 italic py-8">
            No chat messages yet. Say hello!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-2 bg-[#120d1e] border-t border-purple-900/60 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message (Enter to send)..."
          maxLength={140}
          className="flex-1 bg-[#201833] text-xs text-white px-3 py-2 rounded-xl outline-none border border-purple-800/40 focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white rounded-xl shadow cursor-pointer transition-transform active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
