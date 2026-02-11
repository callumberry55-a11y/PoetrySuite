import { useState } from 'react';
import { Grid3x3, Trophy, RefreshCw } from 'lucide-react';

const challenges = [
  'Write about water',
  'Use alliteration',
  'Include a color',
  'Write a haiku',
  'Use metaphor',
  'Write about time',
  'Include nature',
  'Use repetition',
  'Write about home',
  'Use rhyme',
  'Write about light',
  'Use personification',
  'Write about seasons',
  'Include music',
  'Write about memory',
  'Use symbolism',
  'Write about journey',
  'Include animals',
  'Write about dreams',
  'Use imagery',
  'Write about silence',
  'Include emotions',
  'Write about change',
  'Use simile',
  'Write about night',
];

export default function PoetryBingo() {
  const [board, setBoard] = useState<string[]>([]);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const generateBoard = () => {
    const shuffled = [...challenges].sort(() => Math.random() - 0.5);
    setBoard(shuffled.slice(0, 25));
    setCompleted(new Set());
  };

  const toggleSquare = (index: number) => {
    const newCompleted = new Set(completed);
    if (completed.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompleted(newCompleted);
  };

  const checkBingo = () => {
    const lines = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20],
    ];

    return lines.some((line) => line.every((index) => completed.has(index)));
  };

  const hasBingo = checkBingo();

  if (board.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Poetry Bingo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete challenges to achieve bingo and improve your skills
          </p>
        </div>

        <div className="text-center py-12">
          <Grid3x3 className="w-24 h-24 mx-auto text-primary mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Ready to Play?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get a random board of poetry challenges and try to complete a full line!
          </p>
          <button
            onClick={generateBoard}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold"
          >
            Generate Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Poetry Bingo</h1>
          <button
            onClick={generateBoard}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Board
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {completed.size} / 25 challenges completed
        </p>
      </div>

      {hasBingo && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-6 border-2 border-yellow-400 dark:border-yellow-600">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
              BINGO! You did it!
            </h2>
            <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-5 gap-2">
          {board.map((challenge, index) => (
            <button
              key={index}
              onClick={() => toggleSquare(index)}
              className={`aspect-square rounded-lg border-2 p-2 transition-all hover:scale-105 ${
                completed.has(index)
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-primary'
              }`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs text-center font-medium leading-tight">
                  {challenge}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">How to Play</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Click a square when you complete that challenge</li>
          <li>• Complete a full row, column, or diagonal to win</li>
          <li>• Share your poems as you complete challenges</li>
          <li>• Generate a new board for a fresh set of challenges</li>
        </ul>
      </div>
    </div>
  );
}
