import { useState } from 'react';
import { Book, Info, Sparkles, Filter } from 'lucide-react';
import { poetryForms, PoetryForm } from '../lib/poetry-forms';

interface FormsProps {
  onSelectForm: (form: PoetryForm) => void;
}

export default function Forms({ onSelectForm }: FormsProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedForm, setSelectedForm] = useState<PoetryForm | null>(null);

  const filteredForms = selectedDifficulty === 'all'
    ? poetryForms
    : poetryForms.filter(form => form.difficulty === selectedDifficulty);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 glass-subtle border-b border-slate-200/20 dark:border-slate-700/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Poetry Forms</h1>
            <p className="text-slate-600 dark:text-slate-400">Explore traditional and modern poetry structures</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-600 dark:text-slate-400" />
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDifficulty('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDifficulty === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedDifficulty('beginner')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDifficulty === 'beginner'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setSelectedDifficulty('intermediate')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDifficulty === 'intermediate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Intermediate
            </button>
            <button
              onClick={() => setSelectedDifficulty('advanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDifficulty === 'advanced'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {!selectedForm ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map(form => (
                <div
                  key={form.id}
                  onClick={() => setSelectedForm(form)}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Book className="text-blue-600 dark:text-blue-400" size={24} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      form.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : form.difficulty === 'intermediate'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {form.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{form.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{form.description}</p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {form.structure}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => setSelectedForm(null)}
                className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to all forms
              </button>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedForm.name}</h2>
                      <p className="text-slate-600 dark:text-slate-400">{selectedForm.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedForm.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : selectedForm.difficulty === 'intermediate'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {selectedForm.difficulty}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="text-blue-600 dark:text-blue-400" size={20} />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Structure</h3>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{selectedForm.structure}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Rules</h3>
                      <ul className="space-y-2">
                        {selectedForm.rules.map((rule, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span className="text-slate-700 dark:text-slate-300">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedForm.examples.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Example</h3>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-serif italic">
                            {selectedForm.examples[0]}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Template</h3>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                        <pre className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap font-mono">
                          {selectedForm.template}
                        </pre>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectForm(selectedForm)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Sparkles size={20} />
                      Start Writing with This Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
