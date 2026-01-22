import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  }

  // Your function logic here
  const { type, prompt } = await req.json();

  // Placeholder response
  const suggestion = `This is a placeholder response for type: ${type} and prompt: ${prompt}`;

  return new Response(
    JSON.stringify({ suggestion }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } },
  );
});
