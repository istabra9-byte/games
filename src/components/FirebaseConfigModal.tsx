import React, { useState } from 'react';
import { FirebaseConfig, getSavedFirebaseConfig, multiplayer } from '../services/firebase';
import { Database, X, Check, Flame, ExternalLink } from 'lucide-react';

interface FirebaseConfigModalProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  onClose,
  onConfigSaved
}) => {
  const existing = getSavedFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  const [form, setForm] = useState<FirebaseConfig>(existing);
  const [jsonInput, setJsonInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleJsonPaste = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setForm({
        apiKey: parsed.apiKey || '',
        authDomain: parsed.authDomain || '',
        databaseURL: parsed.databaseURL || '',
        projectId: parsed.projectId || '',
        storageBucket: parsed.storageBucket || '',
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || ''
      });
      setStatusMsg({ type: 'success', text: 'Firebase config JSON parsed successfully!' });
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'Invalid JSON format. Check your pasted snippet.' });
    }
  };

  const handleSave = () => {
    if (!form.databaseURL || !form.apiKey) {
      setStatusMsg({
        type: 'error',
        text: 'Database URL and API Key are required for Firebase Realtime Database.'
      });
      return;
    }

    const success = multiplayer.initFirebase(form);
    if (success) {
      setStatusMsg({ type: 'success', text: 'Firebase connected successfully!' });
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 800);
    } else {
      setStatusMsg({ type: 'error', text: 'Failed to initialize Firebase with these credentials.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1630] border-2 border-purple-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-purple-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold font-['Yanone_Kaffeesatz']">
              Firebase Realtime Database Setup
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Connect your Firebase Realtime Database so all game rooms, live dice rolls, trades, and chat sync across multiple devices in real-time with zero backend server!
        </p>

        {/* Quick Paste JSON option */}
        <div className="mb-4 bg-[#281d3f] p-3 rounded-xl border border-purple-800/40">
          <label className="text-[11px] font-bold text-purple-300 block mb-1">
            Quick Setup: Paste Firebase Config Object (JSON)
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{ "apiKey": "AIzaSy...", "databaseURL": "https://your-app-default-rtdb.firebaseio.com", ... }'
              className="flex-1 bg-[#1a122b] text-[11px] font-mono p-2 rounded-lg border border-purple-900 text-gray-200 outline-none"
            />
            <button
              onClick={handleJsonPaste}
              className="px-3 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-lg transition-colors"
            >
              Parse
            </button>
          </div>
        </div>

        {/* Individual Fields */}
        <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
          <div>
            <label className="text-gray-400 block mb-0.5">Database URL *</label>
            <input
              type="text"
              value={form.databaseURL}
              onChange={(e) => setForm({ ...form, databaseURL: e.target.value })}
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              className="w-full bg-[#181126] border border-purple-900/60 rounded-lg p-2 font-mono text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-0.5">API Key *</label>
            <input
              type="text"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full bg-[#181126] border border-purple-900/60 rounded-lg p-2 font-mono text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-0.5">Project ID</label>
            <input
              type="text"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              placeholder="my-richup-game"
              className="w-full bg-[#181126] border border-purple-900/60 rounded-lg p-2 font-mono text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-0.5">App ID</label>
            <input
              type="text"
              value={form.appId}
              onChange={(e) => setForm({ ...form, appId: e.target.value })}
              placeholder="1:123456789:web:abcdef"
              className="w-full bg-[#181126] border border-purple-900/60 rounded-lg p-2 font-mono text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Status notice */}
        {statusMsg && (
          <div
            className={`my-3 p-2.5 rounded-xl text-xs font-semibold ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-950/80 text-red-300 border border-red-500/40'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        {/* Buttons */}
        <div className="pt-3 border-t border-purple-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Currently: {multiplayer.isUsingFirebase() ? 'Live Firebase RTDB' : 'Local / Multi-Tab Fallback'}</span>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save & Connect</span>
          </button>
        </div>
      </div>
    </div>
  );
};
