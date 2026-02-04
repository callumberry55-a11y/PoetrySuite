import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key",
};

interface ProcessBillingRequest {
  action: 'create_period' | 'calculate_billing' | 'process_payment' | 'get_periods' | 'get_usage';
  developerId?: string;
  billingPeriodId?: string;
  periodStart?: string;
  periodEnd?: string;
  limit?: number;
  offset?: number;
}

async function verifyAdminKey(apiKey: string) {
  const adminKey = Deno.env.get('PAAS_ADMIN_KEY');

  if (!adminKey) {
    throw new Error('PAAS_ADMIN_KEY environment variable is not configured');
  }

  if (apiKey !== adminKey) {
    return { valid: false, error: 'Unauthorized: Admin access required' };
  }

  return { valid: true };
}

async function verifyAPIKey(apiKey: string, supabase: any) {
  const { data: keyData } = await supabase
    .from('paas_api_keys')
    .select('id, developer_id, is_active, paas_developers(id, email, is_verified, paas_point_accounts(balance_points))')
    .eq('key_hash', apiKey)
    .eq('is_active', true)
    .maybeSingle();

  if (!keyData || !keyData.paas_developers) {
    return { valid: false, error: 'Invalid or inactive API key' };
  }

  const developer = keyData.paas_developers;

  if (!developer.is_verified) {
    return { valid: false, error: 'Developer account not verified' };
  }

  return {
    valid: true,
    developerId: developer.id,
    apiKeyId: keyData.id,
    balance: developer.paas_point_accounts?.[0]?.balance_points || 0
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'get_periods' || action === 'get_usage') {
      // Developers can view their own data
      const verification = await verifyAPIKey(apiKey, supabase);
      if (!verification.valid) {
        return new Response(
          JSON.stringify({ error: verification.error }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'get_periods') {
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 1000);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);

        const { data: periods, error } = await supabase
          .from('paas_billing_periods')
          .select('*')
          .eq('developer_id', verification.developerId)
          .order('period_start', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: periods,
            pagination: { limit, offset, count: periods.length }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'get_usage') {
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 1000);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);

        const { data: usage, error } = await supabase
          .from('paas_api_usage')
          .select('*')
          .eq('developer_id', verification.developerId)
          .order('timestamp', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: usage,
            pagination: { limit, offset, count: usage.length }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Admin actions require admin key
    const adminVerification = await verifyAdminKey(apiKey);
    if (!adminVerification.valid) {
      return new Response(
        JSON.stringify({ error: adminVerification.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: ProcessBillingRequest = req.method === 'POST' ? await req.json() : { action: action || '' };

    switch (requestData.action) {
      case 'create_period': {
        if (!requestData.developerId || !requestData.periodStart || !requestData.periodEnd) {
          return new Response(
            JSON.stringify({ error: 'developerId, periodStart, and periodEnd are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: period, error } = await supabase
          .from('paas_billing_periods')
          .insert({
            developer_id: requestData.developerId,
            period_start: requestData.periodStart,
            period_end: requestData.periodEnd,
            status: 'pending'
          })
          .select()
          .maybeSingle();

        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: period
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'calculate_billing': {
        if (!requestData.billingPeriodId) {
          return new Response(
            JSON.stringify({ error: 'billingPeriodId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Call AI Banker to calculate pricing
        const aiBankerUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/paas-ai-banker`;
        const aiBankerResponse = await fetch(aiBankerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({ billingPeriodId: requestData.billingPeriodId })
        });

        if (!aiBankerResponse.ok) {
          const errorData = await aiBankerResponse.json();
          throw new Error(`AI Banker failed: ${errorData.error || 'Unknown error'}`);
        }

        const aiBankerResult = await aiBankerResponse.json();

        return new Response(
          JSON.stringify({
            success: true,
            data: aiBankerResult.data
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'process_payment': {
        if (!requestData.billingPeriodId) {
          return new Response(
            JSON.stringify({ error: 'billingPeriodId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get billing period
        const { data: period, error: periodError } = await supabase
          .from('paas_billing_periods')
          .select('*')
          .eq('id', requestData.billingPeriodId)
          .maybeSingle();

        if (periodError || !period) {
          return new Response(
            JSON.stringify({ error: 'Billing period not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (period.status !== 'calculated') {
          return new Response(
            JSON.stringify({ error: 'Billing must be calculated before payment' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get developer account
        const { data: account } = await supabase
          .from('paas_point_accounts')
          .select('balance_points')
          .eq('developer_id', period.developer_id)
          .maybeSingle();

        if (!account) {
          return new Response(
            JSON.stringify({ error: 'Developer account not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const balanceBefore = parseFloat(account.balance_points || '0');
        const amountDue = parseFloat(period.final_cost_points || '0');

        if (balanceBefore < amountDue) {
          return new Response(
            JSON.stringify({
              error: 'Insufficient balance',
              balance: balanceBefore,
              amountDue
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const balanceAfter = balanceBefore - amountDue;

        // Record transaction
        await supabase.from('paas_transactions').insert({
          developer_id: period.developer_id,
          transaction_type: 'billing',
          amount_points: -amountDue,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          endpoint: '/v1/billing/process',
          metadata: {
            billingPeriodId: period.id,
            periodStart: period.period_start,
            periodEnd: period.period_end,
            requests: period.total_requests,
            dataMB: period.total_data_transferred_mb
          }
        });

        // Update billing period status
        await supabase
          .from('paas_billing_periods')
          .update({
            status: 'paid',
            billed_at: new Date().toISOString()
          })
          .eq('id', requestData.billingPeriodId);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              billingPeriodId: period.id,
              amountPaid: amountDue,
              previousBalance: balanceBefore,
              newBalance: balanceAfter,
              paidAt: new Date().toISOString()
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: create_period, calculate_billing, process_payment, get_periods, get_usage' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in billing processor:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
