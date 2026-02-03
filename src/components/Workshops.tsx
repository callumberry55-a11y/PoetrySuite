import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Lock, Globe, MessageCircle } from 'lucide-react';

interface Workshop {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  creator_id: string;
  member_count: number;
  created_at: string;
}

interface WorkshopSubmission {
  id: string;
  poem_id: string;
  poem_title: string;
  poem_content: string;
  submitted_by: string;
  submitted_by_username: string;
  submitted_at: string;
  critique_count: number;
}

interface RawSubmission {
  id: string;
  poem_id: string;
  submitted_by: string;
  submitted_at: string;
  poems: {
    title: string;
    content: string;
  }[];
  user_profiles: {
    username: string;
  }[];
}

export default function Workshops() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<WorkshopSubmission[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    name: '',
    description: '',
    is_public: true
  });

  const loadWorkshops = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .or(`creator_id.eq.${user.id},id.in.(select workshop_id from workshop_members where user_id = '${user.id}')`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading workshops:', error);
      return;
    }

    const workshopsWithCounts = await Promise.all(
      (data || []).map(async (workshop) => {
        const { count } = await supabase
          .from('workshop_members')
          .select('id', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id);

        return {
          ...workshop,
          member_count: count || 0
        };
      })
    );

    setWorkshops(workshopsWithCounts);
  }, [user]);

  const loadSubmissions = useCallback(async (workshopId: string) => {
    const { data, error } = await supabase
      .from('workshop_submissions')
      .select(`
        id,
        poem_id,
        submitted_by,
        submitted_at,
        poems!inner(title, content),
        user_profiles!inner(username)
      `)
      .eq('workshop_id', workshopId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error loading submissions:', error);
      return;
    }

    const submissionsWithCounts = await Promise.all(
      (data || []).map(async (submission: RawSubmission) => {
        const { count } = await supabase
          .from('critiques')
          .select('id', { count: 'exact', head: true })
          .eq('workshop_submission_id', submission.id);

        return {
          id: submission.id,
          poem_id: submission.poem_id,
          poem_title: submission.poems[0]?.title || '',
          poem_content: submission.poems[0]?.content || '',
          submitted_by: submission.submitted_by,
          submitted_by_username: submission.user_profiles[0]?.username || 'Unknown',
          submitted_at: submission.submitted_at,
          critique_count: count || 0
        };
      })
    );

    setSubmissions(submissionsWithCounts);
  }, []);

  useEffect(() => {
    if (user) {
      loadWorkshops();
    }
  }, [user]);

  useEffect(() => {
    if (selectedWorkshop) {
      loadSubmissions(selectedWorkshop);
    }
  }, [selectedWorkshop]);

  const createWorkshop = async () => {
    if (!user || !newWorkshop.name.trim()) return;

    const { data: workshop, error } = await supabase
      .from('workshops')
      .insert([{
        creator_id: user.id,
        ...newWorkshop
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating workshop:', error);
      alert('Failed to create workshop');
      return;
    }

    await supabase
      .from('workshop_members')
      .insert([{
        workshop_id: workshop.id,
        user_id: user.id,
        role: 'admin'
      }]);

    setShowCreateForm(false);
    setNewWorkshop({ name: '', description: '', is_public: true });
    loadWorkshops();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 pb-24">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Writing Workshops</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-medium transition-colors touch-manipulation text-sm sm:text-base"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Create Workshop</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Create New Workshop</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Workshop Name
              </label>
              <input
                type="text"
                value={newWorkshop.name}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g., Sonnet Writers Circle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={newWorkshop.description}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Describe your workshop..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={newWorkshop.is_public}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, is_public: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_public" className="text-sm text-slate-700 dark:text-slate-300">
                Public (anyone can join)
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createWorkshop}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Your Workshops</h3>
            {workshops.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No workshops yet</p>
            ) : (
              <div className="space-y-2">
                {workshops.map((workshop) => (
                  <button
                    key={workshop.id}
                    onClick={() => setSelectedWorkshop(workshop.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedWorkshop === workshop.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                        : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900 dark:text-white">{workshop.name}</span>
                      {workshop.is_public ? (
                        <Globe size={14} className="text-green-500" />
                      ) : (
                        <Lock size={14} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Users size={12} />
                      {workshop.member_count} members
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedWorkshop ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Workshop Submissions</h3>
              {submissions.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  No submissions yet. Submit a poem to get feedback!
                </p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{submission.poem_title}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            by {submission.submitted_by_username}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                          <MessageCircle size={14} />
                          {submission.critique_count}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 font-serif">
                        {submission.poem_content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">Select a workshop to view submissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
