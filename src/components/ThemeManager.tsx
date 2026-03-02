import { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PresetTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

const presetThemes: PresetTheme[] = [
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calming blues and teals inspired by the sea',
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      accent: '#22d3ee',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural greens for a peaceful writing environment',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#064e3b',
    },
  },
  {
    id: 'sunset-warmth',
    name: 'Sunset Warmth',
    description: 'Warm oranges and reds for creative inspiration',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#7c2d12',
    },
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    description: 'Soft purples for a dreamy writing experience',
    colors: {
      primary: '#9333ea',
      secondary: '#a855f7',
      accent: '#c084fc',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
    },
  },
  {
    id: 'midnight-dark',
    name: 'Midnight',
    description: 'Deep dark theme for night owls',
    colors: {
      primary: '#60a5fa',
      secondary: '#3b82f6',
      accent: '#93c5fd',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant rose and gold tones',
    colors: {
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#fb7185',
      background: '#fff1f2',
      surface: '#ffffff',
      text: '#881337',
    },
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    description: 'Warm autumn colors for cozy writing',
    colors: {
      primary: '#b45309',
      secondary: '#d97706',
      accent: '#f59e0b',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#78350f',
    },
  },
];

export default function ThemeManager() {
  const { user } = useAuth();
  const [, setCustomThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadCustomThemes();
    loadActiveTheme();
  }, [user]);

  const loadCustomThemes = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('custom_themes')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.custom_themes) {
        setCustomThemes(data.custom_themes);
      }
    } catch (error) {
      console.error('Error loading custom themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveTheme = () => {
    try {
      const saved = localStorage.getItem('activeThemeId');
      if (saved) {
        setActiveThemeId(saved);
      }
    } catch (error) {
      console.error('Error loading active theme:', error);
    }
  };

  const applyTheme = async (theme: PresetTheme) => {
    setApplying(true);
    try {
      const root = document.documentElement;

      root.style.setProperty('--color-primary', theme.colors.primary);
      root.style.setProperty('--color-secondary', theme.colors.secondary);
      root.style.setProperty('--color-accent', theme.colors.accent);
      root.style.setProperty('--color-background', theme.colors.background);
      root.style.setProperty('--color-surface', theme.colors.surface);
      root.style.setProperty('--color-text', theme.colors.text);

      localStorage.setItem('activeThemeId', theme.id);
      localStorage.setItem('activeTheme', JSON.stringify(theme));
      setActiveThemeId(theme.id);

      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            active_theme_id: theme.id,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }
    } catch (error) {
      console.error('Error applying theme:', error);
    } finally {
      setApplying(false);
    }
  };

  const clearTheme = async () => {
    setApplying(true);
    try {
      const root = document.documentElement;
      const properties = [
        '--color-primary',
        '--color-secondary',
        '--color-accent',
        '--color-background',
        '--color-surface',
        '--color-text',
      ];

      properties.forEach(prop => root.style.removeProperty(prop));

      localStorage.removeItem('activeThemeId');
      localStorage.removeItem('activeTheme');
      setActiveThemeId(null);

      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            active_theme_id: null,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }
    } catch (error) {
      console.error('Error clearing theme:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-6">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white text-sm font-bold shadow-lg">
              <Sparkles size={14} className="animate-pulse" />
              BETA
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Palette className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Advanced Themes</h2>
              <p className="text-white/90 text-sm">Personalize your Poetry Suite experience</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeThemeId && (
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="text-emerald-600 dark:text-emerald-400" size={20} />
                <span className="text-emerald-900 dark:text-emerald-100 font-semibold">
                  Theme "{presetThemes.find(t => t.id === activeThemeId)?.name}" is active
                </span>
              </div>
              <button
                onClick={clearTheme}
                disabled={applying}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={applying ? 'animate-spin' : ''} />
                Reset to Default
              </button>
            </div>
          )}

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Preset Themes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {presetThemes.map((theme) => {
              const isActive = activeThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  className={`relative group p-5 rounded-xl border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md'
                  }`}
                  onClick={() => applyTheme(theme)}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Check className="text-white" size={16} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex gap-1.5">
                      <div
                        className="w-8 h-8 rounded-lg shadow-md ring-2 ring-white dark:ring-slate-900"
                        style={{ background: theme.colors.primary }}
                      ></div>
                      <div
                        className="w-8 h-8 rounded-lg shadow-md ring-2 ring-white dark:ring-slate-900"
                        style={{ background: theme.colors.secondary }}
                      ></div>
                      <div
                        className="w-8 h-8 rounded-lg shadow-md ring-2 ring-white dark:ring-slate-900"
                        style={{ background: theme.colors.accent }}
                      ></div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">{theme.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {theme.description}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTheme(theme);
                    }}
                    disabled={applying || isActive}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 cursor-default'
                        : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {applying ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : isActive ? (
                      <>
                        <Check size={16} />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Apply Theme</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Beta Feature</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Advanced theme customization is in beta. Themes apply across the entire application, including the editor, settings, and all other pages.
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Themes persist across sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Works with both light and dark modes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>More themes coming soon</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
