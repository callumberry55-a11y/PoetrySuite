import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface Story {
  id: string;
  user_id: string;
  content_url: string;
  content_type: 'image' | 'video';
  caption: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  username: string;
  avatar_url?: string;
  has_viewed: boolean;
}

interface StoryGroup {
  user_id: string;
  username: string;
  avatar_url?: string;
  stories: Story[];
  has_unviewed: boolean;
}

export default function Stories() {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StoryGroup | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      loadStories();
    }
  }, [user]);

  // Auto-advance story progress
  useEffect(() => {
    if (selectedGroup && selectedGroup.stories[currentStoryIndex]) {
      setProgress(0);
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 2;
        });
      }, 100); // 5 seconds per story (100 * 50ms)

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [selectedGroup, currentStoryIndex]);

  const loadStories = async () => {
    if (!user) return;

    // Get all non-expired stories with user info
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        *,
        user_profiles!inner(username, avatar_url)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading stories:', error);
      return;
    }

    // Get stories the current user has viewed
    const { data: viewedStories } = await supabase
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', user.id);

    const viewedStoryIds = new Set(viewedStories?.map((v) => v.story_id) || []);

    // Format stories with user info
    const formattedStories: Story[] = stories.map((story: any) => ({
      id: story.id,
      user_id: story.user_id,
      content_url: story.content_url,
      content_type: story.content_type,
      caption: story.caption,
      created_at: story.created_at,
      expires_at: story.expires_at,
      view_count: story.view_count,
      username: story.user_profiles.username,
      avatar_url: story.user_profiles.avatar_url,
      has_viewed: viewedStoryIds.has(story.id),
    }));

    // Group stories by user
    const grouped = formattedStories.reduce((acc, story) => {
      const existingGroup = acc.find((g) => g.user_id === story.user_id);
      if (existingGroup) {
        existingGroup.stories.push(story);
        if (!story.has_viewed) {
          existingGroup.has_unviewed = true;
        }
      } else {
        acc.push({
          user_id: story.user_id,
          username: story.username,
          avatar_url: story.avatar_url,
          stories: [story],
          has_unviewed: !story.has_viewed,
        });
      }
      return acc;
    }, [] as StoryGroup[]);

    // Put current user's stories first
    const userStories = grouped.filter((g) => g.user_id === user.id);
    const otherStories = grouped.filter((g) => g.user_id !== user.id);

    setStoryGroups([...userStories, ...otherStories]);
  };

  const openStoryViewer = async (group: StoryGroup, startIndex = 0) => {
    setSelectedGroup(group);
    setCurrentStoryIndex(startIndex);
    setProgress(0);

    // Mark first story as viewed
    if (group.stories[startIndex] && group.stories[startIndex].user_id !== user?.id) {
      await markStoryViewed(group.stories[startIndex].id);
    }
  };

  const markStoryViewed = async (storyId: string) => {
    if (!user) return;

    await supabase
      .from('story_views')
      .insert({
        story_id: storyId,
        viewer_id: user.id,
      })
      .select()
      .maybeSingle();

    // Reload to update viewed status
    loadStories();
  };

  const nextStory = async () => {
    if (!selectedGroup) return;

    if (currentStoryIndex < selectedGroup.stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setProgress(0);

      // Mark as viewed
      if (selectedGroup.stories[nextIndex].user_id !== user?.id) {
        await markStoryViewed(selectedGroup.stories[nextIndex].id);
      }
    } else {
      // Move to next user's stories
      const currentGroupIndex = storyGroups.findIndex(
        (g) => g.user_id === selectedGroup.user_id
      );
      if (currentGroupIndex < storyGroups.length - 1) {
        openStoryViewer(storyGroups[currentGroupIndex + 1], 0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const previousStory = () => {
    if (!selectedGroup) return;

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else {
      // Move to previous user's stories
      const currentGroupIndex = storyGroups.findIndex(
        (g) => g.user_id === selectedGroup.user_id
      );
      if (currentGroupIndex > 0) {
        const prevGroup = storyGroups[currentGroupIndex - 1];
        openStoryViewer(prevGroup, prevGroup.stories.length - 1);
      }
    }
  };

  const closeStoryViewer = () => {
    setSelectedGroup(null);
    setCurrentStoryIndex(0);
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadStory = async () => {
    if (!uploadFile || !user) return;

    setUploading(true);

    // Upload file to Supabase Storage
    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const contentType = uploadFile.type.startsWith('video/') ? 'video' : 'image';

    const { error: uploadError, data } = await supabase.storage
      .from('stories')
      .upload(fileName, uploadFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Failed to upload story');
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stories')
      .getPublicUrl(fileName);

    // Create story record
    const { error: dbError } = await supabase.from('stories').insert({
      user_id: user.id,
      content_url: urlData.publicUrl,
      content_type: contentType,
      caption: caption,
    });

    if (dbError) {
      console.error('Database error:', dbError);
      alert('Failed to create story');
      setUploading(false);
      return;
    }

    setUploading(false);
    setShowCreateModal(false);
    setUploadFile(null);
    setPreviewUrl('');
    setCaption('');
    loadStories();
  };

  const currentStory = selectedGroup?.stories[currentStoryIndex];

  return (
    <>
      {/* Stories Horizontal Scroll */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 overflow-x-auto">
        <div className="flex gap-3">
          {/* Add Story Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
              <Plus size={24} className="text-white" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate w-full text-center">
              Add Story
            </span>
          </button>

          {/* Story Circles */}
          {storyGroups.map((group) => (
            <button
              key={group.user_id}
              onClick={() => openStoryViewer(group, 0)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 ${
                  group.has_unviewed
                    ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 p-0.5">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold">
                    {group.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate w-full text-center">
                {group.user_id === user?.id ? 'You' : group.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedGroup && currentStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
            {selectedGroup.stories.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: `${
                      index < currentStoryIndex
                        ? 100
                        : index === currentStoryIndex
                        ? progress
                        : 0
                    }%`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                {selectedGroup.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-white font-medium">
                  {selectedGroup.username}
                </div>
                <div className="text-white/70 text-sm">
                  {new Date(currentStory.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <button
              onClick={closeStoryViewer}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Story Content */}
          <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center">
            {currentStory.content_type === 'image' ? (
              <img
                src={currentStory.content_url}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={currentStory.content_url}
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted
                playsInline
              />
            )}

            {/* Navigation Areas */}
            <button
              onClick={previousStory}
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
              aria-label="Previous story"
            />
            <button
              onClick={nextStory}
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
              aria-label="Next story"
            />

            {/* Navigation Buttons */}
            <button
              onClick={previousStory}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={nextStory}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-20 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
              {currentStory.caption}
            </div>
          )}

          {/* View Count (for own stories) */}
          {currentStory.user_id === user?.id && (
            <div className="absolute bottom-6 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-white">
              <Eye size={16} />
              <span className="text-sm">{currentStory.view_count} views</span>
            </div>
          )}
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Create Story
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setUploadFile(null);
                  setPreviewUrl('');
                  setCaption('');
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>

            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex flex-col items-center justify-center py-6">
                  <Upload size={48} className="text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Click to upload image or video
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Story will expire in 24 hours
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  {uploadFile?.type.startsWith('video/') ? (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Caption (optional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Add a caption..."
                    maxLength={200}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setPreviewUrl('');
                    }}
                    className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    disabled={uploading}
                  >
                    Change
                  </button>
                  <button
                    onClick={uploadStory}
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Share Story'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
