import { useState } from 'react';
import { Shuffle, Sparkles, PenLine } from 'lucide-react';

const prompts = [
  'Write about a memory that still makes you smile',
  'Describe the sound of silence',
  'Capture the feeling of a rainy afternoon',
  'Write about something you lost and found again',
  'Imagine a conversation with your future self',
  'Describe a place you feel most at peace',
  'Write about the color blue without naming it',
  'Capture the essence of a perfect moment',
  'Describe the taste of a childhood memory',
  'Write about the space between two heartbeats',
  'Imagine you can speak to the moon',
  'Describe a dream you remember',
  'Write about the first snowfall',
  'Capture the feeling of home',
  'Describe your favorite time of day',
  'Write about something that makes you brave',
  'Imagine being a drop of rain',
  'Describe the smell of autumn',
  'Write about a door you have never opened',
  'Capture the feeling of waiting',
];

export default function PromptRoulette() {
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinRoulette = () => {
    setIsSpinning(true);
    let spins = 0;
    const maxSpins = 20;

    const interval = setInterval(() => {
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      setCurrentPrompt(randomPrompt);
      spins++;

      if (spins >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prompt Roulette</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Spin the wheel and let chance inspire your next poem
        </p>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-12 mb-8">
        <div className="text-center">
          <div className={`mb-8 transition-all duration-300 ${isSpinning ? 'scale-110' : 'scale-100'}`}>
            <Sparkles className={`w-16 h-16 mx-auto text-primary mb-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <div className="min-h-[120px] flex items-center justify-center">
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 px-8">
                {currentPrompt}
              </p>
            </div>
          </div>

          <button
            onClick={spinRoulette}
            disabled={isSpinning}
            className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto text-lg font-semibold shadow-lg hover:shadow-xl"
          >
            <Shuffle className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? 'Spinning...' : 'Spin the Roulette'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            How It Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Click the spin button to get a random prompt</li>
            <li>• Use the prompt as inspiration for your poem</li>
            <li>• Don't like it? Spin again for a new one</li>
            <li>• Let chance guide your creativity</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Take the first prompt you get as a challenge</li>
            <li>• Set a timer and write for 10 minutes</li>
            <li>• Interpret prompts in your own unique way</li>
            <li>• There are no wrong answers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
