import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const promptTemplates = {
  emotions: [
    "Write about the feeling of {emotion} through the lens of {subject}",
    "Capture {emotion} in a poem about {time} {subject}",
    "Explore {emotion} using imagery from {subject}",
    "Express {emotion} in a {form} about {subject}"
  ],
  nature: [
    "Describe {subject} as if experiencing {emotion}",
    "Write a {form} about {subject} during {time}",
    "Personify {subject} and give it a voice",
    "Compare {subject} to a human emotion or experience"
  ],
  abstract: [
    "Write about {concept} without naming it directly",
    "Use only sensory details to describe {concept}",
    "Explore {concept} through the metaphor of {subject}",
    "Write a {form} that captures the essence of {concept}"
  ],
  narrative: [
    "Tell a story about {subject} in exactly {number} lines",
    "Write a {form} from the perspective of {subject}",
    "Create a dialogue between {subject1} and {subject2}",
    "Describe a moment of transformation involving {subject}"
  ],
  experimental: [
    "Write a poem using only {constraint}",
    "Create a {form} where every line {rule}",
    "Write about {subject} without using the letter '{letter}'",
    "Compose a poem using words from a {source}"
  ]
};

const emotions = ["joy", "sorrow", "longing", "fear", "hope", "nostalgia", "wonder", "regret", "love", "anger", "peace", "anxiety"];
const subjects = ["ocean", "moon", "forest", "city streets", "childhood", "silence", "storm", "sunrise", "memory", "time", "dreams", "shadows"];
const times = ["dawn", "dusk", "midnight", "noon", "autumn", "winter", "spring", "summer"];
const forms = ["sonnet", "haiku", "free verse", "villanelle", "acrostic", "cinquain", "limerick"];
const concepts = ["time", "identity", "change", "loss", "growth", "truth", "beauty", "freedom"];
const constraints = ["monosyllabic words", "colors", "verbs", "nature imagery", "food metaphors"];
const rules = ["begins with the same word", "ends with a question", "contains a color", "uses alliteration"];
const letters = ["e", "a", "o", "t", "s"];
const sources = ["news headline", "dictionary", "recipe", "user manual", "weather forecast"];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePrompt(category: string): string {
  const templates = promptTemplates[category as keyof typeof promptTemplates];
  const template = getRandomItem(templates);

  let prompt = template
    .replace("{emotion}", getRandomItem(emotions))
    .replace("{subject}", getRandomItem(subjects))
    .replace("{subject1}", getRandomItem(subjects))
    .replace("{subject2}", getRandomItem(subjects.filter(s => s !== subjects[0])))
    .replace("{time}", getRandomItem(times))
    .replace("{form}", getRandomItem(forms))
    .replace("{concept}", getRandomItem(concepts))
    .replace("{constraint}", getRandomItem(constraints))
    .replace("{rule}", getRandomItem(rules))
    .replace("{letter}", getRandomItem(letters))
    .replace("{source}", getRandomItem(sources))
    .replace("{number}", String(Math.floor(Math.random() * 10) + 5));

  return prompt;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'random';
    const count = parseInt(url.searchParams.get('count') || '3', 10);

    let prompts: string[] = [];

    if (category === 'random') {
      const categories = Object.keys(promptTemplates);
      for (let i = 0; i < count; i++) {
        const randomCategory = getRandomItem(categories);
        prompts.push(generatePrompt(randomCategory));
      }
    } else if (category in promptTemplates) {
      for (let i = 0; i < count; i++) {
        prompts.push(generatePrompt(category));
      }
    } else {
      return new Response(
        JSON.stringify({
          error: 'Invalid category. Use: emotions, nature, abstract, narrative, experimental, or random',
          availableCategories: Object.keys(promptTemplates)
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        prompts,
        category: category === 'random' ? 'mixed' : category,
        count: prompts.length
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating prompts:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        prompts: [
          "Write about a moment that changed everything",
          "Describe silence using only sound imagery",
          "Create a haiku about the passage of time"
        ]
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
