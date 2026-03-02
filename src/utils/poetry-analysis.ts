export function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length === 0) return 0;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const syllableMatches = word.match(/[aeiouy]{1,2}/g);
  return syllableMatches ? syllableMatches.length : 1;
}

export function countSyllablesInLine(line: string): number {
  const words = line.split(/\s+/).filter(w => w.length > 0);
  return words.reduce((total, word) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    return total + (cleanWord.length > 0 ? countSyllables(cleanWord) : 0);
  }, 0);
}

export function detectRhymeScheme(lines: string[]): string {
  const endWords = lines.map(line => {
    const words = line.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    return lastWord ? lastWord.toLowerCase().replace(/[^a-z]/g, '') : '';
  }).filter(w => w.length > 0);

  if (endWords.length === 0) return '';

  const scheme: string[] = [];
  const rhymeMap: { [key: string]: string } = {};
  let currentLetter = 'A';

  endWords.forEach((word) => {
    const rhymeSound = getRhymeSound(word);

    let foundRhyme = false;
    for (const [sound, letter] of Object.entries(rhymeMap)) {
      if (rhymesWithSound(rhymeSound, sound)) {
        scheme.push(letter);
        foundRhyme = true;
        break;
      }
    }

    if (!foundRhyme) {
      rhymeMap[rhymeSound] = currentLetter;
      scheme.push(currentLetter);
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
    }
  });

  return scheme.join('');
}

function getRhymeSound(word: string): string {
  const vowels = 'aeiouy';
  let rhymeSound = '';
  let foundVowel = false;

  for (let i = word.length - 1; i >= 0; i--) {
    const char = word[i];
    rhymeSound = char + rhymeSound;

    if (vowels.includes(char)) {
      foundVowel = true;
      if (i > 0) {
        rhymeSound = word[i - 1] + rhymeSound;
      }
      break;
    }
  }

  return foundVowel ? rhymeSound : word.slice(-3);
}

function rhymesWithSound(sound1: string, sound2: string): boolean {
  if (sound1 === sound2) return true;

  const minLength = Math.min(sound1.length, sound2.length);
  if (minLength < 2) return false;

  const end1 = sound1.slice(-minLength);
  const end2 = sound2.slice(-minLength);

  return end1 === end2;
}

export function findRhymingWords(word: string): string[] {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return [];

  const commonRhymes: { [key: string]: string[] } = {
    'ay': ['day', 'way', 'say', 'play', 'stay', 'may', 'bay', 'ray', 'gray', 'pray'],
    'ight': ['light', 'night', 'bright', 'sight', 'flight', 'might', 'tight', 'right', 'fight', 'height'],
    'ove': ['love', 'dove', 'above', 'shove', 'glove'],
    'eart': ['heart', 'part', 'start', 'art', 'cart', 'smart', 'apart'],
    'ream': ['dream', 'stream', 'beam', 'team', 'cream', 'gleam', 'scream'],
    'ing': ['sing', 'ring', 'bring', 'spring', 'wing', 'thing', 'king', 'string'],
    'ear': ['clear', 'dear', 'fear', 'near', 'year', 'tear', 'appear', 'hear'],
    'ower': ['flower', 'power', 'tower', 'shower', 'hour'],
    'oon': ['moon', 'soon', 'noon', 'spoon', 'tune', 'june'],
    'ain': ['rain', 'pain', 'gain', 'train', 'brain', 'chain', 'main', 'plain'],
    'old': ['gold', 'cold', 'bold', 'hold', 'told', 'fold', 'mold'],
    'ame': ['name', 'game', 'flame', 'shame', 'blame', 'frame', 'same'],
    'ine': ['fine', 'line', 'mine', 'shine', 'wine', 'pine', 'divine', 'combine'],
    'ow': ['flow', 'glow', 'show', 'know', 'grow', 'slow', 'throw', 'snow'],
  };

  const rhymeSound = getRhymeSound(word);
  const results: string[] = [];

  for (const [pattern, words] of Object.entries(commonRhymes)) {
    if (rhymeSound.endsWith(pattern) || pattern.endsWith(rhymeSound)) {
      results.push(...words.filter(w => w !== word));
    }
  }

  if (results.length === 0) {
    for (const [, words] of Object.entries(commonRhymes)) {
      const matches = words.filter(w => {
        const wSound = getRhymeSound(w);
        return rhymesWithSound(rhymeSound, wSound) && w !== word;
      });
      results.push(...matches);
    }
  }

  return [...new Set(results)].slice(0, 20);
}

export function detectAlliteration(line: string): {
  hasAlliteration: boolean;
  patterns: string[];
  strength: 'weak' | 'moderate' | 'strong';
} {
  const words = line.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const firstLetters = words.map(w => w.replace(/[^a-z]/g, '')[0]).filter(Boolean);

  const letterCounts: { [key: string]: number } = {};
  firstLetters.forEach(letter => {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  });

  const patterns: string[] = [];
  let maxCount = 0;

  for (const [letter, count] of Object.entries(letterCounts)) {
    if (count >= 2) {
      patterns.push(`"${letter}" sound repeats ${count} times`);
      maxCount = Math.max(maxCount, count);
    }
  }

  const hasAlliteration = patterns.length > 0;
  let strength: 'weak' | 'moderate' | 'strong' = 'weak';

  if (maxCount >= 4) strength = 'strong';
  else if (maxCount >= 3) strength = 'moderate';

  return { hasAlliteration, patterns, strength };
}

export function detectAssonance(line: string): {
  hasAssonance: boolean;
  vowelPatterns: string[];
} {
  const vowels = 'aeiou';
  const words = line.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const vowelSequences: string[] = [];

  words.forEach(word => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    const vowelsInWord = cleanWord.split('').filter(c => vowels.includes(c));
    if (vowelsInWord.length > 0) {
      vowelSequences.push(vowelsInWord.join(''));
    }
  });

  const vowelCounts: { [key: string]: number } = {};
  vowelSequences.join('').split('').forEach(v => {
    vowelCounts[v] = (vowelCounts[v] || 0) + 1;
  });

  const vowelPatterns: string[] = [];
  for (const [vowel, count] of Object.entries(vowelCounts)) {
    if (count >= 3) {
      vowelPatterns.push(`"${vowel}" sound repeats ${count} times`);
    }
  }

  return {
    hasAssonance: vowelPatterns.length > 0,
    vowelPatterns
  };
}

export function analyzeMeter(line: string): {
  pattern: string;
  possibleMeter: string;
  syllableCount: number;
} {
  const syllableCount = countSyllablesInLine(line);
  const words = line.split(/\s+/).filter(w => w.length > 0);

  const stresses = words.map(word => {
    const syllables = countSyllables(word.replace(/[^a-zA-Z]/g, ''));
    return syllables > 1 ? '/' : '-';
  });

  const pattern = stresses.join(' ');

  let possibleMeter = 'Free verse';

  if (syllableCount === 10 && stresses.length === 5) {
    possibleMeter = 'Possibly Iambic Pentameter';
  } else if (syllableCount === 8) {
    possibleMeter = 'Possibly Iambic Tetrameter';
  } else if (syllableCount === 12) {
    possibleMeter = 'Possibly Alexandrine';
  } else if (syllableCount === 5 || syllableCount === 7) {
    possibleMeter = 'Possibly Haiku-like';
  }

  return { pattern, possibleMeter, syllableCount };
}

export function detectRepetition(lines: string[]): {
  repeatedWords: { word: string; count: number }[];
  repeatedPhrases: { phrase: string; count: number }[];
} {
  const allText = lines.join(' ').toLowerCase();
  const words = allText.split(/\s+/).filter(w => w.length > 3);

  const wordCounts: { [key: string]: number } = {};
  words.forEach(word => {
    const clean = word.replace(/[^a-z]/g, '');
    if (clean.length > 3) {
      wordCounts[clean] = (wordCounts[clean] || 0) + 1;
    }
  });

  const repeatedWords = Object.entries(wordCounts)
    .filter(([, count]) => count >= 2)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    phrases.push(phrase);
  }

  const phraseCounts: { [key: string]: number } = {};
  phrases.forEach(phrase => {
    phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
  });

  const repeatedPhrases = Object.entries(phraseCounts)
    .filter(([, count]) => count >= 2)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { repeatedWords, repeatedPhrases };
}

export function getReadingTime(text: string): {
  minutes: number;
  seconds: number;
  wordCount: number;
} {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const wordsPerMinute = 200;
  const totalMinutes = wordCount / wordsPerMinute;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  return { minutes, seconds, wordCount };
}

export function detectPoeticDevices(text: string): {
  devices: { name: string; description: string; examples: string[] }[];
} {
  const lines = text.split('\n').filter(l => l.trim());
  const devices: { name: string; description: string; examples: string[] }[] = [];

  const alliteration = detectAlliteration(text);
  if (alliteration.hasAlliteration) {
    devices.push({
      name: 'Alliteration',
      description: `${alliteration.strength} alliteration detected`,
      examples: alliteration.patterns
    });
  }

  const assonance = detectAssonance(text);
  if (assonance.hasAssonance) {
    devices.push({
      name: 'Assonance',
      description: 'Repeated vowel sounds create musical quality',
      examples: assonance.vowelPatterns
    });
  }

  const rhymeScheme = detectRhymeScheme(lines);
  if (rhymeScheme && rhymeScheme.length > 1 && rhymeScheme.includes('A') && rhymeScheme.includes('B')) {
    devices.push({
      name: 'Rhyme',
      description: `Rhyme scheme: ${rhymeScheme}`,
      examples: ['End rhymes detected']
    });
  }

  const { repeatedWords, repeatedPhrases } = detectRepetition(lines);
  if (repeatedWords.length > 0 || repeatedPhrases.length > 0) {
    devices.push({
      name: 'Repetition',
      description: 'Repeated words or phrases for emphasis',
      examples: [
        ...repeatedWords.slice(0, 3).map(r => `"${r.word}" (${r.count}x)`),
        ...repeatedPhrases.slice(0, 2).map(r => `"${r.phrase}" (${r.count}x)`)
      ]
    });
  }

  return { devices };
}
