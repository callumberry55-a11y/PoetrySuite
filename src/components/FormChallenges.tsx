import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, Send, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Challenge {
  id: string;
  form_type: string;
  time_limit_minutes: number;
  prompt: string;
  difficulty: string;
}

export default function FormChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('form_challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setTimeLeft(challenge.time_limit_minutes * 60);
    setContent('');
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (selectedChallenge) {
      setTimeLeft(selectedChallenge.time_limit_minutes * 60);
      setIsRunning(false);
      setContent('');
    }
  };

  const submitChallenge = async () => {
    if (!selectedChallenge || !content.trim()) return;

    const completionTime = (selectedChallenge.time_limit_minutes * 60) - timeLeft;

    try {
      const { data: poem, error: poemError } = await supabase
        .from('poems')
        .insert({
          user_id: user?.id,
          title: `${selectedChallenge.form_type} Challenge`,
          content,
          is_public: false,
          word_count: content.trim().split(/\s+/).length,
        })
        .select()
        .single();

      if (poemError) throw poemError;

      const { error: submissionError } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: selectedChallenge.id,
          user_id: user?.id,
          poem_id: poem.id,
          completion_time: completionTime,
        });

      if (submissionError) throw submissionError;

      alert('Challenge submitted successfully!');
      setSelectedChallenge(null);
      setContent('');
    } catch (error) {
      console.error('Error submitting challenge:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Loading challenges...</div>
      </div>
    );
  }

  if (selectedChallenge) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <button
            onClick={() => setSelectedChallenge(null)}
            className="text-blue-500 hover:text-blue-600 mb-4"
          >
            ← Back to Challenges
          </button>
          <h1 className="text-3xl font-bold mb-2">{selectedChallenge.form_type} Challenge</h1>
          <p className="text-gray-600 dark:text-gray-400">{selectedChallenge.prompt}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-blue-500'}`}>
                {formatTime(timeLeft)}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${getDifficultyColor(selectedChallenge.difficulty)}`}>
                {selectedChallenge.difficulty}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleTimer}
                className={`p-3 rounded-lg ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your poem here..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 resize-none"
            rows={15}
            style={{ fontFamily: 'Georgia, serif' }}
          />

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {content.trim().split(/\s+/).filter(Boolean).length} words
            </div>
            <button
              onClick={submitChallenge}
              disabled={!content.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Challenge
            </button>
          </div>
        </div>

        {timeLeft === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border-2 border-yellow-500 text-center">
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-xl font-semibold mb-2">Time's Up!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Submit your work or reset the timer to keep writing.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form Challenges</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Race against the clock to write poems in specific forms
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">{challenge.time_limit_minutes} min</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-2">{challenge.form_type}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {challenge.prompt}
            </p>

            <button
              onClick={() => startChallenge(challenge)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Start Challenge
            </button>
          </div>
        ))}

        {challenges.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No challenges available yet. Check back soon!
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">How It Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>Choose a challenge based on form and difficulty</li>
          <li>Start the timer and begin writing</li>
          <li>Try to complete the poem within the time limit</li>
          <li>Submit your work when finished or when time runs out</li>
          <li>Track your progress and improve your speed!</li>
        </ol>
      </div>
    </div>
  );
}
