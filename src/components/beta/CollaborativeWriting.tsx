import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, Copy, Check, ArrowLeft, AlertCircle, Send, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BetaGuard from './BetaGuard';

interface CollabSession {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participant_count: number;
  is_active: boolean;
}

interface Participant {
  user_id: string;
  email: string;
  joined_at: string;
}

interface Update {
  id: string;
  user_email: string;
  content: string;
  timestamp: string;
}

export default function CollaborativeWriting() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CollabSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollabSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [content, setContent] = useState('');
  const [showNewSession, setShowNewSession] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    if (currentSession) {
      loadParticipants();
      loadUpdates();
      const interval = setInterval(() => {
        refreshSession();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collaborative_sessions')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadParticipants = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('collab_participants')
        .select('user_id, profiles:user_profiles(email), joined_at')
        .eq('session_id', currentSession.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const formattedParticipants = (data || []).map((p: any) => ({
        user_id: p.user_id,
        email: p.profiles?.email || 'Unknown User',
        joined_at: p.joined_at
      }));

      setParticipants(formattedParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadUpdates = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('collab_updates')
        .select('id, user_id, content, created_at, profiles:user_profiles(email)')
        .eq('session_id', currentSession.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedUpdates = (data || []).map((u: any) => ({
        id: u.id,
        user_email: u.profiles?.email || 'Unknown User',
        content: u.content,
        timestamp: u.created_at
      }));

      setUpdates(formattedUpdates);
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  const refreshSession = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('collaborative_sessions')
        .select('*')
        .eq('id', currentSession.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCurrentSession(data);
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const createSession = async () => {
    if (!user || !newTitle.trim()) {
      setError('Please enter a session title');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('collaborative_sessions')
        .insert({
          title: newTitle,
          content: '',
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('collab_participants')
        .insert({
          session_id: data.id,
          user_id: user.id
        });

      setSuccess('Session created successfully!');
      setNewTitle('');
      setShowNewSession(false);
      loadSessions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session');
    }
  };

  const joinSession = async (session: CollabSession) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('collab_participants')
        .select('*')
        .eq('session_id', session.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from('collab_participants')
          .insert({
            session_id: session.id,
            user_id: user.id
          });

        await supabase
          .from('collab_updates')
          .insert({
            session_id: session.id,
            user_id: user.id,
            content: 'joined the session'
          });
      }

      setCurrentSession(session);
      setContent(session.content);
    } catch (error) {
      console.error('Error joining session:', error);
      setError('Failed to join session');
    }
  };

  const leaveSession = () => {
    setCurrentSession(null);
    setContent('');
    setParticipants([]);
    setUpdates([]);
  };

  const saveContent = async () => {
    if (!currentSession || !user) return;

    try {
      const { error } = await supabase
        .from('collaborative_sessions')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      await supabase
        .from('collab_updates')
        .insert({
          session_id: currentSession.id,
          user_id: user.id,
          content: 'updated the poem'
        });

      setSuccess('Changes saved!');
      loadUpdates();
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error('Error saving content:', error);
      setError('Failed to save changes');
    }
  };

  const endSession = async () => {
    if (!currentSession || !user || currentSession.created_by !== user.id) return;

    if (!confirm('End this collaborative session? The poem will be saved but no more edits can be made.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('collaborative_sessions')
        .update({ is_active: false })
        .eq('id', currentSession.id);

      if (error) throw error;

      setSuccess('Session ended. The poem has been saved.');
      setTimeout(() => {
        leaveSession();
        loadSessions();
      }, 2000);
    } catch (error) {
      console.error('Error ending session:', error);
      setError('Failed to end session');
    }
  };

  const copySessionLink = () => {
    if (currentSession) {
      navigator.clipboard.writeText(window.location.origin + '#collab-' + currentSession.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Collaborative Writing</h2>
            <p className="text-slate-600 dark:text-slate-400">Write poetry together in real-time</p>
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

      {!currentSession ? (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Active Sessions</h3>
              <button
                onClick={() => setShowNewSession(!showNewSession)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                New Session
              </button>
            </div>

            {showNewSession && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter a title for your collaborative poem..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createSession}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Session
                  </button>
                  <button
                    onClick={() => setShowNewSession(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {sessions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Users size={48} className="mx-auto mb-3 opacity-30" />
                <p>No active sessions. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                    onClick={() => joinSession(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {session.participant_count} participant{session.participant_count !== 1 ? 's' : ''}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(session.updated_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400">
                        Join →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {currentSession.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={copySessionLink}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Copy session link"
                  >
                    {copied ? (
                      <Check className="text-green-600 dark:text-green-400" size={18} />
                    ) : (
                      <Copy className="text-slate-600 dark:text-slate-400" size={18} />
                    )}
                  </button>
                  <button
                    onClick={leaveSession}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Leave
                  </button>
                </div>
              </div>

              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your collaborative poem here..."
                rows={16}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none font-serif"
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveContent}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Send size={18} />
                  Save Changes
                </button>
                {currentSession.created_by === user?.id && (
                  <button
                    onClick={endSession}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Trash2 size={18} />
                    End Session
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.user_id}
                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="text-blue-600 dark:text-blue-400" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {participant.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {updates.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No activity yet
                  </p>
                ) : (
                  updates.map((update) => (
                    <div
                      key={update.id}
                      className="text-sm p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{update.user_email}</span> {update.content}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </BetaGuard>
  );
}
