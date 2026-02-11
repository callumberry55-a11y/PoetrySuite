import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface CollaborateRequest {
  sessionName: string;
  participantDeveloperId?: string;
  maxParticipants?: number;
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

  if (!keyData.permissions.social) {
    return { valid: false, error: 'No permission for Social Hub' };
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

    const { sessionName, participantDeveloperId, maxParticipants = 10 }: CollaborateRequest = await req.json();

    if (!sessionName) {
      return new Response(
        JSON.stringify({ error: 'sessionName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await chargePoints(
      verification.developerId!,
      verification.apiKeyId!,
      5,
      '/v1/social/collaborate',
      supabase
    );

    const { data: existingCollaborative } = await supabase
      .from('collaborative_poems')
      .select('id, title, participants, status')
      .eq('title', sessionName)
      .eq('status', 'active')
      .maybeSingle();

    if (existingCollaborative && !participantDeveloperId) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            sessionId: existingCollaborative.id,
            sessionName: existingCollaborative.title,
            status: 'joined_existing',
            participants: existingCollaborative.participants,
            maxParticipants
          }
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Stanzalink-Points-Remaining': (verification.balance! - 5).toString(),
            'X-Stanzalink-Points-Charged': '5'
          }
        }
      );
    }

    const sessionId = crypto.randomUUID();
    const participants = [verification.developerId!];
    if (participantDeveloperId) {
      participants.push(participantDeveloperId);
    }

    const { data: newSession } = await supabase
      .from('collaborative_poems')
      .insert({
        title: sessionName,
        content: '',
        participants,
        max_participants: maxParticipants,
        status: 'active',
        created_by: verification.developerId
      })
      .select()
      .single();

    const remainingPoints = verification.balance! - 5;

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/social/collaborate',
      http_method: 'POST',
      status_code: 200,
      points_charged: 5,
      request_id: crypto.randomUUID()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          sessionId: newSession?.id || sessionId,
          sessionName,
          status: 'created',
          participants,
          maxParticipants,
          createdAt: new Date().toISOString()
        },
        meta: {
          pointsCharged: 5,
          costGBP: 3.75
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
    console.error('Error in social-collaborate:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
