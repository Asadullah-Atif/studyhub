'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useStore();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      setResolvedTheme(isDark ? 'dark' : 'light');
    };

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(settings.theme === 'dark');
    }
  }, [settings.theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const color = ACCENT_COLORS[settings.accentColor];
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-foreground', '#ffffff');
  }, [settings.accentColor, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const fontSize = FONT_SIZES[settings.fontSize];
    root.style.setProperty('--font-size-base', fontSize);
    document.body.style.fontSize = fontSize;
  }, [settings.fontSize, mounted]);

  const setTheme = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const setAccentColor = (color: AccentColor) => {
    updateSettings({ accentColor: color });
  };

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
