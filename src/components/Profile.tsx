import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  MapPin,
  Globe,
  Edit2,
  Save,
  X,
  Award,
  Flame,
  Coins
} from 'lucide-react';

interface UserProfile {
  user_id: string;
  username: string;
  bio: string;
  avatar_url: string;
  location: string;
  website: string;
  favorite_forms: string[];
  writing_style: string;
  follower_count: number;
  following_count: number;
  total_likes_received: number;
  is_editor: boolean;
  is_mentor: boolean;
  points_balance: number;
  points_earned_total: number;
}

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rank: string;
  points: number;
  earned_at: string;
}

interface WritingStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [streak, setStreak] = useState<WritingStreak | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [poemCount, setPoemCount] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const createProfile = useCallback(async () => {
    if (!user) return;

    const username = user.email?.split('@')[0] || 'user';
    const newProfile = {
      user_id: user.id,
      username,
      bio: '',
      avatar_url: '',
      location: '',
      website: '',
      favorite_forms: [],
      writing_style: '',
      follower_count: 0,
      following_count: 0,
      total_likes_received: 0,
      is_editor: false,
      is_mentor: false
    };

    const { error } = await supabase
      .from('user_profiles')
      .insert(newProfile);

    if (error) {
      console.error('Error creating profile:', error);
      setLoadError(true);
      return;
    }
  }, [user]);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoadError(false);

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      setLoadError(true);
      return;
    }

    if (!data) {
      await createProfile();
      const { data: newData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (newData) {
        setProfile(newData);
        setEditForm(newData);
      }
      return;
    }

    setProfile(data);
    setEditForm(data);
  }, [user, createProfile]);

  const loadBadges = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        earned_at,
        badges (
          name,
          description,
          icon,
          rank,
          points
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading badges:', error);
      return;
    }

    const formattedBadges = data.map((item: any) => ({
      id: item.id,
      name: item.badges.name,
      description: item.badges.description,
      icon: item.badges.icon,
      rank: item.badges.rank,
      points: item.badges.points,
      earned_at: item.earned_at
    }));

    setBadges(formattedBadges);
  }, [user]);

  const loadStreak = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('writing_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading streak:', error);
      return;
    }

    setStreak(data);
  }, [user]);

  const loadPoemCount = useCallback(async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from('poems')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading poem count:', error);
      return;
    }

    setPoemCount(count || 0);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadBadges();
      loadStreak();
      loadPoemCount();
    }
  }, [user, loadProfile, loadBadges, loadStreak, loadPoemCount]);

  const saveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update(editForm)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
      return;
    }

    setIsEditing(false);
    loadProfile();
  };

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 text-center">
          <p className="text-red-800 dark:text-red-200 mb-4">
            Unable to load your profile. Please try refreshing the page.
          </p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 pb-24">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                {profile.username}
              </h1>
              {profile.location && (
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 mt-1">
                  <MapPin size={14} />
                  <span className="text-sm truncate">{profile.location}</span>
                </div>
              )}
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-colors touch-manipulation whitespace-nowrap"
            >
              <Edit2 size={16} />
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Edit</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg transition-colors touch-manipulation"
              >
                <Save size={16} />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(profile);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors touch-manipulation"
              >
                <X size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{poemCount}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Poems</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{profile.follower_count}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Followers</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-500">{profile.following_count}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Following</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-500">{profile.total_likes_received}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Likes</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins size={16} className="text-yellow-600 dark:text-yellow-400" />
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {profile.points_balance || 0}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">Points</div>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Bio
              </label>
              <textarea
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Website
              </label>
              <input
                type="url"
                value={editForm.website || ''}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Writing Style
              </label>
              <textarea
                value={editForm.writing_style || ''}
                onChange={(e) => setEditForm({ ...editForm, writing_style: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Describe your writing style..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">About</h3>
                <p className="text-slate-600 dark:text-slate-400">{profile.bio}</p>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2 text-blue-500">
                <Globe size={16} />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {profile.website}
                </a>
              </div>
            )}
            {profile.writing_style && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Writing Style</h3>
                <p className="text-slate-600 dark:text-slate-400">{profile.writing_style}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {streak && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Flame className="text-orange-500" size={18} />
            Writing Streak
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{streak.current_streak}</div>
              <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Current Streak</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{streak.longest_streak}</div>
              <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Longest Streak</div>
            </div>
          </div>
        </div>
      )}

      {badges.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" size={18} />
            Badges ({badges.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-3 sm:p-4 text-center"
              >
                <div className="text-2xl sm:text-3xl mb-2">{badge.icon === 'award' ? '🏆' : badge.icon === 'flame' ? '🔥' : badge.icon === 'heart' ? '❤️' : '🎖️'}</div>
                <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{badge.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{badge.description}</div>
                {badge.rank && (
                  <div className="mt-2 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    {badge.rank} • {badge.points} pts
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
