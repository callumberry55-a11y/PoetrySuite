import { useState } from 'react';
import { Target, Calendar, Trophy, Clock, Check } from 'lucide-react';

const CHALLENGES = [
  {
    id: '1',
    title: 'Haiku Haven',
    description: 'Write a haiku about nature',
    difficulty: 'Easy',
    timeLimit: '15 minutes',
    points: 10,
    category: 'Form',
    requirements: ['5-7-5 syllable pattern', 'Nature theme', 'Seasonal reference']
  },
  {
    id: '2',
    title: 'Sonnet Sunday',
    description: 'Compose a Shakespearean sonnet',
    difficulty: 'Hard',
    timeLimit: '60 minutes',
    points: 50,
    category: 'Form',
    requirements: ['14 lines', 'ABAB CDCD EFEF GG rhyme scheme', 'Iambic pentameter']
  },
  {
    id: '3',
    title: 'Metaphor Master',
    description: 'Write a poem using at least 5 metaphors',
    difficulty: 'Medium',
    timeLimit: '30 minutes',
    points: 25,
    category: 'Device',
    requirements: ['Minimum 5 metaphors', 'At least 12 lines', 'Cohesive theme']
  },
  {
    id: '4',
    title: 'One Word Wonder',
    description: 'Write a poem where every line starts with the same word',
    difficulty: 'Medium',
    timeLimit: '20 minutes',
    points: 20,
    category: 'Style',
    requirements: ['Each line starts with same word', 'Minimum 8 lines', 'Makes sense']
  },
  {
    id: '5',
    title: 'Color Cascade',
    description: 'Write a poem about emotions using only color imagery',
    difficulty: 'Medium',
    timeLimit: '25 minutes',
    points: 30,
    category: 'Theme',
    requirements: ['Only color-based imagery', 'Express emotions', 'No direct emotion words']
  },
  {
    id: '6',
    title: 'Reverse Engineering',
    description: 'Write a poem that reads differently backwards',
    difficulty: 'Hard',
    timeLimit: '45 minutes',
    points: 45,
    category: 'Style',
    requirements: ['Makes sense forwards', 'Makes sense backwards', 'Different meanings']
  }
];

export default function PoetryChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [poemText, setPoemText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const handleStartChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    setPoemText('');
    setIsSubmitted(false);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (!completedChallenges.includes(selectedChallenge.id)) {
      setCompletedChallenges([...completedChallenges, selectedChallenge.id]);
    }
  };

  const handleBackToChallenges = () => {
    setSelectedChallenge(null);
    setPoemText('');
    setIsSubmitted(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Hard': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700';
    }
  };

  const totalPoints = completedChallenges.reduce((sum, id) => {
    const challenge = CHALLENGES.find(c => c.id === id);
    return sum + (challenge?.points || 0);
  }, 0);

  if (selectedChallenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={handleBackToChallenges}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Challenges
        </button>

        <div className="glass rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {selectedChallenge.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {selectedChallenge.description}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedChallenge.difficulty)}`}>
              {selectedChallenge.difficulty}
            </span>
          </div>

          <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{selectedChallenge.timeLimit}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={16} />
              <span>{selectedChallenge.points} points</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Requirements:</h3>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {selectedChallenge.requirements.map((req: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Your Submission
          </h3>
          <textarea
            value={poemText}
            onChange={(e) => setPoemText(e.target.value)}
            placeholder="Write your poem here..."
            rows={14}
            disabled={isSubmitted}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none disabled:opacity-60"
          />

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!poemText.trim()}
              className="w-full mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Submit Challenge
            </button>
          ) : (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <Check size={20} />
                <span className="font-semibold">Challenge Completed!</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You earned {selectedChallenge.points} points. Keep writing to complete more challenges!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Poetry Challenges</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Take on daily and weekly poetry challenges to improve your craft and earn points.
        </p>
      </div>

      <div className="glass rounded-xl p-6 shadow-sm mb-6 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Your Progress
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {completedChallenges.length} challenges completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalPoints}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Points</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {CHALLENGES.map((challenge) => {
          const isCompleted = completedChallenges.includes(challenge.id);

          return (
            <div
              key={challenge.id}
              className={`glass rounded-xl p-6 shadow-sm transition-all ${
                isCompleted ? 'ring-2 ring-green-500 dark:ring-green-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {challenge.title}
                </h3>
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="text-white" size={16} />
                  </div>
                )}
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {challenge.description}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                  {challenge.category}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{challenge.timeLimit}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy size={14} />
                  <span>{challenge.points} pts</span>
                </div>
              </div>

              <button
                onClick={() => handleStartChallenge(challenge)}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                {isCompleted ? 'Try Again' : 'Start Challenge'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          How Challenges Work
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Complete challenges to earn points and improve your skills</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Each challenge has specific requirements you need to meet</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Harder challenges award more points</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>You can retry any challenge to practice and perfect your technique</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
