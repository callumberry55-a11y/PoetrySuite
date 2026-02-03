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
        is_verified
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

  if (!keyData.permissions.economy) {
    return { valid: false, error: 'No permission for Economy Hub' };
  }

  return {
    valid: true,
    developerId: developer.id,
    apiKeyId: keyData.id
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

    const { data: account } = await supabase
      .from('paas_point_accounts')
      .select('*')
      .eq('developer_id', verification.developerId)
      .single();

    const { data: grants } = await supabase
      .from('paas_point_grants')
      .select('*')
      .eq('developer_id', verification.developerId)
      .eq('is_active', true);

    const totalUnvestedPoints = grants?.reduce((sum: number, g: any) => sum + parseFloat(g.unvested_points), 0) || 0;
    const totalVestedPoints = grants?.reduce((sum: number, g: any) => sum + parseFloat(g.vested_points), 0) || 0;

    const { data: recentTransactions } = await supabase
      .from('paas_transactions')
      .select('*')
      .eq('developer_id', verification.developerId)
      .order('created_at', { ascending: false })
      .limit(10);

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/economy/balance',
      http_method: 'GET',
      status_code: 200,
      points_charged: 0,
      request_id: crypto.randomUUID()
    });

    const balanceData = {
      currentBalance: parseFloat(account?.balance_points || 0),
      currentBalanceGBP: parseFloat(account?.balance_gbp || 0),
      vestedPoints: parseFloat(account?.vested_points || 0),
      unvestedPoints: parseFloat(account?.unvested_points || 0),
      totalEarned: parseFloat(account?.total_earned || 0),
      totalSpent: parseFloat(account?.total_spent || 0),
      activeGrants: grants?.length || 0,
      vestingStatus: {
        totalVested: totalVestedPoints,
        totalUnvested: totalUnvestedPoints,
        percentageVested: totalVestedPoints + totalUnvestedPoints > 0
          ? Math.round((totalVestedPoints / (totalVestedPoints + totalUnvestedPoints)) * 100)
          : 0
      },
      recentTransactions: recentTransactions?.map((t: any) => ({
        id: t.id,
        type: t.transaction_type,
        amount: parseFloat(t.amount_points),
        amountGBP: parseFloat(t.amount_gbp),
        endpoint: t.endpoint,
        createdAt: t.created_at
      })) || []
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: balanceData
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Stanzalink-Points-Remaining': balanceData.currentBalance.toString()
        }
      }
    );

  } catch (error) {
    console.error('Error in economy-balance:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
