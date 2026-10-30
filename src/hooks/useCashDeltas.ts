import { useState, useEffect, useRef } from 'react';
import { Player } from '../types/game';

export interface CashDelta {
  delta: number;
  key: number;
}

/**
 * Tracks real-time cash balance changes per player and surfaces a temporary
 * positive (gain / green) or negative (loss / red) delta notification for 3 seconds.
 */
export function useCashDeltas(players?: Record<string, Player>): Record<string, CashDelta> {
  const [cashDeltas, setCashDeltas] = useState<Record<string, CashDelta>>({});
  const prevCashRef = useRef<Record<string, number>>({});
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!players) return;

    if (!isInitializedRef.current) {
      // First render: initialize baseline balances without firing false delta notifications
      Object.values(players).forEach(p => {
        if (p && typeof p.cash === 'number') {
          prevCashRef.current[p.id] = p.cash;
        }
      });
      isInitializedRef.current = true;
      return;
    }

    const newDeltas: Record<string, CashDelta> = {};
    let hasChanges = false;
    const now = Date.now();

    Object.values(players).forEach(p => {
      if (!p || typeof p.cash !== 'number') return;
      const prev = prevCashRef.current[p.id];
      if (prev !== undefined && prev !== p.cash) {
        const diff = p.cash - prev;
        if (diff !== 0) {
          newDeltas[p.id] = { delta: diff, key: now };
          hasChanges = true;
        }
      }
      prevCashRef.current[p.id] = p.cash;
    });

    if (hasChanges) {
      setCashDeltas(prev => ({
        ...prev,
        ...newDeltas
      }));
    }
  }, [players]);

  // Keep notification active for exactly 3 seconds (3000ms), then remove it
  useEffect(() => {
    const activeEntries = Object.entries(cashDeltas);
    if (activeEntries.length === 0) return;

    const timers = activeEntries.map(([pId, info]) => {
      return setTimeout(() => {
        setCashDeltas(prev => {
          if (prev[pId]?.key === info.key) {
            const next = { ...prev };
            delete next[pId];
            return next;
          }
          return prev;
        });
      }, 3000);
    });

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [cashDeltas]);

  return cashDeltas;
}
