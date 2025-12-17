import { useState } from 'react';
import { Book, Lightbulb, Type, Sparkles, Heart, Gauge } from 'lucide-react';

interface WritingAssistantProps {
  selectedText: string;
  poemContent: string;
  onInsert: (text: string) => void;
}

export default function WritingAssistant({ selectedText, poemContent, onInsert }: WritingAssistantProps) {
  const [activeTab, setActiveTab] = useState<'tips' | 'devices' | 'meters' | 'rhyme' | 'imagery' | 'structure'>('tips');

  const writingTips = [
    'Show, don\'t tell - use concrete imagery and sensory details',
    'Read your poem aloud to test its rhythm and flow',
    'Use unexpected word combinations to create fresh imagery',
    'Consider line breaks as a tool for pacing and emphasis',
    'Let your first draft be messy - perfection comes in revision',
    'Use strong, specific verbs instead of relying on adjectives',
    'Create tension between form and content for deeper meaning',
    'Trust your unique voice - authenticity resonates with readers',
  ];

  const literaryDevices = [
    { name: 'Metaphor', description: 'Comparing two unlike things directly', example: '"Time is a thief"' },
    { name: 'Simile', description: 'Comparing using "like" or "as"', example: '"Her smile was like sunshine"' },
    { name: 'Personification', description: 'Giving human qualities to non-human things', example: '"The wind whispered secrets"' },
    { name: 'Alliteration', description: 'Repetition of initial consonant sounds', example: '"Peter Piper picked"' },
    { name: 'Assonance', description: 'Repetition of vowel sounds', example: '"The rain in Spain"' },
    { name: 'Consonance', description: 'Repetition of consonant sounds', example: '"Pitter patter"' },
    { name: 'Enjambment', description: 'Continuing a sentence beyond line break', example: 'Creates flow and momentum' },
    { name: 'Imagery', description: 'Vivid sensory language', example: 'Appeal to sight, sound, touch, taste, smell' },
    { name: 'Symbolism', description: 'Using objects to represent ideas', example: '"A dove represents peace"' },
    { name: 'Onomatopoeia', description: 'Words that imitate sounds', example: '"Buzz, hiss, splash"' },
  ];

  const meterTypes = [
    { name: 'Iambic', pattern: 'da-DUM', description: 'Unstressed-stressed (most common)', example: 'a-LONE, to-DAY' },
    { name: 'Trochaic', pattern: 'DUM-da', description: 'Stressed-unstressed', example: 'NE-ver, AL-ways' },
    { name: 'Anapestic', pattern: 'da-da-DUM', description: 'Two unstressed, one stressed', example: 'un-der-STAND' },
    { name: 'Dactylic', pattern: 'DUM-da-da', description: 'One stressed, two unstressed', example: 'ME-rri-ly' },
    { name: 'Spondaic', pattern: 'DUM-DUM', description: 'Two stressed syllables', example: 'HEART-BEAT' },
    { name: 'Pyrrhic', pattern: 'da-da', description: 'Two unstressed syllables', example: 'in the' },
  ];

  const rhymeSchemes = [
    { name: 'Couplet', scheme: 'AA BB CC', description: 'Two consecutive rhyming lines' },
    { name: 'Alternate', scheme: 'ABAB CDCD', description: 'Every other line rhymes' },
    { name: 'Enclosed', scheme: 'ABBA CDDC', description: 'Rhymes enclose middle lines' },
    { name: 'Terza Rima', scheme: 'ABA BCB CDC', description: 'Interlocking three-line stanzas' },
    { name: 'Monorhyme', scheme: 'AAAA', description: 'All lines rhyme with each other' },
    { name: 'Limerick', scheme: 'AABBA', description: 'Five-line humorous verse' },
  ];

  const imageryCategories = [
    { category: 'Nature', examples: ['crimson sunset', 'whispering pines', 'morning dew', 'rolling thunder', 'autumn leaves'] },
    { category: 'Emotion', examples: ['heavy heart', 'lightness of being', 'storm of tears', 'quiet joy', 'burning anger'] },
    { category: 'Time', examples: ['endless moment', 'fleeting youth', 'eternal now', 'borrowed time', 'golden age'] },
    { category: 'Light', examples: ['silver moonbeam', 'dancing shadows', 'golden hour', 'flickering candle', 'starlit path'] },
    { category: 'Sound', examples: ['deafening silence', 'rustling leaves', 'distant echo', 'melodic laughter', 'thunderous applause'] },
    { category: 'Texture', examples: ['velvet darkness', 'rough edges', 'silken words', 'jagged thoughts', 'smooth sailing'] },
  ];

  const poemStructures = [
    { name: 'Sonnet', lines: 14, description: 'Traditional 14-line poem, usually iambic pentameter' },
    { name: 'Haiku', lines: 3, description: '5-7-5 syllable pattern, focuses on nature and moments' },
    { name: 'Villanelle', lines: 19, description: 'Five tercets and one quatrain with specific repetition' },
    { name: 'Sestina', lines: 39, description: 'Six stanzas of six lines plus three-line envoi' },
    { name: 'Pantoum', lines: 'Variable', description: 'Interlocking quatrains with repeating lines' },
    { name: 'Ghazal', lines: 'Variable', description: 'Series of couplets with refrain and rhyme' },
    { name: 'Free Verse', lines: 'Variable', description: 'No fixed pattern, relies on natural speech rhythms' },
    { name: 'Prose Poem', lines: 'Variable', description: 'Written in prose form but with poetic qualities' },
  ];

  const tabs = [
    { id: 'tips' as const, label: 'Tips', icon: Lightbulb },
    { id: 'devices' as const, label: 'Devices', icon: Sparkles },
    { id: 'meters' as const, label: 'Meter', icon: Gauge },
    { id: 'rhyme' as const, label: 'Rhyme', icon: Type },
    { id: 'imagery' as const, label: 'Imagery', icon: Heart },
    { id: 'structure' as const, label: 'Forms', icon: Book },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Writing Resources</h3>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'tips' && (
          <ul className="space-y-3">
            {writingTips.map((tip, index) => (
              <li key={index} className="flex gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'devices' && (
          <div className="space-y-4">
            {literaryDevices.map((device, index) => (
              <div key={index} className="border-l-2 border-blue-600 dark:border-blue-400 pl-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{device.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{device.description}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 italic">{device.example}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'meters' && (
          <div className="space-y-4">
            {meterTypes.map((meter, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{meter.name}</h4>
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">{meter.pattern}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{meter.description}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Example: {meter.example}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rhyme' && (
          <div className="space-y-4">
            {rhymeSchemes.map((scheme, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{scheme.name}</h4>
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">{scheme.scheme}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{scheme.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'imagery' && (
          <div className="space-y-4">
            {imageryCategories.map((category, index) => (
              <div key={index}>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{category.category}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.examples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => onInsert(example)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="space-y-4">
            {poemStructures.map((structure, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{structure.name}</h4>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{structure.lines} lines</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{structure.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
