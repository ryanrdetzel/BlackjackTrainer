import { useState, useEffect, useCallback } from 'react';
import type { CasinoRules } from '../types';
import { DEFAULT_CASINO_RULES } from '../types';

const STORAGE_KEY = 'blackjack-trainer-settings';

function loadSettings(): CasinoRules {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate and merge with defaults to handle any missing fields
      return {
        ...DEFAULT_CASINO_RULES,
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_CASINO_RULES;
}

function saveSettings(settings: CasinoRules): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<CasinoRules>(loadSettings);

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<CasinoRules>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_CASINO_RULES);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
