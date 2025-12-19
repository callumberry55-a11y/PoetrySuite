import { useState } from 'react';
import { Trophy, Calendar, Users, Heart, Send } from 'lucide-react';

const CONTESTS = [
  {
    id: '1',
    title: 'Spring Awakening',
    theme: 'Nature & Renewal',
    deadline: '2025-03-15',
    status: 'open',
    entries: 47,
    votes: 234,
    prize: 'Featured on homepage',
    description: 'Celebrate the renewal of spring with poems about nature, growth, and new beginnings.'
  },
  {
    id: '2',
    title: 'Love in Verses',
    theme: 'Romance & Relationships',
    deadline: '2025-02-14',
    status: 'voting',
    entries: 89,
    votes: 521,
    prize: 'Community choice award',
    description: 'Express the many facets of love through your poetry.'
  },
  {
    id: '3',
    title: 'Urban Poetry',
    theme: 'City Life',
    deadline: '2025-01-30',
    status: 'closed',
    entries: 63,
    votes: 387,
    prize: 'Editor\'s pick feature',
    description: 'Capture the rhythm, energy, and stories of urban life.'
  }
];

const SAMPLE_ENTRIES = [
  {
    id: '1',
    title: 'Whispers of Dawn',
    author: 'PoetLover23',
    excerpt: 'In the hush before the morning light...',
    votes: 42,
    hasVoted: false
  },
  {
    id: '2',
    title: 'City Symphony',
    author: 'UrbanVerse',
    excerpt: 'Concrete canyons echo with a thousand voices...',
    votes: 38,
    hasVoted: false
  },
  {
    id: '3',
    title: 'Spring\'s Promise',
    author: 'NaturePoet',
    excerpt: 'Green fingers push through winter\'s sleep...',
    votes: 51,
    hasVoted: true
  }
];

export default function PoetryContests() {
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'entries' | 'submit'>('details');
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [entries, setEntries] = useState(SAMPLE_ENTRIES);

  const handleVote = (entryId: string) => {
    setEntries(entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          votes: entry.hasVoted ? entry.votes - 1 : entry.votes + 1,
          hasVoted: !entry.hasVoted
        };
      }
      return entry;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'voting': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'closed': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open for Submissions';
      case 'voting': return 'Voting Phase';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  if (selectedContest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedContest(null)}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Contests
        </button>

        <div className="glass rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {selectedContest.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {selectedContest.description}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedContest.status)}`}>
              {getStatusLabel(selectedContest.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Theme</div>
              <div className="font-semibold text-slate-900 dark:text-white">{selectedContest.theme}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Deadline</div>
              <div className="font-semibold text-slate-900 dark:text-white">
                {new Date(selectedContest.deadline).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Entries</div>
              <div className="font-semibold text-slate-900 dark:text-white">{selectedContest.entries}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Votes</div>
              <div className="font-semibold text-slate-900 dark:text-white">{selectedContest.votes}</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Trophy className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">Prize</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{selectedContest.prize}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('entries')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'entries'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              Entries
            </button>
            {selectedContest.status === 'open' && (
              <button
                onClick={() => setActiveTab('submit')}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  activeTab === 'submit'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Submit Entry
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Contest Guidelines</h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>Poems must be original and not previously published</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>Maximum length: 50 lines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>Must relate to the contest theme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span>One entry per person</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'entries' && (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{entry.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">by {entry.author}</p>
                      </div>
                      <button
                        onClick={() => handleVote(entry.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          entry.hasVoted
                            ? 'bg-red-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Heart size={16} fill={entry.hasVoted ? 'currentColor' : 'none'} />
                        <span>{entry.votes}</span>
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic">{entry.excerpt}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'submit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Poem Title
                  </label>
                  <input
                    type="text"
                    value={submissionTitle}
                    onChange={(e) => setSubmissionTitle(e.target.value)}
                    placeholder="Enter your poem title..."
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Poem Text
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your poem here..."
                    rows={14}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                  />
                </div>

                <button
                  disabled={!submissionTitle.trim() || !submissionText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <Send size={20} />
                  Submit Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Poetry Contests</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Enter community poetry contests and vote on your favorite submissions.
        </p>
      </div>

      <div className="space-y-6">
        {CONTESTS.map((contest) => (
          <div key={contest.id} className="glass rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {contest.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contest.status)}`}>
                    {getStatusLabel(contest.status)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {contest.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-slate-400" size={16} />
                <div>
                  <div className="text-slate-600 dark:text-slate-400">Deadline</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {new Date(contest.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="text-slate-400" size={16} />
                <div>
                  <div className="text-slate-600 dark:text-slate-400">Entries</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{contest.entries}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Heart className="text-slate-400" size={16} />
                <div>
                  <div className="text-slate-600 dark:text-slate-400">Votes</div>
                  <div className="font-semibold text-slate-900 dark:text-white">{contest.votes}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Trophy className="text-slate-400" size={16} />
                <div>
                  <div className="text-slate-600 dark:text-slate-400">Prize</div>
                  <div className="font-semibold text-slate-900 dark:text-white text-xs">
                    {contest.prize}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedContest(contest)}
              className="w-full px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              {contest.status === 'open' ? 'Enter Contest' : 'View Entries'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          About Poetry Contests
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Submit your poems during the open submission period</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Vote for your favorite entries during the voting phase</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Winners are featured on the homepage and community pages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>New contests are announced regularly with different themes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
