import { useState, useEffect } from 'react';
import { Palette, Download, Upload, Trash2, Check, Sparkles, Sun, Waves, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import {
  getAllThemes,
  getUserThemePreferences,
  saveUserThemePreferences,
  applyThemeToDocument,
  deleteTheme,
  generateAITheme,
  type Theme
} from '../utils/themes';
import { useToast } from '../contexts/ToastContext';

export default function ThemeManager() {
  const { user } = useAuth();
  const { refreshTheme } = useTheme();
  const { showToast } = useToast();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'browse' | 'import' | 'ai'>('browse');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [importData, setImportData] = useState('');

  useEffect(() => {
    loadThemes();
  }, [user]);

  const loadThemes = async () => {
    if (!user) return;

    try {
      const [allThemes, preferences] = await Promise.all([
        getAllThemes(),
        getUserThemePreferences(user.id)
      ]);

      setThemes(allThemes);
      setActiveThemeId(preferences?.active_theme_id || null);

      if (preferences?.active_theme_id) {
        const activeTheme = allThemes.find(t => t.id === preferences.active_theme_id);
        if (activeTheme) {
          applyThemeToDocument(activeTheme);
        }
      }
    } catch (error) {
      console.error('Error loading themes:', error);
      showToast('Failed to load themes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTheme = async (theme: Theme) => {
    if (!user) return;

    try {
      applyThemeToDocument(theme);
      await saveUserThemePreferences(user.id, { active_theme_id: theme.id });
      setActiveThemeId(theme.id);
      await refreshTheme();
      showToast(`${theme.name} theme applied`, 'success');
    } catch (error) {
      console.error('Error applying theme:', error);
      showToast('Failed to apply theme', 'error');
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!user || !confirm('Are you sure you want to delete this custom theme?')) return;

    try {
      await deleteTheme(themeId);
      setThemes(themes.filter(t => t.id !== themeId));
      if (activeThemeId === themeId) {
        setActiveThemeId(null);
      }
      showToast('Theme deleted', 'success');
    } catch (error) {
      console.error('Error deleting theme:', error);
      showToast('Failed to delete theme', 'error');
    }
  };

  const handleGenerateAITheme = async () => {
    if (!user || !aiPrompt.trim()) return;

    setGenerating(true);
    try {
      const newTheme = await generateAITheme(aiPrompt, user.id);
      setThemes([...themes, newTheme]);
      setAiPrompt('');
      showToast('AI theme generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating AI theme:', error);
      showToast('Failed to generate AI theme', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportTheme = (theme: Theme) => {
    const exportData = {
      name: theme.name,
      type: theme.type,
      colors: theme.colors,
      settings: theme.settings
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Theme exported', 'success');
  };

  const handleImportTheme = async () => {
    if (!user || !importData.trim()) return;

    try {
      const themeData = JSON.parse(importData);

      if (!themeData.name || !themeData.type || !themeData.colors) {
        throw new Error('Invalid theme format');
      }

      const { data, error } = await supabase
        .from('themes')
        .insert({
          name: themeData.name + ' (Imported)',
          type: themeData.type,
          colors: themeData.colors,
          settings: themeData.settings || {},
          is_premium: false,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setThemes([...themes, data]);
      setImportData('');
      showToast('Theme imported successfully!', 'success');
    } catch (error) {
      console.error('Error importing theme:', error);
      showToast('Failed to import theme. Check the format.', 'error');
    }
  };

  const getThemeIcon = (type: string) => {
    switch (type) {
      case 'adaptive': return Sun;
      case 'live': return Waves;
      case 'ai-generated': return Sparkles;
      default: return Palette;
    }
  };

  const getColorPreview = (theme: Theme) => {
    if (theme.type === 'adaptive' && typeof theme.colors === 'object') {
      const firstKey = Object.keys(theme.colors)[0];
      return theme.colors[firstKey]?.primary || '#3b82f6';
    } else if (theme.type === 'live') {
      return theme.colors.base || '#6366f1';
    } else if (typeof theme.colors === 'object') {
      return theme.colors.primary || '#3b82f6';
    }
    return '#3b82f6';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-shrink-0 bg-primary text-on-primary p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Palette size={28} className="sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">Theme Manager</h1>
          </div>
          <p className="text-sm sm:text-base text-on-primary/80">
            Customize your Poetry Suite experience with beautiful themes
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 bg-surface border-b border-outline/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 sm:gap-2">
            {[
              { id: 'browse', label: 'Browse Themes', icon: Palette, beta: false },
              { id: 'import', label: 'Import/Export', icon: Download, beta: false },
              { id: 'ai', label: 'AI Generator', icon: Sparkles, beta: true }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                    selectedTab === tab.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.beta && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded font-bold">
                      BETA
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          {selectedTab === 'browse' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm text-amber-900 dark:text-amber-100 font-semibold mb-1">
                      Advanced Themes (Beta)
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      Adaptive, Live, and AI-generated themes are experimental features. They may not work perfectly in all situations. If you experience issues, please switch back to a standard theme.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => {
                  const Icon = getThemeIcon(theme.type);
                  const isActive = theme.id === activeThemeId;
                  const isCustom = theme.created_by === user?.id;

                  return (
                    <div
                      key={theme.id}
                      className={`relative bg-surface rounded-2xl p-4 border-2 transition-all ${
                        isActive
                          ? 'border-primary shadow-lg'
                          : 'border-outline/20 hover:border-primary/30'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -top-2 -right-2 bg-primary text-on-primary rounded-full p-2">
                          <Check size={16} />
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-16 h-16 rounded-xl shadow-md flex items-center justify-center"
                          style={{ backgroundColor: getColorPreview(theme) }}
                        >
                          <Icon size={24} className="text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-on-surface truncate">{theme.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 bg-primary-container text-on-primary-container rounded-full capitalize">
                              {theme.type}
                            </span>
                            {theme.is_premium && (
                              <span className="text-xs px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full">
                                Premium
                              </span>
                            )}
                            {(theme.type === 'adaptive' || theme.type === 'live' || theme.type === 'ai-generated') && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full font-semibold flex items-center gap-1">
                                <Zap size={10} />
                                BETA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">
                        {theme.settings?.description || 'Custom theme'}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplyTheme(theme)}
                          className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-all text-sm"
                        >
                          {isActive ? 'Active' : 'Apply'}
                        </button>
                        <button
                          onClick={() => handleExportTheme(theme)}
                          className="p-2 bg-secondary-container text-on-secondary-container rounded-xl hover:bg-secondary-container/80 transition-all"
                          title="Export theme"
                        >
                          <Download size={18} />
                        </button>
                        {isCustom && (
                          <button
                            onClick={() => handleDeleteTheme(theme.id)}
                            className="p-2 bg-error-container text-on-error-container rounded-xl hover:bg-error-container/80 transition-all"
                            title="Delete theme"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <div className="flex items-center gap-3 mb-4">
                  <Upload size={24} className="text-primary" />
                  <h2 className="text-xl font-bold text-on-surface">Import Theme</h2>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">
                  Paste theme JSON data below to import a custom theme
                </p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='{"name": "My Theme", "type": "static", "colors": {...}}'
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-outline/30 text-on-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
                />
                <button
                  onClick={handleImportTheme}
                  disabled={!importData.trim()}
                  className="mt-4 w-full sm:w-auto px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  Import Theme
                </button>
              </div>

              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <div className="flex items-center gap-3 mb-4">
                  <Download size={24} className="text-primary" />
                  <h2 className="text-xl font-bold text-on-surface">Export Themes</h2>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">
                  Click the download icon on any theme card to export it as JSON
                </p>
              </div>
            </div>
          )}

          {selectedTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 sm:p-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={24} className="text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-on-surface">AI Theme Generator</h2>
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full font-bold flex items-center gap-1">
                        <Zap size={12} />
                        BETA
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">
                  Describe your ideal theme and let AI create it for you
                </p>

                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      <strong>Beta Feature:</strong> AI-generated themes are experimental and may produce unexpected results. Generated themes are saved to your account and can be deleted if needed.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateAITheme()}
                    placeholder="e.g., warm sunset over the ocean, minimalist zen garden, cyberpunk neon..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-outline/30 text-on-background focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={generating}
                  />
                  <button
                    onClick={handleGenerateAITheme}
                    disabled={!aiPrompt.trim() || generating}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Theme
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-outline/20">
                <h3 className="text-lg font-bold text-on-surface mb-4">Example Prompts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Warm autumn forest at sunset',
                    'Deep ocean with bioluminescence',
                    'Minimalist Japanese zen garden',
                    'Vibrant tropical paradise',
                    'Cozy coffee shop in winter',
                    'Starry night sky over mountains'
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setAiPrompt(example)}
                      className="px-4 py-2 bg-primary-container text-on-primary-container rounded-xl text-sm font-medium hover:bg-primary-container/80 transition-all text-left"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
