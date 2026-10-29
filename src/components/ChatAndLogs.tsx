import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GameLog, Player } from '../types/game';
import { MessageSquare, ScrollText, Send } from 'lucide-react';
import { sound } from '../services/sound';

interface ChatAndLogsProps {
  chat: ChatMessage[];
  logs: GameLog[];
  currentPlayer: Player;
  onSendMessage: (text: string) => void;
}

export const ChatAndLogs: React.FC<ChatAndLogsProps> = ({
  chat,
  logs,
  currentPlayer,
  onSendMessage
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, logs, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    sound.playChatPop();
  };

  return (
    <div className="flex flex-col h-full bg-[#171126] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl text-white">
      {/* Tab Switcher */}
      <div className="flex items-center border-b border-purple-900/60 bg-[#120d1e]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'chat'
              ? 'border-purple-500 text-white bg-purple-950/30'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat ({chat.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'logs'
              ? 'border-purple-500 text-white bg-purple-950/30'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span>Game Log ({logs.length})</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-sans">
        {activeTab === 'chat' ? (
          <>
            {chat.map((msg) => (
              <div key={msg.id} className="flex flex-col leading-tight">
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
              <div className="text-center text-gray-500 italic py-6">
                No chat messages yet. Say hello!
              </div>
            )}
          </>
        ) : (
          <>
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-1.5 rounded-lg bg-[#201736]/60 border border-purple-950 text-[11px] text-gray-300 flex items-start gap-1.5"
              >
                <span className="flex-1">{log.text}</span>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      {activeTab === 'chat' && (
        <form onSubmit={handleSend} className="p-2 bg-[#120d1e] border-t border-purple-900/60 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
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
      )}
    </div>
  );
};
