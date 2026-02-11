import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const POETRYDB_API = "https://poetrydb.org";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'random';
    const author = url.searchParams.get('author');
    const title = url.searchParams.get('title');
    const count = url.searchParams.get('count') || '10';

    let apiUrl = '';

    switch (action) {
      case 'random':
        apiUrl = `${POETRYDB_API}/random/${count}`;
        break;
      case 'by_author':
        if (!author) {
          throw new Error('Author parameter is required for by_author action');
        }
        apiUrl = `${POETRYDB_API}/author/${encodeURIComponent(author)}`;
        break;
      case 'by_title':
        if (!title) {
          throw new Error('Title parameter is required for by_title action');
        }
        apiUrl = `${POETRYDB_API}/title/${encodeURIComponent(title)}`;
        break;
      default:
        throw new Error('Invalid action. Use: random, by_author, or by_title');
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`PoetryDB API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 404 || data.reason) {
      return new Response(
        JSON.stringify({ poems: [] }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const poems = Array.isArray(data) ? data : [data];

    return new Response(
      JSON.stringify({ poems }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching poems:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        poems: []
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
