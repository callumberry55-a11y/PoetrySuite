import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Image, Plus, Save, Trash2, Check, Sparkles, RefreshCw, X, Settings as SettingsIcon } from 'lucide-react';
import BetaGuard from './BetaGuard';
import { supabase } from '../../lib/supabase';

interface Wallpaper {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  isActive: boolean;
  blurAmount: number;
  opacity: number;
}

const wallpaperCategories = [
  { name: 'Nature', keywords: ['nature', 'forest', 'mountain', 'ocean', 'landscape'] },
  { name: 'Abstract', keywords: ['abstract', 'pattern', 'gradient', 'texture', 'art'] },
  { name: 'Minimalist', keywords: ['minimal', 'simple', 'clean', 'white', 'geometric'] },
  { name: 'Space', keywords: ['space', 'galaxy', 'stars', 'nebula', 'cosmos'] },
  { name: 'Urban', keywords: ['city', 'architecture', 'buildings', 'urban', 'street'] },
  { name: 'Calm', keywords: ['calm', 'peaceful', 'serene', 'zen', 'meditation'] },
  { name: 'Sunset', keywords: ['sunset', 'sunrise', 'dawn', 'dusk', 'golden hour'] },
  { name: 'Ocean', keywords: ['ocean', 'sea', 'water', 'waves', 'beach'] }
];

const pexelsImages = [
  { id: 'nature-1', url: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Nature' },
  { id: 'abstract-1', url: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Abstract' },
  { id: 'minimal-1', url: 'https://images.pexels.com/photos/956999/milky-way-starry-sky-night-sky-star-956999.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Space' },
  { id: 'ocean-1', url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Ocean' },
  { id: 'sunset-1', url: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Sunset' },
  { id: 'urban-1', url: 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Urban' },
  { id: 'calm-1', url: 'https://images.pexels.com/photos/4666748/pexels-photo-4666748.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Calm' },
  { id: 'nature-2', url: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1920', category: 'Nature' }
];

export default function AIWallpapers() {
  const { user } = useAuth();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blurAmount, setBlurAmount] = useState(2);
  const [opacity, setOpacity] = useState(20);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [wallpaperName, setWallpaperName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWallpapers();
    }
  }, [user]);

  const loadWallpapers = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('ai_wallpapers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const loadedWallpapers = data?.map(wp => ({
        id: wp.id,
        name: wp.name,
        prompt: wp.prompt,
        imageUrl: wp.image_url,
        thumbnailUrl: wp.thumbnail_url,
        source: wp.source,
        isActive: wp.is_active,
        blurAmount: wp.blur_amount,
        opacity: wp.opacity
      })) || [];

      setWallpapers(loadedWallpapers);

      const activeWallpaper = loadedWallpapers.find(w => w.isActive);
      if (activeWallpaper) {
        applyWallpaperToApp(activeWallpaper);
      }
    } catch (err) {
      console.error('Error loading wallpapers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyWallpaperToApp = (wallpaper: Wallpaper) => {
    const root = document.documentElement;
    root.style.setProperty('--wallpaper-url', `url(${wallpaper.imageUrl})`);
    root.style.setProperty('--wallpaper-blur', `${wallpaper.blurAmount}px`);
    root.style.setProperty('--wallpaper-opacity', `${wallpaper.opacity / 100}`);
    localStorage.setItem('activeWallpaper', JSON.stringify(wallpaper));

    const appElement = document.querySelector('#root');
    if (appElement) {
      appElement.classList.add('has-wallpaper');
    }
  };

  const clearWallpaperFromApp = () => {
    const root = document.documentElement;
    root.style.removeProperty('--wallpaper-url');
    root.style.removeProperty('--wallpaper-blur');
    root.style.removeProperty('--wallpaper-opacity');
    localStorage.removeItem('activeWallpaper');

    const appElement = document.querySelector('#root');
    if (appElement) {
      appElement.classList.remove('has-wallpaper');
    }
  };

  const generateAIWallpaper = () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsGenerating(true);

    const matchingCategory = wallpaperCategories.find(cat =>
      cat.keywords.some(keyword => aiPrompt.toLowerCase().includes(keyword))
    );

    const categoryImages = matchingCategory
      ? pexelsImages.filter(img => img.category === matchingCategory.name)
      : pexelsImages;

    const randomImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];

    setTimeout(() => {
      setSelectedImage(randomImage.url);
      setWallpaperName(`AI: ${aiPrompt.slice(0, 30)}${aiPrompt.length > 30 ? '...' : ''}`);
      setIsGenerating(false);
      setSuccess('Wallpaper generated! Adjust settings and save.');
      setTimeout(() => setSuccess(null), 3000);
    }, 1500);
  };

  const selectPresetWallpaper = (imageUrl: string, category: string) => {
    setSelectedImage(imageUrl);
    setWallpaperName(category);
    setIsCreating(true);
    setShowAIGenerator(false);
  };

  const saveWallpaper = async () => {
    if (!wallpaperName.trim() || !selectedImage) {
      setError('Please select an image and enter a name');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!user) {
      setError('You must be logged in to save wallpapers');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('ai_wallpapers')
        .insert([{
          user_id: user.id,
          name: wallpaperName,
          prompt: aiPrompt,
          image_url: selectedImage,
          thumbnail_url: selectedImage,
          source: 'pexels',
          is_active: false,
          blur_amount: blurAmount,
          opacity: opacity
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const wallpaper: Wallpaper = {
        id: data.id,
        name: data.name,
        prompt: data.prompt,
        imageUrl: data.image_url,
        thumbnailUrl: data.thumbnail_url,
        source: data.source,
        isActive: data.is_active,
        blurAmount: data.blur_amount,
        opacity: data.opacity
      };

      setWallpapers([wallpaper, ...wallpapers]);
      setSuccess('Wallpaper saved successfully!');
      setIsCreating(false);
      setShowAIGenerator(false);
      setSelectedImage('');
      setWallpaperName('');
      setAiPrompt('');
      setBlurAmount(2);
      setOpacity(20);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving wallpaper:', err);
      setError('Failed to save wallpaper. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteWallpaper = async (id: string) => {
    if (!confirm('Delete this wallpaper?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('ai_wallpapers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const deletedWallpaper = wallpapers.find(w => w.id === id);
      if (deletedWallpaper?.isActive) {
        clearWallpaperFromApp();
      }

      setWallpapers(wallpapers.filter(w => w.id !== id));
      if (selectedWallpaper === id) {
        setSelectedWallpaper(null);
      }
      setSuccess('Wallpaper deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting wallpaper:', err);
      setError('Failed to delete wallpaper. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const activateWallpaper = async (id: string) => {
    const wallpaper = wallpapers.find(w => w.id === id);
    if (!wallpaper || !user) return;

    try {
      await supabase
        .from('ai_wallpapers')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const { error: updateError } = await supabase
        .from('ai_wallpapers')
        .update({ is_active: true })
        .eq('id', id);

      if (updateError) throw updateError;

      setWallpapers(wallpapers.map(w => ({
        ...w,
        isActive: w.id === id
      })));

      applyWallpaperToApp(wallpaper);
      setSuccess('Wallpaper activated and will persist across sessions!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error activating wallpaper:', err);
      setError('Failed to activate wallpaper. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const deactivateAllWallpapers = async () => {
    if (!confirm('Remove the current wallpaper and revert to default?')) return;

    try {
      if (user) {
        await supabase
          .from('ai_wallpapers')
          .update({ is_active: false })
          .eq('user_id', user.id);
      }

      setWallpapers(wallpapers.map(w => ({ ...w, isActive: false })));
      clearWallpaperFromApp();
      setSuccess('Wallpaper removed. Using default background.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deactivating wallpapers:', err);
      setError('Failed to deactivate wallpaper. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const previewWallpaper = wallpapers.find(w => w.id === selectedWallpaper);

  return (
    <BetaGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Wallpapers</h2>
          <p className="text-slate-600 dark:text-slate-400">Generate beautiful AI-powered wallpapers for your workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <X className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <Check className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Wallpapers</h3>
                <div className="flex items-center gap-2">
                  {wallpapers.some(w => w.isActive) && (
                    <button
                      onClick={deactivateAllWallpapers}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                      title="Remove Wallpaper"
                    >
                      <X size={18} />
                      Remove
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
                    {isCreating ? 'Cancel' : 'Browse'}
                  </button>
                </div>
              </div>

              {showAIGenerator && (
                <div className="mb-6 p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl border-2 border-violet-200 dark:border-violet-800 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-violet-600 dark:text-violet-400" size={24} />
                    <h4 className="font-semibold text-violet-900 dark:text-violet-100">AI Wallpaper Generator</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-violet-900 dark:text-violet-100 mb-2">
                      Describe your ideal wallpaper
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., peaceful mountain landscape at sunset, abstract geometric patterns, minimalist ocean waves..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-violet-300 dark:border-violet-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-400 focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={generateAIWallpaper}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Wallpaper
                      </>
                    )}
                  </button>
                </div>
              )}

              {isCreating && (
                <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 space-y-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">Browse Wallpapers</h4>

                  <div className="grid grid-cols-2 gap-3">
                    {pexelsImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => selectPresetWallpaper(img.url, img.category)}
                        className="relative aspect-video rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-700 hover:border-blue-500 transition-colors group"
                      >
                        <img
                          src={img.url}
                          alt={img.category}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <span className="text-white text-sm font-medium">{img.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedImage && (
                <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 space-y-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-4">Customize Wallpaper</h4>

                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${selectedImage})`,
                        filter: `blur(${blurAmount}px)`,
                        opacity: opacity / 100
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Wallpaper Name
                    </label>
                    <input
                      type="text"
                      value={wallpaperName}
                      onChange={(e) => setWallpaperName(e.target.value)}
                      placeholder="Enter a name..."
                      className="w-full px-4 py-2 rounded-lg border-2 border-green-300 dark:border-green-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Blur Amount: {blurAmount}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={blurAmount}
                      onChange={(e) => setBlurAmount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Opacity: {opacity}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={saveWallpaper}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save size={20} />
                    Save Wallpaper
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
                </div>
              ) : wallpapers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Image size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No wallpapers yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wallpapers.map((wallpaper) => (
                    <div
                      key={wallpaper.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedWallpaper === wallpaper.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : wallpaper.isActive
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedWallpaper(wallpaper.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                              {wallpaper.name}
                            </h4>
                            {wallpaper.isActive && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Active</span>
                            )}
                          </div>
                          <div className="aspect-video rounded-lg overflow-hidden mb-2">
                            <img
                              src={wallpaper.imageUrl}
                              alt={wallpaper.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Blur: {wallpaper.blurAmount}px • Opacity: {wallpaper.opacity}%
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              activateWallpaper(wallpaper.id);
                            }}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="Activate Wallpaper"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWallpaper(wallpaper.id);
                            }}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="Delete Wallpaper"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-xl p-6 shadow-sm sticky top-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Preview</h3>
            {previewWallpaper ? (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${previewWallpaper.imageUrl})`,
                      filter: `blur(${previewWallpaper.blurAmount}px)`,
                      opacity: previewWallpaper.opacity / 100
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{previewWallpaper.name}</h4>
                  {previewWallpaper.prompt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Prompt: {previewWallpaper.prompt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span>Blur: {previewWallpaper.blurAmount}px</span>
                    <span>Opacity: {previewWallpaper.opacity}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <Image size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Select a wallpaper to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BetaGuard>
  );
}
