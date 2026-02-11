import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface LinksRequest {
  text: string;
  archiveSize?: number;
}

async function verifyAPIKey(apiKey: string, supabase: any) {
  const { data: keyData, error } = await supabase
    .from('paas_api_keys')
    .select(`
      id,
      developer_id,
      permissions,
      is_active,
      paas_developers (
        id,
        subscription_status,
        is_verified,
        paas_point_accounts (
          balance_points
        )
      )
    `)
    .eq('key_hash', apiKey)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !keyData) {
    return { valid: false, error: 'Invalid API key' };
  }

  const developer = keyData.paas_developers;
  if (!developer.is_verified) {
    return { valid: false, error: 'Developer not verified' };
  }

  if (developer.subscription_status !== 'active') {
    const balance = developer.paas_point_accounts?.[0]?.balance_points || 0;
    if (balance < 3) {
      return { valid: false, error: 'Insufficient points. Need 3 points (£2.25)' };
    }
  }

  if (!keyData.permissions.neural) {
    return { valid: false, error: 'No permission for Neural Hub' };
  }

  return {
    valid: true,
    developerId: developer.id,
    apiKeyId: keyData.id,
    balance: developer.paas_point_accounts?.[0]?.balance_points || 0
  };
}

async function chargePoints(developerId: string, apiKeyId: string, points: number, endpoint: string, supabase: any) {
  const { data: account } = await supabase
    .from('paas_point_accounts')
    .select('balance_points')
    .eq('developer_id', developerId)
    .single();

  const balanceBefore = account?.balance_points || 0;
  const balanceAfter = balanceBefore - points;

  await supabase.from('paas_transactions').insert({
    developer_id: developerId,
    transaction_type: 'api_call',
    amount_points: -points,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    endpoint: endpoint,
    api_key_id: apiKeyId,
    metadata: { cost_gbp: points * 0.75 }
  });
}

async function findSemanticLinks(text: string, developerId: string, supabase: any) {
  const { data: poems } = await supabase
    .from('poems')
    .select('id, title, content, form, created_at')
    .eq('user_id', developerId)
    .limit(50)
    .order('created_at', { ascending: false });

  if (!poems || poems.length === 0) {
    return { connections: [], totalArchiveSize: 0 };
  }

  const inputWords = text.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const connections: any[] = [];

  for (const poem of poems) {
    const poemWords = poem.content.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const commonWords = inputWords.filter((w: string) => poemWords.includes(w));

    if (commonWords.length > 0) {
      const similarity = (commonWords.length / Math.min(inputWords.length, poemWords.length)) * 100;

      if (similarity > 10) {
        connections.push({
          poemId: poem.id,
          poemTitle: poem.title,
          poemForm: poem.form,
          similarityScore: Math.round(similarity),
          commonThemes: commonWords.slice(0, 5),
          createdAt: poem.created_at
        });
      }
    }
  }

  connections.sort((a, b) => b.similarityScore - a.similarityScore);

  return {
    connections: connections.slice(0, 10),
    totalArchiveSize: poems.length
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing X-API-Key header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const verification = await verifyAPIKey(apiKey, supabase);
    if (!verification.valid) {
      return new Response(
        JSON.stringify({ error: verification.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text }: LinksRequest = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await chargePoints(
      verification.developerId!,
      verification.apiKeyId!,
      3,
      '/v1/neural/links',
      supabase
    );

    const linkResult = await findSemanticLinks(text, verification.developerId!, supabase);

    const remainingPoints = verification.balance! - 3;

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/neural/links',
      http_method: 'GET',
      status_code: 200,
      points_charged: 3,
      request_id: crypto.randomUUID()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: linkResult,
        meta: {
          pointsCharged: 3,
          costGBP: 2.25,
          connectionsFound: linkResult.connections.length
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Stanzalink-Points-Remaining': remainingPoints.toString(),
          'X-Stanzalink-Points-Charged': '3'
        }
      }
    );

  } catch (error) {
    console.error('Error in neural-links:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
