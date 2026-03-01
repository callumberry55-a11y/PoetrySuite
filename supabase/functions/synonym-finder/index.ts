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
    const max = url.searchParams.get('max') || '100';

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

    const synonymsUrl = `${DATAMUSE_API}/words?ml=${encodeURIComponent(word)}&max=${max}&md=d`;

    const response = await fetch(synonymsUrl);

    if (!response.ok) {
      throw new Error(`Datamuse API error: ${response.status}`);
    }

    const data = await response.json();

    const enrichedResults = data.map((item: any) => ({
      word: item.word,
      score: item.score,
      definitions: item.defs || [],
      tags: item.tags || []
    }));

    return new Response(
      JSON.stringify({
        originalWord: word,
        synonyms: enrichedResults
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error finding synonyms:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        synonyms: []
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
