import { useState, useEffect } from 'react';
import { Palette, Check, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ThemeManager() {
  const { user } = useAuth();
  const [customThemes, setCustomThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomThemes();
  }, [user]);

  const loadCustomThemes = async () => {
    if (!user) return;

    try {
      const { supabase } = await import('../lib/supabase');
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
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <Palette className="text-white" size={24} />
            <h2 className="text-xl font-bold text-white">Advanced Theme Customization</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Advanced theme customization is coming soon. Create custom color schemes, fonts, and layouts to personalize your Poetry Suite experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="text-blue-600 dark:text-blue-400" size={24} />
                <h4 className="font-bold text-blue-900 dark:text-blue-100">Color Schemes</h4>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Customize colors for backgrounds, text, and accents
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Download className="text-violet-600 dark:text-violet-400" size={24} />
                <h4 className="font-bold text-violet-900 dark:text-violet-100">Import Themes</h4>
              </div>
              <p className="text-sm text-violet-800 dark:text-violet-200">
                Download and import community-created themes
              </p>
            </div>
          </div>

          {customThemes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Custom Themes</h3>
              <div className="space-y-3">
                {customThemes.map((theme, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg shadow-md"
                        style={{ background: theme.primaryColor || '#3b82f6' }}
                      ></div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{theme.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {theme.description || 'Custom theme'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Check size={20} />
                      </button>
                      <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
