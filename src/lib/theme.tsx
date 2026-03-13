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

  useEffect(() => {
    const html = document.documentElement;
    
    const applyTheme = () => {
      let isDark = false;
      
      if (settings.theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = settings.theme === 'dark';
      }
      
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      setResolvedTheme(isDark ? 'dark' : 'light');
    };

    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    const color = ACCENT_COLORS[settings.accentColor];
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-foreground', '#ffffff');
  }, [settings.accentColor]);

  useEffect(() => {
    const root = document.documentElement;
    const fontSize = FONT_SIZES[settings.fontSize];
    root.style.setProperty('--font-size-base', fontSize);
    document.body.style.fontSize = fontSize;
  }, [settings.fontSize]);

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
