import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const POETRYDB_BASE_URL = "https://poetrydb.org";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const author = url.searchParams.get("author");
    const title = url.searchParams.get("title");
    const count = url.searchParams.get("count") || "20";

    let apiUrl = "";

    switch (action) {
      case "random":
        apiUrl = `${POETRYDB_BASE_URL}/random/${count}`;
        break;
      
      case "authors":
        apiUrl = `${POETRYDB_BASE_URL}/author`;
        break;
      
      case "by_author":
        if (!author) {
          return new Response(
            JSON.stringify({ error: "Author parameter is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        apiUrl = `${POETRYDB_BASE_URL}/author/${encodeURIComponent(author)}`;
        break;
      
      case "by_title":
        if (!title) {
          return new Response(
            JSON.stringify({ error: "Title parameter is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        apiUrl = `${POETRYDB_BASE_URL}/title/${encodeURIComponent(title)}`;
        break;
      
      case "search":
        if (author && title) {
          apiUrl = `${POETRYDB_BASE_URL}/author,title/${encodeURIComponent(author)};${encodeURIComponent(title)}`;
        } else if (author) {
          apiUrl = `${POETRYDB_BASE_URL}/author/${encodeURIComponent(author)}`;
        } else if (title) {
          apiUrl = `${POETRYDB_BASE_URL}/title/${encodeURIComponent(title)}`;
        } else {
          return new Response(
            JSON.stringify({ error: "At least one search parameter is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: random, authors, by_author, by_title, or search" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`PoetryDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle PoetryDB's "not found" response
    if (data.status === 404 || (data.reason && data.reason.includes("Not found"))) {
      return new Response(
        JSON.stringify({ poems: [], message: "No poems found" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ poems: Array.isArray(data) ? data : [data] }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching poems:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch poems", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});