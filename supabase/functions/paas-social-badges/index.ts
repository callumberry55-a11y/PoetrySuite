import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

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

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await chargePoints(
      verification.developerId!,
      verification.apiKeyId!,
      1,
      '/v1/social/badges',
      supabase
    );

    const { data: userBadges } = await supabase
      .from('user_badges')
      .select(`
        earned_at,
        badges (
          id,
          name,
          description,
          tier,
          icon,
          points_reward
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    const expertBadges = userBadges?.filter((ub: any) =>
      ub.badges.tier === 'expert' || ub.badges.tier === 'master'
    ) || [];

    const userLevel = expertBadges.length >= 10 ? 'master'
      : expertBadges.length >= 5 ? 'expert'
      : userBadges && userBadges.length >= 10 ? 'advanced'
      : userBadges && userBadges.length >= 5 ? 'intermediate'
      : 'novice';

    const remainingPoints = verification.balance! - 1;

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/social/badges',
      http_method: 'GET',
      status_code: 200,
      points_charged: 1,
      request_id: crypto.randomUUID()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userId,
          level: userLevel,
          totalBadges: userBadges?.length || 0,
          expertBadges: expertBadges.length,
          badges: userBadges?.map((ub: any) => ({
            id: ub.badges.id,
            name: ub.badges.name,
            description: ub.badges.description,
            tier: ub.badges.tier,
            icon: ub.badges.icon,
            pointsReward: ub.badges.points_reward,
            earnedAt: ub.earned_at
          })) || [],
          permissions: {
            canAccessPremiumFeatures: userLevel === 'expert' || userLevel === 'master',
            canCreateContests: userLevel === 'master',
            maxCollaborations: userLevel === 'master' ? 20 : userLevel === 'expert' ? 10 : 5
          }
        },
        meta: {
          pointsCharged: 1,
          costGBP: 0.75
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Stanzalink-Points-Remaining': remainingPoints.toString(),
          'X-Stanzalink-Points-Charged': '1'
        }
      }
    );

  } catch (error) {
    console.error('Error in social-badges:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
