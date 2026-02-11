import { Wrench, Type, BookOpen, Shuffle, Sparkles } from 'lucide-react';

export default function WritingTools() {
  const tools = [
    {
      name: 'Rhyme Finder',
      description: 'Find perfect and near rhymes for any word',
      icon: Type,
      color: 'blue',
    },
    {
      name: 'Syllable Counter',
      description: 'Count syllables in words and lines',
      icon: BookOpen,
      color: 'green',
    },
    {
      name: 'Word Randomizer',
      description: 'Generate random words for creative inspiration',
      icon: Shuffle,
      color: 'purple',
    },
    {
      name: 'Metaphor Generator',
      description: 'Create unique metaphors and similes',
      icon: Sparkles,
      color: 'pink',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Writing Tools</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Essential tools to help craft your poetry
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-primary transition-all hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg bg-${tool.color}-100 dark:bg-${tool.color}-900/20`}>
                <tool.icon className={`w-6 h-6 text-${tool.color}-500`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {tool.description}
                </p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Open Tool
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          More Tools Coming Soon
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We're constantly adding new tools to help you write better poetry. Check back regularly for updates!
        </p>
      </div>
    </div>
  );
}
