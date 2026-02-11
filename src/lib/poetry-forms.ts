export interface PoetryForm {
  id: string;
  name: string;
  description: string;
  structure: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  template: string;
  rules: string[];
  examples: string[];
}

export const poetryForms: PoetryForm[] = [
  {
    id: 'haiku',
    name: 'Haiku',
    description: 'A traditional Japanese form capturing a moment in nature',
    structure: '3 lines: 5-7-5 syllables',
    difficulty: 'beginner',
    template: '[5 syllables]\n[7 syllables]\n[5 syllables]',
    rules: [
      '3 lines with 5-7-5 syllable pattern',
      'Focus on nature or seasons',
      'Present tense preferred',
      'Capture a single moment',
    ],
    examples: [
      'An old silent pond\nA frog jumps into the pond—\nSplash! Silence again',
      'Winter moonlight falls\nOn snow-covered evergreens\nSilver shadows dance',
    ],
  },
  {
    id: 'sonnet',
    name: 'Sonnet',
    description: 'A 14-line poem with intricate rhyme scheme',
    structure: '14 lines, iambic pentameter, specific rhyme scheme',
    difficulty: 'advanced',
    template: 'Line 1 (A)\nLine 2 (B)\nLine 3 (A)\nLine 4 (B)\nLine 5 (C)\nLine 6 (D)\nLine 7 (C)\nLine 8 (D)\nLine 9 (E)\nLine 10 (F)\nLine 11 (E)\nLine 12 (F)\nLine 13 (G)\nLine 14 (G)',
    rules: [
      '14 lines total',
      'Iambic pentameter (10 syllables per line)',
      'Shakespearean rhyme scheme: ABAB CDCD EFEF GG',
      'Volta (turn) typically after line 12',
    ],
    examples: [
      'Shall I compare thee to a summer\'s day?\nThou art more lovely and more temperate...',
    ],
  },
  {
    id: 'limerick',
    name: 'Limerick',
    description: 'A humorous five-line poem with AABBA rhyme',
    structure: '5 lines with AABBA rhyme scheme',
    difficulty: 'beginner',
    template: '[Line 1 - A]\n[Line 2 - A]\n[Line 3 - B]\n[Line 4 - B]\n[Line 5 - A]',
    rules: [
      '5 lines total',
      'AABBA rhyme scheme',
      'Lines 1, 2, 5 are longer (7-10 syllables)',
      'Lines 3, 4 are shorter (5-7 syllables)',
      'Usually humorous or whimsical',
    ],
    examples: [
      'There once was a man from Peru\nWho dreamed he was eating his shoe\nHe woke with a fright\nIn the middle of night\nTo find that his dream had come true',
    ],
  },
  {
    id: 'villanelle',
    name: 'Villanelle',
    description: 'A complex form with repeating refrains',
    structure: '19 lines, 5 tercets + 1 quatrain, 2 refrains',
    difficulty: 'advanced',
    template: 'A1\nb\nA2\n\na\nb\nA1\n\na\nb\nA2\n\na\nb\nA1\n\na\nb\nA2\n\na\nb\nA1\nA2',
    rules: [
      '19 lines: 5 tercets + 1 quatrain',
      'Two refrain lines (A1 and A2) that alternate',
      'Rhyme scheme: ABA ABA ABA ABA ABA ABAA',
      'Refrains appear at specific positions',
    ],
    examples: [
      'Do not go gentle into that good night...',
    ],
  },
  {
    id: 'tanka',
    name: 'Tanka',
    description: 'Japanese form, longer than haiku',
    structure: '5 lines: 5-7-5-7-7 syllables',
    difficulty: 'beginner',
    template: '[5 syllables]\n[7 syllables]\n[5 syllables]\n[7 syllables]\n[7 syllables]',
    rules: [
      '5 lines with 5-7-5-7-7 syllable pattern',
      'Often explores emotions or relationships',
      'Can be more personal than haiku',
      'May have a pivot or turn',
    ],
    examples: [
      'Spring raindrops falling\nGently on the cherry blooms\nPetals drift away\nCarried by the evening breeze\nTo places unknown and far',
    ],
  },
  {
    id: 'acrostic',
    name: 'Acrostic',
    description: 'First letters spell a word vertically',
    structure: 'Variable length, first letters spell a word',
    difficulty: 'beginner',
    template: '[P]oem line\n[O]ther line\n[E]xample line\n[M]ore line',
    rules: [
      'First letter of each line spells a word',
      'Can be any length',
      'Lines can be any length',
      'Word is typically the subject',
    ],
    examples: [
      'Peaceful evening sky\nOrchids bloom in silence\nEvery moment still\nTranquil beauty flows',
    ],
  },
  {
    id: 'free-verse',
    name: 'Free Verse',
    description: 'No fixed structure, focused on natural rhythm',
    structure: 'No fixed structure or rhyme scheme',
    difficulty: 'intermediate',
    template: 'Write freely...\nLet your thoughts flow...\nNo rules to follow...',
    rules: [
      'No required rhyme scheme',
      'No fixed meter',
      'Focus on imagery and natural speech',
      'Line breaks create rhythm and emphasis',
    ],
    examples: [
      'The fog comes\non little cat feet.\nIt sits looking\nover harbor and city...',
    ],
  },
  {
    id: 'cinquain',
    name: 'Cinquain',
    description: 'Five-line poem with syllable pattern',
    structure: '5 lines: 2-4-6-8-2 syllables',
    difficulty: 'beginner',
    template: '[2 syllables]\n[4 syllables]\n[6 syllables]\n[8 syllables]\n[2 syllables]',
    rules: [
      '5 lines total',
      'Syllable pattern: 2-4-6-8-2',
      'Often describes a single image or moment',
      'Last line echoes or contrasts first line',
    ],
    examples: [
      'Autumn\nLeaves falling down\nRed gold and orange bright\nBlanket the earth with color\nPeace falls',
    ],
  },
  {
    id: 'pantoum',
    name: 'Pantoum',
    description: 'Form with interlocking repeating lines',
    structure: 'Variable quatrains with repeating lines',
    difficulty: 'advanced',
    template: 'Line 1\nLine 2\nLine 3\nLine 4\n\nLine 2 (repeat)\nLine 5\nLine 4 (repeat)\nLine 6',
    rules: [
      'Written in quatrains',
      'Lines 2 and 4 of each stanza become lines 1 and 3 of next',
      'Can be any length',
      'Last stanza often repeats lines from first',
    ],
    examples: [],
  },
  {
    id: 'ghazal',
    name: 'Ghazal',
    description: 'Ancient Persian form with couplets',
    structure: 'Couplets with repeating refrain',
    difficulty: 'advanced',
    template: 'Line ending with [REFRAIN]\nLine ending with [REFRAIN]\n\nNew couplet\nLine ending with [REFRAIN]',
    rules: [
      'Composed of couplets',
      'Each couplet is autonomous',
      'Refrain repeats at end of each couplet',
      'Often explores themes of love and loss',
    ],
    examples: [],
  },
  {
    id: 'blank-verse',
    name: 'Blank Verse',
    description: 'Unrhymed iambic pentameter',
    structure: 'Iambic pentameter without rhyme',
    difficulty: 'intermediate',
    template: 'da-DUM da-DUM da-DUM da-DUM da-DUM\nda-DUM da-DUM da-DUM da-DUM da-DUM',
    rules: [
      'Unrhymed',
      'Iambic pentameter (10 syllables, stressed/unstressed)',
      'Natural speech rhythm',
      'Used in much of Shakespeare\'s work',
    ],
    examples: [
      'To be or not to be, that is the question...',
    ],
  },
  {
    id: 'ode',
    name: 'Ode',
    description: 'Lyrical poem addressing a subject',
    structure: 'Variable, often uses stanzas',
    difficulty: 'intermediate',
    template: 'Stanza 1: Address the subject\nStanza 2: Elaborate\nStanza 3: Conclude',
    rules: [
      'Addresses a particular subject',
      'Elevated, formal tone',
      'Often uses stanzas',
      'Explores subject from multiple angles',
    ],
    examples: [
      'Ode to a Nightingale\nOde on a Grecian Urn',
    ],
  },
];

export function getFormById(id: string): PoetryForm | undefined {
  return poetryForms.find(form => form.id === id);
}

export function getFormsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): PoetryForm[] {
  return poetryForms.filter(form => form.difficulty === difficulty);
}
