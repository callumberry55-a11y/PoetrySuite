import { useState, useEffect } from 'react';
import { Send, Check, X, Clock, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Submission {
  id: string;
  venue_name: string;
  venue_type: string;
  submission_date: string;
  status: string;
  response_date: string | null;
  notes: string;
  poem_id: string;
  poems?: {
    title: string;
  };
}

export default function Submissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [poems, setPoems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    poem_id: '',
    venue_name: '',
    venue_type: 'journal',
    submission_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadSubmissions();
    loadPoems();
  }, []);

  const loadSubmissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          poems(title)
        `)
        .eq('user_id', user.id)
        .order('submission_date', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPoems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('poems')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPoems(data || []);
    } catch (error) {
      console.error('Error loading poems:', error);
    }
  };

  const handleAddSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          ...formData,
          user_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      setShowAddForm(false);
      setFormData({
        poem_id: '',
        venue_name: '',
        venue_type: 'journal',
        submission_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      await loadSubmissions();
    } catch (error) {
      console.error('Error adding submission:', error);
    }
  };

  const updateStatus = async (id: string, status: string, response_date?: string) => {
    try {
      const updateData: any = { status };
      if (response_date) {
        updateData.response_date = response_date;
      }

      const { error } = await supabase
        .from('submissions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    accepted: submissions.filter(s => s.status === 'accepted').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Submission Tracker</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your poetry submissions to journals and contests</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add Submission
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.accepted}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Accepted</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Rejected</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {submissions.map(submission => (
              <div
                key={submission.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {submission.poems?.title || 'Untitled'}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {submission.venue_name} ({submission.venue_type})
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Send size={14} />
                    Submitted: {new Date(submission.submission_date).toLocaleDateString()}
                  </div>
                  {submission.response_date && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      Response: {new Date(submission.response_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {submission.notes && (
                  <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">{submission.notes}</p>
                )}

                <div className="flex items-center gap-2">
                  {submission.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(submission.id, 'accepted', new Date().toISOString().split('T')[0])}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm transition-colors"
                      >
                        <Check size={14} />
                        Accepted
                      </button>
                      <button
                        onClick={() => updateStatus(submission.id, 'rejected', new Date().toISOString().split('T')[0])}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm transition-colors"
                      >
                        <X size={14} />
                        Rejected
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteSubmission(submission.id)}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="text-center py-12">
                <Send className="mx-auto mb-4 text-slate-400" size={48} />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No submissions yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Your First Submission
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add Submission</h2>

            <form onSubmit={handleAddSubmission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Poem
                </label>
                <select
                  value={formData.poem_id}
                  onChange={(e) => setFormData({ ...formData, poem_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select a poem</option>
                  {poems.map(poem => (
                    <option key={poem.id} value={poem.id}>{poem.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Venue Type
                </label>
                <select
                  value={formData.venue_type}
                  onChange={(e) => setFormData({ ...formData, venue_type: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="journal">Journal</option>
                  <option value="contest">Contest</option>
                  <option value="anthology">Anthology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Submission Date
                </label>
                <input
                  type="date"
                  value={formData.submission_date}
                  onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Submission
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
