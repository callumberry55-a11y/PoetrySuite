import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Palette, Plus, Save, Trash2, Eye, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import BetaGuard from './BetaGuard';

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

export default function CustomThemes() {
  const { user } = useAuth();
  const [themes, setThemes] = useState<CustomTheme[]>(defaultThemes);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
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

  const createTheme = () => {
    if (!newTheme.name.trim()) {
      setError('Please enter a theme name');
      return;
    }

    const theme: CustomTheme = {
      id: Date.now().toString(),
      ...newTheme,
      isActive: false
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
  };

  const deleteTheme = (id: string) => {
    if (confirm('Delete this theme?')) {
      setThemes(themes.filter(t => t.id !== id));
      if (selectedTheme === id) {
        setSelectedTheme(null);
      }
      setSuccess('Theme deleted');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const activateTheme = (id: string) => {
    setThemes(themes.map(t => ({
      ...t,
      isActive: t.id === id
    })));
    setSuccess('Theme activated! (Note: This is a preview feature)');
    setTimeout(() => setSuccess(null), 3000);
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
            <p className="text-slate-600 dark:text-slate-400">Create and customize your own color themes</p>
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
              <button
                onClick={() => {
                  setIsCreating(!isCreating);
                  setError(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                {isCreating ? 'Cancel' : 'New Theme'}
              </button>
            </div>

            {isCreating && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Theme Name
                  </label>
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
