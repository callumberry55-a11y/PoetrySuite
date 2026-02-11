import { useState, useEffect, useCallback } from 'react';
import { Brain, Trophy, Clock, Target, CheckCircle, XCircle, Award, TrendingUp, Play, RotateCcw, BookOpen, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: 'forms' | 'poets' | 'devices' | 'history' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_limit_seconds: number | null;
  points_reward: number;
  passing_score: number;
  question_count?: number;
  best_score?: number;
  attempts_count?: number;
}

interface Question {
  id: string;
  question_text: string;
  question_order: number;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  time_taken_seconds: number;
  completed_at: string;
}

export default function Quizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const loadQuizzes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('poetry_quizzes')
        .select('*')
        .eq('is_active', true);

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }
      if (filterDifficulty !== 'all') {
        query = query.eq('difficulty', filterDifficulty);
      }

      const { data: quizzesData, error: quizzesError } = await query.order('created_at', { ascending: false });

      if (quizzesError) throw quizzesError;

      const quizzesWithStats = await Promise.all(
        (quizzesData || []).map(async (quiz) => {
          const { count } = await supabase
            .from('quiz_questions')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id);

          const { data: attempts } = await supabase
            .from('quiz_attempts')
            .select('score')
            .eq('quiz_id', quiz.id)
            .eq('user_id', user.id)
            .order('score', { ascending: false })
            .limit(1);

          const { count: attemptsCount } = await supabase
            .from('quiz_attempts')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id)
            .eq('user_id', user.id);

          return {
            ...quiz,
            question_count: count || 0,
            best_score: attempts?.[0]?.score || undefined,
            attempts_count: attemptsCount || 0
          };
        })
      );

      setQuizzes(quizzesWithStats);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filterCategory, filterDifficulty]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  useEffect(() => {
    if (quizStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining]);

  const startQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowLeaderboard(false);

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('question_order');

      if (error) throw error;

      setQuestions(data || []);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setQuizStarted(true);
      setQuizCompleted(false);
      setShowExplanation(false);
      setTimeRemaining(quiz.time_limit_seconds);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz || !user) return;

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });

    const scorePercentage = Math.round((correct / questions.length) * 100);
    const passed = scorePercentage >= selectedQuiz.passing_score;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    setScore(scorePercentage);
    setCorrectCount(correct);
    setQuizCompleted(true);
    setQuizStarted(false);

    try {
      const { error } = await supabase.from('quiz_attempts').insert({
        quiz_id: selectedQuiz.id,
        user_id: user.id,
        score: scorePercentage,
        correct_answers: correct,
        total_questions: questions.length,
        time_taken_seconds: timeTaken,
        passed,
        answers
      });

      if (error) throw error;

      if (passed) {
        await supabase.rpc('handle_point_transaction', {
          p_user_id: user.id,
          p_amount: selectedQuiz.points_reward,
          p_type: 'add'
        });
      }

      loadQuizzes();
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  };

  const loadLeaderboard = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          user_id,
          score,
          time_taken_seconds,
          completed_at,
          user_profiles!inner(username)
        `)
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .limit(10);

      if (error) throw error;

      const leaderboardData = (data || []).map((entry: any) => ({
        user_id: entry.user_id,
        username: entry.user_profiles?.username || 'Anonymous',
        score: entry.score,
        time_taken_seconds: entry.time_taken_seconds,
        completed_at: entry.completed_at
      }));

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const showQuizLeaderboard = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowLeaderboard(true);
    setQuizStarted(false);
    setQuizCompleted(false);
    loadLeaderboard(quiz.id);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizStarted(false);
    setQuizCompleted(false);
    setShowExplanation(false);
    setShowLeaderboard(false);
    setTimeRemaining(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'forms': return <BookOpen size={20} />;
      case 'poets': return <Award size={20} />;
      case 'devices': return <Sparkles size={20} />;
      case 'history': return <Clock size={20} />;
      default: return <Brain size={20} />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-on-surface-variant">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (showLeaderboard && selectedQuiz) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={resetQuiz}
              className="mb-4 text-white/90 hover:text-white text-sm flex items-center gap-2"
            >
              ← Back to Quizzes
            </button>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8" />
              <h1 className="text-2xl sm:text-4xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-lg opacity-90">{selectedQuiz.title}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No attempts yet. Be the first to take this quiz!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={`${entry.user_id}-${index}`}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                      : index === 1
                      ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900 shadow-md'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 shadow'
                  }`}
                >
                  <div className="text-2xl font-bold w-12 text-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.username}</p>
                    <p className={`text-sm ${index < 3 ? 'opacity-90' : 'text-slate-500'}`}>
                      {entry.time_taken_seconds ? formatTime(entry.time_taken_seconds) : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{entry.score}%</p>
                    {index < 3 && <Trophy className="w-5 h-5 mx-auto mt-1" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && selectedQuiz) {
    const passed = score >= selectedQuiz.passing_score;

    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center">
          {passed ? (
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          )}

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {passed
              ? `You passed with ${score}% and earned ${selectedQuiz.points_reward} points!`
              : `You scored ${score}%. You need ${selectedQuiz.passing_score}% to pass.`
            }
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{score}%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Score</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{correctCount}/{questions.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Correct</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{passed ? selectedQuiz.points_reward : 0}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Points</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => startQuiz(selectedQuiz)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <RotateCcw size={20} />
              Retake Quiz
            </button>
            <button
              onClick={() => showQuizLeaderboard(selectedQuiz)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              <TrendingUp size={20} />
              Leaderboard
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted && selectedQuiz && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestion.id];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                <span className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</span>
              </div>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {currentQuestion.question_text}
              </h3>

              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => {
                  const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string;
                  const isSelected = selectedAnswer === option;

                  return (
                    <button
                      key={option}
                      onClick={() => selectAnswer(currentQuestion.id, option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {option}
                        </div>
                        <span className="text-slate-900 dark:text-white">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Correct Answer: {currentQuestion.correct_answer}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                {showExplanation ? 'Hide' : 'Show'} Answer
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length !== questions.length}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10" />
            <h1 className="text-2xl sm:text-4xl font-bold">Poetry Quizzes</h1>
          </div>
          <p className="text-lg opacity-90">Test your poetry knowledge and earn points</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="forms">Poetic Forms</option>
              <option value="poets">Famous Poets</option>
              <option value="devices">Literary Devices</option>
              <option value="history">Poetry History</option>
              <option value="general">General</option>
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    {getCategoryIcon(quiz.category)}
                    <span className="text-sm font-semibold capitalize">{quiz.category}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {quiz.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {quiz.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Brain size={16} />
                    <span>{quiz.question_count} questions</span>
                  </div>
                  {quiz.time_limit_seconds && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{Math.floor(quiz.time_limit_seconds / 60)} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Trophy size={16} />
                    <span>{quiz.points_reward} pts</span>
                  </div>
                </div>

                {quiz.best_score !== undefined && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Best Score: {quiz.best_score}% ({quiz.attempts_count} {quiz.attempts_count === 1 ? 'attempt' : 'attempts'})
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Play size={18} />
                    Start Quiz
                  </button>
                  <button
                    onClick={() => showQuizLeaderboard(quiz)}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <TrendingUp size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {quizzes.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No quizzes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
