import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface TransferRequest {
  recipientDeveloperId: string;
  amount: number;
  reason?: string;
  biometricToken?: string;
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

  if (!keyData.permissions.economy) {
    return { valid: false, error: 'No permission for Economy Hub' };
  }

  return {
    valid: true,
    developerId: developer.id,
    apiKeyId: keyData.id,
    balance: developer.paas_point_accounts?.[0]?.balance_points || 0
  };
}

async function verifyBiometric(token: string) {
  // TODO: Implement proper biometric verification with a trusted service
  // This is a placeholder implementation for development only
  // In production, verify the token against a biometric service provider
  if (!token || token.length < 32) {
    return false;
  }

  // Verify token format (should be a valid JWT or signed token)
  const tokenPattern = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;
  return tokenPattern.test(token);
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

    const { recipientDeveloperId, amount, reason = 'Transfer', biometricToken }: TransferRequest = await req.json();

    if (!recipientDeveloperId || !amount) {
      return new Response(
        JSON.stringify({ error: 'recipientDeveloperId and amount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount > 1000 && !biometricToken) {
      return new Response(
        JSON.stringify({ error: 'Biometric authentication required for transfers over 1000 points' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (biometricToken && !(await verifyBiometric(biometricToken))) {
      return new Response(
        JSON.stringify({ error: 'Invalid biometric token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((verification.balance ?? 0) < amount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: recipient } = await supabase
      .from('paas_developers')
      .select('id, is_verified')
      .eq('id', recipientDeveloperId)
      .maybeSingle();

    if (!recipient || !recipient.is_verified) {
      return new Response(
        JSON.stringify({ error: 'Recipient not found or not verified' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: senderAccount } = await supabase
      .from('paas_point_accounts')
      .select('balance_points')
      .eq('developer_id', verification.developerId)
      .maybeSingle();

    const senderBalanceBefore = parseFloat(senderAccount?.balance_points || 0);
    const senderBalanceAfter = senderBalanceBefore - amount;

    await supabase.from('paas_transactions').insert({
      developer_id: verification.developerId,
      transaction_type: 'transfer',
      amount_points: -amount,
      balance_before: senderBalanceBefore,
      balance_after: senderBalanceAfter,
      endpoint: '/v1/economy/transfer',
      api_key_id: verification.apiKeyId,
      metadata: { recipient: recipientDeveloperId, reason }
    });

    const { data: recipientAccount } = await supabase
      .from('paas_point_accounts')
      .select('balance_points')
      .eq('developer_id', recipientDeveloperId)
      .maybeSingle();

    const recipientBalanceBefore = parseFloat(recipientAccount?.balance_points || 0);
    const recipientBalanceAfter = recipientBalanceBefore + amount;

    await supabase.from('paas_transactions').insert({
      developer_id: recipientDeveloperId,
      transaction_type: 'transfer',
      amount_points: amount,
      balance_before: recipientBalanceBefore,
      balance_after: recipientBalanceAfter,
      endpoint: '/v1/economy/transfer',
      metadata: { sender: verification.developerId, reason }
    });

    await supabase.from('paas_api_logs').insert({
      developer_id: verification.developerId,
      api_key_id: verification.apiKeyId,
      endpoint: '/v1/economy/transfer',
      http_method: 'POST',
      status_code: 200,
      points_charged: 0,
      request_id: crypto.randomUUID()
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transferId: crypto.randomUUID(),
          amount,
          amountGBP: amount * 0.75,
          sender: verification.developerId,
          recipient: recipientDeveloperId,
          newBalance: senderBalanceAfter,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Stanzalink-Points-Remaining': senderBalanceAfter.toString()
        }
      }
    );

  } catch (error) {
    console.error('Error in economy-transfer:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
