import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.warn('Error setting theme:', error);
    }
  }, [isDark]);

  useEffect(() => {
    try {
      const activeThemeStr = localStorage.getItem('activeTheme');
      if (activeThemeStr) {
        const activeTheme = JSON.parse(activeThemeStr);
        const root = document.documentElement;
        root.style.setProperty('--theme-primary', activeTheme.primary);
        root.style.setProperty('--theme-secondary', activeTheme.secondary);
        root.style.setProperty('--theme-accent', activeTheme.accent);
        root.style.setProperty('--theme-background', activeTheme.background);
        root.style.setProperty('--theme-surface', activeTheme.surface);
        root.style.setProperty('--theme-text', activeTheme.text);
      }
    } catch (error) {
      console.warn('Error loading custom theme:', error);
    }
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
