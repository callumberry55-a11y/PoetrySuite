import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DATAMUSE_API = "https://api.datamuse.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const word = url.searchParams.get('word');
    const type = url.searchParams.get('type') || 'perfect';
    const max = url.searchParams.get('max') || '50';

    if (!word) {
      return new Response(
        JSON.stringify({ error: 'Word parameter is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let apiUrl = '';

    switch (type) {
      case 'perfect':
        apiUrl = `${DATAMUSE_API}/words?rel_rhy=${encodeURIComponent(word)}&max=${max}`;
        break;
      case 'near':
        apiUrl = `${DATAMUSE_API}/words?rel_nry=${encodeURIComponent(word)}&max=${max}`;
        break;
      case 'sounds_like':
        apiUrl = `${DATAMUSE_API}/words?sl=${encodeURIComponent(word)}&max=${max}`;
        break;
      case 'adjectives':
        apiUrl = `${DATAMUSE_API}/words?rel_jjb=${encodeURIComponent(word)}&max=${max}`;
        break;
      case 'nouns':
        apiUrl = `${DATAMUSE_API}/words?rel_jja=${encodeURIComponent(word)}&max=${max}`;
        break;
      case 'synonyms':
        apiUrl = `${DATAMUSE_API}/words?rel_syn=${encodeURIComponent(word)}&max=${max}`;
        break;
      case 'triggers':
        apiUrl = `${DATAMUSE_API}/words?rel_trg=${encodeURIComponent(word)}&max=${max}`;
        break;
      default:
        apiUrl = `${DATAMUSE_API}/words?rel_rhy=${encodeURIComponent(word)}&max=${max}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Datamuse API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        word,
        type,
        results: data
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error finding rhymes:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        results: []
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
