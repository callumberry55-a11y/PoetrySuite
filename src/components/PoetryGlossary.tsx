import { useState, useMemo } from 'react';
import { Book, Search, BookOpen, Sparkles, Music, Palette, FileText, Target } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  category: string;
}

export default function PoetryGlossary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const glossaryTerms: GlossaryTerm[] = [
    {
      term: 'Alliteration',
      category: 'Sound Devices',
      definition: 'The repetition of the same consonant sounds at the beginning of words that are close together.',
      example: '"Peter Piper picked a peck of pickled peppers" or "The fair breeze blew, the white foam flew"'
    },
    {
      term: 'Assonance',
      category: 'Sound Devices',
      definition: 'The repetition of vowel sounds within words that are close together.',
      example: '"Hear the mellow wedding bells" (repetition of "e" sound)'
    },
    {
      term: 'Consonance',
      category: 'Sound Devices',
      definition: 'The repetition of consonant sounds, typically at the end of words or within words.',
      example: '"Pitter patter" or "all mammals named Sam are clammy"'
    },
    {
      term: 'Onomatopoeia',
      category: 'Sound Devices',
      definition: 'Words that imitate the sound they describe.',
      example: 'Buzz, hiss, crack, whisper, boom, splash, sizzle'
    },
    {
      term: 'Rhyme',
      category: 'Sound Devices',
      definition: 'The correspondence of sound between words or the endings of words, especially at the ends of lines.',
      example: 'End rhyme: "moon/June", Internal rhyme: "I went to town to buy a gown"'
    },
    {
      term: 'Slant Rhyme',
      category: 'Sound Devices',
      definition: 'Also called near rhyme or half rhyme, occurs when words have similar but not identical sounds.',
      example: 'Soul/oil, worm/swarm, years/yours'
    },
    {
      term: 'Metaphor',
      category: 'Figurative Language',
      definition: 'A direct comparison between two unlike things, stating one thing is another.',
      example: '"Hope is the thing with feathers" - Emily Dickinson. "Time is a thief"'
    },
    {
      term: 'Simile',
      category: 'Figurative Language',
      definition: 'A comparison between two unlike things using "like" or "as".',
      example: '"My love is like a red, red rose" - Robert Burns. "As brave as a lion"'
    },
    {
      term: 'Personification',
      category: 'Figurative Language',
      definition: 'Giving human characteristics to non-human things or abstract concepts.',
      example: '"The wind whispered through the trees" or "Death kindly stopped for me"'
    },
    {
      term: 'Hyperbole',
      category: 'Figurative Language',
      definition: 'Extreme exaggeration used for emphasis or effect.',
      example: '"I\'ve told you a million times" or "I\'m so hungry I could eat a horse"'
    },
    {
      term: 'Imagery',
      category: 'Figurative Language',
      definition: 'Vivid descriptive language that appeals to the senses (sight, sound, touch, taste, smell).',
      example: '"The autumn leaves crunched underfoot, releasing an earthy perfume into the crisp air"'
    },
    {
      term: 'Symbolism',
      category: 'Figurative Language',
      definition: 'Using an object, person, situation, or word to represent something beyond its literal meaning.',
      example: 'A dove symbolizing peace, a road symbolizing life\'s journey, darkness symbolizing evil or ignorance'
    },
    {
      term: 'Sonnet',
      category: 'Forms',
      definition: 'A 14-line poem, typically in iambic pentameter. Shakespearean sonnets rhyme ABABCDCDEFEFGG; Petrarchan sonnets divide into octave (8 lines) and sestet (6 lines).',
      example: 'Shakespeare\'s "Shall I compare thee to a summer\'s day?" is a famous English sonnet'
    },
    {
      term: 'Haiku',
      category: 'Forms',
      definition: 'A traditional Japanese form of three lines with a 5-7-5 syllable pattern, typically about nature and containing a seasonal reference.',
      example: '"An old silent pond / A frog jumps into the pond— / Splash! Silence again." - Basho'
    },
    {
      term: 'Villanelle',
      category: 'Forms',
      definition: 'A 19-line poem with two repeating rhymes and two refrains. The form consists of five tercets followed by a quatrain.',
      example: 'Dylan Thomas\'s "Do Not Go Gentle Into That Good Night" is a famous villanelle'
    },
    {
      term: 'Free Verse',
      category: 'Forms',
      definition: 'Poetry without a consistent meter, rhyme scheme, or musical pattern. It relies on natural speech patterns and varied line lengths.',
      example: 'Walt Whitman\'s "Song of Myself" pioneered free verse in American poetry'
    },
    {
      term: 'Limerick',
      category: 'Forms',
      definition: 'A humorous five-line poem with an AABBA rhyme scheme and a distinctive rhythm.',
      example: '"There once was a man from Nantucket / Who kept all his cash in a bucket..."'
    },
    {
      term: 'Ode',
      category: 'Forms',
      definition: 'A lyrical poem, typically of elaborate or irregular metrical form, addressing and celebrating a particular subject.',
      example: 'John Keats\' "Ode to a Nightingale" or Pablo Neruda\'s "Ode to a Tomato"'
    },
    {
      term: 'Meter',
      category: 'Structure & Rhythm',
      definition: 'The rhythmic structure of a poem, determined by the pattern of stressed and unstressed syllables.',
      example: 'Iambic pentameter has five pairs of unstressed-stressed syllables per line'
    },
    {
      term: 'Iambic Pentameter',
      category: 'Structure & Rhythm',
      definition: 'A metrical line consisting of five iambs (unstressed-stressed syllable pairs). The most common meter in English poetry.',
      example: '"Shall I / com-PARE / thee TO / a SUM / mer\'s DAY?" - Shakespeare'
    },
    {
      term: 'Stanza',
      category: 'Structure & Rhythm',
      definition: 'A grouped set of lines within a poem, usually set off from other stanzas by a blank line.',
      example: 'A quatrain is a four-line stanza; a tercet is a three-line stanza; a couplet is two lines'
    },
    {
      term: 'Enjambment',
      category: 'Structure & Rhythm',
      definition: 'When a sentence or phrase runs over from one line to the next without punctuation, creating flow and momentum.',
      example: '"I could not stop for Death— / He kindly stopped for me—" - Emily Dickinson'
    },
    {
      term: 'Caesura',
      category: 'Structure & Rhythm',
      definition: 'A pause or break within a line of poetry, often marked by punctuation.',
      example: '"To be, || or not to be, || that is the question" - Shakespeare (|| marks caesuras)'
    },
    {
      term: 'Refrain',
      category: 'Structure & Rhythm',
      definition: 'A line or group of lines repeated at intervals throughout a poem, usually at the end of stanzas.',
      example: 'The repeated line "Nevermore" in Poe\'s "The Raven"'
    },
    {
      term: 'Volta',
      category: 'Structure & Rhythm',
      definition: 'The turn or shift in thought in a poem, particularly common in sonnets. In Shakespearean sonnets, it typically occurs at line 13; in Petrarchan sonnets, at line 9.',
      example: 'The shift from describing summer to declaring eternal love in Shakespeare\'s Sonnet 18'
    },
    {
      term: 'Allusion',
      category: 'Literary Devices',
      definition: 'A brief reference to a person, event, place, or work of art. Often from literature, mythology, religion, or history.',
      example: '"He was a real Romeo with the ladies" (allusion to Shakespeare\'s Romeo and Juliet)'
    },
    {
      term: 'Apostrophe',
      category: 'Literary Devices',
      definition: 'Directly addressing an absent person, abstract concept, or inanimate object as if it were present and able to respond.',
      example: '"O Captain! My Captain!" - Walt Whitman, or "Death, be not proud" - John Donne'
    },
    {
      term: 'Irony',
      category: 'Literary Devices',
      definition: 'A contrast between expectation and reality. Can be verbal (saying the opposite of what you mean), situational, or dramatic.',
      example: '"The Rime of the Ancient Mariner": "Water, water, everywhere, / Nor any drop to drink"'
    },
    {
      term: 'Paradox',
      category: 'Literary Devices',
      definition: 'A statement that appears contradictory but reveals a deeper truth.',
      example: '"I must be cruel only to be kind" - Shakespeare, or "Less is more"'
    },
    {
      term: 'Oxymoron',
      category: 'Literary Devices',
      definition: 'Two contradictory terms used together.',
      example: 'Deafening silence, bittersweet, living death, jumbo shrimp, organized chaos'
    },
    {
      term: 'Tone',
      category: 'Literary Devices',
      definition: 'The attitude or feeling the poet conveys through word choice, imagery, and style.',
      example: 'Tone can be playful, somber, ironic, reverent, angry, melancholic, celebratory, etc.'
    },
    {
      term: 'Diction',
      category: 'Craft & Technique',
      definition: 'The choice and use of words and phrases in writing. Can be formal, informal, colloquial, abstract, or concrete.',
      example: 'Comparing "The precipitation commenced" (formal) vs. "It started raining" (informal)'
    },
    {
      term: 'Syntax',
      category: 'Craft & Technique',
      definition: 'The arrangement of words and phrases to create well-formed sentences. Poets often manipulate syntax for effect.',
      example: 'Standard: "I wandered lonely." Inverted: "Lonely I wandered" or "Wandered lonely I"'
    },
    {
      term: 'Voice',
      category: 'Craft & Technique',
      definition: 'The distinctive style or personality that comes through in a poet\'s work. The unique way a poet expresses themselves.',
      example: 'Emily Dickinson\'s voice: compressed, enigmatic, uses dashes. Walt Whitman\'s: expansive, celebratory, cataloguing'
    },
    {
      term: 'Concrete Poetry',
      category: 'Craft & Technique',
      definition: 'Poetry where the visual arrangement of text creates a picture or shape related to the poem\'s subject.',
      example: 'George Herbert\'s "Easter Wings" is shaped like wings; poems shaped like their subject matter'
    },
    {
      term: 'Ekphrastic Poetry',
      category: 'Craft & Technique',
      definition: 'A poem that describes, responds to, or comments on a work of visual art.',
      example: 'W.H. Auden\'s "Musée des Beaux Arts" (about Bruegel paintings) or Keats\' "Ode on a Grecian Urn"'
    },
    {
      term: 'Synecdoche',
      category: 'Literary Devices',
      definition: 'A figure of speech where a part represents the whole or the whole represents a part.',
      example: '"All hands on deck" (hands = sailors), "Nice wheels" (wheels = car)'
    },
    {
      term: 'Metonymy',
      category: 'Literary Devices',
      definition: 'Substituting the name of one thing for something closely associated with it.',
      example: '"The White House issued a statement" (White House = President), "Hollywood" (the film industry)'
    },
    {
      term: 'Anaphora',
      category: 'Literary Devices',
      definition: 'The repetition of a word or phrase at the beginning of successive lines or clauses.',
      example: '"We shall fight on the beaches, we shall fight on the landing grounds..." - Churchill'
    },
    {
      term: 'Epistrophe',
      category: 'Literary Devices',
      definition: 'The repetition of a word or phrase at the end of successive lines or clauses.',
      example: '"...government of the people, by the people, for the people..." - Lincoln'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Terms', icon: BookOpen, color: 'from-slate-500 to-slate-600' },
    { id: 'Sound Devices', name: 'Sound Devices', icon: Music, color: 'from-blue-500 to-cyan-500' },
    { id: 'Figurative Language', name: 'Figurative Language', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'Forms', name: 'Poetry Forms', icon: FileText, color: 'from-emerald-500 to-teal-500' },
    { id: 'Structure & Rhythm', name: 'Structure & Rhythm', icon: Target, color: 'from-orange-500 to-amber-500' },
    { id: 'Literary Devices', name: 'Literary Devices', icon: Palette, color: 'from-rose-500 to-red-500' },
    { id: 'Craft & Technique', name: 'Craft & Technique', icon: Book, color: 'from-indigo-500 to-violet-500' }
  ];

  const filteredTerms = useMemo(() => {
    let terms = glossaryTerms;

    if (selectedCategory !== 'all') {
      terms = terms.filter(term => term.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      terms = terms.filter(term =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        (term.example && term.example.toLowerCase().includes(query))
      );
    }

    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  const currentCategory = categories.find(c => c.id === selectedCategory) || categories[0];
  const CategoryIcon = currentCategory.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-24">
      <div className={`relative bg-gradient-to-r ${currentCategory.color} h-32 sm:h-40`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Book className="w-10 h-10 sm:w-12 sm:h-12 mb-2 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">Poetry Glossary</h1>
          <p className="text-sm sm:text-base opacity-90">Master the language and craft of poetry</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search poetry terms, definitions, or examples..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white scale-105`
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 bg-gradient-to-r ${currentCategory.color} rounded-2xl shadow-lg`}>
              <CategoryIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentCategory.name}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'} found
              </p>
            </div>
          </div>
        </div>

        {filteredTerms.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Book className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No terms found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTerms.map((term) => {
              const termCategory = categories.find(c => c.id === term.category);
              const TermIcon = termCategory?.icon || BookOpen;
              return (
                <div
                  key={term.term}
                  className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 bg-gradient-to-r ${termCategory?.color || 'from-slate-500 to-slate-600'} rounded-xl shadow-lg flex-shrink-0`}>
                      <TermIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {term.term}
                      </h3>
                      <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                        {term.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    {term.definition}
                  </p>

                  {term.example && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Example
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
                        {term.example}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
