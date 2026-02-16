import { supabase } from '../lib/supabase';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent?: string;
  [key: string]: string | undefined;
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  );
};

const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - (percent / 100);
  return rgbToHex(
    rgb.r * factor,
    rgb.g * factor,
    rgb.b * factor
  );
};

const isColorDark = (hex: string): boolean => {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
};

export interface Theme {
  id: string;
  name: string;
  type: 'static' | 'adaptive' | 'live' | 'ai-generated';
  colors: ThemeColors | Record<string, ThemeColors> | any;
  settings: Record<string, any>;
  is_premium: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserThemePreferences {
  id: string;
  user_id: string;
  active_theme_id?: string;
  adaptive_enabled: boolean;
  time_based_enabled: boolean;
  activity_based_enabled: boolean;
  custom_settings: Record<string, any>;
}

export const getAllThemes = async (): Promise<Theme[]> => {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const getThemeById = async (themeId: string): Promise<Theme | null> => {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', themeId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getUserThemePreferences = async (userId: string): Promise<UserThemePreferences | null> => {
  const { data, error } = await supabase
    .from('user_theme_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const saveUserThemePreferences = async (
  userId: string,
  preferences: Partial<UserThemePreferences>
): Promise<void> => {
  const { error } = await supabase
    .from('user_theme_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) throw error;
};

export const createCustomTheme = async (
  userId: string,
  theme: Omit<Theme, 'id' | 'created_at' | 'updated_at' | 'created_by'>
): Promise<Theme> => {
  const { data, error } = await supabase
    .from('themes')
    .insert({
      ...theme,
      created_by: userId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTheme = async (themeId: string, updates: Partial<Theme>): Promise<void> => {
  const { error } = await supabase
    .from('themes')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', themeId);

  if (error) throw error;
};

export const deleteTheme = async (themeId: string): Promise<void> => {
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', themeId);

  if (error) throw error;
};

export const applyThemeToDocument = (theme: Theme, context?: string): void => {
  const root = document.documentElement;
  let colors: ThemeColors;

  if (theme.type === 'adaptive' && typeof theme.colors === 'object' && !Array.isArray(theme.colors)) {
    if (context && theme.colors[context]) {
      colors = theme.colors[context];
    } else {
      const hour = new Date().getHours();
      const isDayTime = hour >= 6 && hour < 18;
      const colorKeys = Object.keys(theme.colors);
      colors = theme.colors[isDayTime ? 'light' : 'dark'] ||
               theme.colors['morning'] ||
               theme.colors['afternoon'] ||
               theme.colors[colorKeys[0]] ||
               { primary: '#3b82f6', secondary: '#0ea5e9', background: '#ffffff', surface: '#f8f9fa', text: '#1a1a1a' };
    }
  } else if (theme.type === 'live') {
    const isDarkMode = root.classList.contains('dark');

    colors = {
      primary: theme.colors.base || '#6366f1',
      secondary: theme.colors.base || '#6366f1',
      background: isDarkMode ? '#18181b' : '#ffffff',
      surface: isDarkMode ? '#27272a' : '#f8f9fa',
      text: isDarkMode ? '#fafafa' : '#1a1a1a'
    };

    if (theme.colors.animation === 'pulse') {
      root.style.setProperty('--theme-animation', 'pulse');
      root.style.setProperty('--theme-animation-duration', `${theme.colors.duration || 5000}ms`);
    } else if (theme.colors.animation === 'flow' && theme.colors.gradient) {
      root.style.setProperty('--theme-gradient', theme.colors.gradient.join(', '));
      root.style.setProperty('--theme-animation', 'flow');
      root.style.setProperty('--theme-animation-duration', `${theme.colors.duration || 10000}ms`);
    }
  } else if (typeof theme.colors === 'object' && !Array.isArray(theme.colors)) {
    colors = theme.colors as ThemeColors;
  } else {
    colors = { primary: '#3b82f6', secondary: '#0ea5e9', background: '#ffffff', surface: '#f8f9fa', text: '#1a1a1a' };
  }

  if (!colors.primary || !colors.background || !colors.text) {
    console.warn('Theme missing required colors, using defaults');
    colors = {
      primary: colors.primary || '#3b82f6',
      secondary: colors.secondary || '#0ea5e9',
      background: colors.background || '#ffffff',
      surface: colors.surface || '#f8f9fa',
      text: colors.text || '#1a1a1a'
    };
  }

  const isDarkBg = isColorDark(colors.background);
  const onBackground = colors.text || (isDarkBg ? '#fafafa' : '#18181b');
  const onSurface = colors.text || (isDarkBg ? '#fafafa' : '#18181b');

  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--on-primary', '#ffffff');
  root.style.setProperty('--primary-container', lightenColor(colors.primary, 40));
  root.style.setProperty('--on-primary-container', darkenColor(colors.primary, 40));

  root.style.setProperty('--secondary', colors.secondary || colors.primary);
  root.style.setProperty('--on-secondary', '#ffffff');
  root.style.setProperty('--secondary-container', lightenColor(colors.secondary || colors.primary, 40));
  root.style.setProperty('--on-secondary-container', darkenColor(colors.secondary || colors.primary, 40));

  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--on-background', onBackground);

  root.style.setProperty('--surface', colors.surface || colors.background);
  root.style.setProperty('--on-surface', onSurface);
  root.style.setProperty('--surface-variant', isDarkBg ? lightenColor(colors.background, 15) : darkenColor(colors.background, 5));
  root.style.setProperty('--on-surface-variant', isDarkBg ? lightenColor(onSurface, -20) : darkenColor(onSurface, 20));

  root.style.setProperty('--outline', isDarkBg ? '#71717a' : '#a1a1aa');
  root.style.setProperty('--shadow', '#000000');

  root.style.setProperty('--error', '#ef4444');
  root.style.setProperty('--on-error', '#ffffff');
  root.style.setProperty('--error-container', '#fee2e2');
  root.style.setProperty('--on-error-container', '#7f1d1d');

  if (colors.accent) {
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--on-accent', '#ffffff');
  }

  const tertiaryColor = colors.tertiary || lightenColor(colors.primary, 20);
  root.style.setProperty('--tertiary', tertiaryColor);
  root.style.setProperty('--on-tertiary', '#ffffff');
  root.style.setProperty('--tertiary-container', lightenColor(tertiaryColor, 40));
  root.style.setProperty('--on-tertiary-container', darkenColor(tertiaryColor, 40));

  root.style.setProperty('--inverse-surface', isDarkBg ? '#fafafa' : '#27272a');
  root.style.setProperty('--inverse-on-surface', isDarkBg ? '#18181b' : '#fafafa');
  root.style.setProperty('--inverse-primary', isDarkBg ? lightenColor(colors.primary, 30) : darkenColor(colors.primary, 20));

  root.setAttribute('data-theme', theme.name.toLowerCase().replace(/\s+/g, '-'));
  root.setAttribute('data-theme-type', theme.type);
};

export const getAdaptiveThemeContext = async (): Promise<string> => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

export const generateAITheme = async (prompt: string, userId: string): Promise<Theme> => {
  try {
    const { generateTheme } = await import('./ai');
    const aiColors = await generateTheme(prompt);

    const theme: Omit<Theme, 'id' | 'created_at' | 'updated_at' | 'created_by'> = {
      name: `AI: ${prompt.substring(0, 30)}`,
      type: 'ai-generated',
      colors: aiColors,
      settings: {
        prompt,
        generated_at: new Date().toISOString()
      },
      is_premium: false
    };

    return await createCustomTheme(userId, theme);
  } catch (error) {
    console.error('Error generating AI theme:', error);
    throw new Error('Failed to generate AI theme. Please try again.');
  }
};

export const getTimeBasedTheme = (themes: Theme[]): Theme | null => {
  const hour = new Date().getHours();
  const isDayTime = hour >= 6 && hour < 18;

  const adaptiveTheme = themes.find(t =>
    t.type === 'adaptive' &&
    t.settings.triggers?.includes('time')
  );

  if (adaptiveTheme) {
    return adaptiveTheme;
  }

  return themes.find(t => t.name.toLowerCase().includes(isDayTime ? 'light' : 'dark')) || null;
};

export const getActivityBasedTheme = (themes: Theme[], activity: string): Theme | null => {
  return themes.find(t =>
    t.type === 'adaptive' &&
    t.settings.triggers?.includes('activity') &&
    t.settings.activities?.[activity]
  ) || null;
};

export const startLiveThemeAnimation = (theme: Theme): void => {
  if (theme.type !== 'live') return;

  const root = document.documentElement;

  if (theme.colors.animation === 'pulse') {
    root.classList.add('theme-pulse');
  } else if (theme.colors.animation === 'flow') {
    root.classList.add('theme-flow');
  }
};

export const stopLiveThemeAnimation = (): void => {
  const root = document.documentElement;
  root.classList.remove('theme-pulse', 'theme-flow');
};
