import { useState, useEffect } from 'react';
import { Settings, DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'lofipad_settings_v2';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (changes: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...changes }));
  };

  return { settings, update };
}
