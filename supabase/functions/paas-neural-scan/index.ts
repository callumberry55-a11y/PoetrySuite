import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface ScanRequest {
  content: string;
  type: 'code' | 'text' | 'url';
  strictness?: 'low' | 'medium' | 'high';
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
    if (balance < 10) {
      return { valid: false, error: 'Insufficient points. Need 10 points (£7.50)' };
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

async function scanContent(content: string, type: string, strictness: string) {
  const threats: any[] = [];
  const warnings: any[] = [];

  const dangerousPatterns = [
    { pattern: /eval\s*\(/gi, threat: 'eval() usage detected', severity: 'high' },
    { pattern: /exec\s*\(/gi, threat: 'exec() usage detected', severity: 'high' },
    { pattern: /innerHTML\s*=/gi, threat: 'innerHTML assignment detected', severity: 'medium' },
    { pattern: /document\.write/gi, threat: 'document.write usage detected', severity: 'medium' },
    { pattern: /\.env|API_KEY|SECRET|PASSWORD/gi, threat: 'Potential credential exposure', severity: 'high' },
    { pattern: /rm\s+-rf|del\s+\/f/gi, threat: 'Destructive command detected', severity: 'critical' },
    { pattern: /<script[^>]*>.*?<\/script>/gis, threat: 'Script tag detected', severity: 'medium' }
  ];

  const suspiciousPatterns = [
    { pattern: /fetch\(.*?\)/gi, warning: 'External API call detected' },
    { pattern: /localStorage|sessionStorage/gi, warning: 'Local storage usage detected' },
    { pattern: /btoa|atob/gi, warning: 'Base64 encoding/decoding detected' },
    { pattern: /crypto\.subtle/gi, warning: 'Cryptographic operation detected' }
  ];

  for (const { pattern, threat, severity } of dangerousPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      threats.push({
        type: threat,
        severity,
        occurrences: matches.length,
        samples: matches.slice(0, 3)
      });
    }
  }

  if (strictness === 'high' || strictness === 'medium') {
    for (const { pattern, warning } of suspiciousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        warnings.push({
          type: warning,
          occurrences: matches.length
        });
      }
    }
  }

  const riskScore = threats.reduce((score, t) => {
    const severityScores: any = { low: 10, medium: 25, high: 50, critical: 100 };
    return score + severityScores[t.severity];
  }, 0);

  return {
    safe: threats.length === 0,
    riskScore: Math.min(riskScore, 100),
    riskLevel: riskScore === 0 ? 'safe' : riskScore < 25 ? 'low' : riskScore < 50 ? 'medium' : riskScore < 75 ? 'high' : 'critical',
    threats,
    warnings,
    scannedBytes: new Blob([content]).size,
    scanTime: Date.now()
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

    const { content, type = 'code', strictness = 'medium' }: ScanRequest = await req.json();

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await chargePoints(
      verification.developerId!,
      verification.apiKeyId!,
      10,
      '/v1/neural/scan',
      supabase
    );

    const scanResult = await scanContent(content, type, strictness);

    if (scanResult.threats.length > 0) {
      await supabase.from('paas_security_events').insert({
        developer_id: verification.developerId,
        api_key_id: verification.apiKeyId,
        event_type: 'threat_detected',
        severity: scanResult.riskLevel,
        endpoint: '/v1/neural/scan',
        reason: `${scanResult.threats.length} threat(s) detected`,
        ai_guard_decision: { threats: scanResult.threats }
      });
    }

    const remainingPoints = verification.balance! - 10;

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/neural/scan',
      http_method: 'POST',
      status_code: 200,
      request_size_bytes: new Blob([content]).size,
      points_charged: 10,
      request_id: crypto.randomUUID()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: scanResult,
        meta: {
          pointsCharged: 10,
          costGBP: 7.50,
          contentSize: content.length
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Stanzalink-Points-Remaining': remainingPoints.toString(),
          'X-Stanzalink-Points-Charged': '10'
        }
      }
    );

  } catch (error) {
    console.error('Error in neural-scan:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
