import { useState, useEffect, useCallback } from 'react';
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

  const loadChallenges = useCallback(async () => {
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
          .eq('user_id', user.id)
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
  }, [user]);

  const loadTodayPrompt = useCallback(async () => {
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
      .eq('user_id', user.id)
      .maybeSingle();

    setTodayPrompt({
      ...prompt,
      response_count: count || 0,
      user_has_responded: !!userResponse
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      loadChallenges();
      loadTodayPrompt();
    }
  }, [user, loadChallenges, loadTodayPrompt]);

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('challenge_participations')
      .insert([{
        challenge_id: challengeId,
        user_id: user.id
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 h-32 sm:h-40">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Challenges & Prompts</h1>
          <p className="text-sm sm:text-base opacity-90">Push your creative boundaries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
        {todayPrompt && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl shadow-lg">
                    <Zap className="text-white" size={24} />
                  </div>
                  Today's Writing Prompt
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {todayPrompt.response_count} poets have responded today
                </p>
              </div>
              {todayPrompt.user_has_responded && (
                <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg flex-shrink-0">
                  <CheckCircle size={18} />
                  <span className="hidden sm:inline">Completed</span>
                </span>
              )}
            </div>
            <p className="text-lg sm:text-xl text-slate-900 dark:text-white font-serif mb-4 italic leading-relaxed">
              "{todayPrompt.prompt_text}"
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm px-4 py-2 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 rounded-xl font-semibold border border-violet-200 dark:border-violet-800">
                {todayPrompt.category}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : challenges.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No active challenges at the moment</p>
            </div>
          ) : (
            challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg">
                    {getChallengeIcon(challenge.challenge_type)}
                  </div>
                  {challenge.user_completed && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg">
                      <CheckCircle size={14} />
                      <span className="hidden sm:inline">Done</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {challenge.description}
                </p>

                <div className="space-y-2 mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Target:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {challenge.target_value} {challenge.challenge_type === 'word_count' ? 'words' : challenge.challenge_type === 'timed' ? 'minutes' : 'poems'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Ends:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatDate(challenge.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Participants:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {challenge.participant_count}
                    </span>
                  </div>
                </div>

                {!challenge.user_has_joined ? (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Join Challenge
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-semibold cursor-not-allowed"
                  >
                    {challenge.user_completed ? 'Completed' : 'In Progress'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
