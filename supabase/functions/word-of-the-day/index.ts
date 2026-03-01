import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WORDS_API = "https://api.wordnik.com/v4";
const API_KEY = Deno.env.get("WORDNIK_API_KEY");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!API_KEY) {
      throw new Error('Wordnik API key not configured');
    }

    const apiUrl = `${WORDS_API}/words.json/wordOfTheDay?api_key=${API_KEY}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Wordnik API error: ${response.status}`);
    }

    const data = await response.json();

    const result = {
      word: data.word,
      definitions: data.definitions || [],
      examples: data.examples || [],
      note: data.note || '',
      publishDate: data.publishDate || new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching word of the day:', error);

    const fallbackWords = [
      {
        word: "serendipity",
        definitions: [{ text: "The occurrence of events by chance in a happy or beneficial way", partOfSpeech: "noun" }],
        examples: [{ text: "A fortunate stroke of serendipity brought the two old friends together after years" }],
        note: "A beautiful word for beautiful accidents",
        publishDate: new Date().toISOString()
      },
      {
        word: "ephemeral",
        definitions: [{ text: "Lasting for a very short time", partOfSpeech: "adjective" }],
        examples: [{ text: "The ephemeral beauty of cherry blossoms reminds us to appreciate the moment" }],
        note: "Perfect for describing fleeting moments in poetry",
        publishDate: new Date().toISOString()
      },
      {
        word: "luminous",
        definitions: [{ text: "Full of or shedding light; bright or shining", partOfSpeech: "adjective" }],
        examples: [{ text: "The luminous moon cast silver shadows across the garden" }],
        note: "A word that brings light to your verses",
        publishDate: new Date().toISOString()
      }
    ];

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const selectedWord = fallbackWords[dayOfYear % fallbackWords.length];

    return new Response(
      JSON.stringify(selectedWord),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
