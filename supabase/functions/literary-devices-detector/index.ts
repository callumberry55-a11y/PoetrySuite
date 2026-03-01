import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DetectedDevice {
  device: string;
  examples: string[];
  description: string;
}

function detectAlliteration(text: string): DetectedDevice {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const examples: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    if (words[i][0] === words[i + 1][0]) {
      examples.push(`"${words[i]} ${words[i + 1]}"`);
    }
  }

  return {
    device: "Alliteration",
    examples: [...new Set(examples)].slice(0, 5),
    description: "Repetition of consonant sounds at the beginning of words"
  };
}

function detectAssonance(text: string): DetectedDevice {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const examples: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const vowels1 = words[i].split('').filter(c => vowels.includes(c));
    const vowels2 = words[i + 1].split('').filter(c => vowels.includes(c));

    if (vowels1.some(v => vowels2.includes(v)) && vowels1.length > 0) {
      examples.push(`"${words[i]} ${words[i + 1]}"`);
    }
  }

  return {
    device: "Assonance",
    examples: [...new Set(examples)].slice(0, 5),
    description: "Repetition of vowel sounds in nearby words"
  };
}

function detectRepetition(text: string): DetectedDevice {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const wordCount: Record<string, number> = {};

  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const repeated = Object.entries(wordCount)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => `"${word}" (${count}x)`);

  return {
    device: "Repetition",
    examples: repeated,
    description: "Words or phrases repeated for emphasis"
  };
}

function detectMetaphor(text: string): DetectedDevice {
  const metaphorPatterns = [
    /is\s+(?:a|an)\s+([^,.!?\n]+)/gi,
    /are\s+(?:a|an)\s+([^,.!?\n]+)/gi,
    /was\s+(?:a|an)\s+([^,.!?\n]+)/gi,
    /were\s+(?:a|an)\s+([^,.!?\n]+)/gi,
  ];

  const examples: string[] = [];

  metaphorPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0].length < 100) {
        examples.push(`"${match[0].trim()}"`);
      }
    }
  });

  return {
    device: "Metaphor",
    examples: [...new Set(examples)].slice(0, 5),
    description: "Direct comparison stating one thing is another"
  };
}

function detectSimile(text: string): DetectedDevice {
  const similePatterns = [
    /like\s+(?:a|an)\s+([^,.!?\n]+)/gi,
    /as\s+([^,.!?\n]+)\s+as/gi,
  ];

  const examples: string[] = [];

  similePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[0].length < 100) {
        examples.push(`"${match[0].trim()}"`);
      }
    }
  });

  return {
    device: "Simile",
    examples: [...new Set(examples)].slice(0, 5),
    description: "Comparison using 'like' or 'as'"
  };
}

function detectPersonification(text: string): DetectedDevice {
  const humanActions = ['walks', 'speaks', 'whispers', 'sings', 'dances', 'weeps', 'laughs', 'sleeps', 'dreams', 'thinks'];
  const examples: string[] = [];

  const sentences = text.split(/[.!?]/);
  sentences.forEach(sentence => {
    humanActions.forEach(action => {
      if (sentence.toLowerCase().includes(action)) {
        const words = sentence.trim().split(/\s+/);
        if (words.length < 15) {
          examples.push(`"${sentence.trim()}"`);
        }
      }
    });
  });

  return {
    device: "Personification",
    examples: [...new Set(examples)].slice(0, 5),
    description: "Giving human qualities to non-human things"
  };
}

function analyzeStructure(text: string): any {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const words = text.match(/\b[a-z]+\b/gi) || [];
  const syllableEstimate = words.reduce((count, word) => {
    return count + Math.max(1, word.match(/[aeiouy]+/gi)?.length || 1);
  }, 0);

  return {
    lines: lines.length,
    words: words.length,
    characters: text.length,
    estimatedSyllables: syllableEstimate,
    averageLineLength: lines.length > 0 ? Math.round(words.length / lines.length) : 0
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text parameter is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const devices = [
      detectAlliteration(text),
      detectAssonance(text),
      detectRepetition(text),
      detectMetaphor(text),
      detectSimile(text),
      detectPersonification(text),
    ].filter(device => device.examples.length > 0);

    const structure = analyzeStructure(text);

    return new Response(
      JSON.stringify({
        literaryDevices: devices,
        structure,
        summary: {
          devicesFound: devices.length,
          devicesDetected: devices.map(d => d.device)
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error analyzing text:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        literaryDevices: [],
        structure: null
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
