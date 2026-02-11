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
  Coins,
  Camera,
  Upload,
  Loader2
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload the new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setEditForm(prev => ({ ...prev, avatar_url: publicUrl }));
      setAvatarPreview(publicUrl);

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    // Only update fields that users are allowed to edit
    const allowedFields = {
      username: editForm.username,
      bio: editForm.bio,
      avatar_url: editForm.avatar_url,
      location: editForm.location,
      website: editForm.website,
      favorite_forms: editForm.favorite_forms,
      writing_style: editForm.writing_style,
    };

    const { error } = await supabase
      .from('user_profiles')
      .update(allowedFields)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile: ' + error.message);
      return;
    }

    setIsEditing(false);
    setAvatarPreview(null);
    loadProfile();
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-md shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-600 dark:text-red-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Unable to Load Profile
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please try refreshing the page
          </p>
          <button
            onClick={loadProfile}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 sm:-mt-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative group">
                  {(avatarPreview || profile.avatar_url) ? (
                    <img
                      src={avatarPreview || profile.avatar_url}
                      alt={profile.username}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-2xl ring-4 ring-white dark:ring-slate-900"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white text-3xl sm:text-5xl font-bold shadow-2xl ring-4 ring-white dark:ring-slate-900">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="text-white animate-spin" size={32} />
                      ) : (
                        <Camera className="text-white" size={32} />
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white truncate mb-2">
                    {profile.username}
                  </h1>
                  {profile.location && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                      <MapPin size={16} />
                      <span className="text-sm sm:text-base truncate">{profile.location}</span>
                    </div>
                  )}
                  {(profile.is_editor || profile.is_mentor) && (
                    <div className="flex gap-2 mt-2">
                      {profile.is_editor && (
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                          EDITOR
                        </span>
                      )}
                      {profile.is_mentor && (
                        <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                          MENTOR
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditForm(profile);
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 whitespace-nowrap"
                >
                  <Edit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={saveProfile}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                    <Save size={18} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile);
                      setAvatarPreview(null);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 text-center hover:shadow-lg transition-all border border-blue-100 dark:border-blue-900/30">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  {poemCount}
                </div>
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Poems</div>
              </div>
              <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 text-center hover:shadow-lg transition-all border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  {profile.follower_count}
                </div>
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Followers</div>
              </div>
              <div className="group bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl p-5 text-center hover:shadow-lg transition-all border border-sky-100 dark:border-sky-900/30">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-1">
                  {profile.following_count}
                </div>
                <div className="text-sm font-semibold text-sky-700 dark:text-sky-300">Following</div>
              </div>
              <div className="group bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-5 text-center hover:shadow-lg transition-all border border-rose-100 dark:border-rose-900/30">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  {profile.total_likes_received}
                </div>
                <div className="text-sm font-semibold text-rose-700 dark:text-rose-300">Likes</div>
              </div>
              <div className="group bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-5 text-center hover:shadow-lg transition-all border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Coins size={20} className="text-amber-600 dark:text-amber-400" />
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                    {profile.points_balance || 0}
                  </div>
                </div>
                <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">Points</div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-900/40">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative group">
                      {(avatarPreview || profile.avatar_url) ? (
                        <img
                          src={avatarPreview || profile.avatar_url}
                          alt="Preview"
                          className="w-20 h-20 rounded-full object-cover shadow-lg ring-2 ring-blue-500"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-2 ring-blue-500">
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="avatar-upload-button"
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold cursor-pointer transition-all ${
                          uploadingAvatar
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
                        }`}
                      >
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            <span>Upload Photo</span>
                          </>
                        )}
                        <input
                          id="avatar-upload-button"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        JPG, PNG, GIF or WebP. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website || ''}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Writing Style
                  </label>
                  <textarea
                    value={editForm.writing_style || ''}
                    onChange={(e) => setEditForm({ ...editForm, writing_style: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Describe your writing style..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.bio && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">About</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                      <Globe size={18} />
                    </div>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline font-medium"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.writing_style && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Writing Style</h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profile.writing_style}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {streak && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <Flame className="text-white" size={24} />
              </div>
              <span>Writing Streak</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="group relative bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border-2 border-orange-100 dark:border-orange-900/30 hover:shadow-lg transition-all">
                <div className="absolute top-4 right-4">
                  <Flame className="text-orange-500 dark:text-orange-400" size={32} />
                </div>
                <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {streak.current_streak}
                </div>
                <div className="text-sm sm:text-base font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                  Current Streak
                </div>
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                  Keep it going!
                </div>
              </div>
              <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-all">
                <div className="absolute top-4 right-4">
                  <Award className="text-blue-500 dark:text-blue-400" size={32} />
                </div>
                <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {streak.longest_streak}
                </div>
                <div className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  Longest Streak
                </div>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Personal best
                </div>
              </div>
            </div>
          </div>
        )}

        {badges.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl shadow-lg">
                <Award className="text-white" size={24} />
              </div>
              <span>Badges</span>
              <span className="ml-auto text-base sm:text-lg font-semibold px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                {badges.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const getRankColor = (rank: string) => {
                  if (rank.toLowerCase().includes('gold') || rank.toLowerCase().includes('éire')) {
                    return 'from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-200 dark:border-amber-900/40';
                  } else if (rank.toLowerCase().includes('silver')) {
                    return 'from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-200 dark:border-slate-700';
                  } else if (rank.toLowerCase().includes('bronze')) {
                    return 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-900/40';
                  }
                  return 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-900/40';
                };

                return (
                  <div
                    key={badge.id}
                    className={`group bg-gradient-to-br ${getRankColor(badge.rank)} rounded-2xl p-5 text-center border-2 hover:shadow-xl transition-all hover:scale-105`}
                  >
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {badge.icon === 'award' ? '🏆' : badge.icon === 'flame' ? '🔥' : badge.icon === 'heart' ? '❤️' : badge.icon === 'star' ? '⭐' : '🎖️'}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
                      {badge.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                      {badge.description}
                    </div>
                    {badge.rank && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1 bg-white/50 dark:bg-slate-900/50 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-full">
                          {badge.rank}
                        </span>
                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-xs font-bold text-amber-700 dark:text-amber-300 rounded-full">
                          {badge.points} pts
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
