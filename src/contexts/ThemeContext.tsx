import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { themes, Theme } from '@/lib/themes';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  theme: string;
  setTheme: (themeName: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { profile, updateProfileTheme, user } = useAuth();
  const [themeName, setThemeName] = useState<string>('teal');

  useEffect(() => {
    if (profile?.theme) {
      setThemeName(profile.theme);
    } else if (!user) {
      const localTheme = localStorage.getItem('app-theme') || 'teal';
      setThemeName(localTheme);
    }
  }, [profile, user]);

  useEffect(() => {
    const root = window.document.documentElement;
    const selectedTheme = themes.find(t => t.name === themeName) || themes[0];
    
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    root.classList.remove('light', 'dark');
    root.classList.add(isDarkMode ? 'dark' : 'light');

    const colors = isDarkMode ? selectedTheme.colors.dark : selectedTheme.colors.light;

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--primary-glow', colors.primaryGlow);
    root.style.setProperty('--ring', colors.ring);

  }, [themeName]);

  const setTheme = (newThemeName: string) => {
    setThemeName(newThemeName);
    if (user) {
      updateProfileTheme(newThemeName);
    } else {
      localStorage.setItem('app-theme', newThemeName);
    }
  };

  const value = useMemo(() => ({
    theme: themeName,
    setTheme,
    themes,
  }), [themeName, user]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};