import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Users, Search, Plus, X, Lock, Globe } from 'lucide-react';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  is_private: boolean;
  created_at: string;
}

export default function StudyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    topic: '',
    is_private: false
  });

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await supabase.from('study_group_members').insert({
        group_id: groupId,
        user_id: user?.id,
        role: 'member'
      });
      loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroup.name.trim()) return;

    setCreating(true);
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          topic: newGroup.topic,
          is_private: newGroup.is_private,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      await supabase.from('study_group_members').insert({
        group_id: groupData.id,
        user_id: user.id,
        role: 'admin'
      });

      setNewGroup({ name: '', description: '', topic: '', is_private: false });
      setShowCreateModal(false);
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create study group');
    } finally {
      setCreating(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    !searchQuery ||
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Study Groups
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Create Group
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-3">
                {group.topic}
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {group.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {group.description}
              </p>
              <button
                onClick={() => handleJoinGroup(group.id)}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Join Group
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create Study Group
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-5">
              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Group Name *
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Poetry Writing Workshop"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="group-topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Topic *
                </label>
                <input
                  id="group-topic"
                  type="text"
                  value={newGroup.topic}
                  onChange={(e) => setNewGroup({ ...newGroup, topic: e.target.value })}
                  placeholder="e.g., Sonnets, Haiku, Free Verse"
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="group-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  id="group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Describe what this study group is about..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Privacy
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewGroup({ ...newGroup, is_private: false })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      !newGroup.is_private
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <Globe size={18} />
                    <span className="font-medium">Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGroup({ ...newGroup, is_private: true })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      newGroup.is_private
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <Lock size={18} />
                    <span className="font-medium">Private</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newGroup.name.trim() || !newGroup.topic.trim()}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Group
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
