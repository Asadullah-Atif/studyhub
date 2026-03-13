'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useStore } from '../lib/store';
import { ThemeMode, ACCENT_COLORS, AccentColor, FontSize } from '../lib/types';

const FONT_SIZES: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

interface ThemeContextType {
  theme: ThemeMode;
  accentColor: AccentColor;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useStore();
  const [mounted, setMounted] = useState(false);

  // Apply theme to DOM
  const applyTheme = useCallback((theme: ThemeMode) => {
    const isDark = theme === 'dark' || 
      (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    applyTheme(settings.theme);
  }, [settings.theme, applyTheme]);

  // Apply accent color
  useEffect(() => {
    const root = document.documentElement;
    const color = ACCENT_COLORS[settings.accentColor];
    root.style.setProperty('--accent', color);
  }, [settings.accentColor]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', FONT_SIZES[settings.fontSize]);
  }, [settings.fontSize]);

  const setTheme = useCallback((theme: ThemeMode) => {
    applyTheme(theme);
    updateSettings({ theme });
  }, [applyTheme, updateSettings]);

  const setAccentColor = useCallback((color: AccentColor) => {
    updateSettings({ accentColor: color });
  }, [updateSettings]);

  const resolvedTheme = settings.theme === 'system' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;

  return (
    <ThemeContext.Provider
      value={{
        theme: settings.theme,
        accentColor: settings.accentColor,
        resolvedTheme,
        setTheme,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
