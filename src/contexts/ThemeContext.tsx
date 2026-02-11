// @refresh reset
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadThemeFromDatabase(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadThemeFromDatabase(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadThemeFromDatabase = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;

      if (data?.theme) {
        const darkMode = data.theme === 'dark';
        setIsDark(darkMode);
        localStorage.setItem('theme', data.theme);
      }
    } catch (error) {
      console.warn('Error loading theme from database:', error);
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
  }, [isDark, userId]);

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
