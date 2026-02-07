import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookHeart, Plus, Users, Lock, Globe, Calendar, MessageSquare, Search } from 'lucide-react';

interface BookClub {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  max_members: number;
  current_book: string;
  meeting_schedule: string;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

export default function BookClubs() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<BookClub[]>([]);
  const [myClubs, setMyClubs] = useState<BookClub[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-clubs'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    current_book: '',
    meeting_schedule: '',
    is_private: false,
    max_members: 50
  });

  useEffect(() => {
    if (user) {
      loadClubs();
    }
  }, [user, activeTab]);

  const loadClubs = async () => {
    setLoading(true);
    try {
      if (activeTab === 'discover') {
        const { data, error } = await supabase
          .from('book_clubs')
          .select('*')
          .eq('is_private', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClubs(data || []);
      } else {
        const { data: memberData, error: memberError } = await supabase
          .from('book_club_members')
          .select(`
            club_id,
            book_clubs (*)
          `)
          .eq('user_id', user?.id);

        if (memberError) throw memberError;

        const clubsList = memberData?.map(m => m.book_clubs).filter(Boolean) || [];
        setMyClubs(clubsList as BookClub[]);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: clubData, error: clubError } = await supabase
        .from('book_clubs')
        .insert({
          ...formData,
          created_by: user?.id
        })
        .select()
        .single();

      if (clubError) throw clubError;

      await supabase
        .from('book_club_members')
        .insert({
          club_id: clubData.id,
          user_id: user?.id,
          role: 'admin'
        });

      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        current_book: '',
        meeting_schedule: '',
        is_private: false,
        max_members: 50
      });
      loadClubs();
    } catch (error) {
      console.error('Error creating club:', error);
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('book_club_members')
        .insert({
          club_id: clubId,
          user_id: user?.id,
          role: 'member'
        });

      if (error) throw error;
      loadClubs();
    } catch (error) {
      console.error('Error joining club:', error);
    }
  };

  const filteredClubs = () => {
    const list = activeTab === 'discover' ? clubs : myClubs;
    if (!searchQuery) return list;

    return list.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookHeart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Poetry Book Clubs
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Club
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Join virtual reading groups to discuss poetry books, share insights, and connect with fellow poetry enthusiasts.
      </p>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'discover'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Discover Clubs
        </button>
        <button
          onClick={() => setActiveTab('my-clubs')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'my-clubs'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          My Clubs
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search clubs..."
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
          {filteredClubs().length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No clubs found matching your search.' : 'No clubs available. Create one to get started!'}
            </div>
          ) : (
            filteredClubs().map(club => (
              <div
                key={club.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {club.name}
                  </h3>
                  {club.is_private ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Globe className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {club.description}
                </p>

                {club.current_book && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                      Currently Reading:
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {club.current_book}
                    </p>
                  </div>
                )}

                {club.meeting_schedule && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{club.meeting_schedule}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{club.member_count || 0} members</span>
                  </div>

                  {activeTab === 'discover' && (
                    <button
                      onClick={() => handleJoinClub(club.id)}
                      className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Join Club
                    </button>
                  )}

                  {activeTab === 'my-clubs' && (
                    <button className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Discuss
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create Book Club
            </h2>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Club Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Book (optional)
                </label>
                <input
                  type="text"
                  value={formData.current_book}
                  onChange={(e) => setFormData({ ...formData, current_book: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meeting Schedule (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly on Mondays, 7 PM"
                  value={formData.meeting_schedule}
                  onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_private" className="text-sm text-gray-700 dark:text-gray-300">
                  Make this club private
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
