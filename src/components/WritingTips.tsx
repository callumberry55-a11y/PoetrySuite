import { useState } from 'react';
import { Lightbulb, Sparkles, BookOpen, Feather, Target, Wand2, Eye, Pen, MessageSquare } from 'lucide-react';

interface Tip {
  title: string;
  description: string;
  example?: string;
}

interface Category {
  name: string;
  icon: any;
  color: string;
  tips: Tip[];
}

export default function WritingTips() {
  const [selectedCategory, setSelectedCategory] = useState(0);

  const categories: Category[] = [
    {
      name: 'Imagery & Sensory Details',
      icon: Eye,
      color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
      tips: [
        {
          title: 'Show, Don\'t Tell',
          description: 'Instead of stating emotions directly, show them through concrete images and actions.',
          example: 'Instead of "I am sad," try "Rain drips from my sleeve onto the empty chair."'
        },
        {
          title: 'Engage All Five Senses',
          description: 'Go beyond visual imagery. Include sounds, smells, textures, and tastes to create a vivid, immersive experience.',
          example: 'The salt-crusted dock creaked under my feet, gulls crying overhead, fish-scent thick in the fog.'
        },
        {
          title: 'Use Specific Details',
          description: 'Replace general words with specific, concrete details. "Flower" becomes "wild iris," "bird" becomes "red-winged blackbird."',
          example: 'Not "the old house," but "the Victorian with peeling turquoise paint and a rusted weathervane."'
        },
        {
          title: 'Create Unexpected Images',
          description: 'Surprise readers with fresh, original imagery that challenges conventional descriptions.',
          example: 'The moon wore the city like a tarnished crown of broken glass and neon signs.'
        }
      ]
    },
    {
      name: 'Metaphor & Figurative Language',
      icon: Wand2,
      color: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
      tips: [
        {
          title: 'Extended Metaphors',
          description: 'Develop a central metaphor throughout the entire poem, exploring different facets and implications.',
          example: 'If love is a garden, explore: planting, seasons, weeding, harvest, and winter dormancy.'
        },
        {
          title: 'Mixed Senses (Synesthesia)',
          description: 'Combine different sensory experiences for striking effect.',
          example: 'The cold blue sound of winter wind, the rough taste of her goodbye, violet silence.'
        },
        {
          title: 'Avoid Clichés',
          description: 'Replace worn-out comparisons with fresh perspectives. Rethink "red as a rose," "time flies," "heart of gold."',
          example: 'Instead of "time flies," try "hours dissolve like sugar in rain" or "days slip through my fingers like minnows."'
        },
        {
          title: 'Personification with Purpose',
          description: 'Give human qualities to non-human things, but ensure it serves the poem\'s emotional core.',
          example: 'The jealous wind stripped leaves from the oak; the patient river waited at the stone\'s feet.'
        }
      ]
    },
    {
      name: 'Sound & Rhythm',
      icon: MessageSquare,
      color: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
      tips: [
        {
          title: 'Read Aloud',
          description: 'Always read your poems aloud. The ear catches awkward rhythms, clunky word choices, and line break issues the eye might miss.',
          example: 'Listen for: natural speech patterns, where you naturally pause, which words feel heavy or light.'
        },
        {
          title: 'Consonance & Assonance',
          description: 'Use repeated consonant and vowel sounds within words for subtle musical effects.',
          example: 'Consonance: "The silken, sad, uncertain rustling." Assonance: "slow road home at dawn."'
        },
        {
          title: 'Vary Line Lengths',
          description: 'Mix short and long lines to control pacing. Short lines speed up, create tension. Long lines slow down, elaborate.',
          example: 'Short line: "Stop." Long line: "The world holds its breath in the space between thunder and rain."'
        },
        {
          title: 'Intentional Repetition',
          description: 'Repeat words, phrases, or structures for emphasis, rhythm, or to create a haunting effect.',
          example: 'Let it go. Let it go like leaves, like light, like yesterday\'s impossible promises.'
        }
      ]
    },
    {
      name: 'Line Breaks & Structure',
      icon: Feather,
      color: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400',
      tips: [
        {
          title: 'Break on Strong Words',
          description: 'End lines with words you want to emphasize. The line break creates a micro-pause that gives the word extra weight.',
          example: 'Break after: "I waited / all winter" vs. "I / waited all winter." The first emphasizes "waited."'
        },
        {
          title: 'Enjambment for Flow',
          description: 'Let sentences run over line breaks without punctuation to create momentum and surprise.',
          example: 'The river carried / what I could not say / downstream into the delta\'s / secret mouth.'
        },
        {
          title: 'White Space as Silence',
          description: 'Use stanza breaks and indentation to create pauses, silence, or visual interest on the page.',
          example: 'A single-line stanza can create a moment of isolation or emphasis after a dense passage.'
        },
        {
          title: 'Consider the Visual',
          description: 'How the poem looks on the page matters. Shape can reinforce meaning.',
          example: 'A poem about falling might use descending indentation. A poem about barriers might use justified margins.'
        }
      ]
    },
    {
      name: 'Word Choice & Precision',
      icon: Target,
      color: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
      tips: [
        {
          title: 'Every Word Earns Its Place',
          description: 'Poetry is the art of compression. Remove unnecessary words. Can you say it in fewer words without losing meaning?',
          example: 'Instead of "the color of blue," just "blue." Instead of "very sad," find a precise word: "bereft," "hollow," "gutted."'
        },
        {
          title: 'Strong Verbs Over Adverbs',
          description: 'Replace weak verb + adverb with a single strong verb.',
          example: 'Instead of "walked slowly," use: trudged, crept, shuffled, dragged. Instead of "said loudly," use: shouted, bellowed, roared.'
        },
        {
          title: 'Anglo-Saxon vs. Latinate Words',
          description: 'Anglo-Saxon words (short, direct) feel earthier. Latinate words (longer, abstract) feel more formal or intellectual.',
          example: 'Anglo-Saxon: dark, eat, fight, love. Latinate: obscurity, consume, conflict, affection. Mix them deliberately.'
        },
        {
          title: 'Trust the Concrete',
          description: 'Concrete nouns create stronger images than abstract ones. Root abstract concepts in physical reality.',
          example: 'Not "freedom," but "an open field." Not "grief," but "the empty chair at dinner."'
        }
      ]
    },
    {
      name: 'Revision & Editing',
      icon: Pen,
      color: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400',
      tips: [
        {
          title: 'The First Draft is Discovery',
          description: 'Don\'t judge your first draft. Its job is to exist, not to be perfect. Write freely, revise ruthlessly.',
          example: 'Set aside your first draft for at least a day or week. Fresh eyes see more clearly.'
        },
        {
          title: 'Read as a Stranger',
          description: 'Pretend you\'ve never seen the poem before. What\'s confusing? What\'s not earned? What\'s unnecessary?',
          example: 'Ask: Does every image work? Does the ending land? Are there clichés I\'ve become blind to?'
        },
        {
          title: 'Cut Your Darlings',
          description: 'That beautiful line that doesn\'t serve the poem? Remove it. Save it for another poem.',
          example: 'If a line draws attention to itself instead of the poem\'s meaning, it may need to go.'
        },
        {
          title: 'Multiple Revision Passes',
          description: 'Each revision should focus on one element: imagery, then sound, then line breaks, then word choice.',
          example: 'Pass 1: Clarity. Pass 2: Sound. Pass 3: Line breaks. Pass 4: Compression. Pass 5: Final polish.'
        }
      ]
    },
    {
      name: 'Finding Inspiration',
      icon: Sparkles,
      color: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400',
      tips: [
        {
          title: 'Observe the Ordinary',
          description: 'The extraordinary is hidden in everyday moments. Pay attention to details others overlook.',
          example: 'The way light moves across a wall, how strangers hold their phones, the specific sound of your door closing.'
        },
        {
          title: 'Follow Your Obsessions',
          description: 'Write about what you can\'t stop thinking about. Genuine obsession fuels authentic poetry.',
          example: 'What images recur in your thoughts? What memories return unbidden? Those are your subjects.'
        },
        {
          title: 'Constraints Spark Creativity',
          description: 'Give yourself limits: write a poem using only one-syllable words, or without the letter "e," or exactly 50 words.',
          example: 'Write a sonnet, a haiku sequence, or use only words from a newspaper article.'
        },
        {
          title: 'Keep an Idea Journal',
          description: 'Capture images, overheard phrases, dreams, and random thoughts. These fragments become poem seeds.',
          example: 'Note: moments that strike you, unusual word combinations, questions that linger, contradictions you notice.'
        }
      ]
    },
    {
      name: 'Poetry Forms & Traditions',
      icon: BookOpen,
      color: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400',
      tips: [
        {
          title: 'Study the Masters',
          description: 'Read widely across time periods and cultures. See what worked, what endures, and what you can adapt.',
          example: 'Study: Shakespeare\'s sonnets, Dickinson\'s slant rhymes, Neruda\'s odes, Basho\'s haiku, Brooks\' urban poetry.'
        },
        {
          title: 'Learn the Forms',
          description: 'Understanding traditional forms (sonnet, villanelle, ghazal) teaches you about structure, even if you break the rules.',
          example: 'Try writing a sonnet to understand volta (turn). Then apply that turn to free verse.'
        },
        {
          title: 'Free Verse Still Has Structure',
          description: 'Free verse means freedom from meter and rhyme, not freedom from all structure. It still needs shape and intentionality.',
          example: 'Your free verse can be structured by: recurring images, parallel syntax, emotional progression, sonic patterns.'
        },
        {
          title: 'Experiment with Hybrids',
          description: 'Mix forms, blend traditions, create new structures. Poetry evolves through innovation.',
          example: 'Combine: a ghazal\'s repetition with free verse, a sonnet\'s structure with prose poetry, haiku brevity with narrative.'
        }
      ]
    }
  ];

  const selected = categories[selectedCategory];
  const Icon = selected.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className={`relative bg-gradient-to-r ${selected.color.replace('from-', 'from-').replace('to-', 'to-').replace('50', '500').replace('900/20', '600')} h-32 sm:h-40`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Writing Tips & Techniques</h1>
          <p className="text-sm sm:text-base opacity-90">Master the craft of poetry</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <div className="flex gap-3 flex-wrap">
            {categories.map((category, index) => {
              const CategoryIcon = category.icon;
              const isSelected = selectedCategory === index;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(index)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                    isSelected
                      ? `bg-gradient-to-r ${category.color.replace('50', '500').replace('900/20', '600')} text-white scale-105`
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <CategoryIcon className="w-5 h-5" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`bg-gradient-to-br ${selected.color} rounded-3xl border-2 ${selected.color.replace('from-', 'border-').split(' ')[0].replace('to-', '')} p-6 mb-6 shadow-xl`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${selected.color.replace('50', '500').replace('900/20', '600')} rounded-2xl shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selected.name}
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {selected.tips.length} essential techniques to elevate your poetry
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selected.tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 bg-gradient-to-br ${selected.color.replace('50', '100').replace('900/20', '900/30')} rounded-2xl shadow-lg flex-shrink-0`}>
                  <span className="text-2xl font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
              {tip.example && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 ml-16">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Example
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    {tip.example}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl border-2 border-blue-300 dark:border-blue-800 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Remember
            </h3>
          </div>
          <ul className="text-blue-800 dark:text-blue-200 space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              <span><strong>Read constantly:</strong> The best poets are voracious readers of poetry and everything else.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              <span><strong>Write regularly:</strong> Make poetry a practice, not just an inspiration-dependent activity.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              <span><strong>Join a community:</strong> Share work, get feedback, and learn from other poets.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              <span><strong>Revise ruthlessly:</strong> Great poems are made in revision, not in the first draft.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              <span><strong>Trust your voice:</strong> Learn the rules, then find your own way of breaking them.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
