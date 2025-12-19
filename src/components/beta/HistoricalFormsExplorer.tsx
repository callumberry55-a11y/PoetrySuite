import { useState } from 'react';
import { BookOpen, Globe, Calendar } from 'lucide-react';

const HISTORICAL_FORMS = [
  {
    id: '1',
    name: 'Ghazal',
    origin: 'Arabic/Persian',
    period: '7th century',
    description: 'A poetic form consisting of rhyming couplets and a refrain, with each line sharing the same meter.',
    structure: [
      '5-15 couplets',
      'Each couplet is autonomous',
      'Refrain (radif) at end of second line in each couplet',
      'Rhyme (qaafiya) before the radif'
    ],
    example: `Not all, who seem to fail, are lost —\nSome visions call, though all seems crossed.\n\nThe desert heat that burns by day\nGives way to stars when light is tossed.\n\nIn every ending lies a seed\nOf something new, though path was lost.`,
    tips: [
      'Each couplet should stand alone as a complete thought',
      'The refrain creates a musical quality',
      'Traditionally explores themes of love and loss'
    ]
  },
  {
    id: '2',
    name: 'Pantoum',
    origin: 'Malay',
    period: '15th century',
    description: 'A form where lines are repeated in a specific pattern, creating an interwoven, cyclical effect.',
    structure: [
      'Four-line stanzas',
      'Lines 2 and 4 of each stanza become lines 1 and 3 of the next',
      'Final stanza\'s lines 2 and 4 are lines 3 and 1 of first stanza',
      'Creates a circular, interlocking pattern'
    ],
    example: `The rain falls soft on city streets,\nA gentle rhythm, slow and deep.\nThe lights reflect in wet concrete,\nWhile dreamers in their beds still sleep.\n\nA gentle rhythm, slow and deep,\nThe world transforms in silver light.\nWhile dreamers in their beds still sleep,\nThe city breathes throughout the night.`,
    tips: [
      'Choose lines that work well when repeated',
      'The repetition should add new meaning in context',
      'Plan your repeating lines carefully before starting'
    ]
  },
  {
    id: '3',
    name: 'Villanelle',
    origin: 'Italian/French',
    period: '16th century',
    description: 'A 19-line poem with a strict pattern of repetition and rhyme, creating an obsessive, haunting quality.',
    structure: [
      '19 lines total: five tercets and one quatrain',
      'Two repeating rhymes (ABA)',
      'Two refrains that alternate and conclude together',
      'Rhyme scheme: ABA ABA ABA ABA ABA ABAA'
    ],
    example: `The art of losing isn't hard to master,\nSo many things seem filled with the intent\nTo be lost that their loss is no disaster.\n\nLose something every day. Accept the fluster\nOf lost door keys, the hour badly spent.\nThe art of losing isn't hard to master.`,
    tips: [
      'Choose strong refrains that can carry different meanings',
      'The obsessive repetition suits themes of obsession or loss',
      'Famous example: "Do Not Go Gentle" by Dylan Thomas'
    ]
  },
  {
    id: '4',
    name: 'Tanka',
    origin: 'Japanese',
    period: '7th century',
    description: 'An extension of haiku, traditionally expressing personal emotions and observations in 31 syllables.',
    structure: [
      'Five lines',
      'Syllable pattern: 5-7-5-7-7',
      'Often includes a pivot or turn',
      'More personal and emotional than haiku'
    ],
    example: `Winter moon rising,\nCasting silver on the snow —\nA fox's footprints.\nFollowing the winding path\nTo wherever night may lead.`,
    tips: [
      'Use the extra lines to develop emotion or narrative',
      'The turn often comes at line 3 or 4',
      'Can be more personal and less nature-focused than haiku'
    ]
  },
  {
    id: '5',
    name: 'Rondeau',
    origin: 'French',
    period: '13th century',
    description: 'A medieval French form with a refrain and circular structure, often playful or romantic.',
    structure: [
      '15 lines in three stanzas',
      'Stanza pattern: 5-3-5 lines',
      'Uses only two rhymes throughout',
      'Rentrement (refrain) from first line appears after stanzas 2 and 3'
    ],
    example: `Love comes on gentle, quiet feet,\nA whisper soft, a moment fleet,\nIt steals upon us unaware,\nAnd settles in with tender care,\nMaking every heartbeat sweet.\n\nLove comes on gentle feet.\n\nNo fanfare marks this rare retreat\nInto our lives, so bittersweet,\nYet once it settles there,\nWe find we cannot help but meet\nIts call with joy beyond compare.\n\nLove comes on gentle feet.`,
    tips: [
      'The refrain should be flexible in meaning',
      'Keep it light and musical',
      'Perfect for romantic or playful themes'
    ]
  },
  {
    id: '6',
    name: 'Sestina',
    origin: 'Provençal',
    period: '12th century',
    description: 'A complex form using end-word repetition in a spiraling pattern across six stanzas.',
    structure: [
      '39 lines: six sestets plus one tercet',
      'Six end-words rotate in a specific pattern',
      'Pattern: 123456, 615243, 364125, 532614, 451362, 246531',
      'Final tercet includes all six words'
    ],
    example: `I walked the empty streets at night,\nSearching for meaning in the air.\nEach corner held a different story,\nWhispered by shadows, thin as time.\nThe city breathed its ancient song —\nA melody that spoke of home.`,
    tips: [
      'Choose versatile end-words with multiple meanings',
      'The spiraling pattern creates obsessive intensity',
      'Very challenging but rewarding to complete'
    ]
  }
];

export default function HistoricalFormsExplorer() {
  const [selectedForm, setSelectedForm] = useState<any>(null);

  if (selectedForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedForm(null)}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Forms
        </button>

        <div className="glass rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {selectedForm.name}
          </h2>

          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Globe size={16} />
              <span><strong>Origin:</strong> {selectedForm.origin}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar size={16} />
              <span><strong>Period:</strong> {selectedForm.period}</span>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {selectedForm.description}
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Structure
              </h3>
              <ul className="space-y-2">
                {selectedForm.structure.map((rule: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Example
              </h3>
              <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <pre className="text-slate-900 dark:text-white whitespace-pre-wrap font-serif">
                  {selectedForm.example}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Writing Tips
              </h3>
              <ul className="space-y-2">
                {selectedForm.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Try It Yourself
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Now that you've learned about the {selectedForm.name}, why not try writing your own?
            Use the structure guide above and don't worry about perfection — experimentation is part of the learning process.
          </p>
          <a
            href="#editor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Open Poem Editor
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-blue-600 dark:text-blue-400" size={32} />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Historical Forms Explorer</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Explore historical poetry forms from different cultures with examples and writing guides.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {HISTORICAL_FORMS.map((form) => (
          <div key={form.id} className="glass rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              {form.name}
            </h3>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                {form.origin}
              </span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                {form.period}
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
              {form.description}
            </p>

            <button
              onClick={() => setSelectedForm(form)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Learn More
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 glass rounded-xl p-6 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Why Explore Historical Forms?
        </h3>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Learn from centuries of poetic tradition and craftsmanship</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Understand how different cultures approach poetry and meaning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Challenge yourself with complex structures and patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Discover new ways to express emotions and ideas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Add depth and variety to your poetic repertoire</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
