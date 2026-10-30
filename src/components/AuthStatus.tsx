import React, { useState, useEffect, useRef } from 'react';
import { multiplayer } from '../services/firebase';
import { User } from 'firebase/auth';
import { LogOut, User as UserIcon, ShieldCheck, Sparkles, ChevronDown, Copy, Check, AlertTriangle, X } from 'lucide-react';
import { sound } from '../services/sound';

interface AuthStatusProps {
  onUserChanged?: (user: User | null) => void;
  compact?: boolean;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ onUserChanged, compact = false }) => {
  const [user, setUser] = useState<User | null>(multiplayer.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = multiplayer.onAuthChange((u) => {
      setUser(u);
      if (onUserChanged) onUserChanged(u);
    });
    return unsub;
  }, [onUserChanged]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      sound.playSelect();
      const signedInUser = await multiplayer.signInWithGoogle();
      if (signedInUser) {
        sound.playTurnChime();
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const errMsg = String(err?.message || '');
      const errCode = String(err?.code || '');
      const isUnauthorizedDomain =
        errCode === 'auth/unauthorized-domain' ||
        errMsg.toLowerCase().includes('unauthorized-domain') ||
        errMsg.toLowerCase().includes('unauthorized domain');

      if (isUnauthorizedDomain) {
        setShowDomainModal(true);
      } else if (errCode !== 'auth/popup-closed-by-user' && !errMsg.includes('popup-closed')) {
        alert(err.message || 'Failed to sign in with Google. Ensure popup permissions are enabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      sound.playSelect();
      setShowDropdown(false);
      await multiplayer.signOutUser();
    } catch (err) {
      console.warn('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isGoogle = Boolean(user && !user.isAnonymous);

  return (
    <div className="relative inline-flex items-center text-xs" ref={dropdownRef}>
      {isGoogle ? (
        // Signed in with Google
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDropdown(prev => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e1533]/90 hover:bg-[#2a1d47] border border-emerald-500/50 hover:border-emerald-400 text-white transition-all cursor-pointer shadow-sm backdrop-blur-sm group"
            title="Google Account"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Google Avatar"
                className="w-5 h-5 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold">
                {user?.displayName ? user.displayName[0].toUpperCase() : 'G'}
              </div>
            )}
            <span className="font-bold text-emerald-300 max-w-[110px] truncate hidden sm:inline">
              {user?.displayName || 'Google Player'}
            </span>
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
              G
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#1b132c] border border-purple-500/40 rounded-xl shadow-2xl p-2.5 z-50 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 pb-2 border-b border-purple-900/50">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-400" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'G'}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-xs truncate">{user?.displayName || 'Google Account'}</span>
                  <span className="text-[10px] text-gray-400 truncate font-mono">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 px-1 py-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Verified Google Account</span>
              </div>

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-1.5 px-2 bg-red-950/40 hover:bg-red-900/60 border border-red-700/50 rounded-lg text-red-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Play as Guest</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        // Anonymous / Guest - Show Sign in with Google Button
        <div className="flex items-center gap-1.5">
          {!compact && (
            <span className="text-[10px] text-purple-300/80 font-bold px-2 py-1 bg-purple-950/40 rounded-lg border border-purple-800/40 hidden md:inline">
              Guest
            </span>
          )}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 active:scale-95 text-gray-800 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200"
            title="Sign in with Google"
          >
            {/* Official Google G Logo */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs font-bold text-gray-700">
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>
        </div>
      )}

      {/* Unauthorized Domain Helpful Guidance Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#19112a] border border-amber-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl text-white relative">
            <button
              onClick={() => setShowDomainModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-amber-400 mb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-black tracking-wide">Firebase Authorized Domain Required</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              Google Sign-in on GitHub Pages requires adding your website domain to your Firebase Console authorized domains list:
            </p>

            {/* Domain Copy Box */}
            <div className="flex items-center gap-2 bg-[#0e0918] border border-purple-800/60 rounded-xl px-3 py-2 mb-4">
              <code className="text-xs font-mono font-bold text-amber-300 flex-1 truncate select-all">
                {typeof window !== 'undefined' ? window.location.hostname : 'istabra9-byte.github.io'}
              </code>
              <button
                onClick={() => {
                  const host = typeof window !== 'undefined' ? window.location.hostname : 'istabra9-byte.github.io';
                  navigator.clipboard.writeText(host);
                  setCopiedDomain(true);
                  setTimeout(() => setCopiedDomain(false), 2000);
                }}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDomain ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Steps */}
            <div className="bg-[#120b20] border border-purple-900/50 rounded-xl p-3 text-[11px] text-gray-300 space-y-1.5 mb-4">
              <div className="font-bold text-purple-300 text-xs mb-1">Quick 30-Second Fix in Firebase Console:</div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-400">1.</span>
                <span>Open <b>Firebase Console</b> &gt; select your project.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-400">2.</span>
                <span>Navigate to <b>Authentication</b> &gt; <b>Settings</b> tab.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-400">3.</span>
                <span>Scroll down to <b>Authorized domains</b> &gt; click <b>Add domain</b>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-400">4.</span>
                <span>Paste <code className="text-amber-300 font-mono">istabra9-byte.github.io</code> and click <b>Save</b>.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDomainModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow"
              >
                Continue Playing as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
