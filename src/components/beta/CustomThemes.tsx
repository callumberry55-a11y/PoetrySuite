import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Palette, Plus, Save, Trash2, Eye, ArrowLeft, AlertCircle, Check, Sparkles, Wand2, RefreshCw, X } from 'lucide-react';
import BetaGuard from './BetaGuard';
import { supabase } from '../../lib/supabase';

interface CustomTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  isActive: boolean;
}

const defaultThemes: CustomTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#3b82f6',
    background: '#f0f9ff',
    surface: '#ffffff',
    text: '#0c4a6e',
    isActive: false
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#84cc16',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#14532d',
    isActive: false
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#fbbf24',
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#7c2d12',
    isActive: false
  }
];

const themePresets = [
  { mood: 'cozy', keywords: ['warm', 'comfortable', 'inviting'], baseHue: 25 },
  { mood: 'energetic', keywords: ['vibrant', 'dynamic', 'bold'], baseHue: 350 },
  { mood: 'calm', keywords: ['peaceful', 'serene', 'tranquil'], baseHue: 200 },
  { mood: 'professional', keywords: ['clean', 'modern', 'sleek'], baseHue: 210 },
  { mood: 'creative', keywords: ['artistic', 'expressive', 'unique'], baseHue: 280 },
  { mood: 'nature', keywords: ['earthy', 'organic', 'fresh'], baseHue: 120 },
  { mood: 'sunset', keywords: ['warm', 'romantic', 'golden'], baseHue: 30 },
  { mood: 'midnight', keywords: ['dark', 'mysterious', 'elegant'], baseHue: 240 },
  { mood: 'spring', keywords: ['fresh', 'light', 'blooming'], baseHue: 90 },
  { mood: 'autumn', keywords: ['rich', 'warm', 'cozy'], baseHue: 20 }
];

export default function CustomThemes() {
  const { user } = useAuth();
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTheme, setNewTheme] = useState<Omit<CustomTheme, 'id' | 'isActive'>>({
    name: '',
    primary: '#3b82f6',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a'
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const previewTheme = themes.find(t => t.id === selectedTheme) || newTheme;

  useEffect(() => {
    if (user) {
      loadThemes();
    }
  }, [user]);

  const loadThemes = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('custom_themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const loadedThemes = data?.map(theme => ({
        id: theme.id,
        name: theme.name,
        primary: theme.primary_color,
        secondary: theme.secondary_color,
        accent: theme.accent_color,
        background: theme.background_color,
        surface: theme.surface_color,
        text: theme.text_color,
        isActive: theme.is_active
      })) || [];

      setThemes([...defaultThemes, ...loadedThemes]);

      const activeTheme = loadedThemes.find(t => t.isActive);
      if (activeTheme) {
        applyThemeToApp(activeTheme);
      }
    } catch (err) {
      console.error('Error loading themes:', err);
      setThemes(defaultThemes);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeToApp = (theme: CustomTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-text', theme.text);
    localStorage.setItem('activeTheme', JSON.stringify(theme));
  };

  const clearThemeFromApp = () => {
    const root = document.documentElement;
    root.style.removeProperty('--theme-primary');
    root.style.removeProperty('--theme-secondary');
    root.style.removeProperty('--theme-accent');
    root.style.removeProperty('--theme-background');
    root.style.removeProperty('--theme-surface');
    root.style.removeProperty('--theme-text');
    localStorage.removeItem('activeTheme');
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generateColorPalette = (baseHue: number, saturation: number, isDark: boolean = false) => {
    const primary = hslToHex(baseHue, saturation, isDark ? 45 : 55);
    const secondary = hslToHex((baseHue + 30) % 360, saturation - 10, isDark ? 50 : 60);
    const accent = hslToHex((baseHue + 180) % 360, saturation - 5, isDark ? 55 : 65);
    const background = isDark ? hslToHex(baseHue, 15, 10) : hslToHex(baseHue, 30, 97);
    const surface = isDark ? hslToHex(baseHue, 15, 15) : '#ffffff';
    const text = isDark ? hslToHex(baseHue, 10, 90) : hslToHex(baseHue, 30, 15);

    return { primary, secondary, accent, background, surface, text };
  };

  const analyzeMood = (prompt: string): { mood: string; baseHue: number; saturation: number; isDark: boolean } => {
    const lowerPrompt = prompt.toLowerCase();

    for (const preset of themePresets) {
      if (lowerPrompt.includes(preset.mood) || preset.keywords.some(k => lowerPrompt.includes(k))) {
        const saturation = lowerPrompt.includes('vibrant') || lowerPrompt.includes('bold') ? 75 :
                          lowerPrompt.includes('muted') || lowerPrompt.includes('soft') ? 45 : 60;
        const isDark = lowerPrompt.includes('dark') || lowerPrompt.includes('night') || lowerPrompt.includes('midnight');
        return { mood: preset.mood, baseHue: preset.baseHue, saturation, isDark };
      }
    }

    const colorMap: Record<string, number> = {
      red: 0, orange: 30, yellow: 60, green: 120, blue: 210,
      purple: 280, pink: 330, brown: 25, grey: 0, gray: 0
    };

    for (const [color, hue] of Object.entries(colorMap)) {
      if (lowerPrompt.includes(color)) {
        const saturation = 60;
        const isDark = lowerPrompt.includes('dark') || lowerPrompt.includes('deep');
        return { mood: color, baseHue: hue, saturation, isDark };
      }
    }

    const randomHue = Math.floor(Math.random() * 360);
    return { mood: 'custom', baseHue: randomHue, saturation: 60, isDark: false };
  };

  const generateThemeName = (mood: string, prompt: string): string => {
    const adjectives = ['Vibrant', 'Soft', 'Bold', 'Gentle', 'Modern', 'Classic', 'Fresh', 'Deep'];
    const nouns = ['Dream', 'Breeze', 'Glow', 'Wave', 'Essence', 'Harmony', 'Spirit', 'Vision'];

    if (prompt.length > 2) {
      const words = prompt.split(' ').filter(w => w.length > 3);
      if (words.length > 0) {
        const word = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        return `${word} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
      }
    }

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  };

  const generateAITheme = async () => {
    if (!aiPrompt.trim()) {
      setError('Please describe the theme you want to create');
      return;
    }

    setIsGenerating(true);
    setError(null);

    setTimeout(() => {
      const analysis = analyzeMood(aiPrompt);
      const colors = generateColorPalette(analysis.baseHue, analysis.saturation, analysis.isDark);
      const themeName = generateThemeName(analysis.mood, aiPrompt);

      setNewTheme({
        name: themeName,
        ...colors
      });

      setIsGenerating(false);
      setShowAIGenerator(false);
      setIsCreating(true);
      setAiPrompt('');
      setSuccess(`Generated "${themeName}" theme from your description!`);
      setTimeout(() => setSuccess(null), 3000);
    }, 1500);
  };

  const generateRandomTheme = () => {
    const randomMood = themePresets[Math.floor(Math.random() * themePresets.length)];
    const saturation = 50 + Math.floor(Math.random() * 30);
    const isDark = Math.random() > 0.7;
    const colors = generateColorPalette(randomMood.baseHue, saturation, isDark);

    const adjectives = ['Mystical', 'Ethereal', 'Radiant', 'Serene', 'Dynamic', 'Elegant'];
    const nouns = ['Aurora', 'Cascade', 'Horizon', 'Nebula', 'Zenith', 'Prisma'];
    const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

    setNewTheme({
      name,
      ...colors
    });

    setIsCreating(true);
    setShowAIGenerator(false);
    setSuccess(`Generated random theme: "${name}"!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const createTheme = async () => {
    if (!newTheme.name.trim()) {
      setError('Please enter a theme name');
      return;
    }

    if (!user) {
      setError('You must be logged in to create themes');
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('custom_themes')
        .insert([{
          user_id: user.id,
          name: newTheme.name,
          primary_color: newTheme.primary,
          secondary_color: newTheme.secondary,
          accent_color: newTheme.accent,
          background_color: newTheme.background,
          surface_color: newTheme.surface,
          text_color: newTheme.text,
          is_active: false
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const theme: CustomTheme = {
        id: data.id,
        name: data.name,
        primary: data.primary_color,
        secondary: data.secondary_color,
        accent: data.accent_color,
        background: data.background_color,
        surface: data.surface_color,
        text: data.text_color,
        isActive: data.is_active
      };

      setThemes([...themes, theme]);
      setSuccess('Theme created successfully!');
      setIsCreating(false);
      setNewTheme({
        name: '',
        primary: '#3b82f6',
        secondary: '#06b6d4',
        accent: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a'
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating theme:', err);
      setError('Failed to create theme. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteTheme = async (id: string) => {
    if (!confirm('Delete this theme?')) return;

    if (defaultThemes.some(t => t.id === id)) {
      setError('Cannot delete default themes');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('custom_themes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const deletedTheme = themes.find(t => t.id === id);
      if (deletedTheme?.isActive) {
        clearThemeFromApp();
      }

      setThemes(themes.filter(t => t.id !== id));
      if (selectedTheme === id) {
        setSelectedTheme(null);
      }
      setSuccess('Theme deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting theme:', err);
      setError('Failed to delete theme. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const activateTheme = async (id: string) => {
    const theme = themes.find(t => t.id === id);
    if (!theme) return;

    const isDefaultTheme = defaultThemes.some(t => t.id === id);

    try {
      if (!isDefaultTheme && user) {
        await supabase
          .from('custom_themes')
          .update({ is_active: false })
          .eq('user_id', user.id);

        const { error: updateError } = await supabase
          .from('custom_themes')
          .update({ is_active: true })
          .eq('id', id);

        if (updateError) throw updateError;
      }

      setThemes(themes.map(t => ({
        ...t,
        isActive: t.id === id
      })));

      applyThemeToApp(theme);
      setSuccess('Theme activated and will persist across sessions!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error activating theme:', err);
      setError('Failed to activate theme. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const deactivateAllThemes = async () => {
    if (!confirm('Deactivate the current theme and revert to default?')) return;

    try {
      if (user) {
        await supabase
          .from('custom_themes')
          .update({ is_active: false })
          .eq('user_id', user.id);
      }

      setThemes(themes.map(t => ({ ...t, isActive: false })));
      clearThemeFromApp();
      setSuccess('All themes deactivated. Using default app theme.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deactivating themes:', err);
      setError('Failed to deactivate themes. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <BetaGuard>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.location.hash = ''}
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Back to Beta Features
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
            <Palette className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Custom Themes</h2>
            <p className="text-slate-600 dark:text-slate-400">Create themes manually or let AI generate them for you</p>
          </div>
        </div>
      </div>

      <div className="mb-6 glass rounded-xl p-4 shadow-sm bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-100 dark:border-violet-800">
        <div className="flex items-start gap-3">
          <Sparkles className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI-Powered Theme Generation</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Describe your ideal theme and let AI create harmonious color palettes based on color theory and mood analysis.
              Try descriptions like "warm autumn evening" or "calm ocean morning" for best results.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Themes</h3>
              <div className="flex items-center gap-2">
                {themes.some(t => t.isActive) && (
                  <button
                    onClick={deactivateAllThemes}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    title="Deactivate Theme"
                  >
                    <X size={18} />
                    Deactivate
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAIGenerator(!showAIGenerator);
                    setIsCreating(false);
                    setError(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Sparkles size={18} />
                  AI Generate
                </button>
                <button
                  onClick={() => {
                    setIsCreating(!isCreating);
                    setShowAIGenerator(false);
                    setError(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus size={18} />
                  {isCreating ? 'Cancel' : 'Manual'}
                </button>
              </div>
            </div>

            {showAIGenerator && (
              <div className="mb-6 p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl border-2 border-violet-200 dark:border-violet-800 space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="text-violet-600 dark:text-violet-400" size={24} />
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">AI Theme Generator</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Describe your ideal theme
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'cozy autumn evening', 'vibrant ocean waves', 'calm forest morning', 'professional dark mode'"
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-900 dark:text-white resize-none"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Try words like: cozy, vibrant, calm, dark, professional, nature, sunset, midnight
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={generateAITheme}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Theme
                      </>
                    )}
                  </button>
                  <button
                    onClick={generateRandomTheme}
                    className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    title="Generate Random Theme"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>

                <div className="pt-3 border-t border-violet-200 dark:border-violet-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium">Quick Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Cozy Autumn', 'Ocean Breeze', 'Midnight Sky', 'Spring Garden', 'Sunset Glow', 'Forest Trail'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setAiPrompt(suggestion)}
                        className="px-3 py-1 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-700 text-slate-700 dark:text-slate-300 rounded-full text-xs hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isCreating && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Theme Name
                  </label>
                  <button
                    onClick={generateRandomTheme}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    Randomize Colors
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    placeholder="My Custom Theme"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={newTheme.primary}
                      onChange={(e) => setNewTheme({ ...newTheme, primary: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={newTheme.secondary}
                      onChange={(e) => setNewTheme({ ...newTheme, secondary: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={newTheme.accent}
                      onChange={(e) => setNewTheme({ ...newTheme, accent: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Background
                    </label>
                    <input
                      type="color"
                      value={newTheme.background}
                      onChange={(e) => setNewTheme({ ...newTheme, background: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Surface
                    </label>
                    <input
                      type="color"
                      value={newTheme.surface}
                      onChange={(e) => setNewTheme({ ...newTheme, surface: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={newTheme.text}
                      onChange={(e) => setNewTheme({ ...newTheme, text: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={createTheme}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Save size={18} />
                  Create Theme
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
              </div>
            ) : (
              <div className="space-y-3">
                {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedTheme === theme.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.primary }}></div>
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.secondary }}></div>
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.accent }}></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{theme.name}</h4>
                        {theme.isActive && (
                          <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!theme.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            activateTheme(theme.id);
                          }}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Activate Theme"
                        >
                          <Check className="text-slate-600 dark:text-slate-400" size={18} />
                        </button>
                      )}
                      {!defaultThemes.some(t => t.id === theme.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTheme(theme.id);
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete Theme"
                        >
                          <Trash2 className="text-red-600 dark:text-red-400" size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Theme Preview</h3>

          {!selectedTheme && !isCreating && (
            <div className="flex items-center justify-center h-96 text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <Eye size={48} className="mx-auto mb-3 opacity-30" />
                <p>Select a theme to preview it</p>
              </div>
            </div>
          )}

          {(selectedTheme || isCreating) && (
            <div
              className="rounded-xl p-6 space-y-4"
              style={{ backgroundColor: previewTheme.background }}
            >
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: previewTheme.surface }}
              >
                <h4
                  className="text-xl font-bold mb-2"
                  style={{ color: previewTheme.text }}
                >
                  Sample Heading
                </h4>
                <p
                  className="text-sm mb-3"
                  style={{ color: previewTheme.text, opacity: 0.7 }}
                >
                  This is how your text will look with this theme. The colors are carefully selected to ensure readability and visual harmony.
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: previewTheme.primary, color: '#ffffff' }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: previewTheme.secondary, color: '#ffffff' }}
                  >
                    Secondary
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: previewTheme.accent, color: '#ffffff' }}
                  >
                    Accent
                  </button>
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: previewTheme.surface }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{ backgroundColor: previewTheme.primary }}
                  ></div>
                  <div>
                    <h5
                      className="font-semibold"
                      style={{ color: previewTheme.text }}
                    >
                      Sample Card
                    </h5>
                    <p
                      className="text-sm"
                      style={{ color: previewTheme.text, opacity: 0.6 }}
                    >
                      Card subtitle text
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm"
                  style={{ color: previewTheme.text, opacity: 0.7 }}
                >
                  This preview shows how your theme will look across different UI elements in the application.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[previewTheme.primary, previewTheme.secondary, previewTheme.accent].map((color, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>

              <div
                className="rounded-lg p-4 border-2"
                style={{
                  backgroundColor: previewTheme.surface,
                  borderColor: previewTheme.primary
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: previewTheme.text }}
                >
                  Highlighted Element
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: previewTheme.text, opacity: 0.6 }}
                >
                  Elements with borders and highlights
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </BetaGuard>
  );
}
