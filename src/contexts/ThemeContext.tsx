// @refresh reset
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getUserThemePreferences,
  getThemeById,
  applyThemeToDocument,
  type Theme
} from '@/utils/themes';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  activeTheme: Theme | null;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return false;
    }
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadThemeFromDatabase(session.user.id);
      } else {
        applyBasicTheme(isDark);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadThemeFromDatabase(session.user.id);
      } else {
        setUserId(null);
        setActiveTheme(null);
        applyBasicTheme(isDark);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const applyBasicTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const loadThemeFromDatabase = async (uid: string) => {
    try {
      const [preferences, basicPrefs] = await Promise.all([
        getUserThemePreferences(uid),
        supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', uid)
          .maybeSingle()
      ]);

      if (preferences?.active_theme_id) {
        const theme = await getThemeById(preferences.active_theme_id);
        if (theme) {
          setActiveTheme(theme);
          applyThemeToDocument(theme);
          return;
        }
      }

      if (basicPrefs.data?.theme) {
        const darkMode = basicPrefs.data.theme === 'dark';
        setIsDark(darkMode);
        localStorage.setItem('theme', basicPrefs.data.theme);
        applyBasicTheme(darkMode);
      } else {
        applyBasicTheme(isDark);
      }
    } catch (error) {
      console.warn('Error loading theme from database:', error);
      applyBasicTheme(isDark);
    }
  };

  const saveThemeToDatabase = async (theme: 'light' | 'dark', uid: string) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: uid,
          theme: theme,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.warn('Error saving theme to database:', error);
    }
  };

  useEffect(() => {
    if (activeTheme) return;

    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }

      if (userId) {
        saveThemeToDatabase(isDark ? 'dark' : 'light', userId);
      }
    } catch (error) {
      console.warn('Error setting theme:', error);
    }
  }, [isDark, userId, activeTheme]);

  const toggleTheme = () => {
    if (activeTheme) {
      setActiveTheme(null);
    }
    setIsDark(!isDark);
  };

  const refreshTheme = async () => {
    if (userId) {
      await loadThemeFromDatabase(userId);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, activeTheme, refreshTheme }}>
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
