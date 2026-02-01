import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Trophy, Target, Clock, Zap, CheckCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'timed' | 'word_count' | 'form' | 'daily';
  target_value: number;
  start_date: string;
  end_date: string;
  participant_count: number;
  user_has_joined: boolean;
  user_completed: boolean;
}

interface DailyPrompt {
  id: string;
  prompt_text: string;
  prompt_date: string;
  category: string;
  response_count: number;
  user_has_responded: boolean;
}

export default function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [todayPrompt, setTodayPrompt] = useState<DailyPrompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChallenges();
      loadTodayPrompt();
    }
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error loading challenges:', error);
      setLoading(false);
      return;
    }

    const challengesWithData = await Promise.all(
      (data || []).map(async (challenge) => {
        const { count } = await supabase
          .from('challenge_participations')
          .select('id', { count: 'exact', head: true })
          .eq('challenge_id', challenge.id);

        const { data: userParticipation } = await supabase
          .from('challenge_participations')
          .select('completed')
          .eq('challenge_id', challenge.id)
          .eq('user_id', user.uid)
          .maybeSingle();

        return {
          ...challenge,
          participant_count: count || 0,
          user_has_joined: !!userParticipation,
          user_completed: userParticipation?.completed || false
        };
      })
    );

    setChallenges(challengesWithData);
    setLoading(false);
  };

  const loadTodayPrompt = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data: prompt, error } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('prompt_date', today)
      .maybeSingle();

    if (error || !prompt) {
      console.error('Error loading prompt:', error);
      return;
    }

    const { count } = await supabase
      .from('prompt_responses')
      .select('id', { count: 'exact', head: true })
      .eq('prompt_id', prompt.id);

    const { data: userResponse } = await supabase
      .from('prompt_responses')
      .select('id')
      .eq('prompt_id', prompt.id)
      .eq('user_id', user.uid)
      .maybeSingle();

    setTodayPrompt({
      ...prompt,
      response_count: count || 0,
      user_has_responded: !!userResponse
    });
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('challenge_participations')
      .insert([{
        challenge_id: challengeId,
        user_id: user.uid
      }]);

    if (error) {
      console.error('Error joining challenge:', error);
      return;
    }

    loadChallenges();
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'timed':
        return <Clock size={20} />;
      case 'word_count':
        return <Target size={20} />;
      case 'form':
        return <Trophy size={20} />;
      case 'daily':
        return <Zap size={20} />;
      default:
        return <Target size={20} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Challenges & Prompts</h2>

      {todayPrompt && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Today's Writing Prompt</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {todayPrompt.response_count} poets have responded today
              </p>
            </div>
            {todayPrompt.user_has_responded && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                <CheckCircle size={16} />
                Completed
              </span>
            )}
          </div>
          <p className="text-lg text-slate-900 dark:text-white font-serif mb-3">
            "{todayPrompt.prompt_text}"
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded">
              {todayPrompt.category}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No active challenges at the moment</p>
          </div>
        ) : (
          challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-600 dark:text-orange-400">
                  {getChallengeIcon(challenge.challenge_type)}
                </div>
                {challenge.user_completed && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                    <CheckCircle size={16} />
                    Done
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {challenge.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {challenge.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Target:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {challenge.target_value} {challenge.challenge_type === 'word_count' ? 'words' : challenge.challenge_type === 'timed' ? 'minutes' : 'poems'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Ends:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(challenge.end_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Participants:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {challenge.participant_count}
                  </span>
                </div>
              </div>

              {!challenge.user_has_joined ? (
                <button
                  onClick={() => joinChallenge(challenge.id)}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Join Challenge
                </button>
              ) : (
                <button
                  disabled
                  className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed"
                >
                  {challenge.user_completed ? 'Completed' : 'In Progress'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
