import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface ApiKey {
  id: string;
  is_active: boolean;
  rate_limit_per_hour: number;
  permissions: {
    read_poems?: boolean;
  };
}

async function validateApiKey(apiKey: string, supabase: any): Promise<ApiKey | null> {
  const { data, error } = await supabase
    .from('external_api_keys')
    .select('*')
    .eq('key_hash', apiKey)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function checkRateLimit(apiKeyId: string, rateLimit: number, supabase: any): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('external_api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', apiKeyId)
    .gte('created_at', oneHourAgo);

  return (count || 0) < rateLimit;
}

async function logUsage(apiKeyId: string, endpoint: string, method: string, statusCode: number, req: Request, responseTime: number, supabase: any) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  await supabase.from('external_api_usage').insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    ip_address: ipAddress,
    user_agent: userAgent,
    response_time_ms: responseTime
  });

  await supabase
    .from('external_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKeyId);
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = req.headers.get('X-API-Key');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required. Provide it in the X-API-Key header.' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const keyData = await validateApiKey(apiKey, supabase);

    if (!keyData) {
      await logUsage('unknown', '/external-api-poems', req.method, 401, req, Date.now() - startTime, supabase);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!keyData.permissions.read_poems) {
      await logUsage(keyData.id, '/external-api-poems', req.method, 403, req, Date.now() - startTime, supabase);
      return new Response(
        JSON.stringify({ error: 'This API key does not have permission to read poems' }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const withinRateLimit = await checkRateLimit(keyData.id, keyData.rate_limit_per_hour, supabase);

    if (!withinRateLimit) {
      await logUsage(keyData.id, '/external-api-poems', req.method, 429, req, Date.now() - startTime, supabase);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const isPublic = url.searchParams.get('public') === 'true';

    let query = supabase
      .from('poems')
      .select('id, title, content, form_type, created_at, user_id, is_public')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (isPublic) {
      query = query.eq('is_public', true);
    }

    const { data: poems, error } = await query;

    if (error) {
      throw error;
    }

    const responseTime = Date.now() - startTime;
    await logUsage(keyData.id, '/external-api-poems', req.method, 200, req, responseTime, supabase);

    return new Response(
      JSON.stringify({
        success: true,
        data: poems,
        pagination: {
          limit,
          offset,
          count: poems.length
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
