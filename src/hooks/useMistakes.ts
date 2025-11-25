import { useState, useCallback, useEffect } from 'react';
import type { Card, Action, Mistake } from '../types';

const STORAGE_KEY = 'blackjack-trainer-mistakes';

function loadMistakes(): Mistake[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load mistakes from localStorage:', e);
  }
  return [];
}

function saveMistakes(mistakes: Mistake[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
  } catch (e) {
    console.error('Failed to save mistakes to localStorage:', e);
  }
}

export function useMistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>(loadMistakes);

  // Sync to localStorage whenever mistakes change
  useEffect(() => {
    saveMistakes(mistakes);
  }, [mistakes]);

  const addMistake = useCallback((
    playerHand: Card[],
    dealerUpCard: Card,
    actionTaken: Action,
    correctAction: Action
  ) => {
    const newMistake: Mistake = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      playerHand,
      dealerUpCard,
      actionTaken,
      correctAction,
    };

    setMistakes((prev) => [newMistake, ...prev]);
  }, []);

  const clearMistakes = useCallback(() => {
    setMistakes([]);
  }, []);

  const removeMistake = useCallback((id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    mistakes,
    addMistake,
    clearMistakes,
    removeMistake,
  };
}
