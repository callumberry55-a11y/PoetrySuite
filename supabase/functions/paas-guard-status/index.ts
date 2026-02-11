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
      last_used_at,
      paas_developers (
        id,
        is_verified,
        subscription_status,
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

  if (!keyData.permissions.guard) {
    return { valid: false, error: 'No permission for Guard Hub' };
  }

  return {
    valid: true,
    developerId: developer.id,
    apiKeyId: keyData.id,
    balance: developer.paas_point_accounts?.[0]?.balance_points || 0,
    lastUsed: keyData.last_used_at
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

    const { data: recentLogs } = await supabase
      .from('paas_api_logs')
      .select('endpoint, status_code, points_charged, created_at')
      .eq('developer_id', verification.developerId)
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: securityEvents } = await supabase
      .from('paas_security_events')
      .select('*')
      .eq('developer_id', verification.developerId)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: rateLimits } = await supabase
      .from('paas_rate_limits')
      .select('*')
      .eq('developer_id', verification.developerId);

    const totalRequests = recentLogs?.length || 0;
    const successfulRequests = recentLogs?.filter((log: any) => log.status_code === 200).length || 0;
    const failedRequests = totalRequests - successfulRequests;
    const blockedRequests = securityEvents?.filter((e: any) => e.event_type === 'blocked').length || 0;
    const criticalEvents = securityEvents?.filter((e: any) => e.severity === 'critical' || e.severity === 'high').length || 0;

    const endpointStats: any = {};
    recentLogs?.forEach((log: any) => {
      if (!endpointStats[log.endpoint]) {
        endpointStats[log.endpoint] = { total: 0, success: 0, failed: 0 };
      }
      endpointStats[log.endpoint].total++;
      if (log.status_code === 200) {
        endpointStats[log.endpoint].success++;
      } else {
        endpointStats[log.endpoint].failed++;
      }
    });

    const healthStatus = criticalEvents > 0 ? 'critical'
      : blockedRequests > 10 ? 'warning'
      : failedRequests > totalRequests * 0.1 ? 'degraded'
      : 'healthy';

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/guard/status',
      http_method: 'GET',
      status_code: 200,
      points_charged: 0,
      request_id: crypto.randomUUID()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          health: {
            status: healthStatus,
            lastChecked: new Date().toISOString()
          },
          statistics: {
            totalRequests,
            successfulRequests,
            failedRequests,
            successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0
          },
          security: {
            blockedRequests,
            criticalEvents,
            recentEvents: securityEvents?.slice(0, 10).map((e: any) => ({
              type: e.event_type,
              severity: e.severity,
              reason: e.reason,
              timestamp: e.created_at
            })) || []
          },
          rateLimits: rateLimits?.map((rl: any) => ({
            endpoint: rl.endpoint_pattern,
            currentHour: rl.current_hour_count,
            maxHour: rl.requests_per_hour,
            currentDay: rl.current_day_count,
            maxDay: rl.requests_per_day
          })) || [],
          endpoints: endpointStats,
          balance: verification.balance,
          apiKeyLastUsed: verification.lastUsed
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Stanzalink-Points-Remaining': verification.balance!.toString()
        }
      }
    );

  } catch (error) {
    console.error('Error in guard-status:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
