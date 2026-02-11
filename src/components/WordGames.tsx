import { Gamepad2, Sparkles, Type, Zap } from 'lucide-react';

export default function WordGames() {
  const games = [
    {
      name: 'Word Association',
      description: 'Build chains of associated words to spark creativity',
      icon: Sparkles,
      difficulty: 'Easy',
      color: 'blue',
    },
    {
      name: 'Acrostic Builder',
      description: 'Create poems where first letters spell words',
      icon: Type,
      difficulty: 'Medium',
      color: 'green',
    },
    {
      name: 'Speed Poetry',
      description: 'Write poems within a time limit',
      icon: Zap,
      difficulty: 'Hard',
      color: 'orange',
    },
    {
      name: 'Rhyme Match',
      description: 'Find rhyming words as fast as you can',
      icon: Gamepad2,
      difficulty: 'Easy',
      color: 'purple',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Word Games</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fun games to improve your poetry skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <div
            key={game.name}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-${game.color}-100 dark:bg-${game.color}-900/20`}>
                <game.icon className={`w-6 h-6 text-${game.color}-500`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{game.name}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                    {game.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {game.description}
                </p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Play Game
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          Why Play Word Games?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Word games are a fun way to expand your vocabulary, practice different poetic techniques, and overcome writer's block. They help you think creatively and discover new ways to express ideas.
        </p>
      </div>
    </div>
  );
}
