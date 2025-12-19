import { useState, useEffect } from 'react';
import { Mic, Play, Pause, RotateCcw, Settings } from 'lucide-react';

export default function PerformanceMode() {
  const [poemText, setPoemText] = useState('');
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bpm, setBpm] = useState(80);
  const [showMetronome, setShowMetronome] = useState(false);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);

  const lines = poemText.split('\n').filter(l => l.trim());

  useEffect(() => {
    let interval: any;
    if (isPracticing) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPracticing]);

  useEffect(() => {
    let interval: any;
    if (isMetronomeActive && showMetronome) {
      const intervalMs = (60 / bpm) * 1000;
      interval = setInterval(() => {
      }, intervalMs);
    }
    return () => clearInterval(interval);
  }, [isMetronomeActive, bpm, showMetronome]);

  const handleStart = () => {
    setIsPracticing(true);
    if (showMetronome) {
      setIsMetronomeActive(true);
    }
  };

  const handlePause = () => {
    setIsPracticing(false);
    setIsMetronomeActive(false);
  };

  const handleReset = () => {
    setIsPracticing(false);
    setIsMetronomeActive(false);
    setCurrentLine(0);
    setElapsedTime(0);
  };

  const handleNextLine = () => {
    if (currentLine < lines.length - 1) {
      setCurrentLine(prev => prev + 1);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!isPracticing) return;
    if (e.code === 'Space') {
      e.preventDefault();
      handleNextLine();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPracticing, currentLine]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Mic className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Mode</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Practice performing your poetry with timing tools and metronome features.
        </p>
      </div>

      {!isPracticing ? (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Poem Setup
            </h3>
            <textarea
              value={poemText}
              onChange={(e) => setPoemText(e.target.value)}
              placeholder="Enter your poem here..."
              rows={12}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none"
            />
          </div>

          <div className="glass rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="text-blue-600 dark:text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Performance Settings
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Enable Metronome</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Keep rhythm with a metronome beat</p>
                </div>
                <button
                  onClick={() => setShowMetronome(!showMetronome)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showMetronome ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      showMetronome ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {showMetronome && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tempo: {bpm} BPM
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="208"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={!poemText.trim()}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              <Play size={20} />
              Start Practice
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Line {currentLine + 1} of {lines.length}
              </div>
            </div>

            <div className="relative h-64 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-2xl text-center text-slate-900 dark:text-white font-serif">
                {lines[currentLine] || 'End of poem'}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                <Pause size={20} />
                Pause
              </button>
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={20} />
                Reset
              </button>
              <button
                onClick={handleNextLine}
                disabled={currentLine >= lines.length - 1}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Next Line
              </button>
            </div>

            <p className="text-sm text-center text-slate-600 dark:text-slate-400 mt-4">
              Press Space to advance to the next line
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Performance Tips
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Practice with the metronome to develop consistent rhythm</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Use the spacebar to advance lines hands-free during practice</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Track your timing to improve pacing and delivery</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Practice multiple times to memorize your poem</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
