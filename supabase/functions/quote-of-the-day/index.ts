import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const QUOTES_API = "https://api.quotable.io";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const tags = url.searchParams.get('tags') || 'poetry,literature,writing,creativity';
    const maxLength = url.searchParams.get('maxLength') || '300';

    const apiUrl = `${QUOTES_API}/quotes/random?tags=${encodeURIComponent(tags)}&maxLength=${maxLength}&limit=1`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Quotes API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({
          quote: {
            content: "Poetry is when an emotion has found its thought and the thought has found words.",
            author: "Robert Frost",
            tags: ["poetry", "writing"]
          }
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ quote: data[0] }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching quote:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        quote: {
          content: "Poetry is the rhythmical creation of beauty in words.",
          author: "Edgar Allan Poe",
          tags: ["poetry"]
        }
      }),
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
