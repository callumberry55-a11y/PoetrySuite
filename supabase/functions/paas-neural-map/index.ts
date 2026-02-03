import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface NeuralMapRequest {
  text: string;
  options?: {
    includeEmotions?: boolean;
    includeThemes?: boolean;
    includeConnections?: boolean;
  };
}

async function verifyAPIKey(apiKey: string, supabase: any) {
  const { data: keyData, error } = await supabase
    .from('paas_api_keys')
    .select(`
      id,
      developer_id,
      permissions,
      is_active,
      rate_limit_per_hour,
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
    if (balance < 5) {
      return { valid: false, error: 'Insufficient points. Need 5 points (£3.75)' };
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

async function analyzeText(text: string, options: any) {
  const words = text.toLowerCase().split(/\s+/);

  const emotionalKeywords = {
    joy: ['happy', 'joy', 'delight', 'bright', 'sunshine', 'smile'],
    sadness: ['sad', 'sorrow', 'tear', 'grief', 'loss', 'pain'],
    love: ['love', 'heart', 'passion', 'romance', 'desire', 'affection'],
    anger: ['anger', 'rage', 'fury', 'hate', 'bitter', 'wrath'],
    fear: ['fear', 'afraid', 'terror', 'dread', 'anxiety', 'worry'],
    hope: ['hope', 'dream', 'wish', 'tomorrow', 'future', 'believe']
  };

  const thematicKeywords = {
    nature: ['tree', 'sky', 'ocean', 'mountain', 'forest', 'flower', 'bird'],
    time: ['time', 'moment', 'eternity', 'forever', 'yesterday', 'tomorrow'],
    identity: ['self', 'soul', 'being', 'existence', 'who', 'am', 'identity'],
    death: ['death', 'grave', 'tomb', 'end', 'mortality', 'dying'],
    life: ['life', 'birth', 'living', 'breath', 'alive', 'existence']
  };

  const emotions: any = {};
  const themes: any = {};

  if (options.includeEmotions !== false) {
    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      const count = words.filter(word => keywords.includes(word)).length;
      if (count > 0) {
        emotions[emotion] = {
          score: Math.min(count / words.length * 100, 100),
          matches: count
        };
      }
    }
  }

  if (options.includeThemes !== false) {
    for (const [theme, keywords] of Object.entries(thematicKeywords)) {
      const count = words.filter(word => keywords.includes(word)).length;
      if (count > 0) {
        themes[theme] = {
          score: Math.min(count / words.length * 100, 100),
          matches: count
        };
      }
    }
  }

  return {
    emotions,
    themes,
    wordCount: words.length,
    sentiment: Object.keys(emotions).length > 0
      ? Object.keys(emotions).reduce((a, b) =>
          emotions[a].score > emotions[b].score ? a : b
        )
      : 'neutral',
    complexity: words.length > 50 ? 'high' : words.length > 20 ? 'medium' : 'low'
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

    const { text, options = {} }: NeuralMapRequest = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await chargePoints(
      verification.developerId!,
      verification.apiKeyId!,
      5,
      '/v1/neural/map',
      supabase
    );

    const analysis = await analyzeText(text, options);

    const remainingPoints = verification.balance! - 5;

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/neural/map',
      http_method: 'POST',
      status_code: 200,
      request_size_bytes: new Blob([text]).size,
      response_size_bytes: new Blob([JSON.stringify(analysis)]).size,
      points_charged: 5,
      request_id: crypto.randomUUID()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: analysis,
        meta: {
          pointsCharged: 5,
          costGBP: 3.75,
          textLength: text.length
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Stanzalink-Points-Remaining': remainingPoints.toString(),
          'X-Stanzalink-Points-Charged': '5'
        }
      }
    );

  } catch (error) {
    console.error('Error in neural-map:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
